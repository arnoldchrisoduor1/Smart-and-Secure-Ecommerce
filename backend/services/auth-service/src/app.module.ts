import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisOptions } from 'ioredis';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './security/security.module';

import { User } from './users/entities/user.entity';
import { SecurityEvent } from './security/entities/security-event.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // --- 1. DATABASE FIX (Solution A) ---
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'), // Using connection string
        entities: [User, SecurityEvent, RefreshToken],
        synchronize: true, // ❗ will turn off in production
      }),
    }),
    
    // --- 2. THROTTLER FIX (TYPE ERROR CORRECTED) ---
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // CORRECTED: Must return an object with 'ttl' and 'limit' properties
      useFactory: (config: ConfigService) => ({
        // Global rate limit: 10 requests per 60 seconds (default values)
        ttl: config.get<number>('THROTTLE_TTL', 60),
        limit: config.get<number>('THROTTLE_LIMIT', 10),
      }),
    }),

    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            // Note: If you use the REDIS_URL from your .env, you should use 'url: config.get<string>('REDIS_URL')'
            // However, since ClientsModule for Redis expects 'host' and 'port', we keep it as is.
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
          } as RedisOptions,
        }),
      },
    ]),
    AuthModule,
    UsersModule,
    SecurityModule,
  ],
  providers: [
    // --- Apply ThrottlerGuard globally ---
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    console.log('🔎 Loaded ENV values:');
    console.log('DATABASE_URL IS SET:', !!this.configService.get('DATABASE_URL'));
    console.log('REDIS_HOST:', this.configService.get('REDIS_HOST'));
    console.log('REDIS_PORT:', this.configService.get('REDIS_PORT'));
    console.log('KAFKA_BROKER:', this.configService.get('KAFKA_BROKER'));
    console.log('JWT_SECRET IS SET:', !!this.configService.get('JWT_SECRET'));
    console.log('THROTTLE_TTL:', this.configService.get('THROTTLE_TTL'));
    console.log('THROTTLE_LIMIT:', this.configService.get('THROTTLE_LIMIT'));
  }
}