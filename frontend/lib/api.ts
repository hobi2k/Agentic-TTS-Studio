import type {
  AudioToolJob,
  BootstrapResponse,
  CharacterPreset,
  ChatResponse,
  ClonePromptRecord,
  FineTuneDataset,
  FineTuneRun,
  GenerationRecord,
  GenerationResponse,
  ModelInfo,
  RuntimeHealth,
  SpeakerInfo,
  VoiceChangerModelInfo,
} from "./types";

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4010/api";
const serverApiBaseUrl = process.env.INTERNAL_API_URL || publicApiBaseUrl;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicApiBaseUrl() {
  return trimTrailingSlash(publicApiBaseUrl);
}

export function getServerApiBaseUrl() {
  return trimTrailingSlash(serverApiBaseUrl);
}

export function apiUrl(path: string, mode: "public" | "server" = "public") {
  const baseUrl = mode === "server" ? getServerApiBaseUrl() : getPublicApiBaseUrl();
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(path), init);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return (await response.json()) as T;
}

export const api = {
  bootstrap() {
    return request<BootstrapResponse>("/bootstrap");
  },
  health() {
    return request<RuntimeHealth>("/health");
  },
  models() {
    return request<ModelInfo[]>("/models");
  },
  speakers() {
    return request<SpeakerInfo[]>("/speakers");
  },
  history() {
    return request<GenerationRecord[]>("/history");
  },
  deleteHistoryRecord(id: string) {
    return request<{ deleted_count: number }>(`/history/${id}`, { method: "DELETE" });
  },
  presets() {
    return request<CharacterPreset[]>("/presets");
  },
  datasets() {
    return request<FineTuneDataset[]>("/datasets");
  },
  runs() {
    return request<FineTuneRun[]>("/finetune-runs");
  },
  audioToolJobs() {
    return request<AudioToolJob[]>("/audio-tools/jobs");
  },
  voiceChangerModels() {
    return request<VoiceChangerModelInfo[]>("/audio-tools/voice-models");
  },
  chat(payload: { systemHint: string; voiceHint: string; messages: Array<{ id: string; role: "user" | "assistant" | "system"; content: string }> }) {
    return request<ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  uploadAudio(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ id: string; path: string; url: string; filename: string }>("/uploads/reference-audio", {
      method: "POST",
      body: formData,
    });
  },
  generateCustomVoice(payload: Record<string, unknown>) {
    return request<GenerationResponse>("/generate/custom-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateVoiceDesign(payload: Record<string, unknown>) {
    return request<GenerationResponse>("/generate/voice-design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateStoryStudio(payload: Record<string, unknown>) {
    return request<GenerationResponse>("/generate/story-studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateWithModel(payload: Record<string, unknown>) {
    return request<GenerationResponse>("/generate/model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateHybridCloneInstruct(payload: Record<string, unknown>) {
    return request<GenerationResponse>("/generate/hybrid-clone-instruct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  createCloneFromUpload(payload: Record<string, unknown>) {
    return request<ClonePromptRecord>("/clone-prompts/from-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  createCloneFromSample(payload: Record<string, unknown>) {
    return request<ClonePromptRecord>("/clone-prompts/from-generated-sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  transcribeAudio(audioPath: string) {
    return request<{ audio_path: string; text: string; language?: string | null; simulation: boolean; model_id?: string | null }>(
      "/transcriptions/reference-audio",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio_path: audioPath }),
      },
    );
  },
  createPreset(payload: Record<string, unknown>) {
    return request<CharacterPreset>("/presets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateFromPreset(presetId: string, payload: Record<string, unknown>) {
    return request<GenerationResponse>(`/presets/${presetId}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  createDataset(payload: Record<string, unknown>) {
    return request<FineTuneDataset>("/datasets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  prepareDataset(datasetId: string, payload: Record<string, unknown>) {
    return request<FineTuneDataset>(`/datasets/${datasetId}/prepare-codes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  createFineTuneRun(payload: Record<string, unknown>) {
    return request<FineTuneRun>("/finetune-runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  generateSoundEffect(payload: Record<string, unknown>) {
    return request<Record<string, unknown>>("/audio-tools/sound-effects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  changeVoice(payload: Record<string, unknown>) {
    return request<Record<string, unknown>>("/audio-tools/voice-changer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  convertAudio(payload: Record<string, unknown>) {
    return request<Record<string, unknown>>("/audio-tools/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  separateAudio(payload: Record<string, unknown>) {
    return request<Record<string, unknown>>("/audio-tools/separate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  translateAudio(payload: Record<string, unknown>) {
    return request<Record<string, unknown>>("/audio-tools/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
