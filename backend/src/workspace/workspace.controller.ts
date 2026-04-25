import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { appConfig } from "../common/app-config";
import {
  appendAudioToolJob,
  appendClonePromptRecord,
  appendFineTuneRun,
  appendGenerationRecord,
  createDatasetLayout,
  ensureWorkspaceLayout,
  getDataset,
  getGenerationRecord,
  listAudioAssets,
  listAudioToolJobs,
  listDatasets,
  listFineTuneRuns,
  listGenerationRecords,
  makeAssetUrl,
  registerAudioAsset,
  removeGenerationRecords,
  upsertDataset,
  writeDatasetJsonl,
  copyIntoDatasetAudio,
} from "../common/demo-store";
import type {
  AudioToolAsset,
  AudioToolCapability,
  AudioToolJob,
  BootstrapResponse,
  CharacterPreset,
  FineTuneDataset,
  FineTuneRun,
  GenerationRecord,
  VoiceChangerModelInfo,
} from "../common/demo-types";
import { ensureDir, pathExists, readJson, writeJson } from "../common/filesystem";
import { LocalRuntimeService } from "../studio/local-runtime.service";

function normalizeLanguage(value: string | undefined) {
  return value && value !== "Auto" ? value : "Auto";
}

function buildCapabilities(): AudioToolCapability[] {
  return [
    {
      key: "sound_effects",
      label: "사운드 효과",
      description: "프롬프트에서 로컬 procedural 효과음을 생성합니다.",
      available: true,
      notes: "MMAudio 대신 실제 procedural 음원을 만듭니다.",
    },
    {
      key: "voice_changer",
      label: "보이스 체인저",
      description: "업로드된 오디오에 pitch shift 기반 변환을 적용합니다.",
      available: true,
      notes: "RVC/Applio 대신 로컬 DSP 변환입니다.",
    },
    {
      key: "audio_convert",
      label: "오디오 변환",
      description: "샘플레이트와 채널 구성을 변환합니다.",
      available: true,
      notes: "librosa + soundfile 기반입니다.",
    },
    {
      key: "audio_separate",
      label: "오디오 분리",
      description: "HPSS 기반으로 harmonic/percussive 트랙을 분리합니다.",
      available: true,
      notes: "딥러닝 소스 분리 대신 HPSS 분리입니다.",
    },
    {
      key: "audio_translate",
      label: "전사/번역",
      description: "Whisper 전사 후 Gemma 번역과 Qwen 재합성을 연결합니다.",
      available: true,
      notes: "번역문을 직접 넣어도 됩니다.",
    },
  ];
}

function buildVoiceChangerModels(): VoiceChangerModelInfo[] {
  return [
    {
      id: "local-pitch-shift",
      label: "Local Pitch Shift",
      model_path: "builtin://pitch-shift",
      index_path: null,
    },
  ];
}

@Controller()
export class WorkspaceController {
  constructor(private readonly runtime: LocalRuntimeService) {}

  private async listPresets() {
    return ((await readJson<CharacterPreset[]>(path.join(appConfig.data.records, "presets.json"))) ?? []).sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  }

  private async makeGenerationRecord(params: {
    mode: string;
    text: string;
    language?: string;
    voiceHint: string;
    instruction?: string;
    speaker?: string;
    presetId?: string;
    sourceRefAudioPath?: string;
    sourceRefText?: string;
    meta?: Record<string, unknown>;
  }) {
    const generated = await this.runtime.runLocalSpeechGeneration({
      text: params.text,
      voiceHint: params.voiceHint,
      language: normalizeLanguage(params.language),
      speaker: params.speaker,
    });

    const record: GenerationRecord = {
      id: generated.id,
      mode: params.mode,
      input_text: params.text,
      language: normalizeLanguage(params.language),
      speaker: params.speaker || null,
      instruction: params.instruction || null,
      preset_id: params.presetId || null,
      output_audio_path: generated.outputPath,
      output_audio_url: makeAssetUrl(generated.id),
      source_ref_audio_path: params.sourceRefAudioPath || null,
      source_ref_text: params.sourceRefText || null,
      created_at: generated.createdAt,
      meta: params.meta || {},
    };

    await appendGenerationRecord(record);
    return { record };
  }

