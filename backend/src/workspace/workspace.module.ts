import { Module } from "@nestjs/common";
import { StudioModule } from "../studio/studio.module";
import { WorkspaceController } from "./workspace.controller";

@Module({
  imports: [StudioModule],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
