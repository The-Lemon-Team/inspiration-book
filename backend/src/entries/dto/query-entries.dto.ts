import { IsDateString, IsOptional, IsString } from 'class-validator';

export class QueryEntriesDto {
  @IsOptional()
  @IsString()
  tagId?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  visibility?: 'all' | 'public' | 'private';
}