  private async createAudioToolJob(params: {
    kind: string;
    status: string;
    inputSummary: string;
    message: string;
    assetPaths: Array<{ path: string; label: string; source: string; textPreview?: string }>;
    transcriptText?: string;
    translatedText?: string;
    generationRecord?: GenerationRecord;
  }) {
    const artifacts: AudioToolAsset[] = [];

    for (const entry of params.assetPaths) {
      const asset = await registerAudioAsset({
        path: entry.path,
        source: entry.source,
        textPreview: entry.textPreview,
        transcriptText: params.transcriptText,
      });
      artifacts.push({
        label: entry.label,
        path: asset.path,
        url: asset.url,
        filename: asset.filename,
      });
    }

    const job = await appendAudioToolJob({
      kind: params.kind,
      status: params.status,
      input_summary: params.inputSummary,
      message: params.message,
      artifacts,
    });

    return {
      kind: params.kind,
      status: params.status,
      message: params.message,
      assets: artifacts,
      transcript_text: params.transcriptText || null,
      translated_text: params.translatedText || null,
      record: params.generationRecord || null,
      job,
    };
  }

  @Get("bootstrap")
  async bootstrap(): Promise<BootstrapResponse> {
    const [health, history, presets, datasets, finetuneRuns, audioToolJobs, audioAssets] = await Promise.all([
      this.getHealth(),
      listGenerationRecords(),
      this.listPresets(),
      listDatasets(),
      listFineTuneRuns(),
      listAudioToolJobs(),
      listAudioAssets(),
    ]);

    return {
      health,
      models: this.runtime.listModelCatalog(),
      speakers: this.runtime.listSpeakers(),
      gallery: history,
      audio_assets: audioAssets,
      history,
      presets,
      datasets,
      finetune_runs: finetuneRuns,
      audio_tool_capabilities: buildCapabilities(),
      audio_tool_jobs: audioToolJobs,
      voice_changer_models: buildVoiceChangerModels(),
    };
  }

  @Get("models")
  getModels() {
    return this.runtime.listModelCatalog();
  }

  @Get("speakers")
  getSpeakers() {
    return this.runtime.listSpeakers();
  }

  @Get("history")
  async getHistory() {
    return listGenerationRecords();
  }

  @Delete("history")
  async deleteAllHistory() {
    const removed = await removeGenerationRecords();
    return { deleted_count: removed.length };
  }

  @Delete("history/:id")
  async deleteHistoryRecord(@Param("id") id: string) {
    const removed = await removeGenerationRecords([id]);
    return { deleted_count: removed.length };
  }

  @Post("history/delete-batch")
  async deleteHistoryBatch(@Body() payload: { ids?: string[] }) {
    const removed = await removeGenerationRecords(payload.ids || []);
    return { deleted_count: removed.length };
  }

  @Post("uploads/reference-audio")
  @UseInterceptors(FileInterceptor("file"))
  async uploadReferenceAudio(@UploadedFile() file?: { originalname: string; buffer: Buffer }) {
    if (!file) {
      throw new NotFoundException("Upload file is required.");
    }

    await ensureWorkspaceLayout();
    const extension = path.extname(file.originalname) || ".wav";
    const targetPath = path.join(appConfig.data.uploads, `${randomUUID()}${extension}`);
    await ensureDir(appConfig.data.uploads);
    await fs.writeFile(targetPath, file.buffer);
    const asset = await registerAudioAsset({
      path: targetPath,
      filename: file.originalname,
      source: "uploaded",
    });

    return {
      id: asset.id,
      path: asset.path,
      url: asset.url,
      filename: asset.filename,
    };
  }

  @Post("transcriptions/reference-audio")
  async transcribeReferenceAudio(@Body() payload: { audio_path: string }) {
    const result = await this.runtime.transcribeAudio(payload.audio_path);
    return {
      audio_path: payload.audio_path,
      text: result.text,
      language: result.language || null,
      simulation: false,
      model_id: result.model_id || appConfig.models.whisper,
    };
  }

  @Post("generate/custom-voice")
  async generateCustomVoice(
    @Body()
    payload: { text: string; language?: string; speaker?: string; instruct?: string; model_id?: string },
  ) {
    return this.makeGenerationRecord({
      mode: "custom_voice",
      text: payload.text,
      language: payload.language,
      voiceHint: payload.instruct || payload.speaker || "custom voice",
      instruction: payload.instruct || "",
      speaker: payload.speaker || "sohee",
      meta: { model_id: payload.model_id || appConfig.models.qwenTts },
    });
  }

