import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  currentPassword!: string;
}
