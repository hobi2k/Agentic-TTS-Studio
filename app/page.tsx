import { StudioShell } from "@/components/studio-shell";
import { getRuntimeHealth } from "@/lib/server/local-runtime";

export default async function HomePage() {
  const health = await getRuntimeHealth();

  return <StudioShell initialHealth={health} />;
}
