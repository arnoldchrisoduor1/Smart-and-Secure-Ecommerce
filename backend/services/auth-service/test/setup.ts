import 'reflect-metadata';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test configurations
jest.setTimeout(30000);

// Global mocks
jest.mock('@nestjs/microservices', () => ({
  ClientKafka: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    emit: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Custom matchers
expect.extend({
  toBeValidJwt(received: string) {
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const pass = jwtRegex.test(received);
    return {
      message: () => `expected ${received} ${pass ? 'not' : ''} to be a valid JWT`,
      pass,
    };
  },
});