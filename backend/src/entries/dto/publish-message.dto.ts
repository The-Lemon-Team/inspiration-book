import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublishMessageDto {
  @IsString()
  tagId!: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
