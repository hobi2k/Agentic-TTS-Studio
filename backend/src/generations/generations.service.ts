import { Injectable } from "@nestjs/common";
import { GenerationStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateGenerationDto } from "./dto/create-generation.dto";

@Injectable()
export class GenerationsService {
  constructor(private readonly prisma: PrismaService) {}

  listGenerations() {
    return this.prisma.generationRecord.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  createGeneration(dto: CreateGenerationDto) {
    return this.prisma.generationRecord.create({
      data: {
        inputText: dto.inputText,
        voiceHint: dto.voiceHint,
        runtimeMode: dto.runtimeMode || "local",
        status: GenerationStatus.PENDING,
      },
    });
  }
}
