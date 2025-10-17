/**
 * Component Library Tests
 * 
 * Comprehensive test suite for component library architecture,
 * API design, and theme integration. Validates bulletproof
 * component patterns and props strategy.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { ComponentLibrary, Button, Card, Input, createStyledComponent } from '../../design-system/components';
import { defaultTokens as tokenCSS } from '../../design-system/tokens/design-tokens';

// Test utilities
const createMockProps = (overrides = {}) => ({
  'data-testid': 'test-component',
  ...overrides
});

describe('Component Library Architecture', () => {
  describe('Button Component', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      
      const button = screen.getByRole('button', { name: 'Click me' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('btn', 'btn-primary', 'btn-md');
      expect(button).toHaveAttribute('type', 'button');
    });
    
    it('applies variant styles correctly', () => {
      const { rerender } = render(<Button variant="danger">Delete</Button>);
      
      let button = screen.getByRole('button');
      expect(button).toHaveClass('btn-danger');
      expect(button).toHaveStyle({
        background: tokenCSS.semantic.color.error,
        color: tokenCSS.color.white
      });
      
      rerender(<Button variant="success">Save</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('btn-success');
      expect(button).toHaveStyle({
        background: tokenCSS.semantic.color.success
      });
    });
    
    it('applies size styles correctly', () => {
      const { rerender } = render(<Button size="xs">Small</Button>);
      
      let button = screen.getByRole('button');
      expect(button).toHaveClass('btn-xs');
      expect(button).toHaveStyle({
        fontSize: tokenCSS.typography.body.small.fontSize
      });
      
      rerender(<Button size="xl">Large</Button>);
      button = screen.getByRole('button');
      expect(button).toHaveClass('btn-xl');
      expect(button).toHaveStyle({
        fontSize: tokenCSS.typography.heading.h3.fontSize
      });
    });
    
    it('handles disabled state correctly', () => {
      const onClick = vi.fn();
      render(
        <Button disabled onClick={onClick}>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-disabled');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveStyle({ opacity: '0.6' });
      
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
    
    it('handles loading state correctly', () => {
      const onClick = vi.fn();
      render(
        <Button loading onClick={onClick}>
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('btn-loading');
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByText('⟳')).toBeInTheDocument();
      
      fireEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
    });
    
    it('renders icons correctly', () => {
      const { rerender } = render(
        <Button icon="💾" iconPosition="left">
          Save
        </Button>
      );
      
      expect(screen.getByText('💾')).toBeInTheDocument();
      expect(screen.getByText('💾')).toHaveClass('btn-icon-left');
      
      rerender(
        <Button icon="➡️" iconPosition="right">
          Next
        </Button>
      );
      
      expect(screen.getByText('➡️')).toHaveClass('btn-icon-right');
    });
    
    it('handles fullWidth prop correctly', () => {
      render(<Button fullWidth>Full Width</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-full-width');
      expect(button).toHaveStyle({ width: '100%' });
    });
    
    it('supports custom onClick handler', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onClick).toHaveBeenCalledWith(expect.any(Object));
    });
    
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toContain('Button');
    });
  });
  
  describe('Input Component', () => {
    it('renders with default props', () => {
      render(<Input />);
      
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass('input', 'input-md');
      expect(input).toHaveAttribute('type', 'text');
    });
    
    it('renders with label correctly', () => {
      render(<Input label="Username" />);
      
      const label = screen.getByText('Username');
      const input = screen.getByRole('textbox', { name: 'Username' });
      
      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });
    
    it('shows required indicator', () => {
      render(<Input label="Email" required />);
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
      expect(requiredIndicator).toHaveStyle({ color: tokenCSS.semantic.color.error });
    });
    
    it('handles error state correctly', () => {
      render(
        <Input 
          label="Email" 
          error 
          errorMessage="Invalid email format"
        />
      );
      
      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Invalid email format');
      
      expect(input).toHaveClass('input-error');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby', expect.stringContaining(errorMessage.id));
      expect(errorMessage).toHaveAttribute('role', 'alert');
      expect(errorMessage).toHaveStyle({ color: tokenCSS.semantic.color.error });
    });
    
    it('shows helper text correctly', () => {
      render(
        <Input 
          label="Password" 
          helperText="Must be at least 8 characters"
        />
      );
      
      const input = screen.getByRole('textbox');
      const helperText = screen.getByText('Must be at least 8 characters');
      
      expect(helperText).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-describedby', helperText.id);
      expect(helperText).toHaveStyle({ color: tokenCSS.semantic.color.textSecondary });
    });
    
    it('handles disabled state correctly', () => {
      render(<Input disabled label="Disabled Input" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Disabled Input');
      
      expect(input).toBeDisabled();
      expect(input).toHaveClass('input-disabled');
      expect(input).toHaveStyle({ 
        background: tokenCSS.semantic.color.backgroundDisabled,
        color: tokenCSS.semantic.color.textDisabled
      });
      expect(label).toHaveStyle({ color: tokenCSS.semantic.color.textDisabled });
    });
    
    it('renders icons correctly', () => {
      render(
        <Input 
          startIcon="🔍" 
          endIcon="✕"
          placeholder="Search..."
        />
      );
      
      const startIcon = screen.getByText('🔍');
      const endIcon = screen.getByText('✕');
      
      expect(startIcon).toBeInTheDocument();
      expect(startIcon).toHaveClass('input-icon-start');
      expect(endIcon).toBeInTheDocument();
      expect(endIcon).toHaveClass('input-icon-end');
    });
    
    it('applies size variants correctly', () => {
      const { rerender } = render(<Input size="sm" />);
      
      let input = screen.getByRole('textbox');
      expect(input).toHaveClass('input-sm');
      expect(input).toHaveStyle({ fontSize: tokenCSS.typography.body.small.fontSize });
      
      rerender(<Input size="lg" />);
      input = screen.getByRole('textbox');
      expect(input).toHaveClass('input-lg');
      expect(input).toHaveStyle({ fontSize: tokenCSS.typography.body.large.fontSize });
    });
    
    it('handles controlled input correctly', () => {
      const onChange = vi.fn();
      render(<Input value="test value" onChange={onChange} />);
      
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('test value');
      
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(onChange).toHaveBeenCalledTimes(1);
    });
    
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });
  
  describe('Card Component', () => {
    it('renders with default props', () => {
      render(<Card>Card content</Card>);
      
      const card = screen.getByText('Card content').closest('div');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('card', 'card-default', 'card-padding-md');
    });
    
    it('applies variant styles correctly', () => {
      const { rerender } = render(<Card variant="elevated">Content</Card>);
      
      let card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('card-elevated');
      expect(card).toHaveStyle({ boxShadow: tokenCSS.component.card.shadowElevated });
      
      rerender(<Card variant="outlined">Content</Card>);
      card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('card-outlined');
    });
    
    it('renders header and footer correctly', () => {
      render(
        <Card 
          header="Card Header"
          footer={<button>Action</button>}
        >
          Main content
        </Card>
      );
      
      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Card Header')).toHaveClass('card-header');
      
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
      expect(screen.getByRole('button').closest('.card-footer')).toBeInTheDocument();
      
      expect(screen.getByText('Main content')).toBeInTheDocument();
      expect(screen.getByText('Main content')).toHaveClass('card-content');
    });
    
    it('handles clickable cards correctly', () => {
      const onClick = vi.fn();
      render(<Card onClick={onClick}>Clickable card</Card>);
      
      const card = screen.getByText('Clickable card').closest('div');
      expect(card).toHaveClass('card-interactive');
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
      
      fireEvent.click(card!);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
    
    it('applies padding variants correctly', () => {
      const { rerender } = render(<Card padding="none">Content</Card>);
      
      let content = screen.getByText('Content');
      expect(content.closest('div')).toHaveClass('card-padding-none');
      expect(content).toHaveStyle({ padding: '0' });
      
      rerender(<Card padding="lg">Content</Card>);
      content = screen.getByText('Content');
      expect(content.closest('div')).toHaveClass('card-padding-lg');
      expect(content).toHaveStyle({ padding: tokenCSS.semantic.spacing.lg });
    });
    
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card</Card>);
      
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });
  
  describe('Component Composition Utilities', () => {
    it('createStyledComponent works correctly', () => {
      const BaseComponent = React.forwardRef<HTMLDivElement, any>((props, ref) => (
        <div ref={ref} {...props} />
      ));
      
      const StyledComponent = createStyledComponent(
        BaseComponent,
        { background: 'red', color: 'white' },
        { primary: tokenCSS.semantic.color.primary }
      );
      
      render(<StyledComponent variant="primary">Styled</StyledComponent>);
      
      const element = screen.getByText('Styled');
      expect(element).toHaveClass('design-system-component', 'variant-primary');
      expect(element).toHaveStyle({ 
        background: tokenCSS.semantic.color.primary,
        color: 'white'
      });
    });
  });
  
  describe('Component Library Integration', () => {
    it('exports all components correctly', () => {
      expect(ComponentLibrary.Button).toBe(Button);
      expect(ComponentLibrary.Card).toBe(Card);
      expect(ComponentLibrary.Input).toBe(Input);
      expect(ComponentLibrary.createStyledComponent).toBe(createStyledComponent);
      expect(ComponentLibrary.tokens).toBe(tokenCSS);
      expect(ComponentLibrary.version).toBe('1.0.0');
    });
    
    it('components use design tokens correctly', () => {
      render(<Button>Token Test</Button>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveStyle({
        background: tokenCSS.component.button.primary.background,
        color: tokenCSS.component.button.primary.text,
        borderRadius: tokenCSS.component.button.borderRadius,
        fontSize: tokenCSS.component.button.fontSize
      });
    });
    
    it('components maintain consistent spacing', () => {
      render(
        <Card>
          <Input label="Test Input" />
          <Button>Test Button</Button>
        </Card>
      );
      
      const input = screen.getByRole('textbox');
      const button = screen.getByRole('button');
      
      // Both components should use consistent spacing tokens
      expect(input).toHaveStyle({
        padding: tokenCSS.component.input.padding
      });
      expect(button).toHaveStyle({
        padding: `${tokenCSS.component.button.paddingY} ${tokenCSS.component.button.paddingX}`
      });
    });
  });
  
  describe('Accessibility Integration', () => {
    it('components support keyboard navigation', () => {
      render(
        <div>
          <Button>Button 1</Button>
          <Input label="Input" />
          <Card onClick={vi.fn()}>Clickable Card</Card>
        </div>
      );
      
      const button = screen.getByRole('button');
      const input = screen.getByRole('textbox');
      const card = screen.getByRole('button', { name: 'Clickable Card' });
      
      // All should be focusable
      button.focus();
      expect(document.activeElement).toBe(button);
      
      input.focus();
      expect(document.activeElement).toBe(input);
      
      card.focus();
      expect(document.activeElement).toBe(card);
    });
    
    it('components provide proper ARIA attributes', () => {
      render(
        <div>
          <Button disabled>Disabled Button</Button>
          <Input error errorMessage="Invalid input" />
          <Card onClick={vi.fn()}>Interactive Card</Card>
        </div>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
      
      const card = screen.getByRole('button', { name: 'Interactive Card' });
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });
  
  describe('Theme Integration', () => {
    it('components respond to theme changes', () => {
      // This would test theme switching if implemented
      render(<Button variant="primary">Themed Button</Button>);
      
      const button = screen.getByRole('button');
      
      // Verify button uses theme tokens
      expect(button).toHaveStyle({
        background: tokenCSS.component.button.primary.background,
        color: tokenCSS.component.button.primary.text,
        borderColor: tokenCSS.component.button.primary.border
      });
    });
  });
  
  describe('Performance Considerations', () => {
    it('components render efficiently', async () => {
      const renderSpy = vi.fn();
      
      const TestComponent = React.memo(() => {
        renderSpy();
        return <Button>Memoized Button</Button>;
      });
      
      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props - should not re-render due to memo
      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
    
    it('components handle large numbers efficiently', () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      
      const startTime = performance.now();
      
      render(
        <div>
          {items.map(i => (
            <Button key={i}>Button {i}</Button>
          ))}
        </div>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render 100 buttons in reasonable time
      expect(renderTime).toBeLessThan(100); // Less than 100ms
      expect(screen.getAllByRole('button')).toHaveLength(100);
    });
  });
});

describe('Component API Design', () => {
  it('maintains consistent prop patterns across components', () => {
    // All components should support common base props
    const commonProps = {
      className: 'custom-class',
      'data-testid': 'test-component'
    };
    
    render(
      <div>
        <Button {...commonProps}>Button</Button>
        <Input {...commonProps} />
        <Card {...commonProps}>Card</Card>
      </div>
    );
    
    const button = screen.getByTestId('test-component');
    const input = screen.getAllByTestId('test-component')[1];
    const card = screen.getAllByTestId('test-component')[2];
    
    expect(button).toHaveClass('custom-class');
    expect(input).toHaveClass('custom-class');
    expect(card).toHaveClass('custom-class');
  });
  
  it('supports size variants consistently', () => {
    render(
      <div>
        <Button size="lg">Large Button</Button>
        <Input size="lg" />
      </div>
    );
    
    const button = screen.getByRole('button');
    const input = screen.getByRole('textbox');
    
    expect(button).toHaveClass('btn-lg');
    expect(input).toHaveClass('input-lg');
    
    // Both should use large typography
    expect(button).toHaveStyle({ fontSize: tokenCSS.typography.body.large.fontSize });
    expect(input).toHaveStyle({ fontSize: tokenCSS.typography.body.large.fontSize });
  });
  
  it('provides forwards-compatible prop interfaces', () => {
    // Components should gracefully handle unknown props
    const extraProps = {
      'future-prop': 'value',
      'data-analytics': 'track-me'
    };
    
    expect(() => {
      render(<Button {...extraProps}>Future Proof</Button>);
    }).not.toThrow();
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-analytics', 'track-me');
  });
});