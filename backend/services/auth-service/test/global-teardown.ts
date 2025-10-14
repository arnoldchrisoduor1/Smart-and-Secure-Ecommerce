import { exec } from 'child_process';
import { promisify } from 'util';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

const execAsync = promisify(exec);

export default async function globalTeardown() {
  console.log('🧹 Starting global test teardown...');
  
  const configService = new ConfigService();
  const databaseUrl = configService.get('DATABASE_URL');
  
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      const dbName = url.pathname.slice(1);
      const baseUrl = databaseUrl.replace(`/${dbName}`, '/postgres');
      
      // Drop test database
      console.log(`🗑️  Dropping test database: ${dbName}`);
      await execAsync(`psql "${baseUrl}" -c "DROP DATABASE IF EXISTS ${dbName}"`);
      
      console.log('✅ Global test teardown completed');
    } catch (error) {
      console.error('❌ Global teardown failed:', error);
    }
  }
}