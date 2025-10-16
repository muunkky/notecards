/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    testTimeout: 10000, // Optimized: 10s for unit tests (was 30s)
    hookTimeout: 5000,  // Optimized: 5s for hooks (was 10s)
    // Modern Vitest configuration optimizations
    pool: 'forks', // Use worker forks for better isolation
    maxConcurrency: 4, // Limit concurrent tests for stability
    isolate: true, // Ensure proper test isolation
    // Performance optimizations
    passWithNoTests: true, // Don't fail if no tests found
    logHeapUsage: false, // Disable heap logging for performance
    allowOnly: false, // Prevent .only in CI
    // Optimize test discovery
    cache: {
      dir: '.vitest/cache' // Dedicated cache directory
    },
    // Optimize worker startup
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 4,
        singleFork: false
      }
    },
    coverage: {
      provider: 'v8', // Modern V8 coverage provider
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
      ],
      // Modern coverage thresholds for quality assurance
      thresholds: {
        global: {
          branches: 70,
          functions: 75,
          lines: 75,
          statements: 75
        }
      },
      include: ['src/**/*.{ts,tsx}'],
      all: true, // Include all source files in coverage
    },
    // Mock Firebase in tests - Updated for Vitest 3.x
    server: {
      deps: {
        inline: ['firebase/app', 'firebase/auth', 'firebase/firestore']
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
      '@test': '/src/test'
    }
  }
})