  @Post("generate/voice-design")
  async generateVoiceDesign(@Body() payload: { text: string; language?: string; instruct: string; model_id?: string }) {
    return this.makeGenerationRecord({
      mode: "voice_design",
      text: payload.text,
      language: payload.language,
      voiceHint: payload.instruct,
      instruction: payload.instruct,
      meta: { model_id: payload.model_id || appConfig.models.qwenTts },
    });
  }

  @Post("generate/story-studio")
  async generateStoryStudio(
    @Body()
    payload: {
      text: string;
      language?: string;
      instruct: string;
      speaker?: string;
      split_mode?: string;
      pause_ms?: number;
      model_id?: string;
    },
  ) {
    const normalizedText = payload.text
      .split(/\n+/)
      .map((segment) => segment.trim())
      .filter(Boolean)
      .join(" ");

    return this.makeGenerationRecord({
      mode: "story_studio",
      text: normalizedText,
      language: payload.language,
      voiceHint: payload.instruct,
      instruction: payload.instruct,
      speaker: payload.speaker || "sohee",
      meta: {
        split_mode: payload.split_mode || "line",
        pause_ms: payload.pause_ms || 350,
        model_id: payload.model_id || appConfig.models.qwenTts,
      },
    });
  }

  @Post("generate/model")
  async generateWithModel(@Body() payload: { text: string; language?: string; model_id: string; speaker?: string; instruct?: string }) {
    return this.makeGenerationRecord({
      mode: "model_inference",
      text: payload.text,
      language: payload.language,
      voiceHint: payload.instruct || payload.speaker || payload.model_id,
      instruction: payload.instruct || "",
      speaker: payload.speaker || undefined,
      meta: { model_id: payload.model_id },
    });
  }

  @Post("generate/hybrid-clone-instruct")
  async generateHybridCloneInstruct(
    @Body()
    payload: {
      text: string;
      language?: string;
      ref_audio_path: string;
      ref_text?: string;
      instruct?: string;
      custom_model_id?: string;
      base_model_id?: string;
    },
  ) {
    const refText =
      payload.ref_text ||
      (
        await this.runtime.transcribeAudio(payload.ref_audio_path).catch(() => ({
          text: "",
        }))
      ).text;

    return this.makeGenerationRecord({
      mode: "hybrid_clone_instruct",
      text: payload.text,
      language: payload.language,
      voiceHint: payload.instruct || `reference:${path.basename(payload.ref_audio_path)}`,
      instruction: payload.instruct || "",
      sourceRefAudioPath: payload.ref_audio_path,
      sourceRefText: refText,
      meta: {
        custom_model_id: payload.custom_model_id || appConfig.models.qwenTts,
        base_model_id: payload.base_model_id || appConfig.models.qwenTts,
      },
    });
  }

  @Post("clone-prompts/from-generated-sample")
  async clonePromptFromGeneratedSample(@Body() payload: { generation_id: string; model_id?: string; x_vector_only_mode?: boolean }) {
    const record = await getGenerationRecord(payload.generation_id);
    if (!record) {
      throw new NotFoundException("Generation record not found.");
    }

    await ensureDir(appConfig.data.clonePrompts);
    const promptPath = path.join(appConfig.data.clonePrompts, `${randomUUID()}.json`);
    await writeJson(promptPath, {
      source: "generated_sample",
      generation_id: record.id,
      reference_audio_path: record.output_audio_path,
      reference_text: record.input_text,
      model_id: payload.model_id || appConfig.models.qwenTts,
      x_vector_only_mode: Boolean(payload.x_vector_only_mode),
    });

    return appendClonePromptRecord({
      source_type: "generated_sample",
      base_model: payload.model_id || appConfig.models.qwenTts,
      prompt_path: promptPath,
      reference_audio_path: record.output_audio_path,
      reference_text: record.input_text,
      x_vector_only_mode: Boolean(payload.x_vector_only_mode),
      meta: { generation_id: record.id },
    });
  }

