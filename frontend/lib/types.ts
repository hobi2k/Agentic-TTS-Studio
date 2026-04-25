export type ChatRole = "user" | "assistant" | "system";

export type GeneratedAudioCard = {
  id: string;
  title: string;
  url: string;
  statusLabel: string;
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  generatedAudio?: GeneratedAudioCard;
  toolTrace?: string[];
};

export type ChatResponse = {
  reply: string;
  toolTrace: string[];
  generatedAudio?: GeneratedAudioCard;
};

export type RuntimeHealth = {
  status: string;
  simulation_mode: boolean;
  runtime_mode: string;
  qwen_tts_available: boolean;
  device: string;
  attention_implementation: string;
  recommended_instruction_language: string;
  data_dir: string;
  modelDirectories: {
    gemma: string;
    qwenTts: string;
    whisper: string;
  };
};

export type ModelInfo = {
  key: string;
  category: string;
  label: string;
  model_id: string;
  supports_instruction: boolean;
  notes: string;
  recommended: boolean;
  inference_mode?: string | null;
  source: string;
  available_speakers: string[];
  default_speaker?: string | null;
  model_family?: string | null;
  speaker_encoder_included?: boolean;
};

export type SpeakerInfo = {
  speaker: string;
  nativeLanguage: string;
  description: string;
};

export type AudioAsset = {
  id: string;
  path: string;
  url: string;
  filename: string;
  source: string;
  created_at?: string | null;
  text_preview?: string | null;
  transcript_text?: string | null;
};

export type GenerationRecord = {
  id: string;
  mode: string;
  input_text: string;
  language: string;
  speaker?: string | null;
  instruction?: string | null;
  preset_id?: string | null;
  output_audio_path: string;
  output_audio_url: string;
  source_ref_audio_path?: string | null;
  source_ref_text?: string | null;
  created_at: string;
  meta: Record<string, unknown>;
};

export type GenerationResponse = {
  record: GenerationRecord;
};

export type ClonePromptRecord = {
  id: string;
  source_type: string;
  base_model: string;
  prompt_path: string;
  reference_audio_path: string;
  reference_text: string;
  x_vector_only_mode: boolean;
  created_at: string;
  meta: Record<string, unknown>;
};

export type CharacterPreset = {
  id: string;
  name: string;
  source_type: string;
  base_model: string;
  language: string;
  reference_text: string;
  reference_audio_path: string;
  clone_prompt_path: string;
  created_at: string;
  notes: string;
};

export type FineTuneDataset = {
  id: string;
  name: string;
  source_type: string;
  dataset_root_path?: string | null;
  audio_dir_path?: string | null;
  manifest_path?: string | null;
  raw_jsonl_path: string;
  prepared_jsonl_path?: string | null;
  prepared_with_simulation?: boolean | null;
  prepared_tokenizer_model_path?: string | null;
  prepared_device?: string | null;
  ref_audio_path: string;
  speaker_name: string;
  sample_count: number;
  created_at: string;
  training_ready?: boolean;
  status_label?: string;
  next_step_label?: string;
};

export type FineTuneRun = {
  id: string;
  dataset_id: string;
  training_mode: string;
  init_model_path: string;
  speaker_encoder_model_path?: string | null;
  output_model_path: string;
  final_checkpoint_path?: string | null;
  batch_size: number;
  lr: number;
  num_epochs: number;
  speaker_name: string;
  status: string;
  created_at: string;
  finished_at?: string | null;
  log_path?: string | null;
  command?: string[] | null;
  selectable_model_path?: string | null;
  is_selectable?: boolean;
  stage_label?: string;
  summary_label?: string;
  model_family?: string | null;
  speaker_encoder_included?: boolean;
};

export type AudioToolCapability = {
  key: string;
  label: string;
  description: string;
  available: boolean;
  notes: string;
};

export type AudioToolAsset = {
  label: string;
  path: string;
  url: string;
  filename: string;
};

export type AudioToolJob = {
  id: string;
  kind: string;
  status: string;
  input_summary: string;
  created_at: string;
  artifacts: AudioToolAsset[];
  message: string;
};

export type VoiceChangerModelInfo = {
  id: string;
  label: string;
  model_path: string;
  index_path?: string | null;
};

export type BootstrapResponse = {
  health: RuntimeHealth;
  models: ModelInfo[];
  speakers: SpeakerInfo[];
  gallery: GenerationRecord[];
  audio_assets: AudioAsset[];
  history: GenerationRecord[];
  presets: CharacterPreset[];
  datasets: FineTuneDataset[];
  finetune_runs: FineTuneRun[];
  audio_tool_capabilities: AudioToolCapability[];
  audio_tool_jobs: AudioToolJob[];
  voice_changer_models: VoiceChangerModelInfo[];
};
