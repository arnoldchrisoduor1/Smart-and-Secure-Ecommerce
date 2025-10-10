import { Injectable, UnauthorizedException, BadRequestException, ConflictException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as cacheManager_1 from 'cache-manager';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../users/users.service';
import { SecurityService } from '../security/security.service';
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
    private readonly MAX_FAILED_ATTEMPTS = 10;
    private readonly LOCKOUT_DURATION_MINUTES = 30;

    private readonly logger = new Logger(AuthService.name);

    constructor (
        private readonly usersService: UsersService,
        private readonly securityService: SecurityService,
        private readonly eventsService: EventsService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: cacheManager_1.Cache,
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

        this.logger.log("Attempting User Registration");

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

        this.logger.log("User Registered Successfully");


        return {
            ...tokens,
            user: this.sanitizeUser(user),
            expiresIn: this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION),
            requiresMfa: false,
            otpSent: false,
        };
    }


        // ==================== LOGIN ===========================
    async login(loginDto: LoginDto, deviceFingerprint?: string, ipAddress?: string, userAgent?: string): Promise<AuthResponse> {
        const { email, password } = loginDto;

        // Find user
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            await this.handleFailedLogin(email, ipAddress, deviceFingerprint, 'User not found');
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if account is locked
        if (user.isLocked()) {
            await this.securityService.logEvent({
                eventType: SecurityEventType.LOGIN_FAILED,
                userId: user.id,
                ipAddress,
                deviceFingerprint,
                description: 'Login attempted on locked account',
            });
        throw new UnauthorizedException('Account is temporarily locked due to too many failed attempts');
        }

        // Check if user can login
        if (!user.canAttemptLogin()) {
            await this.handleFailedLogin(email, ipAddress, deviceFingerprint, 'Account status prevents login');
            throw new UnauthorizedException('Account is not active');
        }

        // Validate password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            await this.handleFailedLogin(email, ipAddress, deviceFingerprint, 'Invalid password', user.id);
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check for suspicious login
        const isSuspicious = await this.checkSuspiciousLogin(user, deviceFingerprint, ipAddress);
            if (isSuspicious) {
            await this.handleSuspiciousLogin(user, deviceFingerprint, ipAddress);
            // Continue with login but flag for monitoring
        }

        // Reset failed attempts on successful login
        if (user.failedLoginAttempts > 0) {
            await this.usersService.resetFailedAttempts(user.id);
        }

        // Update last login info
        await this.usersService.updateLastLogin(user.id, ipAddress);

        // Update device fingerprints
        if (deviceFingerprint && !user.deviceFingerprints?.includes(deviceFingerprint)) {
            await this.usersService.addDeviceFingerprint(user.id, deviceFingerprint);
        }

        // Log successful login
        await this.securityService.logEvent({
            eventType: SecurityEventType.LOGIN_SUCCESS,
            userId: user.id,
            ipAddress,
            deviceFingerprint,
            userAgent,
            description: 'User logged in successfully',
        });

        // Check if MFA is required
        if (user.mfaEnabled) {
            // Generate and send OTP
            const otpCode = await this.generateAndSendOtp(user);
            
            return {
                accessToken: '',
                refreshToken: '',
                user: this.sanitizeUser(user),
                expiresIn: 0,
                requiresMfa: true,
                otpSent: true,
            };
        }

        // Generate tokens
        const tokens = await this.generateTokens(user, deviceFingerprint, ipAddress, userAgent);

        // Publish login event
        await this.eventsService.publishUserLogin({
            userId: user.id,
            email: user.email,
            ipAddress,
            deviceFingerprint,
            loginTime: new Date(),
        });
 
        return {
            ...tokens,
            requiresMfa: false,
            otpSent: false,
            user: this.sanitizeUser(user),
            expiresIn: this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION),
        };
    }


    // ==================== LOGOUT =============================
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

    // ===================== REFRESH TOKEN =======================
    async refreshToken(refreshToken: string, deviceFingerprint?: string, ipAddress?: string): Promise<AuthResponse> {
        const tokenRecord = await this.usersService.findRefreshToken(refreshToken);

        if(!tokenRecord || !tokenRecord.isValid()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const user = await this.usersService.findById(tokenRecord.userId);
        if (!user || !user.canAttemptLogin()) {
            throw new UnauthorizedException('User account is not accessible');
        }

        // revoing the used refresh token.
        await this.revokeRefreshToken(refreshToken);

        // Generate new tokens.
        const tokens = await this.generateTokens(user, deviceFingerprint, ipAddress)

        // Log token refresh
        await this.securityService.logEvent({
            eventType: SecurityEventType.TOKEN_REFRESHED,
            userId: user.id,
            ipAddress,
            deviceFingerprint,
            description: 'Access token refreshed'
        });

        return {
            ...tokens,
            user: this.sanitizeUser(user),
            expiresIn: this.parseExpiration(this.JWT_ACCESS_TOKEN_EXPIRATION),
            requiresMfa: false,
            otpSent: false,
        };
    }


    // ====================== RESET PASSWORD ==============================
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.usersService.findById(userId);
        if(!user) {
            throw new UnauthorizedException('User not found');
        }

        // validating the new password.
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is Incorrect');
        }

        // validating the strenght of the new password
        this.validatePasswordStrength(newPassword);


        // Ensuring new password is different from current
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            throw new BadRequestException('New password must be different from current password');
        }

        // hash new password.
        const newPasswordHash = await bcrypt.hash(newPassword, 123);

        // update password
        await this.usersService.updatePassword(userId, newPasswordHash);

        // revoing all refresh tokens  for security.
        await this.revokeAllRefreshTokens(userId);

        // now logging all the password change.
        await this.securityService.logEvent({
            eventType: SecurityEventType.PASSWORD_CHANGED,
            userId,
            description: 'Password changed successfully',
        });

        // publish the password change event.
        await this.eventsService.publishPasswordChanged({
            userId,
            email: user.email,
            changedAt: new Date(),
        });
    }


    // ================ FORGOT PASSWORD LOGIC ======================
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto, ipAddress?: string): Promise<void> {
        const { email } = forgotPasswordDto;
        
        const user = await this.usersService.findByEmail(email);
        if(!user) {
            // we will not reveal existence of email.
            return;
        }

        // Generate passwordreset token
        const resetToken = this.generateSecureToken();
        await this.cacheManager.set(
            `password_reset:${resetToken}`,
            user.id,
            this.parseExpiration(this.PASSWORD_RESET_TOKEN_EXPIRATION),
        );

        // Log the password reset request
        await this.securityService.logEvent({
            eventType: SecurityEventType.PASSWORD_RESET_REQUESTED,
            userId: user.id,
            ipAddress,
            description: 'Password reset requested',
        });

        // Publish password request event.
        await this.eventsService.publishPasswordResetRequested({
            userId: user.id,
            email: user.email,
            // resetToken,
            resetAt: new Date()
        });
    }


    // =================== RESET PASSWORD LOGIC ============
    async resetPassword(resetPasswordDto: ResetPasswordDto, ipAddress?: string): Promise<void> {
        const { token, newPassword } = resetPasswordDto;
        // validating the reset token
        const userId = await this.cacheManager.get<string>(`password_reset:${token}`);
        if(!userId) {
            throw new UnauthorizedException('Invalid or expired reset token');
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // validate new password strength
        this.validatePasswordStrength(newPassword);

        // hash new password.
        const newPasswordHash = await bcrypt.hash(newPassword, 12);

        // update password.
        await this.usersService.updatePassword(userId, newPasswordHash);

        // remove reset token.
        await this.cacheManager.del(`password_reset:${token}`);

        // revole all refresh tokens for security
        await this.revokeAllRefreshTokens(userId);

        // Log password reset completion.
        await this.securityService.logEvent({
            eventType: SecurityEventType.PASSWORD_RESET_COMPLETED,
            userId,
            ipAddress,
            description: 'Password reset completed',
        });

        // log the password reset completed event.
        await this.eventsService.publishPasswordResetCompleted({
            userId,
            email: user.email,
            resetAt: new Date(),
        })
    }

    async verifyEmail(token: string): Promise<void> {
        const userId = await this.cacheManager.get<string>(`email_verification:${token}`);
        if (!userId) {
            throw new UnauthorizedException('Invalid or expired verification token');
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Update user verification status
        await this.usersService.verifyEmail(userId);

        // remove verification token.
        await this.cacheManager.del(`email_verification:${token}`);

        // log email verification.
        await this.securityService.logEvent({
            eventType: SecurityEventType.EMAIL_VERIFIED,
            userId,
            description: 'Email verified successfully',
        });

        // publish email verified event
        await this.eventsService.publishEmailVerified({
            userId,
            email: user.email,
            verifiedAt: new Date(),
        });
    }





    // ======================== SOME HELPER METHODS ======================
private async generateTokens(user: User, deviceFingerprint?:string, ipAddress?: string, userAgent?: string) {
    const payload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
    };

    // Generate access token
    const accessToken = this.jwtService.sign(payload, {
        expiresIn: this.JWT_ACCESS_TOKEN_EXPIRATION,
    });

    // Generate refresh token
    const refreshTokenValue = this.generateSecureToken();
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setTime(refreshTokenExpiry.getTime() +  this.parseExpiration(this.JWT_REFRESH_TOKEN_EXPIRATION));

    // save refresh token to database
    await this.usersService.createRefreshToken({
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
        deviceFingerprint,
        ipAddress,
        userAgent,
    });

    return {
        accessToken,
        refreshToken: refreshTokenValue,
    };
}

private async handleFailedLogin(email: string, ipAddress?: string, deviceFingerprint?: string, reason?: string, userId?: string): Promise<void> {
    if (userId) {
        const user = await this.usersService.incrementFailedAttempts(userId);

        // locking account if maximum attempts are reached.
        if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
            const lockedUntil = new Date();
            lockedUntil.setMinutes(lockedUntil.getMinutes() + this.LOCKOUT_DURATION_MINUTES)
        

        await this.usersService.lockAccount(userId, lockedUntil);

        await this.securityService.logEvent({
            eventType: SecurityEventType.ACCOUNT_LOCKED,
            userId,
            ipAddress,
            deviceFingerprint,
            description: `Account locked after ${this.MAX_FAILED_ATTEMPTS} failed attempts`,
        });

        // publish account locked event.
        await this.eventsService.publishAccountLocked({
            userId,
            email,
            lockedUntil: lockedUntil,
            reason: 'Tooo many failed attempts,'
        });
    }
    }

    // loggin the failed attempt.
    await this.securityService.logEvent({
        eventType: SecurityEventType.LOGIN_FAILED,
        userId,
        ipAddress,
        deviceFingerprint,
        description: reason || 'Failed login attempt',
        metadata: { email },
    });
}

