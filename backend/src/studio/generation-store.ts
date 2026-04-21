import path from "node:path";
import { appConfig } from "../common/app-config";
import { ensureDir, readJson, writeJson } from "../common/filesystem";
import type { GeneratedAudioRecord } from "./studio.types";

export async function saveGeneratedAudioRecord(record: GeneratedAudioRecord) {
  const recordPath = path.join(appConfig.data.generated, `${record.id}.json`);
  await ensureDir(appConfig.data.generated);
  await writeJson(recordPath, record);
}

export async function listGeneratedAudioRecords() {
  const index = await readJson<GeneratedAudioRecord[]>(path.join(appConfig.data.generated, "index.json"));
  return index ?? [];
}

export async function appendGeneratedAudioRecord(record: GeneratedAudioRecord) {
  const current = await listGeneratedAudioRecords();
  const next = [record, ...current].slice(0, 50);
  await writeJson(path.join(appConfig.data.generated, "index.json"), next);
  await saveGeneratedAudioRecord(record);
}

export function makeGeneratedAudioCard(record: GeneratedAudioRecord) {
  return {
    id: record.id,
    title: `Generated speech · ${record.voiceHint || "default voice"}`,
    url: `${appConfig.apiPublicUrl}/audio/${record.id}`,
    statusLabel: record.status === "generated" ? "local runtime" : "simulation fallback",
  };
}
