import { Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { appConfig } from "../common/app-config";
import { ensureDir, pathExists } from "../common/filesystem";
import { appendGeneratedAudioRecord } from "./generation-store";
import type { GeneratedAudioRecord, RuntimeHealth } from "./studio.types";

@Injectable()
export class LocalRuntimeService {
  private runPythonScript(script: string, args: string[]) {
    return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve) => {
      const child = spawn(appConfig.pythonBin, [script, ...args], {
        cwd: appConfig.projectRoot,
        env: process.env,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += String(chunk);
      });

      child.stderr.on("data", (chunk) => {
        stderr += String(chunk);
      });

      child.on("close", (code) => {
        resolve({ stdout, stderr, code });
      });
    });
  }

  private async assertModelPathExists(label: string, target: string) {
    if (!(await pathExists(target))) {
      throw new ServiceUnavailableException(`${label} model directory is missing: ${target}`);
    }
  }

  async getRuntimeHealth(): Promise<RuntimeHealth> {
    const gemmaExists = await pathExists(appConfig.models.gemma);
    const qwenExists = await pathExists(appConfig.models.qwenTts);
    const whisperExists = await pathExists(appConfig.models.whisper);

    return {
      runtimeMode: "local",
      modelDirectories: {
        gemma: gemmaExists ? appConfig.models.gemma : `${appConfig.models.gemma} (missing)`,
        qwenTts: qwenExists ? appConfig.models.qwenTts : `${appConfig.models.qwenTts} (missing)`,
        whisper: whisperExists ? appConfig.models.whisper : `${appConfig.models.whisper} (missing)`,
      },
    };
  }

  async runLocalSpeechGeneration(request: { text: string; voiceHint: string }): Promise<GeneratedAudioRecord> {
    const id = randomUUID();
    const outputPath = path.join(appConfig.data.generated, `${id}.wav`);

    await ensureDir(appConfig.data.generated);
    await this.assertModelPathExists("Qwen TTS", appConfig.models.qwenTts);

    const result = await this.runPythonScript(appConfig.scripts.qwenTts, [
      "--model-dir",
      appConfig.models.qwenTts,
      "--text",
      request.text,
      "--voice-hint",
      request.voiceHint,
      "--output",
      outputPath,
    ]);

    if (result.code !== 0) {
      throw new InternalServerErrorException(
        [
          "Qwen TTS generation failed.",
          result.stderr.trim(),
          result.stdout.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    if (!(await pathExists(outputPath))) {
      throw new InternalServerErrorException(`Qwen TTS did not create an output file: ${outputPath}`);
    }

    const record: GeneratedAudioRecord = {
      id,
      text: request.text,
      voiceHint: request.voiceHint,
      outputPath,
      publicUrl: `${appConfig.apiPublicUrl}/audio/${id}`,
      status: "generated",
      createdAt: new Date().toISOString(),
    };

    await appendGeneratedAudioRecord(record);
    return record;
  }

  async runLocalGemma(prompt: string) {
    await this.assertModelPathExists("Gemma", appConfig.models.gemma);

    const result = await this.runPythonScript(appConfig.scripts.gemma, [
      "--model-dir",
      appConfig.models.gemma,
      "--prompt",
      prompt,
    ]);

    if (result.code !== 0) {
      throw new InternalServerErrorException(
        [
          "Gemma execution failed.",
          result.stderr.trim(),
          result.stdout.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    const output = result.stdout.trim();
    if (!output) {
      throw new InternalServerErrorException("Gemma returned an empty response.");
    }

    return output;
  }
}
