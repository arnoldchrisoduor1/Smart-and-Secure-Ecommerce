module.exports = {
  ...require('./jest.config'),
  testRegex: '.*\\.e2e-spec\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/test/setup-e2e.ts'],
  testTimeout: 60000,
};