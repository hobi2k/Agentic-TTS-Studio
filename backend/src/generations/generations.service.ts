import { Injectable } from "@nestjs/common";
import { appendGenerationRecord, listGenerationRecords } from "../common/demo-store";
import { CreateGenerationDto } from "./dto/create-generation.dto";

@Injectable()
export class GenerationsService {
  listGenerations() {
    return listGenerationRecords();
  }

  createGeneration(dto: CreateGenerationDto) {
    const now = new Date().toISOString();
    return appendGenerationRecord({
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`,
      mode: "chat_generation",
      input_text: dto.inputText,
      language: "Auto",
      speaker: null,
      instruction: dto.voiceHint || null,
      preset_id: null,
      output_audio_path: "",
      output_audio_url: "",
      source_ref_audio_path: null,
      source_ref_text: null,
      created_at: now,
      meta: { runtime_mode: dto.runtimeMode || "local" },
    });
  }
}
