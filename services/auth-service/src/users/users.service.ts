import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { RefreshToken } from 'src/auth/entities/refresh-token.entity';

export interface CreateUserDto {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    deviceFingerprints?: string[];
}

export interface CreateRefreshTokenDto {
    token: string;
    userId: string;
    expiresAt: Date;
    deviceFingerprint?: string;
    ipAddress?: string;
    userAgent?: string;
}

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    async updatePassword(userId: string, passwordHash: string): Promise<void> {
        await this.userRepository.update(userId, { passwordHash })
    }

    async verifyEmail(userId: string): Promise<void> {
        await this.userRepository.update(userId, { emailVerified: true,
            status: UserStatus.ACTIVE,
         });
    }

    async updateLastLogin(userId: string, ipAddress?: string): Promise<void> {
        await this.userRepository.update(userId, {
            lastLoginAt: new Date(),
            lastLoginIp: ipAddress,
        })
    }

    async addDeviceFingerprint(userId: string, deviceFingerprint: string): Promise<void> {
        const user = await this.findById(userId);
        if(user) {
            const fingerprints = user.deviceFingerprints || [];
            if (!fingerprints.includes(deviceFingerprint)) {
                fingerprints.push(deviceFingerprint);
                await this.userRepository.update(userId, { deviceFingerprints: fingerprints })
            }
        }
    }

    async incrementFailedAttempts(userId: string): Promise<User> {
        const user = await this.findById(userId);
        if(!user) {
            throw new NotFoundException('User not found');
        }

        user.failedLoginAttempts += 1;
        return this.userRepository.save(user);
    }

    async resetFailedAttempts(userId: string): Promise<void> {
        await this.userRepository.update(userId, {
            failedLoginAttempts: 0,
            lockedUntil: null,
        });
    }

    async lockAccount(userId: string, lockedUntil: Date): Promise<void> {
        await this.userRepository.update(userId, { lockedUntil });
    }

    async createRefreshToken(createRefreshTokenDto: CreateRefreshTokenDto): Promise<RefreshToken> {
        const refreshToken = this.refreshTokenRepository.create(createRefreshTokenDto);
        return this.refreshTokenRepository.save(refreshToken);
    }

    async findRefreshToken(token: string): Promise<RefreshToken | null> {
        return this.refreshTokenRepository.findOne({
            where: { token },
            relations: ['user'],
        });
    }

    async revokeRefreshToken(token: string): Promise<void> {
        await this.refreshTokenRepository.update({ token }, { revoked: true });
    }

    async revokeAllRefreshTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository.update({ userId }, { revoked: true });
    }

    async cleanupExpiredTokens(userId: string): Promise<void> {
        await this.refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :now OR revoked = true', { now: new Date() })
        .execute();
    }
}
