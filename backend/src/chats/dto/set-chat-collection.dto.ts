import { IsOptional, IsString } from 'class-validator';

export class SetChatCollectionDto {
  @IsOptional()
  @IsString()
  collectionId?: string | null;
}
