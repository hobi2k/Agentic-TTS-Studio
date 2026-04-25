import { Injectable } from "@nestjs/common";
import { appendPreset, getPreset, listPresets } from "../common/demo-store";
import { CreatePresetDto } from "./dto/create-preset.dto";
import { LocalRuntimeService } from "../studio/local-runtime.service";

@Injectable()
export class PresetsService {
  constructor(private readonly localRuntimeService: LocalRuntimeService) {}

  listPresets() {
    return listPresets();
  }

  getPreset(presetId: string) {
    return getPreset(presetId);
  }

  async generateFromPreset(
    presetId: string,
    payload: {
      text: string;
      language?: string;
      speaker?: string;
      instruct?: string;
    },
  ) {
    const preset = await getPreset(presetId);
    if (!preset) {
      return null;
    }

    const result = await this.localRuntimeService.runLocalSpeechGeneration({
      text: payload.text,
      language: payload.language || preset.language,
      speaker: payload.speaker || undefined,
      voiceHint: payload.instruct || preset.notes || preset.reference_text || preset.name,
    });

    return {
      record: {
        id: result.id,
        mode: "preset_generate",
        input_text: payload.text,
        language: payload.language || preset.language,
        speaker: payload.speaker || null,
        instruction: payload.instruct || preset.notes || null,
        preset_id: preset.id,
        output_audio_path: result.outputPath,
        output_audio_url: `${process.env.BACKEND_PUBLIC_URL || "http://127.0.0.1:4010/api"}/audio/${result.id}`,
        source_ref_audio_path: preset.reference_audio_path,
        source_ref_text: preset.reference_text,
        created_at: result.createdAt,
        meta: {
          preset_name: preset.name,
          base_model: preset.base_model,
        },
      },
    };
  }

  createPreset(dto: CreatePresetDto) {
    return appendPreset({
      name: dto.name,
      source_type: "manual",
      language: "Auto",
      base_model: "local-qwen",
      reference_text: dto.voiceHint,
      reference_audio_path: "",
      clone_prompt_path: "",
      notes: dto.notes || "",
    });
  }
}
