import { IsOptional, IsString } from 'class-validator';

export class SetChatParentDto {
  @IsOptional()
  @IsString()
  parentChatId?: string | null;
}
