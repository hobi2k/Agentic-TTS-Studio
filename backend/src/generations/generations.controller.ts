import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateGenerationDto } from "./dto/create-generation.dto";
import { GenerationsService } from "./generations.service";

@Controller("generations")
export class GenerationsController {
  constructor(private readonly generationsService: GenerationsService) {}

  @Get()
  listGenerations() {
    return this.generationsService.listGenerations();
  }

  @Post()
  createGeneration(@Body() dto: CreateGenerationDto) {
    return this.generationsService.createGeneration(dto);
  }
}
