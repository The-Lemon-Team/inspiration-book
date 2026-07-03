import { IsString } from 'class-validator';

export class CreateUpwardGrantDto {
  @IsString()
  fromChatId!: string;

  @IsString()
  toChatId!: string;
}
