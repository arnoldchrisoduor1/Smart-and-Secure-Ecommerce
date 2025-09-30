import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

export const getRedisConfig = (configService: ConfigService): CacheModuleOptions => {
  const redisUrl = configService.get<string>('REDIS_URL');
  
  if (redisUrl) {
    return {
      store: redisStore,
      url: redisUrl,
      ttl: 3600,
      max: 1000,
    };
  }

  return {
    store: redisStore,
    url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
    password: configService.get('REDIS_PASSWORD'),
    database: parseInt(configService.get<string>('REDIS_DB', '0'), 10),
    ttl: 3600,
    max: 1000,
  };
};
