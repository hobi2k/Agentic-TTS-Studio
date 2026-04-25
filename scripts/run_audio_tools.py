#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

import librosa
import numpy as np
import soundfile as sf


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local audio tools for Agentic-TTS-Studio.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    sound_effect = subparsers.add_parser("sound-effect")
    sound_effect.add_argument("--prompt", required=True)
    sound_effect.add_argument("--duration-sec", type=float, default=4.0)
    sound_effect.add_argument("--intensity", type=float, default=0.8)
    sound_effect.add_argument("--output", required=True)

    voice_changer = subparsers.add_parser("voice-changer")
    voice_changer.add_argument("--audio-path", required=True)
    voice_changer.add_argument("--pitch-shift-semitones", type=float, default=0.0)
    voice_changer.add_argument("--output", required=True)

    converter = subparsers.add_parser("convert")
    converter.add_argument("--audio-path", required=True)
    converter.add_argument("--sample-rate", type=int, default=24000)
    converter.add_argument("--mono", action="store_true")
    converter.add_argument("--output", required=True)

    separator = subparsers.add_parser("separate")
    separator.add_argument("--audio-path", required=True)
    separator.add_argument("--harmonic-output", required=True)
    separator.add_argument("--percussive-output", required=True)
    return parser.parse_args()


def ensure_parent(target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)


def prompt_seed(prompt: str) -> int:
    return abs(hash(prompt)) % (2**32)


def generate_sound_effect(prompt: str, duration_sec: float, intensity: float, output: Path) -> None:
    sr = 24000
    sample_count = max(1, int(duration_sec * sr))
    rng = np.random.default_rng(prompt_seed(prompt))
    time = np.linspace(0.0, duration_sec, sample_count, endpoint=False)

    low = np.sin(2 * np.pi * rng.uniform(40.0, 110.0) * time)
    mid = np.sin(2 * np.pi * rng.uniform(180.0, 560.0) * time + rng.uniform(0.0, np.pi))
    high = np.sin(2 * np.pi * rng.uniform(800.0, 2400.0) * time + rng.uniform(0.0, np.pi))
    noise = rng.normal(0.0, 0.18, sample_count)
    envelope = np.exp(-time * rng.uniform(0.4, 2.2))

    waveform = (low * 0.45 + mid * 0.25 + high * 0.1 + noise) * envelope * intensity
    waveform = np.clip(waveform, -0.99, 0.99).astype(np.float32)
    ensure_parent(output)
    sf.write(output, waveform, sr)


def transform_voice(audio_path: Path, pitch_shift_semitones: float, output: Path) -> None:
    waveform, sr = librosa.load(audio_path, sr=None, mono=True)
    shifted = librosa.effects.pitch_shift(waveform, sr=sr, n_steps=pitch_shift_semitones)
    shifted = librosa.util.normalize(shifted).astype(np.float32)
    ensure_parent(output)
    sf.write(output, shifted, sr)


def convert_audio(audio_path: Path, sample_rate: int, mono: bool, output: Path) -> None:
    waveform, _ = librosa.load(audio_path, sr=sample_rate, mono=mono)
    ensure_parent(output)
    sf.write(output, waveform, sample_rate)


def separate_audio(audio_path: Path, harmonic_output: Path, percussive_output: Path) -> None:
    waveform, sr = librosa.load(audio_path, sr=None, mono=True)
    harmonic, percussive = librosa.effects.hpss(waveform)
    ensure_parent(harmonic_output)
    ensure_parent(percussive_output)
    sf.write(harmonic_output, harmonic.astype(np.float32), sr)
    sf.write(percussive_output, percussive.astype(np.float32), sr)


def main() -> None:
    args = parse_args()

    if args.command == "sound-effect":
        generate_sound_effect(args.prompt, args.duration_sec, args.intensity, Path(args.output))
        print(args.output)
        return

    if args.command == "voice-changer":
        transform_voice(Path(args.audio_path), args.pitch_shift_semitones, Path(args.output))
        print(args.output)
        return

    if args.command == "convert":
        convert_audio(Path(args.audio_path), args.sample_rate, args.mono, Path(args.output))
        print(args.output)
        return

    if args.command == "separate":
        separate_audio(Path(args.audio_path), Path(args.harmonic_output), Path(args.percussive_output))
        print(f"{args.harmonic_output}\n{args.percussive_output}")
        return

    raise SystemExit(f"Unknown command: {args.command}")


if __name__ == "__main__":
    main()
