import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginInputDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  password: string;
}
