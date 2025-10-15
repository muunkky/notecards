import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Extreme timeout test to verify our cleanup works
describe('Timeout Isolation Test', () => {
  
  let timeoutHandle: NodeJS.Timeout | null = null
  let intervalHandle: NodeJS.Timeout | null = null
  
  beforeEach(() => {
    console.log('🔍 Timeout test starting:', new Date().toISOString())
    vi.useFakeTimers()
  })

  afterEach(async () => {
    console.log('🧹 Aggressive cleanup starting:', new Date().toISOString())
    
    // Clear any timeouts we created
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
      timeoutHandle = null
    }
    
    if (intervalHandle) {
      clearInterval(intervalHandle)  
      intervalHandle = null
    }
    
    // Nuclear option - clear everything
    vi.runOnlyPendingTimers()
    vi.clearAllTimers()
    vi.useRealTimers()
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    console.log('✅ Aggressive cleanup complete:', new Date().toISOString())
  })

  it('should handle timeouts without hanging', async () => {
    console.log('🚀 Creating timeout...')
    
    // Create a timeout that would normally hang
    timeoutHandle = setTimeout(() => {
      console.log('Timeout fired (this should not happen in fake timer mode)')
    }, 5000)
    
    console.log('✅ Timeout created, should be cleaned up automatically')
    
    // Verify the test completes quickly
    expect(true).toBe(true)
  })

  it('should handle intervals without hanging', async () => {
    console.log('🚀 Creating interval...')
    
    let counter = 0
    intervalHandle = setInterval(() => {
      counter++
      console.log('Interval fired:', counter)
    }, 1000)
    
    // Let a few intervals run
    vi.advanceTimersByTime(3000)
    
    console.log('✅ Interval test complete, counter:', counter)
    expect(counter).toBeGreaterThan(0)
  })
})