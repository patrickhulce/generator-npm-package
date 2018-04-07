module.exports = {
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/lib/index.ts',
  ],
  transform: {
    '\\.ts$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.test.js'],
}
