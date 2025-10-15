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
    testTimeout: 30000, // 30 second timeout for tests
    hookTimeout: 10000, // 10 second timeout for hooks
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
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
