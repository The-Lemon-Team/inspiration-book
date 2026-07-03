import { IsString, MinLength } from 'class-validator';

export class CreateChatCollectionDto {
  @IsString()
  @MinLength(1)
  name!: string;
}
