import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

// event interfaces
export interface UserRegisteredEvent {
    userId: string;
    email: string;
    verificationToken: string;
}

export interface UserLoginEvent {
    userId: string;
    email: string;
    ipAddress?: string;
    loginTime: Date;
}

export interface UserLogoutEvent {
    userId: string;
    logoutTime: Date;
}

export interface PasswordChangedEvent {
    userId: string;
    email: string;
    changedAt: Date;
}

export interface PasswordResetRequestEvent {
    userId: string;
    email: string;
    resetAt: Date;
}

export interface EmailVerifiedEvent {
    userId: string;
    email: string;
    verifiedAt: Date;
}

export interface AccountLockedEvent {
    userId: string;
    email: string;
    lockedUntil: Date;
    reason: string;
}

export interface SuspiciousLoginEvent {
    userId: string;
    email: string;
    ipAddress?: string;
    deviceFingerprint?: string;
    loginTime: Date;
}

export interface MfaRequiredEvent {
    userId: string;
    email: string;
    otpCode: string;
}

@Injectable()
export class EventsService{
    private readonly logger = new Logger(EventsService.name);

    constructor(
        @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    ) {}

    async onModuleInit() {
        await this.kafkaClient.connect();
    }

    async onModuleDestroy() {
        await this.kafkaClient.close();
    }

    // user registration events
    async publishUserRegistered(event: UserRegisteredEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.registered', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });

            this.logger.log(`User registred event published for user: ${event.userId}`)
        } catch (error) {
            this.logger.error(`Failed to publish user registrede event: ${error.message}`, error.stack);
        }
    }

    // user authentication events.
    async publishAuthentication(event: UserLoginEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.login', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service'
            });

            this.logger.log(`User login event published for user: ${event.userId}`);
        } catch (error) {
            this.logger.error(`Failed to publish user login event: ${error.message}`);
        }
    }

    async publishUserLogout(event: UserLogoutEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.logout', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`User logout event published for user: ${event.userId}`)
        } catch (error) {
            this.logger.error(`Failed to publish user logout event: ${error.message}`, error.stack);
        }
    }

    async publishPasswordChanged(event: PasswordChangedEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.password.changed', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });

            this.logger.log(`Password changed event published for user: ${event.userId}`);
        } catch (error) {
            this.logger.error(`Failed to publish password changed event: ${error.message}`, error.stack);
        }
    }

    async publishPasswordResetRequested(event: PasswordResetRequestEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.password.reset.requested', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`Password reset requested event published for user: ${event.userId}`);
        } catch (error) {
            this.logger.error(`Failed reset completed event published for user: ${event.userId}`);
            this.logger.error(`Failed to publish password reset completed event: ${error.message}`, error.stack);
        }
    }

    // Email verification events.
    async publishEmailVerified(event: EmailVerifiedEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.email.verified', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            })
            this.logger.log(`Email verified event published for user: ${event.userId}`)
        } catch (error) {
            this.logger.error(`Failed to publish email verified event: ${error.message}`, error.stack);
        }
    }

    async publishAccountLocked(event: AccountLockedEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.account.locked', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`Account locked event published for user: ${event.userId}`);
        } catch(error) {
            this.logger.error(`Failed to publish account locked event: ${error.message}`, error.stack);
        }
    }

    async publishSuspiciousLogin(event: SuspiciousLoginEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('security.suspicious.login', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`Suspicious login event published for user: ${event.userId}`);
        } catch (error) {
            this.logger.error(`Failed to publish suspicious login event: ${error.message}`, error.stack);
        }
    }


    // the MFA events
    async publishMfaRequired(event: MfaRequiredEvent): Promise<void> {
        try {
            await this.kafkaClient.emit('user.mfa.required', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`MFA required event published event: ${event.userId}`);
        } catch(error) {
            this.logger.error(`Failed to publish MFA required event: ${error.message}`, error.stack);
        }
    }

    // Analytics events for the recommendation service.
    async publishUserBehavior(event: {
        userId: string;
        action: string;
        metadata?: Record<string, any>;
    }): Promise<void> {
        try {
            await this.kafkaClient.emit('user.behavior', {
                ...event,
                timestamp: new Date(),
                service: 'auth-service',
            });
            this.logger.log(`User behavior event published: ${event.action} for user: ${event.userId}`);
        } catch(error) {
            this.logger.error(`Failed to push user behavior event: ${error.message}`, error.stack);
        }
    }
}