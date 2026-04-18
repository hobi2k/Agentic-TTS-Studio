#!/usr/bin/env python3
import argparse
from pathlib import Path


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model-dir", required=True)
    parser.add_argument("--prompt", required=True)
    args = parser.parse_args()

    model_dir = Path(args.model_dir)

    if not model_dir.exists():
        raise SystemExit(f"Missing local Gemma model directory: {model_dir}")

    prompt = args.prompt.strip()
    print(
        "Gemma planning stub:\n"
        f"- prompt length: {len(prompt)} chars\n"
        "- recommended flow: interpret intent -> inspect tools -> generate or save when requested\n"
        "- production note: replace this stub with a Transformers, llama.cpp, or vLLM-backed local Gemma runner"
    )


if __name__ == "__main__":
    main()
