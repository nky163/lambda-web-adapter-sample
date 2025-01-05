import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: './jest/globalSetup.ts',
  globalTeardown: './jest/globalTeardown.ts',
  setupFilesAfterEnv: ['./jest/setupFilesAfterEnv.ts'],
  verbose: true,
};

export default config;