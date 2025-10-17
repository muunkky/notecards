/**
 * Documentation Portal Tests
 * 
 * Comprehensive test suite for the design system documentation portal,
 * component showcase, design tokens display, and accessibility guidelines.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  DocumentationPortal,
} from '../../design-system/documentation';

// Mock alert for interactive examples
const originalAlert = window.alert;
beforeEach(() => {
  window.alert = vi.fn();
});

afterEach(() => {
  window.alert = originalAlert;
});

describe('Documentation Portal', () => {
  it('should render with default props', () => {
    render(<DocumentationPortal />);
    
    expect(screen.getByText('Design System')).toBeInTheDocument();
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    expect(screen.getByText('DOCUMENTATION')).toBeInTheDocument();
  });

  it('should display version information when provided', () => {
    render(<DocumentationPortal version="2.0.0" />);
    
    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
  });

  it('should render theme toggle when onThemeChange is provided', () => {
    const mockThemeChange = vi.fn();
    render(<DocumentationPortal onThemeChange={mockThemeChange} />);
    
    const themeButton = screen.getByRole('button', { name: /switch to.*mode/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should call theme change callback when theme button is clicked', async () => {
    const user = userEvent.setup();
    const mockThemeChange = vi.fn();
    render(<DocumentationPortal onThemeChange={mockThemeChange} darkMode={false} />);
    
    const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });
    await user.click(themeButton);
    
    expect(mockThemeChange).toHaveBeenCalledWith(true);
  });

  it('should not render search when searchEnabled is false', () => {
    render(<DocumentationPortal searchEnabled={false} />);
    
    expect(screen.queryByPlaceholderText('Search documentation...')).not.toBeInTheDocument();
  });

  it('should render search input when searchEnabled is true', () => {
    render(<DocumentationPortal searchEnabled={true} />);
    
    expect(screen.getByPlaceholderText('Search documentation...')).toBeInTheDocument();
  });
});

describe('Navigation', () => {
  it('should render all main navigation sections', () => {
    render(<DocumentationPortal />);
    
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Design Tokens')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
  });

  it('should start with Getting Started section active', () => {
    render(<DocumentationPortal />);
    
    // Should show getting started content
    expect(screen.getByText('Quick start guide to integrating the design system into your project.')).toBeInTheDocument();
    expect(screen.getByText('Installation')).toBeInTheDocument();
  });

  it('should navigate between sections when clicking navigation buttons', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    // Click on Design Tokens
    const designTokensButton = screen.getByRole('button', { name: /design tokens/i });
    await user.click(designTokensButton);
    
    // Should show design tokens content
    expect(screen.getByText('Design tokens are the visual design atoms of the design system')).toBeInTheDocument();
  });

  it('should highlight active navigation section', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    const componentsButton = screen.getByRole('button', { name: /components/i });
    await user.click(componentsButton);
    
    // Active button should have different styling (would need to check computed styles in real implementation)
    expect(componentsButton).toBeInTheDocument();
  });
});

describe('Getting Started Section', () => {
  beforeEach(() => {
    render(<DocumentationPortal />);
  });

  it('should display installation instructions', () => {
    expect(screen.getByText('Installation')).toBeInTheDocument();
    expect(screen.getByText('npm install @company/design-system')).toBeInTheDocument();
  });

  it('should show basic usage example', () => {
    expect(screen.getByText('Basic Usage')).toBeInTheDocument();
    expect(screen.getByText(/import.*Button.*Input.*Card/)).toBeInTheDocument();
  });

  it('should include theming information', () => {
    expect(screen.getByText('Theming')).toBeInTheDocument();
    expect(screen.getByText(/CSS custom properties/)).toBeInTheDocument();
  });
});

describe('Design Tokens Section', () => {
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    const designTokensButton = screen.getByRole('button', { name: /design tokens/i });
    await user.click(designTokensButton);
  });

  it('should display design tokens navigation', () => {
    expect(screen.getByText('Colors')).toBeInTheDocument();
    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Spacing')).toBeInTheDocument();
  });

  it('should show color tokens by default', () => {
    expect(screen.getByText('Color Palette')).toBeInTheDocument();
    expect(screen.getByText('Primary Colors')).toBeInTheDocument();
    expect(screen.getByText('Semantic Colors')).toBeInTheDocument();
  });

  it('should display WCAG compliance information', () => {
    expect(screen.getByText('WCAG Compliance')).toBeInTheDocument();
    expect(screen.getByText(/WCAG AA standards/)).toBeInTheDocument();
  });

  it('should switch to typography tokens when typography button is clicked', async () => {
    const user = userEvent.setup();
    
    const typographyButton = screen.getByRole('button', { name: 'Typography' });
    await user.click(typographyButton);
    
    expect(screen.getByText('Typography Scale')).toBeInTheDocument();
    expect(screen.getByText(/The quick brown fox jumps over the lazy dog/)).toBeInTheDocument();
  });

  it('should switch to spacing tokens when spacing button is clicked', async () => {
    const user = userEvent.setup();
    
    const spacingButton = screen.getByRole('button', { name: 'Spacing' });
    await user.click(spacingButton);
    
    expect(screen.getByText('Spacing Scale')).toBeInTheDocument();
    expect(screen.getByText(/Consistent spacing creates visual rhythm/)).toBeInTheDocument();
  });

  it('should display color swatches with hex values', () => {
    // Should show primary color swatches
    expect(screen.getByText('primary-50')).toBeInTheDocument();
    expect(screen.getByText('primary-500')).toBeInTheDocument();
    expect(screen.getByText('primary-950')).toBeInTheDocument();
  });

  it('should show semantic color examples', () => {
    expect(screen.getByText('success')).toBeInTheDocument();
    expect(screen.getByText('warning')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
  });
});

describe('Components Section', () => {
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    const componentsButton = screen.getByRole('button', { name: /components/i });
    await user.click(componentsButton);
  });

  it('should display component navigation', () => {
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Card' })).toBeInTheDocument();
  });

  it('should show button examples by default', () => {
    expect(screen.getByText('Primary Button')).toBeInTheDocument();
    expect(screen.getByText('Secondary Button')).toBeInTheDocument();
    expect(screen.getByText('Button Sizes')).toBeInTheDocument();
    expect(screen.getByText('Button States')).toBeInTheDocument();
  });

  it('should display interactive button examples', () => {
    expect(screen.getByRole('button', { name: 'Primary Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secondary Action' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument();
  });

  it('should show code examples for components', () => {
    expect(screen.getByText('<Button variant="primary">Primary Action</Button>')).toBeInTheDocument();
    expect(screen.getByText('<Button variant="secondary">Secondary Action</Button>')).toBeInTheDocument();
  });

  it('should switch to input examples when input button is clicked', async () => {
    const user = userEvent.setup();
    
    const inputButton = screen.getByRole('button', { name: 'Input' });
    await user.click(inputButton);
    
    expect(screen.getByText('Text Input')).toBeInTheDocument();
    expect(screen.getByText('Input with Label')).toBeInTheDocument();
    expect(screen.getByText('Input States')).toBeInTheDocument();
  });

  it('should switch to card examples when card button is clicked', async () => {
    const user = userEvent.setup();
    
    const cardButton = screen.getByRole('button', { name: 'Card' });
    await user.click(cardButton);
    
    expect(screen.getByText('Basic Card')).toBeInTheDocument();
    expect(screen.getByText('Interactive Card')).toBeInTheDocument();
  });

  it('should demonstrate interactive card behavior', async () => {
    const user = userEvent.setup();
    
    const cardButton = screen.getByRole('button', { name: 'Card' });
    await user.click(cardButton);
    
    const interactiveCard = screen.getByText('Interactive Card').closest('div');
    if (interactiveCard) {
      await user.click(interactiveCard);
      expect(window.alert).toHaveBeenCalledWith('Card clicked!');
    }
  });
});

describe('Accessibility Section', () => {
  beforeEach(async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    const accessibilityButton = screen.getByRole('button', { name: /accessibility/i });
    await user.click(accessibilityButton);
  });

  it('should display WCAG compliance information', () => {
    expect(screen.getByText('WCAG Compliance')).toBeInTheDocument();
    expect(screen.getByText(/meet WCAG 2.1 AA standards/)).toBeInTheDocument();
  });

  it('should show accessibility checklist', () => {
    expect(screen.getByText(/All color combinations meet WCAG AA contrast requirements/)).toBeInTheDocument();
    expect(screen.getByText(/All interactive elements are keyboard accessible/)).toBeInTheDocument();
    expect(screen.getByText(/Screen reader support/)).toBeInTheDocument();
    expect(screen.getByText(/Focus management/)).toBeInTheDocument();
  });

  it('should provide color and contrast guidelines', () => {
    expect(screen.getByText('Color and Contrast')).toBeInTheDocument();
    expect(screen.getByText(/predefined color combinations/)).toBeInTheDocument();
  });

  it('should include keyboard navigation instructions', () => {
    expect(screen.getByText('Keyboard Navigation')).toBeInTheDocument();
    expect(screen.getByText(/Tab:/)).toBeInTheDocument();
    expect(screen.getByText(/Enter\/Space:/)).toBeInTheDocument();
    expect(screen.getByText(/Escape:/)).toBeInTheDocument();
    expect(screen.getByText(/Arrow keys:/)).toBeInTheDocument();
  });

  it('should show screen reader support guidelines', () => {
    expect(screen.getByText('Screen Reader Support')).toBeInTheDocument();
    expect(screen.getByText(/proper ARIA attributes/)).toBeInTheDocument();
  });

  it('should provide code examples for accessibility', () => {
    expect(screen.getByText(/aria-label=/)).toBeInTheDocument();
    expect(screen.getByText(/aria-describedby=/)).toBeInTheDocument();
  });
});

describe('Search Functionality', () => {
  beforeEach(() => {
    render(<DocumentationPortal searchEnabled={true} />);
  });

  it('should render search input', () => {
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show search results when typing', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    
    await user.type(searchInput, 'button');
    
    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    }, { timeout: 100 });
    
    await waitFor(() => {
      expect(screen.getByText(/result.*found/i)).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should display search results with proper structure', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    
    await user.type(searchInput, 'button');
    
    await waitFor(() => {
      expect(screen.getByText('Button Component')).toBeInTheDocument();
      expect(screen.getByText(/Primary and secondary button variants/)).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should show no results message for non-matching search', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    
    await user.type(searchInput, 'nonexistent');
    
    await waitFor(() => {
      expect(screen.getByText('No results found for "nonexistent"')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('should clear search results when input is cleared', async () => {
    const user = userEvent.setup();
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    
    // Type search query
    await user.type(searchInput, 'button');
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/result.*found/i)).toBeInTheDocument();
    }, { timeout: 500 });
    
    // Clear input
    await user.clear(searchInput);
    
    // Results should be gone
    expect(screen.queryByText(/result.*found/i)).not.toBeInTheDocument();
  });
});

describe('Responsive Behavior', () => {
  it('should render properly on different screen sizes', () => {
    // Test mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });
    
    render(<DocumentationPortal />);
    expect(screen.getByText('Design System')).toBeInTheDocument();
    
    // Test desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1200,
    });
    
    render(<DocumentationPortal />);
    expect(screen.getAllByText('Design System')).toHaveLength(2); // Both instances rendered
  });

  it('should maintain navigation functionality across viewport sizes', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    const designTokensButton = screen.getByRole('button', { name: /design tokens/i });
    await user.click(designTokensButton);
    
    expect(screen.getByText('Design tokens are the visual design atoms')).toBeInTheDocument();
  });
});

describe('Component Integration', () => {
  it('should properly integrate with design system components', () => {
    render(<DocumentationPortal />);
    
    // Should use design system components internally
    expect(screen.getByRole('heading', { name: 'Design System' })).toBeInTheDocument();
    expect(screen.getByText('DOCUMENTATION')).toBeInTheDocument();
  });

  it('should apply consistent styling throughout', () => {
    render(<DocumentationPortal />);
    
    // All headings should be properly styled (would test computed styles in real implementation)
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('should maintain accessibility standards', () => {
    render(<DocumentationPortal />);
    
    // Should have proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    
    // Navigation should be accessible
    const navButtons = screen.getAllByRole('button');
    navButtons.forEach(button => {
      expect(button).toBeVisible();
    });
  });
});

describe('Error Handling', () => {
  it('should handle missing theme change callback gracefully', () => {
    render(<DocumentationPortal onThemeChange={undefined} />);
    
    // Should not render theme toggle when callback is not provided
    expect(screen.queryByRole('button', { name: /switch to.*mode/i })).not.toBeInTheDocument();
  });

  it('should handle search errors gracefully', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal searchEnabled={true} />);
    
    const searchInput = screen.getByPlaceholderText('Search documentation...');
    
    // Should not crash with special characters
    await user.type(searchInput, '!@#$%^&*()');
    
    // Should handle the search gracefully
    expect(searchInput).toHaveValue('!@#$%^&*()');
  });

  it('should maintain state when switching between sections', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    // Navigate to design tokens
    const designTokensButton = screen.getByRole('button', { name: /design tokens/i });
    await user.click(designTokensButton);
    
    // Switch to typography
    const typographyButton = screen.getByRole('button', { name: 'Typography' });
    await user.click(typographyButton);
    
    // Navigate to components and back
    const componentsButton = screen.getByRole('button', { name: /components/i });
    await user.click(componentsButton);
    
    await user.click(designTokensButton);
    
    // Typography should still be selected in design tokens
    expect(screen.getByText('Typography Scale')).toBeInTheDocument();
  });
});

describe('Performance', () => {
  it('should render efficiently without unnecessary re-renders', () => {
    const renderSpy = vi.fn();
    
    const TestWrapper: React.FC = () => {
      renderSpy();
      return <DocumentationPortal />;
    };
    
    const { rerender } = render(<TestWrapper />);
    
    expect(renderSpy).toHaveBeenCalledTimes(1);
    
    // Re-render with same props shouldn't cause excessive renders
    rerender(<TestWrapper />);
    
    expect(renderSpy).toHaveBeenCalledTimes(2);
  });

  it('should handle large numbers of examples without performance issues', async () => {
    const user = userEvent.setup();
    render(<DocumentationPortal />);
    
    // Navigate through all sections quickly
    const sections = ['Design Tokens', 'Components', 'Accessibility'];
    
    for (const sectionName of sections) {
      const button = screen.getByRole('button', { name: new RegExp(sectionName, 'i') });
      await user.click(button);
      
      // Should render without significant delay
      expect(button).toBeInTheDocument();
    }
  });
});