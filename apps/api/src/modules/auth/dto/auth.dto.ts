import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  @Length(1, 80)
  name!: string;

  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @MinLength(8, { message: 'A senha precisa de pelo menos 8 caracteres' })
  password!: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsString()
  password!: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}
