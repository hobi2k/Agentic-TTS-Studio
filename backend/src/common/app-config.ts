import path from "node:path";

const backendRoot = process.cwd();
const projectRoot = path.resolve(backendRoot, "..");

function resolveLocalPath(input: string | undefined, fallback: string) {
  const value = input || fallback;
  return path.isAbsolute(value) ? value : path.join(projectRoot, value);
}

export const appConfig = {
  backendRoot,
  projectRoot,
  pythonBin: process.env.PYTHON_BIN || "python3",
  runtimeMode: process.env.LOCAL_RUNTIME_MODE || "auto",
  apiPublicUrl: process.env.BACKEND_PUBLIC_URL || `http://127.0.0.1:${process.env.PORT || 4010}/api`,
  models: {
    gemma: resolveLocalPath(process.env.GEMMA_MODEL_DIR, "./models/gemma-3-4b-it"),
    qwenTts: resolveLocalPath(process.env.QWEN_TTS_MODEL_DIR, "./models/qwen"),
    whisper: resolveLocalPath(process.env.WHISPER_MODEL_DIR, "./models/whisper"),
  },
  data: {
    generated: path.join(projectRoot, "data/generated"),
    presets: path.join(projectRoot, "data/presets"),
    uploads: path.join(projectRoot, "data/uploads"),
  },
  scripts: {
    gemma: path.join(projectRoot, "scripts/run_gemma_chat.py"),
    qwenTts: path.join(projectRoot, "scripts/run_qwen_tts.py"),
  },
};
