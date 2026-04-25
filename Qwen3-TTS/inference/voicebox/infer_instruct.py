#!/usr/bin/env python3
"""Run regular VoiceBox `speaker + instruct` inference."""

from __future__ import annotations

import argparse
import importlib.util
from pathlib import Path

import soundfile as sf
import torch

from runtime import load_qwen_or_voicebox_model


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run VoiceBox regular instruct inference.")
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--speaker", default="sohee")
    parser.add_argument("--language", default="Korean")
    parser.add_argument("--text", required=True)
    parser.add_argument("--instruct", default="")
    parser.add_argument("--output", default="")
    parser.add_argument("--seed", type=int, default=None)
    return parser.parse_args()


def resolve_attention() -> str:
    if torch.cuda.is_available() and importlib.util.find_spec("flash_attn"):
        return "flash_attention_2"
    return "sdpa"


def main() -> None:
    args = parse_args()
    model = load_qwen_or_voicebox_model(
        args.model_path,
        device_map="cuda:0" if torch.cuda.is_available() else "cpu",
        dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        attn_implementation=resolve_attention(),
    )
    wavs, sample_rate = model.generate_custom_voice(
        text=args.text,
        speaker=args.speaker,
        language=args.language,
        instruct=args.instruct,
        seed=args.seed,
    )
    output = Path(args.output) if args.output else Path(args.model_path).resolve().parent / "voicebox_infer_output.wav"
    output.parent.mkdir(parents=True, exist_ok=True)
    sf.write(output, wavs[0], sample_rate)
    print(output)


if __name__ == "__main__":
    main()
