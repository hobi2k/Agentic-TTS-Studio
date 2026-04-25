import { Module } from "@nestjs/common";
import { StudioModule } from "../studio/studio.module";
import { PresetsController } from "./presets.controller";
import { PresetsService } from "./presets.service";

@Module({
  imports: [StudioModule],
  controllers: [PresetsController],
  providers: [PresetsService],
})
export class PresetsModule {}
