import { Injectable, UnauthorizedException, BadRequestException, ConflictException, CACHE_MANAGER, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../users/users.service';
import { SecureService } from '../security/security.service';
import { EventsService } from '../events/events.service';

import { User, UserStatus } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { SecurityEventType } from '../security/entities/security-event.entity';

import { RegisterDto, LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto, AuthResponse } from './dto/auth.dto';


@Injectable()
export class AutService {
    private readonly JWT_ACCESS_TOKEN_EXPIRATION = '15m';
    private readonly JWT_REFRESH_TOKEN_EXPIRATION = '7d';
    private readonly PASSWORD_RESET_TOKEN_EXPIRATION = '1h';
    private readonly EMAIL_VERIFICATION_TOKEN_EXPIRATION = '24h';
    private readonly MAX_FAILED_ATTEMPTS = 7;
    private readonly LOCKOUT_DURATION_MINUTES = 30;

    constructor (
        private readonly usersService: UsersService,
        private readonly securityService: SecurityService,
        private readonly eventsService: EventsService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}
}