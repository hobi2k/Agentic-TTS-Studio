import * as fs from "node:fs/promises";
import * as path from "node:path";

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
