import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { appConfig } from "./app-config";
import { ensureDir, pathExists, readJson, writeJson } from "./filesystem";
import type {
  AudioAsset,
  AudioToolJob,
  CharacterPreset,
  ClonePromptRecord,
  FineTuneDataset,
  FineTuneRun,
  GenerationRecord,
} from "./demo-types";

type CollectionName =
  | "assets"
  | "history"
  | "presets"
  | "clone-prompts"
  | "datasets"
  | "finetune-runs"
  | "audio-tool-jobs";

const collectionFileNames: Record<CollectionName, string> = {
  assets: "assets.json",
  history: "history.json",
  presets: "presets.json",
  "clone-prompts": "clone-prompts.json",
  datasets: "datasets.json",
  "finetune-runs": "finetune-runs.json",
  "audio-tool-jobs": "audio-tool-jobs.json",
};

function collectionPath(name: CollectionName) {
  return path.join(appConfig.data.records, collectionFileNames[name]);
}

function nowIso() {
  return new Date().toISOString();
}

async function listCollection<T>(name: CollectionName): Promise<T[]> {
  return (await readJson<T[]>(collectionPath(name))) ?? [];
}

async function saveCollection<T>(name: CollectionName, payload: T[]) {
  await writeJson(collectionPath(name), payload);
}

export function makeAssetUrl(id: string) {
  return `${appConfig.apiPublicUrl}/audio/${id}`;
}

export async function ensureWorkspaceLayout() {
  await Promise.all([
    ensureDir(appConfig.data.generated),
    ensureDir(appConfig.data.uploads),
    ensureDir(appConfig.data.records),
    ensureDir(appConfig.data.clonePrompts),
    ensureDir(appConfig.data.datasets),
    ensureDir(appConfig.data.finetuneRuns),
    ensureDir(appConfig.data.audioTools),
  ]);
}

export async function listAudioAssets() {
  return listCollection<AudioAsset>("assets");
}

export async function getAudioAsset(id: string) {
  const assets = await listAudioAssets();
  return assets.find((item) => item.id === id) ?? null;
}

export async function registerAudioAsset(params: {
  path: string;
  filename?: string;
  source: string;
  textPreview?: string;
  transcriptText?: string;
}) {
  await ensureWorkspaceLayout();
  const id = randomUUID();
  const asset: AudioAsset = {
    id,
    path: params.path,
    url: makeAssetUrl(id),
    filename: params.filename || path.basename(params.path),
    source: params.source,
    created_at: nowIso(),
    text_preview: params.textPreview || null,
    transcript_text: params.transcriptText || null,
  };
  const current = await listAudioAssets();
  await saveCollection("assets", [asset, ...current]);
  return asset;
}

export async function upsertAudioAsset(asset: AudioAsset) {
  const current = await listAudioAssets();
  const next = [asset, ...current.filter((item) => item.id !== asset.id)];
  await saveCollection("assets", next);
}

export async function listGenerationRecords() {
  return listCollection<GenerationRecord>("history");
}

export async function getGenerationRecord(id: string) {
  const items = await listGenerationRecords();
  return items.find((item) => item.id === id) ?? null;
}

export async function appendGenerationRecord(record: GenerationRecord) {
  const current = await listGenerationRecords();
  await saveCollection("history", [record, ...current]);
  return record;
}

export async function removeGenerationRecords(ids?: string[]) {
  const current = await listGenerationRecords();
  const targets = ids?.length ? new Set(ids) : null;
  const removed = current.filter((item) => !targets || targets.has(item.id));
  const kept = current.filter((item) => !targets || !targets.has(item.id));
  await saveCollection("history", targets ? kept : []);
  return removed;
}

export async function listPresets() {
  return listCollection<CharacterPreset>("presets");
}

export async function getPreset(id: string) {
  const presets = await listPresets();
  return presets.find((item) => item.id === id) ?? null;
}

export async function appendPreset(record: Omit<CharacterPreset, "id" | "created_at">) {
  const preset: CharacterPreset = {
    id: randomUUID(),
    created_at: nowIso(),
    ...record,
  };
  const current = await listPresets();
  await saveCollection("presets", [preset, ...current]);
  return preset;
}

export async function listClonePromptRecords() {
  return listCollection<ClonePromptRecord>("clone-prompts");
}

export async function appendClonePromptRecord(record: Omit<ClonePromptRecord, "id" | "created_at">) {
  const item: ClonePromptRecord = {
    id: randomUUID(),
    created_at: nowIso(),
    ...record,
  };
  const current = await listClonePromptRecords();
  await saveCollection("clone-prompts", [item, ...current]);
  return item;
}

export async function listDatasets() {
  return listCollection<FineTuneDataset>("datasets");
}

export async function getDataset(id: string) {
  const datasets = await listDatasets();
  return datasets.find((item) => item.id === id) ?? null;
}

export async function upsertDataset(dataset: FineTuneDataset) {
  const current = await listDatasets();
  const next = [dataset, ...current.filter((item) => item.id !== dataset.id)];
  await saveCollection("datasets", next);
  return dataset;
}

export async function listFineTuneRuns() {
  return listCollection<FineTuneRun>("finetune-runs");
}

export async function appendFineTuneRun(payload: Omit<FineTuneRun, "id" | "created_at">) {
  const run: FineTuneRun = {
    id: randomUUID(),
    created_at: nowIso(),
    ...payload,
  };
  const current = await listFineTuneRuns();
  await saveCollection("finetune-runs", [run, ...current]);
  return run;
}

export async function listAudioToolJobs() {
  return listCollection<AudioToolJob>("audio-tool-jobs");
}

export async function appendAudioToolJob(payload: Omit<AudioToolJob, "id" | "created_at">) {
  const job: AudioToolJob = {
    id: randomUUID(),
    created_at: nowIso(),
    ...payload,
  };
  const current = await listAudioToolJobs();
  await saveCollection("audio-tool-jobs", [job, ...current]);
  return job;
}

export async function createDatasetLayout(id: string) {
  const root = path.join(appConfig.data.datasets, id);
  const audio = path.join(root, "audio");
  await ensureDir(audio);
  return { root, audio };
}

export async function copyIntoDatasetAudio(datasetId: string, sourcePath: string, filename?: string) {
  const { audio } = await createDatasetLayout(datasetId);
  const targetFilename = filename || path.basename(sourcePath);
  const targetPath = path.join(audio, targetFilename);
  await fs.copyFile(sourcePath, targetPath);
  return targetPath;
}

export async function writeDatasetJsonl(datasetId: string, fileName: string, lines: Array<Record<string, unknown>>) {
  const { root } = await createDatasetLayout(datasetId);
  const targetPath = path.join(root, fileName);
  const content = lines.map((line) => JSON.stringify(line)).join("\n");
  await fs.writeFile(targetPath, `${content}\n`, "utf-8");
  return targetPath;
}

export async function removeFileIfManaged(target: string) {
  if (!(await pathExists(target))) {
    return;
  }

  if (
    target.startsWith(appConfig.data.generated) ||
    target.startsWith(appConfig.data.uploads) ||
    target.startsWith(appConfig.data.clonePrompts) ||
    target.startsWith(appConfig.data.audioTools)
  ) {
    await fs.rm(target, { force: true });
  }
}
