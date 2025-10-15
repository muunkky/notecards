import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    name: 'sharing-regression',
    include: ['src/test/regression/**/*.test.ts'],
    exclude: ['src/test/regression/**/*.d.ts'],
    testTimeout: 60000, // 1 minute timeout for browser tests
    hookTimeout: 30000,  // 30 second timeout for setup/teardown
    pool: 'forks',      // Use process isolation for browser tests
    maxConcurrency: 1,  // Run tests sequentially for stability
    reporters: ['verbose', 'html'],
    outputFile: {
      html: 'test-results/regression-report.html'
    },
    coverage: {
      enabled: false // Disable coverage for regression tests
    },
    env: {
      NODE_ENV: 'test'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@test': resolve(__dirname, './src/test')
    }
  },
  define: {
    'process.env.NODE_ENV': '"test"'
  }
});