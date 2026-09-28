'use strict';

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  // 30s default is fine; bcrypt@12 rounds + jest are well under it.
  testTimeout: 30000,
  // Clean, readable reporter output for the chat capture.
  verbose: false,
  // Keep tests deterministic; run serially so the rate-limit-disabled trick
  // never collides with another test file's state.
  maxWorkers: 1,
  // Surface the JUnit-style report for artifact capture.
  reporters: [
    'default',
    ['jest-junit', { outputFile: 'tests/artifacts/jest-junit.xml' }],
  ],
  // We intentionally don't use --coverage by default; flip on demand.
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
};
