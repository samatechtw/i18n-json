module.exports = {
  preset: 'ts-jest',
  displayName: '@samatech/i18n-json',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js'],
  verbose: true,
  silent: false,
  testMatch: ['**/test/**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
}
