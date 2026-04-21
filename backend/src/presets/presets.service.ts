import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePresetDto } from "./dto/create-preset.dto";

@Injectable()
export class PresetsService {
  constructor(private readonly prisma: PrismaService) {}

  listPresets() {
    return this.prisma.voicePreset.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  createPreset(dto: CreatePresetDto) {
    return this.prisma.voicePreset.create({
      data: {
        name: dto.name,
        voiceHint: dto.voiceHint,
        notes: dto.notes,
      },
    });
  }
}
