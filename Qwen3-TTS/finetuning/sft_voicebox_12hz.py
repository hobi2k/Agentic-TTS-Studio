#!/usr/bin/env python3
"""Compatibility wrapper for canonical VoiceBox retraining."""

from __future__ import annotations

import runpy
from pathlib import Path

CANONICAL_SCRIPT = Path("/home/hosung/pytorch-demo/Qwen3-TTS-Demo/Qwen3-TTS/finetuning/sft_voicebox_12hz.py")

if __name__ == "__main__":
    runpy.run_path(str(CANONICAL_SCRIPT), run_name="__main__")
