"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { api } from "@/lib/api";
import type {
  BootstrapResponse,
  CharacterPreset,
  ChatMessage,
  ChatResponse,
  FineTuneDataset,
  GenerationRecord,
  RuntimeHealth,
} from "@/lib/types";
import { DEFAULT_SYSTEM_HINT, PRODUCT_SECTIONS, QUICK_ACTIONS, TAB_DESCRIPTIONS, type StudioTab } from "@/lib/constants";

const starterMessages: ChatMessage[] = [
  {
    id: "welcome-assistant",
    role: "assistant",
    content:
      "여기는 Qwen3-TTS-Demo의 기능 탭 위에 오케스트레이션 채팅을 얹은 작업실입니다. 생성, 업로드, 프리셋, 데이터셋, 학습 요청을 여기서 한 번에 묶어 지시할 수 있습니다.",
  },
];

const emptyBootstrap: BootstrapResponse = {
  health: {
    status: "loading",
    simulation_mode: false,
    runtime_mode: "loading",
    qwen_tts_available: false,
    device: "unknown",
    attention_implementation: "unknown",
    recommended_instruction_language: "English",
    data_dir: "",
    modelDirectories: {
      gemma: "",
      qwenTts: "",
      whisper: "",
    },
  },
  models: [],
  speakers: [],
  gallery: [],
  audio_assets: [],
  history: [],
  presets: [],
  datasets: [],
  finetune_runs: [],
  audio_tool_capabilities: [],
  audio_tool_jobs: [],
  voice_changer_models: [],
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function collectAudioUrls(result: Record<string, unknown>) {
  const assets = Array.isArray(result.assets) ? (result.assets as Array<{ url?: string }>) : [];
  return assets.map((item) => item.url).filter(Boolean) as string[];
}

function parseSampleLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [audio_path, ...rest] = line.split("|");
      return { audio_path: audio_path.trim(), text: rest.join("|").trim() };
    })
    .filter((sample) => sample.audio_path);
}

