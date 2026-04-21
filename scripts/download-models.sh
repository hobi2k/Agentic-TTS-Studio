#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_QWEN_DEMO_PYTHON="/home/hosung/pytorch-demo/Qwen3-TTS-Demo/.venv/bin/python"
if [[ -z "${PYTHON_BIN:-}" ]]; then
  if [[ -x "${DEFAULT_QWEN_DEMO_PYTHON}" ]]; then
    PYTHON_BIN="${DEFAULT_QWEN_DEMO_PYTHON}"
  else
    PYTHON_BIN="python3"
  fi
fi
GEMMA_REPO="${GEMMA_REPO:-google/gemma-3-4b-it}"
QWEN_REPO="${QWEN_REPO:-Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice}"
WHISPER_REPO="${WHISPER_REPO:-openai/whisper-large-v3}"

export ROOT_DIR
export GEMMA_REPO
export QWEN_REPO
export WHISPER_REPO
export HF_HUB_ENABLE_HF_TRANSFER="${HF_HUB_ENABLE_HF_TRANSFER:-1}"

mkdir -p "${ROOT_DIR}/models/gemma-3-4b-it"
mkdir -p "${ROOT_DIR}/models/qwen"
mkdir -p "${ROOT_DIR}/models/whisper"

"${PYTHON_BIN}" - <<'PY'
from huggingface_hub import snapshot_download
from pathlib import Path
import os

root = Path(os.environ["ROOT_DIR"])
downloads = [
    (os.environ["GEMMA_REPO"], root / "models" / "gemma-3-4b-it"),
    (os.environ["QWEN_REPO"], root / "models" / "qwen"),
    (os.environ["WHISPER_REPO"], root / "models" / "whisper"),
]

for repo_id, local_dir in downloads:
    print(f"Downloading {repo_id} -> {local_dir}")
    snapshot_download(
        repo_id=repo_id,
        local_dir=str(local_dir),
        local_dir_use_symlinks=False,
        resume_download=True,
    )
PY
