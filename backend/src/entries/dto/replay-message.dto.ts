import { IsIn, IsOptional, IsString } from 'class-validator';

export class ReplayMessageDto {
  @IsIn(['UP', 'DOWN'])
  direction!: 'UP' | 'DOWN';

  @IsOptional()
  @IsString()
  targetChatId?: string;
}
