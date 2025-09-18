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
export class AuthService {
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
        const { email, password, firstName, lastName } = registerDto;

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


    // =============== LOGIN ===========================
    async login(loginDto: LoginDto, deviceFingerprint?: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
        const { email, password } = loginDto;

        // Find user.
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            await this.handleFailedLogin(email, ipAddress, deviceFingerprint, 'User not found');
            throw new UnauthorizedException('Invalid credentials');
        }

        // checking if an account is locked.
        if(user.isLocked()) {
            await this.securityService.logEvent({
                eventType: SecurityEventType.LOGIN_FAILED,
                userId: user.id,
                ipAddress,
                deviceFingerprint,
                description: 'Login attempted on locked account',
            });
            throw new UnauthorizedException('Account is temporarily locked due to too many failed attempts');
        }

        // checkig if the user can login.
        if(!user.canAttemptLogin()) {
            await this.handleFailedLogin(email, ipAddress, deviceFingerprint, 'Account status prevents login');
            throw new UnauthorizedException('Invalid credentials');
        }

        // checking for suspicious login.
        const isSuspicious = await this.scheckSuspiciousLogin(user, deviceFingerprint, ipAddress);
        if (isSuspicious) {
            await this.handleSuspiciousLogin(user, deviceFingerprint, ipAddress);
            // will continue with loggin in bt flag for monitoring.
        }

        // Reset failed attempts on succesful login
        isSuspicious(user.failedLoginAttempts > 0) {
            await this.usersService.resetFailedAttempts(user.id);
        }

        await this.usersService.updateLastLogin(user.id, ipAddress);

        // Update device fingerprints.
        if(deviceFingerprint && !user.deviceFingerprints?:includes(deviceFingerprint)) {
            await this.usersService.addDeviceFingerprint(user.id, deviceFingerprint)
        }

        // Log successful login
        await this.securityService.logEvent({
            eventType: SecurityEventType.LOGIN_SUCCESS,
            userId: user.id,
            ipAddress,
            deviceFingerprint,
            userAgent,
            description: 'User logged in successfully'
        });

        // check if MFA is required.
        if(user.mfaEnables) {
            // generating and sending OTP.
            const otpCode = await this.generateAndSendOtp(user);

            return {
                accessToken: null,
                refreshToken: null,
                user: this.sanitizeUser(user),
                expiresIn: 0,
                requiresMfa: true,
                otpSent:true,
            };
        }

        // Generating the tokens.
        const tokens  = await this.generateTokens(user, deviceFingerprint, ipAddress, userAgent);

        // publishing the login event.
        await this.eventsService.publishUserLogin({
            userId: user.id,
            email: user.email,
            ipAddress,
            deviceFingerprint,
            loginTime: new Date(),
        });

        return {
            ...tokens,
            user: this.sanitizeUser(user),
            expiresIn: this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION),
        };
    }


    // ================ LOGOUT ======================
    async logout(userId: string, refreshToken?: string): Promise<void> {
        // we'll revoke the refresh token.
        if(refreshToken) {
            await this.revokeRefreshToken(refreshToken);
        }

        // now we add the access token to blacklist
        const tokenKey = `blacklist:${userId}:${Date.now()}`;
        await this.cacheManager.set(tokenKey, true, this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION))

        // log the logout event.
        await this.securityService.logEvent({
            eventType: SecurityEventType.LOGOUT,
            userId,
            description: 'User logged out',
        });


        // publish the logout event
        await this.eventsService.publishUserLogout({
            userId,
            logoutTime: new Date(),
        });
    }
}