export function StudioShell({ initialHealth }: { initialHealth: RuntimeHealth }) {
  const [activeTab, setActiveTab] = useState<StudioTab>("home");
  const [bootstrap, setBootstrap] = useState<BootstrapResponse>({ ...emptyBootstrap, health: initialHealth });
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [orchestrationInput, setOrchestrationInput] = useState("");
  const [orchestrationVoiceHint, setOrchestrationVoiceHint] = useState("calm-korean-female");
  const [ttsForm, setTtsForm] = useState({ text: "오늘 회의를 시작하겠습니다.", speaker: "sohee", instruct: "" });
  const [designForm, setDesignForm] = useState({ text: "차갑지만 우아한 서울말 여성 독백 샘플입니다.", instruct: "Cold, elegant, restrained Korean female narration." });
  const [storyForm, setStoryForm] = useState({ text: "첫 장면입니다.\n도시는 비에 젖어 있었습니다.", instruct: "Cinematic Korean female narration.", speaker: "sohee" });
  const [effectsForm, setEffectsForm] = useState({ prompt: "heavy rain with distant thunder", duration_sec: "4", intensity: "0.8" });
  const [audioPath, setAudioPath] = useState("");
  const [pitchShift, setPitchShift] = useState("2");
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [presetGenerateText, setPresetGenerateText] = useState("프리셋 스타일로 새 문장을 읽어줘.");
  const [datasetForm, setDatasetForm] = useState({
    name: "sample-dataset",
    source_type: "uploaded_audio_batch",
    speaker_name: "sohee",
    ref_audio_path: "",
    samplesText: "",
  });
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [trainingForm, setTrainingForm] = useState({
    output_name: "demo-run",
    training_mode: "base",
    init_model_path: "local-qwen",
    batch_size: "2",
    lr: "0.00002",
    num_epochs: "3",
    speaker_name: "sohee",
  });
  const [uploading, setUploading] = useState(false);

  async function refreshBootstrap() {
    const next = await api.bootstrap();
    setBootstrap(next);
    if (!selectedPresetId && next.presets[0]) {
      setSelectedPresetId(next.presets[0].id);
    }
    if (!selectedDatasetId && next.datasets[0]) {
      setSelectedDatasetId(next.datasets[0].id);
    }
  }

  useEffect(() => {
    void refreshBootstrap().catch((error) => {
      setStatusMessage(error instanceof Error ? error.message : "작업실 데이터를 불러오지 못했습니다.");
    });
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const uploaded = await api.uploadAudio(file);
      setAudioPath(uploaded.path);
      setDatasetForm((current) => ({ ...current, ref_audio_path: uploaded.path }));
      setStatusMessage(`업로드 완료: ${uploaded.filename}`);
      await refreshBootstrap();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  }

  function appendAssistant(result: ChatResponse) {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        generatedAudio: result.generatedAudio,
        toolTrace: result.toolTrace,
      },
    ]);
  }

  async function runAction(label: string, runner: () => Promise<unknown>) {
    setStatusMessage("");
    startTransition(async () => {
      try {
        await runner();
        await refreshBootstrap();
        setStatusMessage(`${label} 완료`);
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : `${label}에 실패했습니다.`);
      }
    });
  }

  function submitOrchestration(event: FormEvent) {
    event.preventDefault();
    const content = orchestrationInput.trim();
    if (!content) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content };
    setMessages((current) => [...current, userMessage]);
    setOrchestrationInput("");

    void runAction("오케스트레이션", async () => {
      const result = await api.chat({
        systemHint: DEFAULT_SYSTEM_HINT,
        voiceHint: orchestrationVoiceHint,
        messages: [...messages, userMessage].map(({ id, role, content: itemContent }) => ({ id, role, content: itemContent })),
      });
      appendAssistant(result);
      return result;
    });
  }

  async function runGeneration(label: string, promise: Promise<{ record: GenerationRecord }>) {
    const result = await promise;
    setStatusMessage(`${label} 완료`);
    return result;
  }

  const presets = bootstrap.presets;
  const history = bootstrap.history;
  const datasets = bootstrap.datasets;
  const recentAudio = bootstrap.audio_assets.slice(0, 6);

  function renderHome() {
    return (
      <div className="workspace-panel">
        <div className="panel-header">
          <div>
            <h2>Qwen3-TTS-Demo 기능 허브</h2>
            <p>{TAB_DESCRIPTIONS.home}</p>
          </div>
          <div className="quick-actions">
            {QUICK_ACTIONS.map((item) => (
              <button key={item.label} className="secondary-button" onClick={() => setActiveTab(item.tab)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="runtime-strip">
          <article className="runtime-card">
            <strong>모델</strong>
            <span>{bootstrap.models.length}개 로드 후보</span>
          </article>
          <article className="runtime-card">
            <strong>최근 생성</strong>
            <span>{history.length}개 기록</span>
          </article>
          <article className="runtime-card">
            <strong>학습 데이터셋</strong>
            <span>{datasets.length}개 준비</span>
          </article>
        </div>
        <div className="stack-list stack-list--horizontal">
          {PRODUCT_SECTIONS.flatMap((section) => section.items)
            .filter((item) => item.key !== "home")
            .map((item) => (
              <button key={item.key} className="list-card" onClick={() => setActiveTab(item.key)}>
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
        </div>
      </div>
    );
  }

  function renderOrchestration() {
    return (
      <div className="workspace-panel workspace-panel--chat">
        <div className="panel-header">
          <div>
            <h2>오케스트레이션 채팅</h2>
            <p>{TAB_DESCRIPTIONS.orchestration}</p>
          </div>
        </div>
        <div className="stack-list">
          {messages.map((message) => (
            <article key={message.id} className="list-card">
              <strong>{message.role === "user" ? "사용자" : "에이전트"}</strong>
              <span>{message.content}</span>
              {message.generatedAudio ? <audio controls src={message.generatedAudio.url} /> : null}
            </article>
          ))}
        </div>
        <form className="composer-form" onSubmit={submitOrchestration}>
          <label>
            <span>Voice Hint</span>
            <input value={orchestrationVoiceHint} onChange={(event) => setOrchestrationVoiceHint(event.target.value)} />
          </label>
          <label>
            <span>지시</span>
            <textarea rows={4} value={orchestrationInput} onChange={(event) => setOrchestrationInput(event.target.value)} />
          </label>
          <button className="primary-button" disabled={isPending}>
            {isPending ? "실행 중..." : "보내기"}
          </button>
        </form>
      </div>
    );
  }

  function renderVoices() {
    return (
      <div className="workspace-panel">
        <h2>나의 목소리들</h2>
        <div className="stack-list stack-list--horizontal">
          {bootstrap.models.map((model) => (
            <article key={model.key} className="list-card">
              <strong>{model.label}</strong>
              <span>{model.notes}</span>
            </article>
          ))}
        </div>
        <div className="stack-list">
          {presets.map((preset) => (
            <article key={preset.id} className="list-card">
              <strong>{preset.name}</strong>
              <span>{preset.notes || preset.reference_text || "설명 없음"}</span>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderGallery() {
    return (
      <div className="workspace-panel">
        <h2>생성 갤러리</h2>
        <div className="stack-list">
          {history.map((record) => (
            <article key={record.id} className="list-card">
              <strong>{record.mode}</strong>
              <span>{record.input_text}</span>
              {record.output_audio_url ? <audio controls src={record.output_audio_url} /> : null}
              <div className="button-row">
                <button className="secondary-button" onClick={() => void runAction("이력 삭제", () => api.deleteHistoryRecord(record.id))}>
                  삭제
                </button>
                <button
                  className="secondary-button"
                  onClick={() =>
                    void runAction("샘플 기반 클론", () => api.createCloneFromSample({ generation_id: record.id, model_id: "local-qwen" }))
                  }
                >
                  샘플로 clone prompt 만들기
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderTts() {
    return (
      <div className="workspace-panel">
        <h2>텍스트 음성 변환</h2>
        <form
          className="composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("기본 TTS", () => runGeneration("기본 TTS", api.generateCustomVoice(ttsForm)));
          }}
        >
          <label>
            <span>텍스트</span>
            <textarea rows={4} value={ttsForm.text} onChange={(event) => setTtsForm((current) => ({ ...current, text: event.target.value }))} />
          </label>
          <label>
            <span>화자</span>
            <input value={ttsForm.speaker} onChange={(event) => setTtsForm((current) => ({ ...current, speaker: event.target.value }))} />
          </label>
          <label>
            <span>지시</span>
            <input value={ttsForm.instruct} onChange={(event) => setTtsForm((current) => ({ ...current, instruct: event.target.value }))} />
          </label>
          <button className="primary-button">생성</button>
        </form>
      </div>
    );
  }

  function renderClone() {
    return (
      <div className="workspace-panel">
        <h2>목소리 복제</h2>
        <label className="upload-box">
          <span>{uploading ? "업로드 중..." : "참조 오디오 업로드"}</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleUpload(file);
              }
            }}
          />
        </label>
        <label>
          <span>참조 오디오 경로</span>
          <input value={audioPath} onChange={(event) => setAudioPath(event.target.value)} />
        </label>
        <div className="button-row">
          <button className="secondary-button" onClick={() => void runAction("전사", () => api.transcribeAudio(audioPath))}>
            Whisper 전사
          </button>
          <button
            className="primary-button"
            onClick={() =>
              void runAction("업로드 기반 clone prompt", () => api.createCloneFromUpload({ reference_audio_path: audioPath, model_id: "local-qwen" }))
            }
          >
            clone prompt 만들기
          </button>
        </div>
      </div>
    );
  }

  function renderDesign() {
    return (
      <div className="workspace-panel">
        <h2>목소리 설계</h2>
        <form
          className="composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("목소리 설계", () => runGeneration("목소리 설계", api.generateVoiceDesign(designForm)));
          }}
        >
          <label>
            <span>설명문</span>
            <textarea rows={3} value={designForm.instruct} onChange={(event) => setDesignForm((current) => ({ ...current, instruct: event.target.value }))} />
          </label>
          <label>
            <span>샘플 문장</span>
            <textarea rows={4} value={designForm.text} onChange={(event) => setDesignForm((current) => ({ ...current, text: event.target.value }))} />
          </label>
          <button className="primary-button">설계 후 생성</button>
        </form>
      </div>
    );
  }

  function renderEffects() {
    return (
      <div className="workspace-panel">
        <h2>사운드 효과</h2>
        <form
          className="composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("사운드 효과", () =>
              api.generateSoundEffect({
                prompt: effectsForm.prompt,
                duration_sec: Number(effectsForm.duration_sec),
                intensity: Number(effectsForm.intensity),
              }),
            );
          }}
        >
          <label>
            <span>프롬프트</span>
            <textarea rows={3} value={effectsForm.prompt} onChange={(event) => setEffectsForm((current) => ({ ...current, prompt: event.target.value }))} />
          </label>
          <div className="two-column">
            <label>
              <span>길이</span>
              <input value={effectsForm.duration_sec} onChange={(event) => setEffectsForm((current) => ({ ...current, duration_sec: event.target.value }))} />
            </label>
            <label>
              <span>강도</span>
              <input value={effectsForm.intensity} onChange={(event) => setEffectsForm((current) => ({ ...current, intensity: event.target.value }))} />
            </label>
          </div>
          <button className="primary-button">효과음 생성</button>
        </form>
      </div>
    );
  }

  function renderChanger() {
    return (
      <div className="workspace-panel">
        <h2>보이스 체인저</h2>
        <label>
          <span>오디오 경로</span>
          <input value={audioPath} onChange={(event) => setAudioPath(event.target.value)} />
        </label>
        <label>
          <span>Pitch Shift</span>
          <input value={pitchShift} onChange={(event) => setPitchShift(event.target.value)} />
        </label>
        <button className="primary-button" onClick={() => void runAction("보이스 체인저", () => api.changeVoice({ audio_path: audioPath, pitch_shift_semitones: Number(pitchShift) }))}>
          변환
        </button>
      </div>
    );
  }

  function renderSeparation() {
    return (
      <div className="workspace-panel">
        <h2>오디오 분리</h2>
        <label>
          <span>오디오 경로</span>
          <input value={audioPath} onChange={(event) => setAudioPath(event.target.value)} />
        </label>
        <div className="button-row">
          <button className="primary-button" onClick={() => void runAction("오디오 분리", () => api.separateAudio({ audio_path: audioPath }))}>
            분리 실행
          </button>
          <button className="secondary-button" onClick={() => void runAction("오디오 변환", () => api.convertAudio({ audio_path: audioPath, sample_rate: 24000, mono: true }))}>
            24k mono 변환
          </button>
        </div>
      </div>
    );
  }

  function renderProjects() {
    return (
      <div className="workspace-panel">
        <h2>프리셋 기반 생성</h2>
        <label>
          <span>프리셋</span>
          <select value={selectedPresetId} onChange={(event) => setSelectedPresetId(event.target.value)}>
            <option value="">선택</option>
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>텍스트</span>
          <textarea rows={4} value={presetGenerateText} onChange={(event) => setPresetGenerateText(event.target.value)} />
        </label>
        <button
          className="primary-button"
          onClick={() => {
            if (!selectedPresetId) return;
            void runAction("프리셋 기반 생성", () => runGeneration("프리셋 기반 생성", api.generateFromPreset(selectedPresetId, { text: presetGenerateText })));
          }}
        >
          생성
        </button>
      </div>
    );
  }

  function renderStory() {
    return (
      <div className="workspace-panel">
        <h2>스토리 스튜디오</h2>
        <form
          className="composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("스토리 생성", () => runGeneration("스토리 생성", api.generateStoryStudio(storyForm)));
          }}
        >
          <label>
            <span>설명문</span>
            <textarea rows={3} value={storyForm.instruct} onChange={(event) => setStoryForm((current) => ({ ...current, instruct: event.target.value }))} />
          </label>
          <label>
            <span>대본</span>
            <textarea rows={6} value={storyForm.text} onChange={(event) => setStoryForm((current) => ({ ...current, text: event.target.value }))} />
          </label>
          <button className="primary-button">장문 생성</button>
        </form>
      </div>
    );
  }

  function renderDataset() {
    return (
      <div className="workspace-panel">
        <h2>데이터셋 만들기</h2>
        <form
          className="composer-form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction("데이터셋 생성", () =>
              api.createDataset({
                name: datasetForm.name,
                source_type: datasetForm.source_type,
                speaker_name: datasetForm.speaker_name,
                ref_audio_path: datasetForm.ref_audio_path,
                samples: parseSampleLines(datasetForm.samplesText),
              }),
            );
          }}
        >
          <div className="two-column">
            <label>
              <span>이름</span>
              <input value={datasetForm.name} onChange={(event) => setDatasetForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              <span>화자명</span>
              <input value={datasetForm.speaker_name} onChange={(event) => setDatasetForm((current) => ({ ...current, speaker_name: event.target.value }))} />
            </label>
          </div>
          <label>
            <span>참조 오디오 경로</span>
            <input value={datasetForm.ref_audio_path} onChange={(event) => setDatasetForm((current) => ({ ...current, ref_audio_path: event.target.value }))} />
          </label>
          <label>
            <span>샘플 목록</span>
            <textarea
              rows={6}
              placeholder={"/path/sample1.wav|텍스트\n/path/sample2.wav|텍스트"}
              value={datasetForm.samplesText}
              onChange={(event) => setDatasetForm((current) => ({ ...current, samplesText: event.target.value }))}
            />
          </label>
          <button className="primary-button">데이터셋 생성</button>
        </form>
        <div className="stack-list">
          {datasets.map((dataset) => (
            <article key={dataset.id} className="list-card">
              <strong>{dataset.name}</strong>
              <span>{dataset.status_label || `${dataset.sample_count} samples`}</span>
              <button className="secondary-button" onClick={() => void runAction("데이터셋 준비", () => api.prepareDataset(dataset.id, { device: "cuda:0", simulate_only: false }))}>
                prepare-codes
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderTraining() {
    return (
      <div className="workspace-panel">
        <h2>학습 실행</h2>
        <div className="two-column">
          <label>
            <span>데이터셋</span>
            <select value={selectedDatasetId} onChange={(event) => setSelectedDatasetId(event.target.value)}>
              <option value="">선택</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>출력 이름</span>
            <input value={trainingForm.output_name} onChange={(event) => setTrainingForm((current) => ({ ...current, output_name: event.target.value }))} />
          </label>
        </div>
        <div className="button-row">
          <button
            className="primary-button"
            onClick={() => {
              if (!selectedDatasetId) return;
              void runAction("학습 실행 생성", () =>
                api.createFineTuneRun({
                  dataset_id: selectedDatasetId,
                  training_mode: trainingForm.training_mode,
                  init_model_path: trainingForm.init_model_path,
                  output_name: trainingForm.output_name,
                  batch_size: Number(trainingForm.batch_size),
                  lr: Number(trainingForm.lr),
                  num_epochs: Number(trainingForm.num_epochs),
                  speaker_name: trainingForm.speaker_name,
                  simulate_only: false,
                }),
              );
            }}
          >
            학습 실행 등록
          </button>
          <button className="secondary-button" onClick={() => setActiveTab("dataset")}>
            데이터셋 탭으로 이동
          </button>
        </div>
        <div className="stack-list">
          {bootstrap.finetune_runs.map((run) => (
            <article key={run.id} className="list-card">
              <strong>{run.summary_label || run.training_mode}</strong>
              <span>{run.stage_label || run.status}</span>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderActivePanel() {
    switch (activeTab) {
      case "home":
        return renderHome();
      case "orchestration":
        return renderOrchestration();
      case "voices":
        return renderVoices();
      case "gallery":
        return renderGallery();
      case "tts":
        return renderTts();
      case "clone":
        return renderClone();
      case "design":
        return renderDesign();
      case "effects":
        return renderEffects();
      case "changer":
        return renderChanger();
      case "separation":
        return renderSeparation();
      case "projects":
        return renderProjects();
      case "story":
        return renderStory();
      case "dataset":
        return renderDataset();
      case "training":
        return renderTraining();
      default:
        return renderHome();
    }
  }

  return (
    <div className="product-shell">
      <aside className="product-sidebar">
        <section className="brand-card">
          <span className="eyebrow">Agentic TTS Studio</span>
          <h1>Qwen3-TTS-Demo + Agent</h1>
          <p>업데이트된 기능 탭 전체 위에 오케스트레이션 채팅을 얹은 Next.js 작업실입니다.</p>
        </section>
        <section className="status-card">
          <div className="status-metric">
            <strong>Runtime</strong>
            <span>{bootstrap.health.runtime_mode}</span>
          </div>
          <div className="status-metric">
            <strong>Presets</strong>
            <span>{presets.length}</span>
          </div>
          <div className="status-metric">
            <strong>History</strong>
            <span>{history.length}</span>
          </div>
        </section>
        {PRODUCT_SECTIONS.map((section) => (
          <section key={section.title} className="nav-section">
            <h2>{section.title}</h2>
            <div className="nav-list">
              {section.items.map((item) => (
                <button key={item.key} className={`nav-link ${activeTab === item.key ? "is-active" : ""}`} onClick={() => setActiveTab(item.key)}>
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </aside>
      <main className="product-main">
        <section className="workspace-hero">
          <div>
            <span className="eyebrow">{activeTab}</span>
            <h2>{PRODUCT_SECTIONS.flatMap((section) => section.items).find((item) => item.key === activeTab)?.label || "작업실"}</h2>
            <p>{TAB_DESCRIPTIONS[activeTab]}</p>
          </div>
          <div className="quick-actions">
            {QUICK_ACTIONS.map((item) => (
              <button key={item.label} className="secondary-button" onClick={() => setActiveTab(item.tab)}>
                {item.label}
              </button>
            ))}
          </div>
        </section>
        <section className="runtime-strip">
          <article className="runtime-card">
            <strong>Gemma</strong>
            <span>{bootstrap.health.modelDirectories.gemma}</span>
          </article>
          <article className="runtime-card">
            <strong>Qwen TTS</strong>
            <span>{bootstrap.health.modelDirectories.qwenTts}</span>
          </article>
          <article className="runtime-card">
            <strong>Whisper</strong>
            <span>{bootstrap.health.modelDirectories.whisper}</span>
          </article>
        </section>
        {statusMessage ? <section className="status-banner">{statusMessage}</section> : null}
        {renderActivePanel()}
        <section className="workspace-panel">
          <h2>최근 오디오 자산</h2>
          <div className="stack-list stack-list--horizontal">
            {recentAudio.map((asset) => (
              <article key={asset.id} className="list-card">
                <strong>{asset.filename}</strong>
                <span>{asset.source}</span>
                <audio controls src={asset.url} />
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
