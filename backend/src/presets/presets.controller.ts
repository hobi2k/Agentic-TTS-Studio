import { Body, Controller, Get, Post } from "@nestjs/common";
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
}
