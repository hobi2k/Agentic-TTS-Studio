import path from "node:path";

const repoRoot = process.cwd();

function resolveLocalPath(input: string, fallback: string) {
  const value = input || fallback;
  return path.isAbsolute(value) ? value : path.join(repoRoot, value);
}

export const appConfig = {
  repoRoot,
  pythonBin: process.env.PYTHON_BIN || "python3",
  runtimeMode: process.env.LOCAL_RUNTIME_MODE || "auto",
  models: {
    gemma: resolveLocalPath(process.env.GEMMA_MODEL_DIR || "", "./models/gemma-3-4b-it"),
    qwenTts: resolveLocalPath(process.env.QWEN_TTS_MODEL_DIR || "", "./models/qwen"),
    whisper: resolveLocalPath(process.env.WHISPER_MODEL_DIR || "", "./models/whisper"),
  },
  data: {
    generated: path.join(repoRoot, "data/generated"),
    presets: path.join(repoRoot, "data/presets"),
    uploads: path.join(repoRoot, "data/uploads"),
  },
  scripts: {
    gemma: path.join(repoRoot, "scripts/run_gemma_chat.py"),
    qwenTts: path.join(repoRoot, "scripts/run_qwen_tts.py"),
  },
};
