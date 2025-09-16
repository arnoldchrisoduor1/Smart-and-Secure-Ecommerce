import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
@Index(['token'], { unique: true })
@Index(['userId'])
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    token:string;

    @Column()
    userId: string;

    @ManyToOne(() => User, user => user.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @Column({ nullable: true })
    revoked: boolean;

    @CreateDateColumn()
    createdAt: Date;

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    isValid(): boolean {
        return !this.revoked && !this.isExpired();
    }
}