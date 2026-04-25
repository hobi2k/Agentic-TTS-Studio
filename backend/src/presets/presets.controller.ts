import { Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { CreatePresetDto } from "./dto/create-preset.dto";
import { PresetsService } from "./presets.service";

@Controller("presets")
export class PresetsController {
  constructor(private readonly presetsService: PresetsService) {}

  @Get()
  listPresets() {
    return this.presetsService.listPresets();
  }

  @Post()
  createPreset(@Body() dto: CreatePresetDto) {
    return this.presetsService.createPreset(dto);
  }

  @Post(":id/generate")
  async generateFromPreset(
    @Param("id") id: string,
    @Body() payload: { text: string; language?: string; speaker?: string; instruct?: string },
  ) {
    const result = await this.presetsService.generateFromPreset(id, payload);
    if (!result) {
      throw new NotFoundException("Preset not found.");
    }
    return result;
  }
}
