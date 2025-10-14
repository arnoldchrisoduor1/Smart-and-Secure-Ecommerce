import { faker } from '@faker-js/faker';
import { User, UserStatus, UserRole } from '../../src/users/entities/user.entity';
import { RegisterDto } from '../../src/auth/dto/auth.dto';
import { SecurityEvent, SecurityEventType } from '../../src/security/entities/security-event.entity';

export class TestFactories {
  static createUser(overrides: Partial<User> = {}): User {
    const user = new User();
    user.id = overrides.id || faker.string.uuid();
    user.email = overrides.email || faker.internet.email();
    user.passwordHash = overrides.passwordHash || faker.internet.password();
    user.firstName = overrides.firstName || faker.person.firstName();
    user.lastName = overrides.lastName || faker.person.lastName();
    user.status = overrides.status || UserStatus.ACTIVE; // ✅ use enum
    user.emailVerified = overrides.emailVerified ?? true;
    user.failedLoginAttempts = overrides.failedLoginAttempts || 0;
    user.lockedUntil = overrides.lockedUntil ?? null;
    user.lastLoginAt = overrides.lastLoginAt ?? null;
    user.lastLoginIp = overrides.lastLoginIp || '';
    user.deviceFingerprints = overrides.deviceFingerprints || [];
    user.mfaEnabled = overrides.mfaEnabled || false;
    user.mfaSecret = overrides.mfaSecret || '';
    user.role = overrides.role || UserRole.USER; // ✅ use enum instead of string
    user.createdAt = overrides.createdAt || new Date();
    user.updatedAt = overrides.updatedAt || new Date();

    return user;
  }

  static createRegisterDto(overrides: Partial<RegisterDto> = {}): RegisterDto {
    return {
      email: overrides.email || faker.internet.email(),
      password: overrides.password || 'StrongPassword123!',
      firstName: overrides.firstName || faker.person.firstName(),
      lastName: overrides.lastName || faker.person.lastName(),
      ...overrides,
    };
  }

  static createSecurityEvent(overrides: Partial<SecurityEvent> = {}): SecurityEvent {
    const event = new SecurityEvent();
    event.id = overrides.id || faker.string.uuid();
    event.eventType = overrides.eventType || SecurityEventType.LOGIN_SUCCESS;
    event.userId = overrides.userId || faker.string.uuid();
    event.ipAddress = overrides.ipAddress || faker.internet.ip();
    event.userAgent = overrides.userAgent || faker.internet.userAgent();
    event.deviceFingerprint = overrides.deviceFingerprint || faker.string.uuid();
    event.metadata = overrides.metadata || {};
    event.description = overrides.description || faker.lorem.sentence();
    event.createdAt = overrides.createdAt || new Date();

    return event;
  }

  static createJwtPayload(overrides: any = {}) {
    return {
      sub: overrides.sub || faker.string.uuid(),
      email: overrides.email || faker.internet.email(),
      role: overrides.role || UserRole.USER, // ✅ match enum
      status: overrides.status || UserStatus.ACTIVE, // ✅ match enum
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900, // 15 minutes
      ...overrides,
    };
  }
}
