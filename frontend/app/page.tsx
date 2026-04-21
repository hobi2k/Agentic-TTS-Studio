import { StudioShell } from "@/components/studio-shell";
import { apiUrl } from "@/lib/api";
import type { RuntimeHealth } from "@/lib/types";

export default async function HomePage() {
  let health: RuntimeHealth = {
    runtimeMode: "unavailable",
    simulationMode: true,
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
