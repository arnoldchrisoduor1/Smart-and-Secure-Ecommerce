import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export class TestDatabase {
  private static dataSource: DataSource;

  static async setup() {
    const configService = new ConfigService();
    
    this.dataSource = new DataSource({
      type: 'postgres',
      url: configService.get('DATABASE_URL'),
      entities: ['src/**/*.entity{.ts,.js}'],
      synchronize: false,
      logging: false,
    });

    await this.dataSource.initialize();
    return this.dataSource;
  }

  static async cleanup() {
    if (this.dataSource) {
      // Truncate all tables
      const entities = this.dataSource.entityMetadatas;
      
      for (const entity of entities) {
        const repository = this.dataSource.getRepository(entity.name);
        await repository.clear();
      }
    }
  }

  static async close() {
    if (this.dataSource) {
      await this.dataSource.destroy();
    }
  }
}