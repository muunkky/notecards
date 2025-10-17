/**
 * Vitest Performance Configuration
 * Optimized settings for maximum test execution speed
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Optimize for speed over isolation when safe
    isolate: false, // Faster but less isolation - use carefully
    pool: 'threads' as const, // Threads are faster than forks for CPU-bound tests
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4,
        useAtomics: true, // Enable atomic operations for better performance
      }
    },
    
    // Reduce timeouts for faster feedback
    testTimeout: 5000,  // 5s for unit tests
    hookTimeout: 2500,  // 2.5s for hooks
    
    // Performance-focused test discovery
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/coverage/**',
      '**/*.d.ts'
    ],
    
    // Optimize reporters for performance
    reporters: process.env.CI ? ['github-actions'] : ['default'],
    
    // Cache optimization
    cache: {
      dir: '.vitest/cache'
    },
    
    // Coverage optimizations
    coverage: {
      provider: 'v8' as const, // Fastest coverage provider
      reporter: ['text-summary'], // Minimal reporter for speed
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/coverage/**'
      ]
    }
  }
});