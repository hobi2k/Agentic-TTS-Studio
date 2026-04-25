import { Injectable } from "@nestjs/common";
import { LocalRuntimeService } from "../studio/local-runtime.service";
import { appConfig } from "../common/app-config";
import { pathExists } from "../common/filesystem";

@Injectable()
export class HealthService {
  constructor(private readonly localRuntimeService: LocalRuntimeService) {}

  async getHealth() {
    const runtimeHealth = await this.localRuntimeService.getRuntimeHealth();

    return {
      status: "ok",
      simulation_mode: false,
      runtime_mode: runtimeHealth.runtimeMode,
      qwen_tts_available: await pathExists(appConfig.models.qwenTts),
      device: "cuda:0",
      attention_implementation: "flash_attention_2 or sdpa",
      recommended_instruction_language: "English",
      data_dir: `${appConfig.projectRoot}/data`,
      modelDirectories: runtimeHealth.modelDirectories,
    };
  }
}
