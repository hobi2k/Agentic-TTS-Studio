import { Injectable, InternalServerErrorException, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { appConfig } from "../common/app-config";
import { appendGeneratedAudioRecord } from "./generation-store";
import { ensureDir, pathExists } from "../common/filesystem";
import type { GeneratedAudioRecord, RuntimeHealth } from "./studio.types";
import type { ModelInfo, SpeakerInfo } from "../common/demo-types";

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

  private async scanFineTunedModels(): Promise<ModelInfo[]> {
    const runRoots = [appConfig.data.finetuneRuns, "/home/hosung/pytorch-demo/Qwen3-TTS-Demo/data/finetune-runs"];
    const models: ModelInfo[] = [];

    for (const runRoot of runRoots) {
      if (!(await pathExists(runRoot))) {
        continue;
      }

      const entries = await fs.readdir(runRoot, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const runDir = path.join(runRoot, entry.name);
        const finalDir = path.join(runDir, "final");
        const configPath = path.join(finalDir, "config.json");
        const weightPath = path.join(finalDir, "model.safetensors");

        if (!(await pathExists(configPath)) || !(await pathExists(weightPath))) {
          continue;
        }

        try {
          const config = JSON.parse(await fs.readFile(configPath, "utf-8")) as Record<string, unknown>;
          const ttsModelType = String(config.tts_model_type || "").toLowerCase();
          const modelFamily = String(config.demo_model_family || "").toLowerCase() || null;
          const speakerEncoderIncluded = Boolean(config.speaker_encoder_included);
          const talkerConfig = (config.talker_config || {}) as Record<string, unknown>;
          const speakerMap = ((talkerConfig.spk_id as Record<string, unknown> | undefined) || {}) as Record<string, unknown>;
          const speakerNames = Object.keys(speakerMap);
          const defaultSpeaker = speakerNames.at(-1) || null;

          let category = "finetuned";
          let inferenceMode = "custom_voice";
          let supportsInstruction = true;

          if (modelFamily === "voicebox") {
            category = "voicebox_finetuned";
            inferenceMode = "custom_voice";
            supportsInstruction = true;
          } else if (ttsModelType === "base") {
            category = "base_clone_finetuned";
            inferenceMode = "voice_clone";
            supportsInstruction = false;
          } else if (ttsModelType === "voice_design") {
            category = "voice_design_finetuned";
          } else {
            category = "custom_voice_finetuned";
          }

          const labelPrefix = modelFamily === "voicebox" ? "VoiceBox" : "학습된";
          const notes = [
            `최종 체크포인트: ${finalDir}`,
            speakerEncoderIncluded ? "embedded speaker encoder" : "",
          ]
            .filter(Boolean)
            .join(" · ");

          models.push({
            key: `ft_${entry.name}`.replace(/[^a-z0-9_:-]/gi, "_"),
            category,
            label: `${labelPrefix} ${entry.name}`,
            model_id: finalDir,
            supports_instruction: supportsInstruction,
            notes,
            recommended: modelFamily === "voicebox",
            inference_mode: inferenceMode,
            source: "finetuned",
            available_speakers: speakerNames,
            default_speaker: defaultSpeaker,
            model_family: modelFamily,
            speaker_encoder_included: speakerEncoderIncluded,
          });
        } catch {
          // Ignore malformed checkpoints.
        }
      }
    }

    return models.sort((left, right) => left.label.localeCompare(right.label));
  }

  async listModelCatalog(): Promise<ModelInfo[]> {
    const stock: ModelInfo[] = [
      {
        key: "custom_voice_primary",
        category: "custom_voice",
        label: "Qwen3 TTS Custom Voice",
        model_id: appConfig.models.qwenTts,
        supports_instruction: true,
        notes: "로컬 CustomVoice/VoiceDesign 체크포인트를 자동 탐색합니다.",
        recommended: true,
        inference_mode: "custom_voice",
        source: "local",
        available_speakers: ["sohee", "ryan", "vivian", "serena", "aiden", "ono_anna", "uncle_fu"],
        default_speaker: "sohee",
        model_family: "qwen3-tts",
        speaker_encoder_included: false,
      },
      {
        key: "voice_design_primary",
        category: "voice_design",
        label: "Qwen3 TTS Voice Design",
        model_id: appConfig.models.qwenTts,
        supports_instruction: true,
        notes: "설명문 기반 voice design 생성에 사용합니다.",
        recommended: true,
        inference_mode: "voice_design",
        source: "local",
        available_speakers: ["sohee", "ryan", "vivian", "serena", "aiden", "ono_anna", "uncle_fu"],
        default_speaker: "sohee",
        model_family: "qwen3-tts",
        speaker_encoder_included: false,
      },
      {
        key: "gemma_4b_it",
        category: "orchestration",
        label: "Gemma 3 4B IT",
        model_id: appConfig.models.gemma,
        supports_instruction: true,
        notes: "오케스트레이션 계획 및 번역 보조에 사용합니다.",
        recommended: true,
        inference_mode: "chat",
        source: "local",
        available_speakers: [],
        default_speaker: null,
        model_family: "gemma",
        speaker_encoder_included: false,
      },
    ];

    const fineTuned = await this.scanFineTunedModels();
    return [...stock, ...fineTuned];
  }

  listSpeakers(): SpeakerInfo[] {
    return [
      { speaker: "sohee", nativeLanguage: "Korean", description: "차분한 한국어 여성 기본 화자" },
      { speaker: "ryan", nativeLanguage: "English", description: "명료한 영어 남성 화자" },
      { speaker: "vivian", nativeLanguage: "Chinese", description: "또렷한 중국어 여성 화자" },
      { speaker: "serena", nativeLanguage: "English", description: "부드러운 영어 여성 화자" },
      { speaker: "aiden", nativeLanguage: "English", description: "단단한 영어 남성 화자" },
      { speaker: "ono_anna", nativeLanguage: "Japanese", description: "밝은 일본어 여성 화자" },
      { speaker: "uncle_fu", nativeLanguage: "Chinese", description: "낮고 안정적인 중국어 남성 화자" },
    ];
  }

  async runLocalSpeechGeneration(request: {
    text: string;
    voiceHint: string;
    language?: string;
    speaker?: string;
    maxNewTokens?: number;
    modelDir?: string;
  }): Promise<GeneratedAudioRecord> {
    const id = randomUUID();
    const outputPath = path.join(appConfig.data.generated, `${id}.wav`);
    const modelDir = request.modelDir || appConfig.models.qwenTts;

    await ensureDir(appConfig.data.generated);
    await this.assertModelPathExists("Qwen TTS", modelDir);

    const result = await this.runPythonScript(appConfig.scripts.qwenTts, [
      "--model-dir",
      modelDir,
      "--text",
      request.text,
      "--voice-hint",
      request.voiceHint,
      "--language",
      request.language || "",
      "--speaker",
      request.speaker || "",
      "--max-new-tokens",
      String(request.maxNewTokens || 2048),
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

  async transcribeAudio(audioPath: string) {
    await this.assertModelPathExists("Whisper", appConfig.models.whisper);

    const result = await this.runPythonScript(appConfig.scripts.whisper, [
      "--model-dir",
      appConfig.models.whisper,
      "--audio-path",
      audioPath,
    ]);

    if (result.code !== 0) {
      throw new InternalServerErrorException(
        [
          "Whisper transcription failed.",
          result.stderr.trim(),
          result.stdout.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    try {
      return JSON.parse(result.stdout.trim()) as { text: string; language?: string | null; model_id?: string | null };
    } catch {
      throw new InternalServerErrorException(`Whisper returned invalid JSON: ${result.stdout.trim()}`);
    }
  }

  async runAudioTool(command: "sound-effect" | "voice-changer" | "convert" | "separate", args: string[]) {
    const result = await this.runPythonScript(appConfig.scripts.audioTools, [command, ...args]);

    if (result.code !== 0) {
      throw new InternalServerErrorException(
        [
          `Audio tool '${command}' failed.`,
          result.stderr.trim(),
          result.stdout.trim(),
        ]
          .filter(Boolean)
          .join("\n"),
      );
    }

    return result.stdout.trim();
  }
}
