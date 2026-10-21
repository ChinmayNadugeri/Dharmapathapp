/** Unit tests for pure logic only (no React Native renderer needed). */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false, tsconfig: { module: 'commonjs', target: 'es2020', esModuleInterop: true, strict: true } }],
  },
};
