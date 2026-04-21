import { Module } from "@nestjs/common";
import { StudioModule } from "../studio/studio.module";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";

@Module({
  imports: [StudioModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
