import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;

  @IsString()
  @MinLength(8)
  confirmNewPassword!: string;
}
