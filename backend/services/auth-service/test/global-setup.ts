import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🚀 Starting global test setup...');
  
  const configService = new ConfigService();
  const databaseUrl = configService.get('DATABASE_URL');
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for testing');
  }

  try {
    // Extract database name from URL to create test database
    const url = new URL(databaseUrl);
    const dbName = url.pathname.slice(1);
    const baseUrl = databaseUrl.replace(`/${dbName}`, '/postgres'); // Connect to default postgres DB
    
    console.log(`📦 Creating test database: ${dbName}`);
    
    // Create test database if it doesn't exist
    await execAsync(`psql "${baseUrl}" -c "CREATE DATABASE ${dbName}" || true`);
    
    // Run migrations on test database
    console.log('🔄 Running migrations on test database...');
    await execAsync(`npm run typeorm migration:run -- -d test/typeorm-test.config.ts`);
    
    console.log('✅ Global test setup completed');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  }
}