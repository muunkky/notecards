import { describe, it, expect } from 'vitest'

describe('TDD Verification', () => {
  it('should verify that our test infrastructure works', () => {
    expect(true).toBe(true)
  })

  it('should perform basic math operations', () => {
    expect(2 + 2).toBe(4)
    expect(5 * 3).toBe(15)
  })

  it('should handle arrays correctly', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr[0]).toBe(1)
  })
})
