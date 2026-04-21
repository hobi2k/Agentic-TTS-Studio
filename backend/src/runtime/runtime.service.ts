import { Injectable } from "@nestjs/common";
import { existsSync } from "node:fs";
import { appConfig } from "../common/app-config";

@Injectable()
export class RuntimeService {
  private readonly modelsRoot = appConfig.models;

  listLocalModels() {
    return [
      {
        kind: "chat",
        label: "Gemma 3 4B IT",
        localPath: this.modelsRoot.gemma,
        ready: existsSync(this.modelsRoot.gemma),
      },
      {
        kind: "tts",
        label: "Qwen TTS",
        localPath: this.modelsRoot.qwenTts,
        ready: existsSync(this.modelsRoot.qwenTts),
      },
      {
        kind: "stt",
        label: "Whisper",
        localPath: this.modelsRoot.whisper,
        ready: existsSync(this.modelsRoot.whisper),
      },
    ];
  }
}
