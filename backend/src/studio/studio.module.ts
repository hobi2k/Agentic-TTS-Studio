import { Module } from "@nestjs/common";
import { AudioController } from "./audio.controller";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { LocalRuntimeService } from "./local-runtime.service";

@Module({
  controllers: [ChatController, AudioController],
  providers: [ChatService, LocalRuntimeService],
  exports: [LocalRuntimeService],
})
export class StudioModule {}
