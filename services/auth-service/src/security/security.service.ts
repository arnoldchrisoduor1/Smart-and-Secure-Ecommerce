import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SecurityEvent, SecurityEventType } from "./entities/security-event.entity";

export interface LogSecurityEventDto {
    eventType: SecurityEventType;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceFingerprint?: string;
    metadata?: Record<string, any>;
    description?: string;
}

@Injectable()
export class SecurityService {
    constructor(
        @InjectRepository(SecurityEvent)
        private readonly securityEventRepository: Repository<SecurityEvent>,
    ) {}

    async logEvent(dto: LogSecurityEventDto): Promise<SecurityEvent> {
        const securityEvent = this.securityEventRepository.create(dto);
        return this.securityEventRepository.save(securityEvent);
    }

    async getSecurityEvents(userId: string, limit = 50): Promise<SecurityEvent[]> {
        return this.securityEventRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        })
    }

    async getRecentFailedLogins(ipAddress: string, timeWindow = 3600000): Promise<number> {
        const since = new Date(Date.now() - timeWindow);

        const count = await this.securityEventRepository.count({
            where: {
                eventType: SecurityEventType.LOGIN_FAILED,
                ipAddress,
                createdAt: since
            }
        });
        return count;
    }
}