  @Post("clone-prompts/from-upload")
  async clonePromptFromUpload(
    @Body() payload: { model_id?: string; reference_audio_path: string; reference_text?: string; x_vector_only_mode?: boolean },
  ) {
    const referenceText =
      payload.reference_text ||
      (
        await this.runtime.transcribeAudio(payload.reference_audio_path).catch(() => ({
          text: "",
        }))
      ).text;
    await ensureDir(appConfig.data.clonePrompts);
    const promptPath = path.join(appConfig.data.clonePrompts, `${randomUUID()}.json`);
    await writeJson(promptPath, {
      source: "uploaded_reference",
      reference_audio_path: payload.reference_audio_path,
      reference_text: referenceText,
      model_id: payload.model_id || appConfig.models.qwenTts,
      x_vector_only_mode: Boolean(payload.x_vector_only_mode),
    });

    return appendClonePromptRecord({
      source_type: "uploaded_reference",
      base_model: payload.model_id || appConfig.models.qwenTts,
      prompt_path: promptPath,
      reference_audio_path: payload.reference_audio_path,
      reference_text: referenceText,
      x_vector_only_mode: Boolean(payload.x_vector_only_mode),
      meta: {},
    });
  }

  @Get("datasets")
  async getDatasets() {
    return listDatasets();
  }

  @Get("datasets/:id")
  async getDatasetById(@Param("id") id: string) {
    const dataset = await getDataset(id);
    if (!dataset) {
      throw new NotFoundException("Dataset not found.");
    }
    return dataset;
  }

  @Post("datasets")
  async createDataset(
    @Body()
    payload: {
      name: string;
      source_type: string;
      speaker_name: string;
      ref_audio_path: string;
      samples: Array<{ audio_path: string; text?: string }>;
    },
  ): Promise<FineTuneDataset> {
    const datasetId = `${payload.name.toLowerCase().replace(/[^a-z0-9가-힣]+/gi, "-").replace(/^-+|-+$/g, "") || "dataset"}-${Date.now()}`;
    const layout = await createDatasetLayout(datasetId);
    const copiedRefAudioPath = await copyIntoDatasetAudio(datasetId, payload.ref_audio_path, path.basename(payload.ref_audio_path));
    const preparedSamples: Array<{ audio_path: string; text: string }> = [];

    for (const sample of payload.samples) {
      const copiedSamplePath = await copyIntoDatasetAudio(datasetId, sample.audio_path, path.basename(sample.audio_path));
      preparedSamples.push({
        audio_path: copiedSamplePath,
        text: sample.text || "",
      });
    }

    const rawJsonlPath = await writeDatasetJsonl(
      datasetId,
      "raw.jsonl",
      preparedSamples.map((sample) => ({
        audio_path: sample.audio_path,
        text: sample.text,
        ref_audio_path: copiedRefAudioPath,
      })),
    );

    const dataset: FineTuneDataset = {
      id: datasetId,
      name: payload.name,
      source_type: payload.source_type,
      dataset_root_path: layout.root,
      audio_dir_path: layout.audio,
      manifest_path: path.join(layout.root, "dataset.json"),
      raw_jsonl_path: rawJsonlPath,
      prepared_jsonl_path: null,
      ref_audio_path: copiedRefAudioPath,
      speaker_name: payload.speaker_name,
      sample_count: preparedSamples.length,
      created_at: new Date().toISOString(),
      training_ready: false,
      status_label: "샘플 복사 완료",
      next_step_label: "prepare-codes",
    };
    await writeJson(path.join(layout.root, "dataset.json"), dataset);
    return upsertDataset(dataset);
  }

  @Post("datasets/:id/prepare-codes")
  async prepareDataset(@Param("id") id: string, @Body() payload: { tokenizer_model_path?: string; device?: string; simulate_only?: boolean }) {
    const dataset = await getDataset(id);
    if (!dataset) {
      throw new NotFoundException("Dataset not found.");
    }

    const root = dataset.dataset_root_path || path.join(appConfig.data.datasets, id);
    const rawLines = (await fs.readFile(dataset.raw_jsonl_path, "utf-8")).split(/\r?\n/).filter(Boolean);
    const normalizedLines = rawLines.map((line) => JSON.parse(line) as Record<string, unknown>);
    const preparedJsonlPath = path.join(root, "prepared.jsonl");
    await fs.writeFile(
      preparedJsonlPath,
      `${normalizedLines.map((line) => JSON.stringify({ ...line, prepared: true })).join("\n")}\n`,
      "utf-8",
    );

    const updated: FineTuneDataset = {
      ...dataset,
      prepared_jsonl_path: preparedJsonlPath,
      prepared_with_simulation: Boolean(payload.simulate_only),
      prepared_tokenizer_model_path: payload.tokenizer_model_path || appConfig.models.qwenTts,
      prepared_device: payload.device || "cuda:0",
      training_ready: true,
      status_label: "학습 입력 준비 완료",
      next_step_label: "run training",
    };
    await writeJson(path.join(root, "dataset.json"), updated);
    return upsertDataset(updated);
  }

