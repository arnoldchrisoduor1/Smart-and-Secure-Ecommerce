import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/users/users.service';
import { SecurityService } from '../../../src/security/security.service';
import { EventsService } from '../../../src/events/events.service';
import { User, UserStatus } from '../../../src/users/entities/user.entity';
import { TestFactories } from '../../utils/test-factories';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs');

describe('AuthService - Security', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let securityService: SecurityService;
  let eventsService: EventsService;
  let jwtService: JwtService;
  let cacheManager: any;

  // Mock dependencies
  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    incrementFailedAttempts: jest.fn(),
    resetFailedAttempts: jest.fn(),
    lockAccount: jest.fn(),
    updateLastLogin: jest.fn(),
    addDeviceFingerprint: jest.fn(),
    updatePassword: jest.fn(),
    verifyEmail: jest.fn(),
    createRefreshToken: jest.fn(),
    findRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    revokeAllRefreshTokens: jest.fn(),
  };

  const mockSecurityService = {
    logEvent: jest.fn(),
  };

  const mockEventsService = {
    publishUserRegistered: jest.fn(),
    publishUserLogin: jest.fn(),
    publishUserLogout: jest.fn(),
    publishPasswordChanged: jest.fn(),
    publishPasswordResetRequested: jest.fn(),
    publishPasswordResetCompleted: jest.fn(),
    publishEmailVerified: jest.fn(),
    publishAccountLocked: jest.fn(),
    publishSuspiciousLogin: jest.fn(),
    publishMfaRequired: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockCacheManager = {
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    securityService = module.get<SecurityService>(SecurityService);
    eventsService = module.get<EventsService>(EventsService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get(CACHE_MANAGER);

    // Reset all mocks
    jest.clearAllMocks();

    // Default config values
    mockConfigService.get.mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
      };
      return config[key];
    });
  });

  describe('Password Security', () => {
    describe('validatePasswordStrength', () => {
      it('should accept strong passwords', () => {
        const strongPasswords = [
          'StrongPass123!',
          'Another$Pass456',
          'Test@Password789',
        ];

        strongPasswords.forEach(password => {
          expect(() => authService['validatePasswordStrength'](password)).not.toThrow();
        });
      });

      it('should reject passwords shorter than 8 characters', () => {
        const weakPassword = 'Short1!';
        expect(() => authService['validatePasswordStrength'](weakPassword))
          .toThrow(BadRequestException);
      });

      it('should reject passwords without lowercase letters', () => {
        const password = 'UPPERCASE123!';
        expect(() => authService['validatePasswordStrength'](password))
          .toThrow(BadRequestException);
      });

      it('should reject passwords without numbers', () => {
        const password = 'NoNumbers!';
        expect(() => authService['validatePasswordStrength'](password))
          .toThrow(BadRequestException);
      });

      it('should reject passwords without special characters', () => {
        const password = 'NoSpecialChars123';
        expect(() => authService['validatePasswordStrength'](password))
          .toThrow(BadRequestException);
      });
    });
  });

  describe('Account Lockout Mechanism', () => {
    it('should lock account after maximum failed attempts', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const ipAddress = '192.168.1.100';
      const deviceFingerprint = 'device-123';

      const user = TestFactories.createUser({
        email,
        failedLoginAttempts: 9, // One attempt away from lockout
      });

      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Wrong password
      mockUsersService.incrementFailedAttempts.mockResolvedValue({
        ...user,
        failedLoginAttempts: 10,
      });

      // Act & Assert
      await expect(authService.login(
        { email, password },
        deviceFingerprint,
        ipAddress
      )).rejects.toThrow(UnauthorizedException);

      // Verify account was locked
      expect(mockUsersService.lockAccount).toHaveBeenCalled();
      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'ACCOUNT_LOCKED',
          userId: user.id,
          description: expect.stringContaining('Account locked after'),
        })
      );
    });

    it('should prevent login for locked account', async () => {
      // Arrange
      const email = 'locked@example.com';
      const password = 'anypassword';
      const lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      const lockedUser = TestFactories.createUser({
        email,
        lockedUntil,
      });

      mockUsersService.findByEmail.mockResolvedValue(lockedUser);

      // Act & Assert
      await expect(authService.login(
        { email, password },
        'device-123',
        '192.168.1.100'
      )).rejects.toThrow(UnauthorizedException);

      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILED',
          description: 'Login attempted on locked account',
        })
      );
    });

    it('should reset failed attempts on successful login', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'correctpassword';
      const user = TestFactories.createUser({
        email,
        failedLoginAttempts: 3,
      });

      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Correct password
      mockUsersService.resetFailedAttempts.mockResolvedValue({
        ...user,
        failedLoginAttempts: 0,
      });

      // Mock token generation
      mockJwtService.sign.mockReturnValue('access-token');
      mockUsersService.createRefreshToken.mockResolvedValue(undefined);

      // Act
      await authService.login(
        { email, password },
        'device-123',
        '192.168.1.100'
      );

      // Assert
      expect(mockUsersService.resetFailedAttempts).toHaveBeenCalledWith(user.id);
    });
  });

  describe('Suspicious Login Detection', () => {
    it('should detect suspicious login from new device', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'correctpassword';
      const user = TestFactories.createUser({
        email,
        deviceFingerprints: ['old-device-123'],
        lastLoginIp: '192.168.1.50',
      });

      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      mockJwtService.sign.mockReturnValue('access-token');
      mockUsersService.createRefreshToken.mockResolvedValue(undefined);

      // Act - Login from new device
      await authService.login(
        { email, password },
        'new-device-456', // New device
        '192.168.1.100', // Same IP
        'Mozilla/5.0'
      );

      // Assert - Should log suspicious login
      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SUSPICIOUS_LOGIN',
          description: 'Suspicious login detected - new device or location',
        })
      );
    });

    it('should detect suspicious login from new location quickly', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'correctpassword';
      const user = TestFactories.createUser({
        email,
        deviceFingerprints: ['device-123'],
        lastLoginIp: '192.168.1.50',
        lastLoginAt: new Date(Date.now() - 30000), // 30 seconds ago
      });

      mockUsersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Mock token generation
      mockJwtService.sign.mockReturnValue('access-token');
      mockUsersService.createRefreshToken.mockResolvedValue(undefined);

      // Act - Login from new IP quickly after last login
      await authService.login(
        { email, password },
        'device-123', // Same device
        '192.168.2.100', // Different IP
        'Mozilla/5.0'
      );

      // Assert - Should log suspicious login
      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SUSPICIOUS_LOGIN',
        })
      );
    });
  });

  describe('Token Security', () => {
    it('should revoke all refresh tokens when password is changed', async () => {
      // Arrange
      const userId = 'user-123';
      const changePasswordDto = {
        currentPassword: 'oldPassword123!',
        newPassword: 'newPassword123!',
      };

      const user = TestFactories.createUser({ id: userId });
      mockUsersService.findById.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true) // Current password correct
        .mockResolvedValueOnce(false); // New password different

      // Act
      await authService.changePassword(userId, changePasswordDto);

      // Assert
      expect(mockUsersService.revokeAllRefreshTokens).toHaveBeenCalledWith(userId);
      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'PASSWORD_CHANGED',
          userId,
        })
      );
    });

    it('should revoke all refresh tokens when password is reset', async () => {
      // Arrange
      const resetToken = 'reset-token-123';
      const userId = 'user-123';
      const resetPasswordDto = {
        token: resetToken,
        newPassword: 'newPassword123!',
      };

      mockCacheManager.get.mockResolvedValue(userId);
      const user = TestFactories.createUser({ id: userId });
      mockUsersService.findById.mockResolvedValue(user);

      // Act
      await authService.resetPassword(resetPasswordDto, '192.168.1.100');

      // Assert
      expect(mockUsersService.revokeAllRefreshTokens).toHaveBeenCalledWith(userId);
    });
  });

  describe('Security Event Logging', () => {
    it('should log security events for failed logins', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'anypassword';

      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(
        { email, password },
        'device-123',
        '192.168.1.100'
      )).rejects.toThrow(UnauthorizedException);

      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_FAILED',
          description: 'User not found',
          metadata: { email },
        })
      );
    });

    it('should log security events for successful operations', async () => {
      // Arrange
      const registerDto = TestFactories.createRegisterDto();
      const user = TestFactories.createUser({ email: registerDto.email });

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      // Act
      await authService.register(registerDto, 'device-123', '192.168.1.100');

      // Assert
      expect(mockSecurityService.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'LOGIN_SUCCESS',
          description: 'User registered successfully',
        })
      );
    });
  });
});