import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Put,
    HttpCode,
    HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, } from '@nestjs/swagger';
import { ThrottleGuard } from '@nestjs/throttle';
import express from 'express';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponse,
} from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(ThrottleGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User registered successfully', type: AuthResponse })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 409, description: 'User already exists' })
    async register(@Body() registerDto:RegisterDto, @Req() req: express.Request): Promise<AuthResponse> {
        const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
        const ipAddress = req.ip;

        return this.authService.register(registerDto, deviceFingerprint, ipAddress);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @ApiOperation({ summary: 'Login User' })
    @ApiResponse({ status: 200, description: 'Login successful', type: AuthResponse })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Body() loginDto: LoginDto, @Req() req: Request): Promise<AuthResponse> {
        const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
        const ipAddress = req.ip;
        const userAgent = req.headers['user-agent'];

        return this.authService.login(loginDto, deviceFingerprint, ipAddress, userAgent);
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 204, description: 'Logout successful' })
    async logout(@GetUser() user: User, @Body('refreshToken') refreshToken?: string): Promise<void> {
        await this.authService.logout(user.id, refreshToken);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'Token refreshed successfuly' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    async refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request): Promise<AuthResponse> {
        const deviceFingerPrint = req.headers['x-device-fingerprint'] as string;
        const ipAddress = req.ip;

        return this.authService.refreshToken(refreshToken, deviceFingerPrint, ipAddress);
    }

    @Put('change-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 204, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid current password' })
    async changePassword(@GetUser() user: User, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
        await this.authService.changePassword(user.id, changePasswordDto);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Requet password reset' })
    @ApiResponse({ status: 204, description: 'Password reset email sent' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Req() request: Request): Promise<void> {
        const ipAddress = req.ip;
        await this.authService.forgotPassword(forgotPasswordDto, ipAddress);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Reset pasword with token' })
    @ApiResponse({ status: 204, description: 'Password reset successfully' })
    @ApiResponse({ status: 401, description: 'Invalid reset token' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Req() req: Request): Promise<void> {
        const ipAddress = req.ip;
        await this.authService.resetPassword(resetPasswordDto, ipAddress)
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Verify user email' })
    @ApiResponse({ status: 204, description: 'Email verified successfully' })
    @ApiResponse({ status: 401, description: 'Invalid verification token' })
    async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<void> {
        await this.authService.verifyEmail(verifyEmailDto.token)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Gte current user info' })
    @ApiResponse({ status: 200, description: 'User info retrieved succesfully' })
    getCurrentUser(@GetUser() user: User) {
        return user;
    }
}