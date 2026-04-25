import * as fs from "node:fs/promises";
import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { appConfig } from "../common/app-config";
import { getAudioAsset } from "../common/demo-store";
import { readJson } from "../common/filesystem";
import type { GeneratedAudioRecord } from "./studio.types";

@Controller("audio")
export class AudioController {
  @Get(":id")
  async getAudio(@Param("id") id: string, @Res() response: Response) {
    const asset = await getAudioAsset(id);
    if (asset) {
      const fileBuffer = await fs.readFile(asset.path);
      response.setHeader("Content-Type", "audio/wav");
      response.setHeader("Cache-Control", "no-store");
      response.send(fileBuffer);
      return;
    }

    const record = await readJson<GeneratedAudioRecord>(`${appConfig.data.generated}/${id}.json`);

    if (!record) {
      throw new NotFoundException("Audio record not found.");
    }

    const fileBuffer = await fs.readFile(record.outputPath);
    response.setHeader("Content-Type", "audio/wav");
    response.setHeader("Cache-Control", "no-store");
    response.send(fileBuffer);
  }
}
