#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Any

import soundfile as sf
import torch
from transformers import AutoConfig, AutoModel, AutoProcessor


PROJECT_ROOT = Path(__file__).resolve().parents[1]
QWEN_DEMO_ROOT = Path("/home/hosung/pytorch-demo/Qwen3-TTS-Demo")
QWEN_PACKAGE_ROOT = QWEN_DEMO_ROOT / "Qwen3-TTS"
RUNTIME_CACHE_ROOT = PROJECT_ROOT / ".cache"

os.environ.setdefault("NUMBA_CACHE_DIR", str(RUNTIME_CACHE_ROOT / "numba"))
os.environ.setdefault("HF_HOME", str(RUNTIME_CACHE_ROOT / "huggingface"))
Path(os.environ["NUMBA_CACHE_DIR"]).mkdir(parents=True, exist_ok=True)
Path(os.environ["HF_HOME"]).mkdir(parents=True, exist_ok=True)

if str(QWEN_PACKAGE_ROOT) not in sys.path and QWEN_PACKAGE_ROOT.exists():
    sys.path.insert(0, str(QWEN_PACKAGE_ROOT))

from qwen_tts import Qwen3TTSModel  # type: ignore  # noqa: E402
from qwen_tts.core.models import (  # type: ignore  # noqa: E402
    Qwen3TTSConfig,
    Qwen3TTSForConditionalGeneration,
    Qwen3TTSProcessor,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local Qwen TTS generation from a local model directory.")
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice-hint", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--language", default="")
    parser.add_argument("--speaker", default="")
    parser.add_argument("--max-new-tokens", type=int, default=2048)
    return parser.parse_args()


def resolve_attention() -> str:
    if torch.cuda.is_available() and importlib.util.find_spec("flash_attn"):
        return "flash_attention_2"
    return "sdpa"


def preferred_dtype() -> torch.dtype:
    if torch.cuda.is_available():
        return torch.bfloat16
    return torch.float32


def raw_config(model_path: Path) -> dict[str, Any]:
    return json.loads((model_path / "config.json").read_text(encoding="utf-8"))


def resolve_qwen_model_dir(root: Path) -> Path:
    if (root / "config.json").exists():
        return root

    candidates = sorted(
        [
            path
            for path in root.iterdir()
            if path.is_dir() and (path / "config.json").exists()
        ]
    )

    for preferred_token in ["CustomVoice", "custom", "VoiceDesign", "Base", "base"]:
        for candidate in candidates:
            if preferred_token.lower() in candidate.name.lower():
                return candidate

    if candidates:
        return candidates[0]

    raise SystemExit(f"No Qwen TTS model directory with config.json found under: {root}")


def is_voicebox_checkpoint(model_path: Path) -> bool:
    try:
        config = raw_config(model_path)
    except Exception:
        return False
    return bool(config.get("demo_model_family") == "voicebox" and config.get("speaker_encoder_included"))


def load_voicebox_model(model_dir: Path, **kwargs: Any) -> Qwen3TTSModel:
    AutoConfig.register("qwen3_tts", Qwen3TTSConfig)
    AutoModel.register(Qwen3TTSConfig, Qwen3TTSForConditionalGeneration)
    AutoProcessor.register(Qwen3TTSConfig, Qwen3TTSProcessor)

    config = AutoConfig.from_pretrained(model_dir)
    runtime_tts_model_type = config.tts_model_type
    config.tts_model_type = "base"
    model = AutoModel.from_pretrained(model_dir, config=config, **kwargs)

    if not isinstance(model, Qwen3TTSForConditionalGeneration):
        raise TypeError(f"Expected Qwen3TTSForConditionalGeneration, got {type(model)}")

    model.tts_model_type = runtime_tts_model_type
    model.config.tts_model_type = runtime_tts_model_type
    processor = AutoProcessor.from_pretrained(model_dir, fix_mistral_regex=True)
    return Qwen3TTSModel(model=model, processor=processor, generate_defaults=model.generate_config)


def load_qwen_model(model_dir: Path) -> Qwen3TTSModel:
    kwargs = {
        "device_map": "cuda:0" if torch.cuda.is_available() else "cpu",
        "dtype": preferred_dtype(),
        "attn_implementation": resolve_attention(),
    }

    if is_voicebox_checkpoint(model_dir):
        return load_voicebox_model(model_dir, **kwargs)
    return Qwen3TTSModel.from_pretrained(str(model_dir), **kwargs)


def infer_language(text: str, voice_hint: str, explicit: str) -> str:
    if explicit:
        return explicit

    hint = voice_hint.lower()
    if "korean" in hint or "한국어" in hint or "korean" in text.lower():
        return "Korean"
    if "japanese" in hint or "일본어" in hint:
        return "Japanese"
    if "chinese" in hint or "중국어" in hint:
        return "Chinese"
    if any("가" <= char <= "힣" for char in text):
        return "Korean"
    return "English"


def choose_speaker(model: Qwen3TTSModel, voice_hint: str, language: str, explicit: str) -> str:
    supported = model.get_supported_speakers() or []
    if explicit:
        return explicit

    hint = voice_hint.lower()
    mapping = [
        ("sohee", "sohee"),
        ("ryan", "ryan"),
        ("vivian", "vivian"),
        ("serena", "serena"),
        ("aiden", "aiden"),
        ("anna", "ono_anna"),
        ("ono", "ono_anna"),
        ("uncle", "uncle_fu"),
        ("fu", "uncle_fu"),
    ]

    for token, speaker in mapping:
        if token in hint and speaker in supported:
            return speaker

    defaults_by_language = {
        "Korean": "sohee",
        "Japanese": "ono_anna",
        "Chinese": "vivian",
        "English": "ryan",
    }

    default_speaker = defaults_by_language.get(language, "ryan")
    if default_speaker in supported:
        return default_speaker
    if supported:
        return supported[0]
    return "Ryan"


def run_generation(model: Qwen3TTSModel, text: str, voice_hint: str, language: str, speaker: str, output_path: Path, max_new_tokens: int):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    model_type = getattr(model.model, "tts_model_type", "")

    common_kwargs = {
        "text": text,
        "language": language,
        "max_new_tokens": max_new_tokens,
    }

    if model_type == "custom_voice":
        wavs, sample_rate = model.generate_custom_voice(
            speaker=speaker,
            instruct=voice_hint or "",
            **common_kwargs,
        )
    elif model_type == "voice_design":
        wavs, sample_rate = model.generate_voice_design(
            instruct=voice_hint or "Warm, natural speech.",
            **common_kwargs,
        )
    elif model_type == "base":
        raise SystemExit(
            "The resolved Qwen TTS model is a Base model. This project's text-only TTS path expects a CustomVoice or VoiceDesign checkpoint."
        )
    else:
        raise SystemExit(f"Unsupported qwen tts model type: {model_type}")

    sf.write(output_path, wavs[0], sample_rate)


def main() -> None:
    args = parse_args()
    resolved_root = resolve_qwen_model_dir(Path(args.model_dir))
    output_path = Path(args.output)

    if not resolved_root.exists():
        raise SystemExit(f"Missing local Qwen TTS model directory: {resolved_root}")

    model = load_qwen_model(resolved_root)
    language = infer_language(args.text, args.voice_hint, args.language)
    speaker = choose_speaker(model, args.voice_hint, language, args.speaker)

    run_generation(
        model=model,
        text=args.text,
        voice_hint=args.voice_hint,
        language=language,
        speaker=speaker,
        output_path=output_path,
        max_new_tokens=args.max_new_tokens,
    )

    print(output_path)


if __name__ == "__main__":
    main()
