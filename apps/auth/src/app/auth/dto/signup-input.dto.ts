import { IsEmail, IsStrongPassword, MaxLength } from 'class-validator';

export class SignUpInputDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsStrongPassword()
  @MaxLength(50)
  password: string;
}
