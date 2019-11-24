/**
 * @type {Partial<jest.InitialOptions>}
 */
const config = {
  preset: 'ts-jest',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/?(*.)+(node|jsdom).test.ts?(x)'],
  testPathIgnorePatterns: ['dist'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/config/setup-tests.ts'],
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
  testEnvironment: 'jest-environment-jsdom-fourteen',
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
}

module.exports = config
