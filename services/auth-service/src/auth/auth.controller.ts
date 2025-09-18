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
}