import { spawn } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import { appConfig } from "@/lib/server/config";
import { appendGeneratedAudioRecord } from "@/lib/server/generation-store";
import { ensureDir, pathExists, writeSilentWaveFile } from "@/lib/server/filesystem";
import type { GeneratedAudioRecord, RuntimeHealth } from "@/lib/types";

const wait = promisify(setTimeout);

type LocalSpeechRequest = {
  text: string;
  voiceHint: string;
};

async function runPythonScript(script: string, args: string[]) {
  return new Promise<{ stdout: string; stderr: string; code: number | null }>((resolve) => {
    const child = spawn(appConfig.pythonBin, [script, ...args], {
      cwd: appConfig.repoRoot,
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

export async function getRuntimeHealth(): Promise<RuntimeHealth> {
  const gemmaExists = await pathExists(appConfig.models.gemma);
  const qwenExists = await pathExists(appConfig.models.qwenTts);
  const whisperExists = await pathExists(appConfig.models.whisper);
  const simulationMode = appConfig.runtimeMode === "simulation" || !gemmaExists || !qwenExists;

  return {
    runtimeMode: simulationMode ? "simulation" : "local",
    simulationMode,
    modelDirectories: {
      gemma: gemmaExists ? appConfig.models.gemma : `${appConfig.models.gemma} (missing)`,
      qwenTts: qwenExists ? appConfig.models.qwenTts : `${appConfig.models.qwenTts} (missing)`,
      whisper: whisperExists ? appConfig.models.whisper : `${appConfig.models.whisper} (missing)`,
    },
  };
}

export async function runLocalSpeechGeneration(request: LocalSpeechRequest): Promise<GeneratedAudioRecord> {
  const id = randomUUID();
  const outputPath = path.join(appConfig.data.generated, `${id}.wav`);
  const health = await getRuntimeHealth();

  await ensureDir(appConfig.data.generated);

  let status: GeneratedAudioRecord["status"] = "generated";

  if (!health.simulationMode) {
    const result = await runPythonScript(appConfig.scripts.qwenTts, [
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
      status = "simulated";
      await writeSilentWaveFile(outputPath, 1);
    }
  } else {
    await wait(120);
    status = "simulated";
    await writeSilentWaveFile(outputPath, 1);
  }

  const record: GeneratedAudioRecord = {
    id,
    text: request.text,
    voiceHint: request.voiceHint,
    outputPath,
    publicUrl: `/data/generated/${path.basename(outputPath)}`,
    status,
    createdAt: new Date().toISOString(),
  };

  await appendGeneratedAudioRecord(record);
  return record;
}

export async function runLocalGemma(prompt: string) {
  const health = await getRuntimeHealth();

  if (health.simulationMode) {
    return [
      "현재 Gemma 로컬 런타임이 준비되지 않았습니다.",
      "그래도 채팅형 작업 흐름은 계속 진행할 수 있습니다.",
      "모델이 준비되면 같은 요청이 실제 LangChain + Gemma 계획 실행으로 바뀝니다.",
    ].join("\n");
  }

  const result = await runPythonScript(appConfig.scripts.gemma, [
    "--model-dir",
    appConfig.models.gemma,
    "--prompt",
    prompt,
  ]);

  if (result.code !== 0) {
    return "Gemma 실행에 실패했습니다. 현재는 fallback 응답으로 전환합니다.";
  }

  return result.stdout.trim() || "Gemma 응답이 비어 있어서 fallback 요약을 사용합니다.";
}
