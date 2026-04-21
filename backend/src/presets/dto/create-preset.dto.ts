import { IsOptional, IsString, MinLength } from "class-validator";

export class CreatePresetDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  voiceHint!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
