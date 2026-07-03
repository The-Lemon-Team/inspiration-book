import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  collectionId?: string;

  @IsOptional()
  @IsString()
  parentChatId?: string;
}
