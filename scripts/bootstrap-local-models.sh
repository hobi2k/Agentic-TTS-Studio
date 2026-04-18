#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

mkdir -p "${ROOT_DIR}/models/gemma-3-4b-it"
mkdir -p "${ROOT_DIR}/models/qwen"
mkdir -p "${ROOT_DIR}/models/whisper"
mkdir -p "${ROOT_DIR}/data/generated"
mkdir -p "${ROOT_DIR}/data/presets"
mkdir -p "${ROOT_DIR}/data/uploads"

if [[ ! -f "${ROOT_DIR}/.env.local" ]]; then
  cp "${ROOT_DIR}/.env.example" "${ROOT_DIR}/.env.local"
fi

echo "Initialized local model and data directories."
echo "Next step: fill model folders or run ./scripts/download-models.sh"
