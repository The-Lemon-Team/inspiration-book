import { IsString, MinLength } from 'class-validator';

export class UpdateChatCollectionDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
