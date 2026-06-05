import { EntryCategory } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';

export class QueryEntriesDto {
  @IsOptional()
  @IsEnum(EntryCategory)
  category?: EntryCategory;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
