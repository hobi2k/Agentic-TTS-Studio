#!/usr/bin/env python3
"""VoiceBox runtime helpers for Agentic-TTS-Studio."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any

from transformers import AutoConfig, AutoModel, AutoProcessor

PROJECT_ROOT = Path(__file__).resolve().parents[3]
QWEN_PACKAGE_ROOT = PROJECT_ROOT / ".venv" / "src" / "qwen-tts"
if str(QWEN_PACKAGE_ROOT) not in sys.path and QWEN_PACKAGE_ROOT.exists():
    sys.path.insert(0, str(QWEN_PACKAGE_ROOT))

from qwen_tts import Qwen3TTSModel  # type: ignore
from qwen_tts.core.models import Qwen3TTSConfig, Qwen3TTSForConditionalGeneration, Qwen3TTSProcessor  # type: ignore


def _load_raw_config(model_path: str | Path) -> dict[str, Any]:
    return json.loads((Path(model_path) / "config.json").read_text(encoding="utf-8"))


def is_voicebox_checkpoint(model_path: str | Path) -> bool:
    try:
        raw = _load_raw_config(model_path)
    except Exception:
        return False
    return bool(raw.get("demo_model_family") == "voicebox" and raw.get("speaker_encoder_included"))


def load_voicebox_model(pretrained_model_name_or_path: str, **kwargs: Any) -> Qwen3TTSModel:
    AutoConfig.register("qwen3_tts", Qwen3TTSConfig)
    AutoModel.register(Qwen3TTSConfig, Qwen3TTSForConditionalGeneration)
    AutoProcessor.register(Qwen3TTSConfig, Qwen3TTSProcessor)

    config = AutoConfig.from_pretrained(pretrained_model_name_or_path)
    runtime_tts_model_type = config.tts_model_type
    config.tts_model_type = "base"

    model = AutoModel.from_pretrained(pretrained_model_name_or_path, config=config, **kwargs)
    if not isinstance(model, Qwen3TTSForConditionalGeneration):
        raise TypeError(f"Expected Qwen3TTSForConditionalGeneration, got {type(model)}")

    model.tts_model_type = runtime_tts_model_type
    model.config.tts_model_type = runtime_tts_model_type
    processor = AutoProcessor.from_pretrained(pretrained_model_name_or_path, fix_mistral_regex=True)
    return Qwen3TTSModel(model=model, processor=processor, generate_defaults=model.generate_config)


def load_qwen_or_voicebox_model(pretrained_model_name_or_path: str, **kwargs: Any) -> Qwen3TTSModel:
    checkpoint_dir = Path(pretrained_model_name_or_path)
    if checkpoint_dir.is_dir() and is_voicebox_checkpoint(checkpoint_dir):
        return load_voicebox_model(str(checkpoint_dir), **kwargs)
    return Qwen3TTSModel.from_pretrained(pretrained_model_name_or_path, **kwargs)
