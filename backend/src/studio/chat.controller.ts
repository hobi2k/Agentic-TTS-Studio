import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { ChatService } from "./chat.service";
import { chatRequestSchema } from "./studio.types";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() payload: unknown) {
    const parsed = chatRequestSchema.safeParse(payload);

    if (!parsed.success) {
      throw new BadRequestException({
        error: "Invalid chat request.",
        details: parsed.error.flatten(),
      });
    }

    return this.chatService.runStudioAgent(parsed.data);
  }
}
