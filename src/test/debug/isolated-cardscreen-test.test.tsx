import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import CardScreen from '../../features/cards/CardScreen'

// Minimal test to isolate the hanging issue
describe('CardScreen Isolation Test', () => {
  
  beforeEach(() => {
    console.log('🔍 Test starting:', new Date().toISOString())
    vi.useFakeTimers()
  })

  afterEach(async () => {
    console.log('🧹 Test cleanup starting:', new Date().toISOString())
    
    try {
      // Force cleanup all pending operations
      cleanup()
      
      // Clear all timers aggressively
      vi.runOnlyPendingTimers()
      vi.clearAllTimers()
      vi.useRealTimers()
      
      console.log('✅ Test cleanup complete:', new Date().toISOString())
    } catch (error) {
      console.error('❌ Cleanup error:', error)
      throw error
    }
  })

  it('should render without hanging (basic smoke test)', async () => {
    console.log('🚀 Rendering CardScreen...')
    
    const mockProps = {
      // Minimal props to get CardScreen to render
      cards: [],
      deckId: 'test-deck',
      selectedDeckId: 'test-deck',
      onCardUpdate: vi.fn(),
      onCardDelete: vi.fn(),
      onCardReorder: vi.fn()
    }

    try {
      render(<CardScreen {...mockProps} />)
      console.log('✅ CardScreen rendered successfully')
      
      // Just check it renders without hanging
      expect(screen.getByRole('main', { hidden: true })).toBeInTheDocument()
      console.log('✅ Basic assertion passed')
      
    } catch (error) {
      console.error('❌ Render error:', error)
      throw error
    }
  })

  // Skip the problematic edit form test for now
  it.skip('should update card when edit form is submitted (PROBLEMATIC)', async () => {
    // This is the test that was hanging - we'll isolate it later
  })
})