import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateGenerationDto {
  @IsString()
  @MinLength(1)
  inputText!: string;

  @IsString()
  @MinLength(1)
  voiceHint!: string;

  @IsOptional()
  @IsString()
  runtimeMode?: string;
}
