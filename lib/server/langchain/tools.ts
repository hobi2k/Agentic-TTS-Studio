import fs from "node:fs/promises";
import path from "node:path";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { appConfig } from "@/lib/server/config";
import { ensureDir, pathExists, readJson, writeJson } from "@/lib/server/filesystem";
import { makeGeneratedAudioCard } from "@/lib/server/generation-store";
import { getRuntimeHealth, runLocalSpeechGeneration } from "@/lib/server/local-runtime";

export type ToolContext = {
  generatedAudio?: ReturnType<typeof makeGeneratedAudioCard>;
};

export function createStudioTools(toolTrace: string[], context: ToolContext) {
  const inspectLocalModels = new DynamicStructuredTool({
    name: "inspect_local_models",
    description: "Inspect whether Gemma, Qwen TTS, and Whisper model folders exist locally.",
    schema: z.object({}),
    func: async () => {
      toolTrace.push("inspect_local_models");
      const health = await getRuntimeHealth();
      return JSON.stringify(health, null, 2);
    },
  });

  const generateSpeech = new DynamicStructuredTool({
    name: "generate_speech",
    description: "Generate speech audio from user text using the local TTS runtime or simulation fallback.",
    schema: z.object({
      text: z.string().min(1),
      voiceHint: z.string().default("default narrator"),
    }),
    func: async ({ text, voiceHint }) => {
      toolTrace.push("generate_speech");
      const record = await runLocalSpeechGeneration({ text, voiceHint });
      context.generatedAudio = makeGeneratedAudioCard(record);
      return JSON.stringify(record, null, 2);
    },
  });

  const savePreset = new DynamicStructuredTool({
    name: "save_preset",
    description: "Save a reusable voice preset as local JSON metadata.",
    schema: z.object({
      name: z.string().min(1),
      voiceHint: z.string().min(1),
      notes: z.string().default(""),
    }),
    func: async ({ name, voiceHint, notes }) => {
      toolTrace.push("save_preset");
      await ensureDir(appConfig.data.presets);
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const target = path.join(appConfig.data.presets, `${id}.json`);
      await writeJson(target, {
        id,
        name,
        voiceHint,
        notes,
        createdAt: new Date().toISOString(),
      });
      return JSON.stringify({ ok: true, id, target }, null, 2);
    },
  });

  const listPresets = new DynamicStructuredTool({
    name: "list_presets",
    description: "List saved preset metadata from the local presets folder.",
    schema: z.object({}),
    func: async () => {
      toolTrace.push("list_presets");
      const indexPath = appConfig.data.presets;
      const exists = await pathExists(indexPath);

      if (!exists) {
        return "[]";
      }

      const files = await fs.readdir(indexPath);
      const presets = await Promise.all(
        files
          .filter((file) => file.endsWith(".json"))
          .map((file) => readJson<Record<string, unknown>>(path.join(indexPath, file))),
      );
      return JSON.stringify(presets.filter(Boolean), null, 2);
    },
  });

  return [inspectLocalModels, generateSpeech, savePreset, listPresets];
}
