import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  rawText!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
