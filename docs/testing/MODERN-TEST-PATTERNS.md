# Modern Test Patterns Guide

This guide documents modern testing patterns and practices for the notecards application.

## Core Principles

### 1. Test Structure (AAA Pattern)
```typescript
describe('ComponentName', () => {
  it('should perform expected behavior', async () => {
    // Arrange - Set up test data and mocks
    const mockData = mockFactories.deck({ title: 'Test Deck' })
    const mockFn = vi.fn()
    
    // Act - Perform the action being tested
    render(<Component data={mockData} onAction={mockFn} />)
    await userEvent.click(screen.getByRole('button', { name: /action/i }))
    
    // Assert - Verify the expected outcome
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({
      id: mockData.id
    }))
  })
})
```

### 2. Modern Async Testing
```typescript
// ✅ Good: Use async/await with waitFor
it('should handle async operations', async () => {
  render(<AsyncComponent />)
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument()
  })
})

// ✅ Good: Use modern async utilities
it('should wait for complex state changes', async () => {
  render(<Component />)
  
  await asyncTestUtils.waitForCondition(
    () => screen.queryByText('Loading') === null,
    5000
  )
  
  expect(screen.getByText('Content')).toBeInTheDocument()
})
```

### 3. Performance-Conscious Testing
```typescript
it('should render quickly', async () => {
  const { renderTime } = await performanceTestUtils.measureRender(() =>
    render(<LargeComponent data={largeMockData} />)
  )
  
  // Assert reasonable render performance
  expect(renderTime).toBeLessThan(100) // 100ms threshold
})
```

### 4. Improved Mock Factories
```typescript
// ✅ Use factory functions for consistent test data
const testDeck = mockFactories.deck({
  title: 'Specific Test Deck',
  cardCount: 5
})

// ✅ Create realistic mock data
const testUser = mockFactories.user({
  email: 'test@example.com',
  displayName: 'Test User'
})
```

### 5. Modern Error Testing
```typescript
it('should handle errors gracefully', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const mockError = new Error('Test error')
  
  // Mock function to throw error
  vi.mocked(someFunctionThatMightFail).mockRejectedValueOnce(mockError)
  
  render(<ComponentWithErrorHandling />)
  
  await waitFor(() => {
    expect(screen.getByText(/error occurred/i)).toBeInTheDocument()
  })
  
  consoleSpy.mockRestore()
})
```

### 6. Component Integration Testing
```typescript
it('should integrate multiple components correctly', async () => {
  const { user } = render(<ParentComponent />)
  
  // Test the full user workflow
  await user.click(screen.getByRole('button', { name: /create/i }))
  await user.type(screen.getByLabelText(/title/i), 'New Item')
  await user.click(screen.getByRole('button', { name: /save/i }))
  
  await waitFor(() => {
    expect(screen.getByText('New Item')).toBeInTheDocument()
  })
})
```

## Best Practices

### Do's ✅
- Use descriptive test names that explain the expected behavior
- Test user interactions, not implementation details
- Use modern async patterns with async/await
- Leverage factory functions for consistent test data
- Test edge cases and error conditions
- Use proper cleanup between tests
- Focus on integration over unit testing for UI components

### Don'ts ❌
- Don't test implementation details (internal state, private methods)
- Don't use arbitrary delays (setTimeout) - use waitFor instead
- Don't create overly complex test setups
- Don't ignore TypeScript errors in tests
- Don't test third-party library functionality
- Don't use legacy testing patterns (callbacks, .then())

## Migration Guidelines

When updating existing tests:

1. **Modernize imports**: Use consistent Vitest imports
2. **Update async patterns**: Replace callbacks with async/await
3. **Improve assertions**: Use semantic queries and meaningful assertions
4. **Add performance considerations**: Use utilities for performance-sensitive tests
5. **Enhance error handling**: Test error boundaries and edge cases

## Test Performance Guidelines

- Unit tests should complete in < 100ms
- Integration tests should complete in < 500ms
- Use `performance.now()` to measure actual performance
- Mock expensive operations (network, file system, complex calculations)
- Use `vi.useFakeTimers()` for time-dependent tests

## Common Patterns

### Testing Custom Hooks
```typescript
import { renderHook, waitFor } from '@testing-library/react'

it('should manage state correctly', async () => {
  const { result } = renderHook(() => useCustomHook())
  
  act(() => {
    result.current.updateState('new value')
  })
  
  await waitFor(() => {
    expect(result.current.state).toBe('new value')
  })
})
```

### Testing Context Providers
```typescript
it('should provide context values', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProvider value={mockValue}>{children}</TestProvider>
  )
  
  const { result } = renderHook(() => useTestContext(), { wrapper })
  
  expect(result.current).toEqual(mockValue)
})
```

This guide should be updated as new patterns emerge and testing practices evolve.