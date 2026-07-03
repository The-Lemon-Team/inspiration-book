import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateReplayScheduleDto {
  @IsString()
  signalTagId!: string;

  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'scheduleTime must be HH:mm',
  })
  scheduleTime!: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  skipIfEmpty?: boolean;
}

export class UpdateReplayScheduleDto {
  @IsOptional()
  @IsString()
  signalTagId?: string;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'scheduleTime must be HH:mm',
  })
  scheduleTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  skipIfEmpty?: boolean;
}