private async checkSuspiciousLogin(user: User, deviceFingerprint?: string, ipAddress?: string): Promise<boolean> {
    // check if the device fingerprint is new.
    const isNewDevice = !!(deviceFingerprint && !user.deviceFingerprints?.includes(deviceFingerprint));


    // checking if the device ip has chnged significantly.
    const isNewLocation = !!(ipAddress && user.lastLoginIp && user.lastLoginIp !== ipAddress);


    // check the time since last login.
    const timeSinceLastLogin = user.lastLoginAt ? Date.now() - user.lastLoginAt.getTime() : Infinity;
    const isTooQuick = timeSinceLastLogin < 60000; //less tha 1 minute.

    return isNewDevice || (isNewLocation && isTooQuick);
}

private async handleSuspiciousLogin(user: User, deviceFingerprint?: string, ipAddress?: string): Promise<void> {
    await this.securityService.logEvent({
        eventType: SecurityEventType.SUSPICIOUS_LOGIN,
        userId: user.id,
        ipAddress,
        deviceFingerprint,
        description: 'Suspicious login detected - new device or location',
    });

    // Publish suspicious login events for notification.
    await this.eventsService.publishSuspiciousLogin({
        userId: user.id,
        email: user.email,
        ipAddress,
        deviceFingerprint,
        loginTime: new Date(),
    });
}

private async generateAndSendOtp(user: User): Promise<string> {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // store in cache with 5 min expiration
    await this.cacheManager.set(`otp$:${user.id}`, otpCode, 300);

    // publish MFA required event
    await this.eventsService.publishMfaRequired({
        userId: user.id,
        email: user.email,
        otpCode,
    });
    return otpCode;
}

private async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.usersService.revokeAllRefreshTokens(refreshToken);
}

private async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.usersService.revokeAllRefreshTokens(userId);
}

private validatePasswordStrength(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?:{}|<>]/.test(password);

    if(password.length < minLength) {
        throw new BadRequestException(`Password must be at least ${minLength} characters long`);
    }

    if(!hasLowerCase) {
        throw new BadRequestException('Password must contain at leat one lowe case letter');
    }

    if(!hasNumbers) {
        throw new BadRequestException('Password must contain atleast one letter')
    }

    if (!hasSpecialChar) {
      throw new BadRequestException('Password must contain at least one special character');
    }
}

private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
}

private parseExpiration(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 *1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return value;
    }
}

private sanitizeUser(user: User) {
    const { passwordHash, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
}


async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
        return user;
    }
    return null;
}

}