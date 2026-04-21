#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import os
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run local Gemma chat generation from a local model directory.")
    parser.add_argument("--model-dir", required=True, help="Path to a local Gemma model directory.")
    parser.add_argument("--prompt", required=True, help="Prompt text to send to the model.")
    parser.add_argument("--max-new-tokens", type=int, default=256)
    parser.add_argument("--temperature", type=float, default=0.7)
    parser.add_argument("--top-p", type=float, default=0.95)
    parser.add_argument("--top-k", type=int, default=40)
    parser.add_argument("--do-sample", action="store_true")
    return parser.parse_args()


def resolve_attention() -> str:
    if torch.cuda.is_available() and importlib.util.find_spec("flash_attn"):
        return "flash_attention_2"
    return "sdpa"


def preferred_dtype() -> torch.dtype:
    if torch.cuda.is_available():
        return torch.bfloat16
    return torch.float32


def load_model(model_dir: str):
    model_path = Path(model_dir)
    if not model_path.exists():
        raise SystemExit(f"Missing local Gemma model directory: {model_path}")

    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=preferred_dtype(),
        device_map="cuda:0" if torch.cuda.is_available() else "cpu",
        attn_implementation=resolve_attention(),
        trust_remote_code=True,
    )
    model.eval()
    return tokenizer, model


def build_inputs(tokenizer: AutoTokenizer, prompt: str):
    if hasattr(tokenizer, "apply_chat_template"):
        messages = [{"role": "user", "content": prompt}]
        formatted = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    else:
        formatted = prompt

    return tokenizer(formatted, return_tensors="pt")


def main() -> None:
    args = parse_args()
    tokenizer, model = load_model(args.model_dir)

    inputs = build_inputs(tokenizer, args.prompt)
    inputs = {key: value.to(model.device) for key, value in inputs.items()}

    with torch.inference_mode():
        output_ids = model.generate(
            **inputs,
            max_new_tokens=args.max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
            top_k=args.top_k,
            do_sample=args.do_sample,
            pad_token_id=tokenizer.pad_token_id or tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )

    prompt_length = inputs["input_ids"].shape[-1]
    generated_ids = output_ids[0][prompt_length:]
    generated_text = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

    if not generated_text:
        generated_text = "Gemma returned an empty response."

    print(generated_text)


if __name__ == "__main__":
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    main()
