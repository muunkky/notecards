import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: [
      'functions/test/**/*.test.ts',
      'functions/src/**/__tests__/*.test.ts'
    ]
  }
})
