import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { GenerationsModule } from "./generations/generations.module";
import { HealthModule } from "./health/health.module";
import { PresetsModule } from "./presets/presets.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RuntimeModule } from "./runtime/runtime.module";
import { StudioModule } from "./studio/studio.module";
import { WorkspaceModule } from "./workspace/workspace.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    PrismaModule,
    HealthModule,
    RuntimeModule,
    StudioModule,
    WorkspaceModule,
    PresetsModule,
    GenerationsModule,
  ],
})
export class AppModule {}
