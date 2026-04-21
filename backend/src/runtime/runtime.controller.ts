import { Controller, Get } from "@nestjs/common";
import { RuntimeService } from "./runtime.service";

@Controller("runtime")
export class RuntimeController {
  constructor(private readonly runtimeService: RuntimeService) {}

  @Get("models")
  listModels() {
    return this.runtimeService.listLocalModels();
  }
}
