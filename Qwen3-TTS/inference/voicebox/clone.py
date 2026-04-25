#!/usr/bin/env python3
"""Compatibility wrapper for canonical VoiceBox clone inference."""

from __future__ import annotations

import runpy
from pathlib import Path

CANONICAL_SCRIPT = Path("/home/hosung/pytorch-demo/Qwen3-TTS-Demo/Qwen3-TTS/inference/voicebox/clone.py")

if __name__ == "__main__":
    runpy.run_path(str(CANONICAL_SCRIPT), run_name="__main__")
