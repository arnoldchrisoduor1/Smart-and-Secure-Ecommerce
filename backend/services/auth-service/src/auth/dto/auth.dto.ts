import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class RegisterDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;


    @ApiProperty({ example: 'SecurePassword123!' })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;
}


export class LoginDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'SecurePassword123!' })
    @IsString()
    password: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    deviceFingerprint?: string;
}

export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    currentPassword: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class ForgotPasswordDto {
    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    token: string;

    @ApiProperty()
    @IsString()
    @MinLength(8)
    newPassword: string;
}


export class VerifyEmailDto {
    @ApiProperty()
    @IsString()
    token: string;
}

export class EnableMfaDto {
    @ApiProperty()
    @IsString()
    code: string;
}

export class VerifyMfaDto {
    @ApiProperty()
    @IsString()
    code: string;
}

export class AuthResponse {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    requiresMfa: boolean;

    @ApiProperty()
    otpSent: boolean;

    @ApiProperty()
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        status: string;
        emailVerified: boolean;
        mfaEnabled: boolean;
    }
    @ApiProperty()
    expiresIn: number;
}