  @Get("finetune-runs")
  async getFineTuneRuns() {
    return listFineTuneRuns();
  }

  @Get("finetune-runs/:id")
  async getFineTuneRun(@Param("id") id: string) {
    const runs = await listFineTuneRuns();
    const run = runs.find((item) => item.id === id);
    if (!run) {
      throw new NotFoundException("Fine-tune run not found.");
    }
    return run;
  }

  @Post("finetune-runs")
  async createFineTuneRun(
    @Body()
    payload: {
      dataset_id: string;
      training_mode: string;
      init_model_path: string;
      speaker_encoder_model_path?: string;
      output_name: string;
      batch_size: number;
      lr: number;
      num_epochs: number;
      speaker_name: string;
      device?: string;
      simulate_only?: boolean;
    },
  ): Promise<FineTuneRun> {
    const dataset = await getDataset(payload.dataset_id);
    if (!dataset) {
      throw new NotFoundException("Dataset not found.");
    }

    const outputDir = path.join(appConfig.data.finetuneRuns, payload.output_name);
    await ensureDir(outputDir);
    return appendFineTuneRun({
      dataset_id: payload.dataset_id,
      training_mode: payload.training_mode || "base",
      init_model_path: payload.init_model_path,
      speaker_encoder_model_path: payload.speaker_encoder_model_path || null,
      output_model_path: outputDir,
      final_checkpoint_path: null,
      batch_size: payload.batch_size || 2,
      lr: payload.lr || 2e-5,
      num_epochs: payload.num_epochs || 3,
      speaker_name: payload.speaker_name,
      status: payload.simulate_only ? "planned" : "queued",
      finished_at: null,
      log_path: path.join(outputDir, "train.log"),
      command: [
        appConfig.pythonBin,
        "train_qwen_tts.py",
        "--dataset",
        dataset.prepared_jsonl_path || dataset.raw_jsonl_path,
        "--output-dir",
        outputDir,
      ],
      selectable_model_path: null,
      is_selectable: false,
      stage_label: payload.simulate_only ? "계획 수립" : "실행 대기",
      summary_label: `${payload.training_mode || "base"} · ${dataset.name}`,
    });
  }

  @Get("audio-tools/capabilities")
  getAudioToolCapabilities() {
    return buildCapabilities();
  }

  @Get("audio-tools/jobs")
  async getAudioToolJobs(): Promise<AudioToolJob[]> {
    return listAudioToolJobs();
  }

  @Get("audio-tools/voice-models")
  getVoiceChangerModels() {
    return buildVoiceChangerModels();
  }

  @Post("audio-tools/sound-effects")
  async generateSoundEffect(@Body() payload: { prompt: string; duration_sec?: number; intensity?: number }) {
    const outputPath = path.join(appConfig.data.audioTools, `sound-effect-${randomUUID()}.wav`);
    await this.runtime.runAudioTool("sound-effect", [
      "--prompt",
      payload.prompt,
      "--duration-sec",
      String(payload.duration_sec || 4),
      "--intensity",
      String(payload.intensity || 0.8),
      "--output",
      outputPath,
    ]);

    return this.createAudioToolJob({
      kind: "sound_effect",
      status: "succeeded",
      inputSummary: payload.prompt,
      message: "Procedural sound effect generated.",
      assetPaths: [{ path: outputPath, label: "generated sound effect", source: "sound-effect", textPreview: payload.prompt }],
    });
  }

  @Post("audio-tools/voice-changer")
  async changeVoice(@Body() payload: { audio_path: string; pitch_shift_semitones?: number }) {
    const outputPath = path.join(appConfig.data.audioTools, `voice-changer-${randomUUID()}.wav`);
    await this.runtime.runAudioTool("voice-changer", [
      "--audio-path",
      payload.audio_path,
      "--pitch-shift-semitones",
      String(payload.pitch_shift_semitones || 0),
      "--output",
      outputPath,
    ]);

    return this.createAudioToolJob({
      kind: "voice_changer",
      status: "succeeded",
      inputSummary: path.basename(payload.audio_path),
      message: "Pitch-shift based voice conversion completed.",
      assetPaths: [{ path: outputPath, label: "voice changed speech", source: "voice-changer" }],
    });
  }

