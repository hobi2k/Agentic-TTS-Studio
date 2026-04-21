import { Injectable } from "@nestjs/common";
import { LocalRuntimeService } from "../studio/local-runtime.service";

@Injectable()
export class HealthService {
  constructor(private readonly localRuntimeService: LocalRuntimeService) {}

  async getHealth() {
    const runtimeHealth = await this.localRuntimeService.getRuntimeHealth();

    return {
      status: "ok",
      service: "agentic-tts-studio-backend",
      ...runtimeHealth,
    };
  }
}
