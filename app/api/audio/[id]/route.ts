import fs from "node:fs/promises";
import { NextRequest } from "next/server";
import { appConfig } from "@/lib/server/config";
import { readJson } from "@/lib/server/filesystem";
import type { GeneratedAudioRecord } from "@/lib/types";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const record = await readJson<GeneratedAudioRecord>(`${appConfig.data.generated}/${id}.json`);

  if (!record) {
    return new Response("Audio record not found.", { status: 404 });
  }

  const fileBuffer = await fs.readFile(record.outputPath);

  return new Response(fileBuffer, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "no-store",
    },
  });
}
