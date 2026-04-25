#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path

import torch
from transformers import pipeline


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local Whisper transcription from a local model directory.")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--audio-path", required=True)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model_dir = Path(args.model_dir)
    audio_path = Path(args.audio_path)

    if not model_dir.exists():
        raise SystemExit(f"Missing local Whisper model directory: {model_dir}")
    if not audio_path.exists():
        raise SystemExit(f"Missing input audio file: {audio_path}")

    transcriber = pipeline(
        "automatic-speech-recognition",
        model=str(model_dir),
        tokenizer=str(model_dir),
        feature_extractor=str(model_dir),
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        device=0 if torch.cuda.is_available() else -1,
    )
    result = transcriber(str(audio_path), return_language=True)
    print(
        json.dumps(
            {
                "text": result.get("text", "").strip(),
                "language": result.get("language"),
                "model_id": str(model_dir),
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
