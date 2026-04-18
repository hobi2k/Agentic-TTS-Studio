#!/usr/bin/env python3
import argparse
import wave
from pathlib import Path


def write_silent_wave(output_path: Path, duration_seconds: int = 1) -> None:
    sample_rate = 22050
    frame_count = sample_rate * duration_seconds

    with wave.open(str(output_path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(b"\x00\x00" * frame_count)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--text", required=True)
    parser.add_argument("--voice-hint", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    model_dir = Path(args.model_dir)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not model_dir.exists():
        raise SystemExit(f"Missing local Qwen TTS model directory: {model_dir}")

    # This is a safe local stub so the Next.js pipeline can be exercised before
    # the full inference backend is wired in.
    write_silent_wave(output_path)
    print(f"Wrote placeholder wave file to {output_path}")


if __name__ == "__main__":
    main()