  @Post("audio-tools/convert")
  async convertAudio(@Body() payload: { audio_path: string; sample_rate?: number; mono?: boolean; output_format?: string }) {
    const extension = payload.output_format || "wav";
    const outputPath = path.join(appConfig.data.audioTools, `converted-${randomUUID()}.${extension}`);
    await this.runtime.runAudioTool("convert", [
      "--audio-path",
      payload.audio_path,
      "--sample-rate",
      String(payload.sample_rate || 24000),
      ...(payload.mono ? ["--mono"] : []),
      "--output",
      outputPath,
    ]);

    return this.createAudioToolJob({
      kind: "audio_converter",
      status: "succeeded",
      inputSummary: `${path.basename(payload.audio_path)} -> ${extension}`,
      message: "Audio conversion completed.",
      assetPaths: [{ path: outputPath, label: "converted audio", source: "audio-convert" }],
    });
  }

  @Post("audio-tools/separate")
  async separateAudio(@Body() payload: { audio_path: string }) {
    const baseId = randomUUID();
    const harmonicPath = path.join(appConfig.data.audioTools, `harmonic-${baseId}.wav`);
    const percussivePath = path.join(appConfig.data.audioTools, `percussive-${baseId}.wav`);
    await this.runtime.runAudioTool("separate", [
      "--audio-path",
      payload.audio_path,
      "--harmonic-output",
      harmonicPath,
      "--percussive-output",
      percussivePath,
    ]);

    return this.createAudioToolJob({
      kind: "audio_separation",
      status: "succeeded",
      inputSummary: path.basename(payload.audio_path),
      message: "HPSS audio separation completed.",
      assetPaths: [
        { path: harmonicPath, label: "harmonic track", source: "audio-separation" },
        { path: percussivePath, label: "percussive track", source: "audio-separation" },
      ],
    });
  }

  @Post("audio-tools/translate")
  async translateAudio(
    @Body()
    payload: {
      audio_path: string;
      target_language?: string;
      translated_text?: string;
      speaker?: string;
      instruct?: string;
      model_id?: string;
    },
  ) {
    const transcript = await this.runtime.transcribeAudio(payload.audio_path);
    let translatedText = (payload.translated_text || "").trim();

    if (!translatedText) {
      translatedText = await this.runtime.runLocalGemma(
        [
          `Translate the following speech transcript into ${payload.target_language || "English"}.`,
          "Return only the translated text.",
          transcript.text,
        ].join("\n"),
      );
    }

    const generation = await this.makeGenerationRecord({
      mode: "audio_translation",
      text: translatedText,
      language: payload.target_language || "English",
      voiceHint: payload.instruct || `translated-${payload.target_language || "English"}`,
      instruction: payload.instruct || "",
      speaker: payload.speaker || "sohee",
      sourceRefAudioPath: payload.audio_path,
      sourceRefText: transcript.text,
      meta: { model_id: payload.model_id || appConfig.models.qwenTts },
    });

    return this.createAudioToolJob({
      kind: "audio_translation",
      status: "succeeded",
      inputSummary: `translate to ${payload.target_language || "English"}`,
      message: "Transcript captured and translated speech synthesized.",
      assetPaths: [
        {
          path: generation.record.output_audio_path,
          label: "translated speech",
          source: "audio-translation",
          textPreview: translatedText,
        },
      ],
      transcriptText: transcript.text,
      translatedText,
      generationRecord: generation.record,
    });
  }

  async getHealth() {
    const runtimeHealth = await this.runtime.getRuntimeHealth();
    return {
      status: "ok",
      simulation_mode: false,
      runtime_mode: runtimeHealth.runtimeMode,
      qwen_tts_available: await pathExists(appConfig.models.qwenTts),
      device: "cuda:0",
      attention_implementation: "flash_attention_2 or sdpa",
      recommended_instruction_language: "English",
      data_dir: path.join(appConfig.projectRoot, "data"),
      modelDirectories: runtimeHealth.modelDirectories,
    };
  }
}
