import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/test/e2e/**/*.test.ts'],
    globals: true,
    environment: 'node',
    testTimeout: 120000,
    hookTimeout: 120000,
    reporters: ['default'],
  }
});
