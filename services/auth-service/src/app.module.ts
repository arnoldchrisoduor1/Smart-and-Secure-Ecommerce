import Module from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottleModule } from '@nestjs/cache-manager';
import { RedisOptions } from 'ioredis';
import * as redisStore from 'cache-manager-redis-store';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from '/users/users.module';
import { SecurityModule } from './security/security.module';

import { User } from './users/entities/user.entity';
import { SecurityEvent } from './auth/entities/refresh-token.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';