import { StudioShell } from "@/components/studio-shell";
import { apiUrl } from "@/lib/api";
import type { RuntimeHealth } from "@/lib/types";

export default async function HomePage() {
  let health: RuntimeHealth = {
    status: "offline",
    simulation_mode: false,
    runtime_mode: "unavailable",
    qwen_tts_available: false,
    device: "unknown",
    attention_implementation: "unknown",
    recommended_instruction_language: "English",
    data_dir: "",
    modelDirectories: {
      gemma: "backend unavailable",
      qwenTts: "backend unavailable",
      whisper: "backend unavailable",
    },
  };

  try {
    const response = await fetch(apiUrl("/health", "server"), {
      cache: "no-store",
    });

    if (response.ok) {
      health = (await response.json()) as RuntimeHealth;
    }
  } catch {
    // Keep the safe fallback so the frontend can still build without a live backend.
  }

  return <StudioShell initialHealth={health} />;
}
