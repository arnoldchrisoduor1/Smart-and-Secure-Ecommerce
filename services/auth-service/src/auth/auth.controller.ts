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
import { ApiTags, ApiOperation, } from '@nestjs/swagger';
import { ThrottleGuard } from '@nestjs/throttle';
import { Request } from 'express';

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
    @ApiResponse({ ststus: 409, description: 'User already exists' })
    async register(@Body() registerDto:RegisterDto, @Req() req: Request): Promise<AuthResponse> {
        const deviceFingerprint = req.headers['x-device-fingerprint'] as string;
        const ipAddress = req.ip;

        return this.authService.register(registerDto, deviceFingerprint, ipAddress);
    }
}