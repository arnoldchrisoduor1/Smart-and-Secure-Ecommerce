import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SecurityEventType {
    LOGIN_SUCCESS = 'login_succes',
    LOGIN_FAILED = 'login_failed',
    LOGOUT = 'logout',
    PASSWORD_CHANGED = 'password_changed',
    PASSWORD_RESET_REQUESTED = 'password_reset_requested',
    PASSWORD_RESET_COMPLETED = 'password_reset_completed',
    EMAIL_VERIFIED = 'email_verified',
    MFA_ENABLED = 'mfa_enambled',
    MFA_DISABLED = 'mfa_disabled',
    ACCOUNT_LOCKED = 'account_locked',
    ACCOUNT_UNLOCKED = 'account_unlocked',
    SUSPICIOUS_LOGIN = 'suspicious_login',
    TOKEN_REFRESHED = 'token_refreshed',
}

@Entity('security_events')
@Index(['userId'])
@Index(['eventType'])
@Index(['createdAt'])
export class SecurityEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: SecurityEventType })
    eventType: SecurityEventType;

    @Column({ nullable: true })
    userId: string;

    @ManyToOne(() => User, user => user.securityEvents, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    deviceFingerprint: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;
}