import fs from "node:fs/promises";
import path from "node:path";

export async function ensureDir(target: string) {
  await fs.mkdir(target, { recursive: true });
}

export async function pathExists(target: string) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

export async function writeJson(target: string, payload: unknown) {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, JSON.stringify(payload, null, 2), "utf-8");
}

export async function readJson<T>(target: string): Promise<T | null> {
  try {
    const content = await fs.readFile(target, "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeSilentWaveFile(target: string, durationSeconds = 1) {
  const sampleRate = 22050;
  const sampleCount = sampleRate * durationSeconds;
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = sampleCount * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  await ensureDir(path.dirname(target));
  await fs.writeFile(target, buffer);
}
