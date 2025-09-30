import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const databaseUrl = configService.get('DATABASE_URL');
  
  // Base configuration (shared between both approaches)
  const baseConfig: Partial<TypeOrmModuleOptions> = {
    type: 'postgres',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development',
    logging: configService.get('NODE_ENV') === 'development' ? ['query', 'error'] : ['error'],
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
    keepConnectionAlive: true,
  };
  
  // If DATABASE_URL exists (Docker/Production), use it
  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,  // ✅ Single source of truth
    } as TypeOrmModuleOptions;
  }
  
  // Fallback: Use individual parameters (for local dev if needed)
  return {
    ...baseConfig,
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: parseInt(configService.get('DATABASE_PORT', '5433')),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
  } as TypeOrmModuleOptions;
};