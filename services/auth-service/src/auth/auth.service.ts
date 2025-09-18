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

    async register(registerDto: RegisterDto, deviceFingerprint?: string, ipAddress?: string): Promise<AuthResponse> {
        const { email, password, firstName, lasttName } = registerDto;

        // checking if the user already exists.
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // else we will validate the password strength
        this.validatePasswordStrength(password);

        const passwordHash = await bcrypt.hash(password, 12);

        // creating the new user.
        const user = await this.usersService.create({
            email,
            passwordHash,
            firstName,
            lastName,
            deviceFingerprints: deviceFingerprint ? [deviceFingerprint] : [],
        });

        // generating the email verification token
        const verificationToken = this.generateSecureToken();
        await this.cacheManager.set(
            `email_verification:${verificationToken}`,
            user.id,
            this.parseExpiration(this.EMAIL_VERIFICATION_TOKEN_EXPIRATION),
        );

        // logging the security event.
        await this.securityService.logEvent({
            eventType: SecurityEventType.LOGIN_SUCCESS,
            userId: user.id,
            ipAddress,
            deviceFingerprint,
            description: 'User registered successfully',
        });

        await this.eventsService.publishUserRegistered({
            userId: user.id,
            email: user.email,
            verificationToken
        });

        // Generating tokens.
        const tokens = await this.generateTokens(user, deviceFingerprint, ipAddress);


        return {
            ...tokens,
            user: this.sanitizeUser(user),
            expiresIn: this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION),
        };
    }
}