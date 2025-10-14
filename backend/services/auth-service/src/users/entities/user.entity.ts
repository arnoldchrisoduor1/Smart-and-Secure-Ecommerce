import {
    Entity, 
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { SecurityEvent } from '../../security/entities/security-event.entity';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Entity('users')
@Index(['email'], { unique: true })
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    @Exclude()
    passwordHash: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
    status: UserStatus;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ default: false })
    mfaEnabled: boolean;

    // @Column({ default: false })
    // requiresMfa: boolean;

    // @Column({ default: false })
    // otpSent: boolean;

    @Column({ nullable: true })
    @Exclude()
    mfaSecret: string;

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @Column({ nullable: true })
    lastLoginIp: string;

    @Column({ type: 'int', default: 0 })
    failedLoginAttempts: number;

    @Column({ type: 'timestamp', nullable: true })
    lockedUntil: Date;

    @Column({ type: 'jsonb', nullable: true })
    deviceFingerprints: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => RefreshToken, token => token.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => SecurityEvent, event => event.user)
    securityEvents: SecurityEvent[];

    // Helper methods
    isLocked(): boolean {
        return this.lockedUntil && this.lockedUntil > new Date();
    }

    canAttemptLogin(): boolean {
        return !this.isLocked();
        // return !this.isLocked() && this.status === UserStatus.ACTIVE;
    }
}