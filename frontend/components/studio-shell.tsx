"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { apiUrl } from "@/lib/api";
import type { ChatMessage, ChatResponse, RuntimeHealth } from "@/lib/types";
import { DEFAULT_SYSTEM_HINT, DOC_LINKS } from "@/lib/constants";

const starterMessages: ChatMessage[] = [
  {
    id: "welcome-assistant",
    role: "assistant",
    content:
      "안녕하세요. 저는 Agentic TTS Studio입니다.\n\n예를 들어 이렇게 말하면 됩니다:\n- 차분한 여성 톤으로 이 문장을 읽어줘\n- 새 캐릭터 목소리를 설계하고 저장해줘\n- 긴 내레이션을 장문 모드로 나눠서 생성해줘\n- 현재 로컬 모델 폴더 상태를 점검해줘",
  },
];

export function StudioShell({ initialHealth }: { initialHealth: RuntimeHealth }) {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [voiceHint, setVoiceHint] = useState("calm-korean-narrator");
  const [isPending, startTransition] = useTransition();

  const systemSummary = useMemo(() => {
    return initialHealth.simulationMode
      ? "현재는 simulation fallback 모드입니다. 모델 폴더를 채우면 실제 런타임으로 전환됩니다."
      : "로컬 모델 폴더가 감지되었습니다. 실제 음성 생성 런타임을 시도합니다.";
  }, [initialHealth.simulationMode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const userText = prompt.trim();

    if (!userText) {
      return;
    }

    const nextUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userText,
    };

    setMessages((current) => [...current, nextUserMessage]);
    setPrompt("");

    startTransition(async () => {
      const response = await fetch(apiUrl("/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemHint: DEFAULT_SYSTEM_HINT,
          voiceHint,
          messages: [...messages, nextUserMessage],
        }),
      });

      const result = (await response.json()) as ChatResponse;
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        generatedAudio: result.generatedAudio,
        toolTrace: result.toolTrace,
      };

      setMessages((current) => [...current, assistantMessage]);
    });
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <article className="hero-card">
          <span className="eyebrow">Next.js + LangChain + Local Gemma</span>
          <h1>Agentic TTS Studio</h1>
          <p>
            `Qwen3-TTS-Demo`의 제품형 흐름을 채팅 인터페이스로 옮긴 작업실입니다. 사용자는 자연어로
            요청하고, 에이전트는 목소리 설계, 프리셋 저장, 장문 처리, 로컬 모델 점검을 순서대로
            오케스트레이션합니다.
          </p>
          <p className="helper-text">{systemSummary}</p>
        </article>
        <aside className="sidebar-card">
          <h2>런타임 상태</h2>
          <div className="meta-list">
            <div className="meta-item">
              <strong>모드</strong>
              <span>{initialHealth.runtimeMode}</span>
            </div>
            <div className="meta-item">
              <strong>Gemma</strong>
              <span>{initialHealth.modelDirectories.gemma}</span>
            </div>
            <div className="meta-item">
              <strong>Qwen TTS</strong>
              <span>{initialHealth.modelDirectories.qwenTts}</span>
            </div>
            <div className="meta-item">
              <strong>Whisper</strong>
              <span>{initialHealth.modelDirectories.whisper}</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="hero-grid">
        <aside className="sidebar-card">
          <h2>문서 허브</h2>
          <div className="doc-list">
            {DOC_LINKS.map((doc) => (
              <a href={doc.href} key={doc.href}>
                <strong>{doc.title}</strong>
                <div className="helper-text">{doc.description}</div>
              </a>
            ))}
          </div>
        </aside>

        <section className="chat-card">
          <h2>채팅 작업실</h2>
          <div className="thread">
            {messages.map((message) => (
              <article
                className={`bubble ${message.role === "user" ? "bubble-user" : "bubble-assistant"}`}
                key={message.id}
              >
                {message.content}
                {message.generatedAudio ? (
                  <div className="audio-card">
                    <strong>{message.generatedAudio.title}</strong>
                    <div className="helper-text">{message.generatedAudio.statusLabel}</div>
                    <audio controls src={message.generatedAudio.url} />
                  </div>
                ) : null}
                {message.toolTrace?.length ? (
                  <div className="bubble-meta">Tool trace: {message.toolTrace.join(" -> ")}</div>
                ) : null}
              </article>
            ))}
          </div>

          <form className="composer" onSubmit={handleSubmit}>
            <textarea
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="예: 서울말 억양의 차분한 여성 목소리로 ‘오늘 회의 요약을 시작하겠습니다’를 읽어주고, 이 스타일을 프리셋으로도 저장해줘."
              value={prompt}
            />
            <div className="composer-row">
              <input
                onChange={(event) => setVoiceHint(event.target.value)}
                placeholder="voice hint"
                value={voiceHint}
              />
              <button className="primary-button" disabled={isPending} type="submit">
                {isPending ? "에이전트가 작업 중입니다" : "보내기"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
