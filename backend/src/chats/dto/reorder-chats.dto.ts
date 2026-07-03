import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class ReorderChatsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  chatIds!: string[];
}
