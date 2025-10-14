import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

dotenv.config({ path: '.env.test' });

jest.setTimeout(60000);

// Global test context
declare global {
  // eslint-disable-next-line no-var
  var testApp: INestApplication;
}

// Utility functions for E2E tests
export const createTestingModule = async (modules: any[]) => {
  const moduleFixture = await Test.createTestingModule({
    imports: modules,
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  
  global.testApp = app;
  return app;
};