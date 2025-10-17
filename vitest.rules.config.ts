import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'rules',
    environment: 'node', // no DOM needed for security rules
    globals: true,
    include: ['src/test/rules/**/*.test.ts'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    setupFiles: [], // avoid global firebase mocks
  pool: 'threads',
    hookTimeout: 20000,
    testTimeout: 20000,
    fileParallelism: false,
  }
})
