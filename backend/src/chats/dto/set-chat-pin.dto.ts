import { IsBoolean } from 'class-validator';

export class SetChatPinDto {
  @IsBoolean()
  pinned!: boolean;
}
