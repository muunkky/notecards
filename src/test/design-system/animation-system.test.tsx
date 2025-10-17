/**
 * Animation System Tests
 * 
 * Comprehensive test suite for animation framework, timing functions,
 * transition utilities, micro-interactions, and accessibility support.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  animationConfig,
  createTransition,
  createKeyframes,
  useReducedMotion,
  useAnimation,
  useIntersectionAnimation,
  FadeIn,
  SlideTransition,
  Scale,
  Stagger,
  Spinner,
  Pulse,
  HoverLift,
  animationPresets,
  animationCSS,
  AnimationSystem,
} from '../../design-system/animations';

// Mock window.matchMedia
const mockMatchMedia = vi.fn();
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mockMatchMedia,
  });
});

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: vi.fn(),
  }));
  
  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    value: mockIntersectionObserver,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Animation Configuration', () => {
  it('should define duration scale with proper values', () => {
    expect(animationConfig.durations.instant).toBe(0);
    expect(animationConfig.durations.micro).toBe(100);
    expect(animationConfig.durations.short).toBe(200);
    expect(animationConfig.durations.medium).toBe(300);
    expect(animationConfig.durations.long).toBe(500);
    expect(animationConfig.durations.extended).toBe(1000);
  });

  it('should include comprehensive easing functions', () => {
    expect(animationConfig.easings.linear).toBe('linear');
    expect(animationConfig.easings.bounce).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    expect(animationConfig.easings.smooth).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
    expect(animationConfig.easings.emphasized).toBe('cubic-bezier(0.2, 0, 0, 1)');
  });

  it('should provide delay options for sequencing', () => {
    expect(animationConfig.delays.none).toBe(0);
    expect(animationConfig.delays.short).toBe(50);
    expect(animationConfig.delays.stagger).toBe(75);
    expect(animationConfig.delays.long).toBe(200);
  });

  it('should define transform utilities', () => {
    expect(animationConfig.transforms.slideUp).toBe('translateY(-100%)');
    expect(animationConfig.transforms.slideDown).toBe('translateY(100%)');
    expect(animationConfig.transforms.fadeIn).toBe('scale(0.95)');
    expect(animationConfig.transforms.rotate).toBe('rotate(180deg)');
  });
});

describe('Animation Utilities', () => {
  it('should create proper CSS transition strings', () => {
    const transition = createTransition('opacity');
    expect(transition).toBe('opacity 300ms cubic-bezier(0.25, 0.1, 0.25, 1) 0ms');
    
    const multiProperty = createTransition(['opacity', 'transform'], 'short', 'bounce', 'medium');
    expect(multiProperty).toBe('opacity, transform 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55) 100ms');
  });

  it('should create keyframe rules', () => {
    const keyframes = createKeyframes('fadeIn', {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' }
    });
    
    expect(keyframes).toContain('@keyframes fadeIn');
    expect(keyframes).toContain('0% { opacity: 0; transform: translateY(20px) }');
    expect(keyframes).toContain('100% { opacity: 1; transform: translateY(0) }');
  });

  it('should handle camelCase to kebab-case conversion in keyframes', () => {
    const keyframes = createKeyframes('test', {
      '0%': { backgroundColor: 'red', fontSize: '14px' }
    });
    
    expect(keyframes).toContain('background-color: red');
    expect(keyframes).toContain('font-size: 14px');
  });
});

describe('useReducedMotion Hook', () => {
  it('should detect reduced motion preference', () => {
    const mockMediaQuery = {
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const TestComponent = () => {
      const reducedMotion = useReducedMotion();
      return <div data-testid="reduced-motion">{reducedMotion.toString()}</div>;
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
  });

  it('should listen for changes in motion preference', () => {
    const mockAddEventListener = vi.fn();
    const mockRemoveEventListener = vi.fn();
    const mockMediaQuery = {
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const TestComponent = () => {
      useReducedMotion();
      return <div>test</div>;
    };
    
    const { unmount } = render(<TestComponent />);
    
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useAnimation Hook', () => {
  it('should respect reduced motion preference', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion enabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const TestComponent = () => {
      const { shouldAnimate, getTransition } = useAnimation();
      return (
        <div>
          <div data-testid="should-animate">{shouldAnimate.toString()}</div>
          <div data-testid="transition">{getTransition('opacity')}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('should-animate')).toHaveTextContent('false');
    expect(screen.getByTestId('transition')).toHaveTextContent('none');
  });

  it('should enable animations when reduced motion is disabled', () => {
    const mockMediaQuery = {
      matches: false, // Reduced motion disabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const TestComponent = () => {
      const { shouldAnimate, getTransition, getDuration } = useAnimation(true, {
        duration: 'short',
        easing: 'bounce'
      });
      return (
        <div>
          <div data-testid="should-animate">{shouldAnimate.toString()}</div>
          <div data-testid="transition">{getTransition('opacity')}</div>
          <div data-testid="duration">{getDuration()}</div>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('should-animate')).toHaveTextContent('true');
    expect(screen.getByTestId('transition')).toContain('opacity 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    expect(screen.getByTestId('duration')).toHaveTextContent('200');
  });

  it('should return zero duration when animations are disabled', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion enabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const TestComponent = () => {
      const { getDuration } = useAnimation();
      return <div data-testid="duration">{getDuration()}</div>;
    };
    
    render(<TestComponent />);
    
    expect(screen.getByTestId('duration')).toHaveTextContent('0');
  });
});

describe('useIntersectionAnimation Hook', () => {
  it('should set up intersection observer with correct options', () => {
    const TestComponent = () => {
      const { elementRef } = useIntersectionAnimation({
        threshold: 0.5,
        rootMargin: '10px',
        triggerOnce: false,
      });
      
      return <div ref={elementRef}>test</div>;
    };
    
    render(<TestComponent />);
    
    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 0.5, rootMargin: '10px' }
    );
  });

  it('should observe element when ref is attached', () => {
    const TestComponent = () => {
      const { elementRef } = useIntersectionAnimation();
      return <div ref={elementRef}>test</div>;
    };
    
    render(<TestComponent />);
    
    expect(mockObserve).toHaveBeenCalled();
  });

  it('should trigger visibility when element intersects', () => {
    let intersectionCallback: (entries: any[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      };
    });
    
    const TestComponent = () => {
      const { elementRef, isVisible } = useIntersectionAnimation();
      return (
        <div ref={elementRef}>
          <span data-testid="visible">{isVisible.toString()}</span>
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Initially not visible
    expect(screen.getByTestId('visible')).toHaveTextContent('false');
    
    // Trigger intersection
    intersectionCallback!([{ isIntersecting: true }]);
    
    expect(screen.getByTestId('visible')).toHaveTextContent('true');
  });
});

describe('FadeIn Component', () => {
  beforeEach(() => {
    // Mock no reduced motion
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should render children', () => {
    render(
      <FadeIn>
        <div>Test Content</div>
      </FadeIn>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply fade-in animation on mount', async () => {
    render(
      <FadeIn triggerOnMount>
        <div>Test Content</div>
      </FadeIn>
    );
    
    const wrapper = screen.getByText('Test Content').parentElement!;
    
    // Should start with opacity 0 and transform
    await waitFor(() => {
      const style = window.getComputedStyle(wrapper);
      expect(style.transition).toContain('opacity');
      expect(style.transition).toContain('transform');
    });
  });

  it('should support different directions', () => {
    const { rerender } = render(
      <FadeIn direction="up" triggerOnMount={false}>
        <div>Test</div>
      </FadeIn>
    );
    
    let wrapper = screen.getByText('Test').parentElement!;
    expect(wrapper.style.transform).toContain('translateY(2rem)');
    
    rerender(
      <FadeIn direction="left" triggerOnMount={false}>
        <div>Test</div>
      </FadeIn>
    );
    
    wrapper = screen.getByText('Test').parentElement!;
    expect(wrapper.style.transform).toContain('translateX(2rem)');
  });

  it('should respect custom distance', () => {
    render(
      <FadeIn direction="up" distance="5rem" triggerOnMount={false}>
        <div>Test</div>
      </FadeIn>
    );
    
    const wrapper = screen.getByText('Test').parentElement!;
    expect(wrapper.style.transform).toContain('translateY(5rem)');
  });

  it('should handle scroll-triggered animation', async () => {
    let intersectionCallback: (entries: any[]) => void;
    
    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback;
      return {
        observe: mockObserve,
        unobserve: mockUnobserve,
        disconnect: vi.fn(),
      };
    });
    
    render(
      <FadeIn triggerOnScroll triggerOnMount={false}>
        <div>Test</div>
      </FadeIn>
    );
    
    const wrapper = screen.getByText('Test').parentElement!;
    
    // Initially hidden
    expect(wrapper.style.opacity).toBe('0');
    
    // Trigger intersection
    intersectionCallback!([{ isIntersecting: true }]);
    
    // Should become visible
    await waitFor(() => {
      expect(wrapper.style.opacity).toBe('1');
    });
  });
});

describe('SlideTransition Component', () => {
  beforeEach(() => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should slide based on visibility prop', () => {
    const { rerender } = render(
      <SlideTransition isVisible={false} direction="up">
        <div>Content</div>
      </SlideTransition>
    );
    
    const wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('translateY(100%)');
    
    rerender(
      <SlideTransition isVisible={true} direction="up">
        <div>Content</div>
      </SlideTransition>
    );
    
    expect(wrapper.style.transform).toBe('translateX(0) translateY(0)');
  });

  it('should support different slide directions', () => {
    const { rerender } = render(
      <SlideTransition isVisible={false} direction="left">
        <div>Content</div>
      </SlideTransition>
    );
    
    let wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('translateX(100%)');
    
    rerender(
      <SlideTransition isVisible={false} direction="right">
        <div>Content</div>
      </SlideTransition>
    );
    
    wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('translateX(-100%)');
  });

  it('should apply transition styles', () => {
    render(
      <SlideTransition isVisible={true} duration="short" easing="bounce">
        <div>Content</div>
      </SlideTransition>
    );
    
    const wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transition).toContain('transform');
    expect(wrapper.style.transition).toContain('200ms');
    expect(wrapper.style.transition).toContain('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
  });
});

describe('Scale Component', () => {
  beforeEach(() => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should scale based on visibility prop', () => {
    const { rerender } = render(
      <Scale isVisible={false} scale={0.5}>
        <div>Content</div>
      </Scale>
    );
    
    const wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('scale(0.5)');
    expect(wrapper.style.opacity).toBe('0');
    
    rerender(
      <Scale isVisible={true} scale={0.5}>
        <div>Content</div>
      </Scale>
    );
    
    expect(wrapper.style.transform).toBe('scale(1)');
    expect(wrapper.style.opacity).toBe('1');
  });

  it('should use custom scale value', () => {
    render(
      <Scale isVisible={false} scale={0.9}>
        <div>Content</div>
      </Scale>
    );
    
    const wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('scale(0.9)');
  });

  it('should apply bounce easing by default', () => {
    render(
      <Scale isVisible={true}>
        <div>Content</div>
      </Scale>
    );
    
    const wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transition).toContain('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
  });
});

describe('Spinner Component', () => {
  beforeEach(() => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should render with default size and styling', () => {
    render(<Spinner />);
    
    const spinner = document.querySelector('div');
    expect(spinner).toBeInTheDocument();
    expect(spinner?.style.width).toBe('24px');
    expect(spinner?.style.height).toBe('24px');
    expect(spinner?.style.borderRadius).toBe('50%');
  });

  it('should apply custom size and color', () => {
    render(<Spinner size={48} color="red" thickness={4} />);
    
    const spinner = document.querySelector('div');
    expect(spinner?.style.width).toBe('48px');
    expect(spinner?.style.height).toBe('48px');
    expect(spinner?.style.borderTop).toBe('4px solid red');
  });

  it('should not animate when reduced motion is enabled', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    render(<Spinner />);
    
    const spinner = document.querySelector('div');
    expect(spinner?.style.animation).toBe('none');
  });
});

describe('HoverLift Component', () => {
  beforeEach(() => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
  });

  it('should lift on hover', async () => {
    const user = userEvent.setup();
    
    render(
      <HoverLift>
        <div>Hover me</div>
      </HoverLift>
    );
    
    const wrapper = screen.getByText('Hover me').parentElement!;
    
    // Initially not lifted
    expect(wrapper.style.transform).toBe('translateY(0)');
    
    // Hover to lift
    await user.hover(wrapper);
    expect(wrapper.style.transform).toBe('translateY(-0.25rem)');
    
    // Unhover to reset
    await user.unhover(wrapper);
    expect(wrapper.style.transform).toBe('translateY(0)');
  });

  it('should apply shadow on hover when enabled', async () => {
    const user = userEvent.setup();
    
    render(
      <HoverLift shadow>
        <div>Hover me</div>
      </HoverLift>
    );
    
    const wrapper = screen.getByText('Hover me').parentElement!;
    
    await user.hover(wrapper);
    expect(wrapper.style.boxShadow).toBe('0 10px 25px rgba(0, 0, 0, 0.15)');
    
    await user.unhover(wrapper);
    expect(wrapper.style.boxShadow).toBe('0 2px 4px rgba(0, 0, 0, 0.1)');
  });

  it('should use custom lift distance', async () => {
    const user = userEvent.setup();
    
    render(
      <HoverLift lift="1rem">
        <div>Hover me</div>
      </HoverLift>
    );
    
    const wrapper = screen.getByText('Hover me').parentElement!;
    
    await user.hover(wrapper);
    expect(wrapper.style.transform).toBe('translateY(-1rem)');
  });
});

describe('Animation Presets', () => {
  it('should provide button interaction presets', () => {
    expect(animationPresets.buttonPress).toHaveProperty('transform', 'scale(0.98)');
    expect(animationPresets.buttonPress).toHaveProperty('transition');
    
    expect(animationPresets.buttonHover).toHaveProperty('transform', 'scale(1.02)');
    expect(animationPresets.buttonHover).toHaveProperty('transition');
  });

  it('should provide card interaction presets', () => {
    expect(animationPresets.cardHover).toHaveProperty('transform', 'translateY(-0.25rem)');
    expect(animationPresets.cardHover).toHaveProperty('boxShadow');
    expect(animationPresets.cardHover).toHaveProperty('transition');
  });

  it('should provide modal animation presets', () => {
    expect(animationPresets.modalBackdrop).toHaveProperty('opacity', 1);
    expect(animationPresets.modalBackdrop).toHaveProperty('transition');
    
    expect(animationPresets.modalContent).toHaveProperty('transform', 'scale(1)');
    expect(animationPresets.modalContent).toHaveProperty('opacity', 1);
  });

  it('should provide page transition presets', () => {
    expect(animationPresets.pageEnter).toHaveProperty('transform', 'translateX(0)');
    expect(animationPresets.pageEnter).toHaveProperty('opacity', 1);
    
    expect(animationPresets.pageExit).toHaveProperty('transform', 'translateX(-100%)');
    expect(animationPresets.pageExit).toHaveProperty('opacity', 0);
  });
});

describe('Animation CSS Variables', () => {
  it('should define duration CSS variables', () => {
    expect(animationCSS['--animation-duration-instant']).toBe('0ms');
    expect(animationCSS['--animation-duration-micro']).toBe('100ms');
    expect(animationCSS['--animation-duration-medium']).toBe('300ms');
    expect(animationCSS['--animation-duration-extended']).toBe('1000ms');
  });

  it('should define easing CSS variables', () => {
    expect(animationCSS['--animation-easing-linear']).toBe('linear');
    expect(animationCSS['--animation-easing-bounce']).toBe('cubic-bezier(0.68, -0.55, 0.265, 1.55)');
    expect(animationCSS['--animation-easing-smooth']).toBe('cubic-bezier(0.25, 0.1, 0.25, 1)');
  });

  it('should define delay CSS variables', () => {
    expect(animationCSS['--animation-delay-none']).toBe('0ms');
    expect(animationCSS['--animation-delay-short']).toBe('50ms');
    expect(animationCSS['--animation-delay-stagger']).toBe('75ms');
  });
});

describe('Animation System Integration', () => {
  it('should export complete system object', () => {
    expect(AnimationSystem).toBeDefined();
    expect(AnimationSystem.version).toBe('1.0.0');
  });

  it('should include all major system parts', () => {
    expect(AnimationSystem.config).toBe(animationConfig);
    expect(AnimationSystem.createTransition).toBe(createTransition);
    expect(AnimationSystem.animationPresets).toBe(animationPresets);
    expect(AnimationSystem.animationCSS).toBe(animationCSS);
  });

  it('should include hook exports', () => {
    expect(AnimationSystem.useReducedMotion).toBe(useReducedMotion);
    expect(AnimationSystem.useAnimation).toBe(useAnimation);
    expect(AnimationSystem.useIntersectionAnimation).toBe(useIntersectionAnimation);
  });

  it('should include component exports', () => {
    expect(AnimationSystem.FadeIn).toBe(FadeIn);
    expect(AnimationSystem.SlideTransition).toBe(SlideTransition);
    expect(AnimationSystem.Scale).toBe(Scale);
    expect(AnimationSystem.Spinner).toBe(Spinner);
    expect(AnimationSystem.HoverLift).toBe(HoverLift);
  });
});

describe('Accessibility Considerations', () => {
  it('should respect prefers-reduced-motion in all components', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion enabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    // Test FadeIn
    render(<FadeIn><div>Test</div></FadeIn>);
    const fadeWrapper = screen.getByText('Test').parentElement!;
    expect(fadeWrapper.style.transition).toBe('none');
    
    // Test Spinner
    render(<Spinner />);
    const spinner = document.querySelector('div[style*="border-radius"]') as HTMLElement;
    expect(spinner?.style.animation).toBe('none');
  });

  it('should provide instant feedback when animations are disabled', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion enabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    render(
      <FadeIn triggerOnMount>
        <div>Test</div>
      </FadeIn>
    );
    
    const wrapper = screen.getByText('Test').parentElement!;
    expect(wrapper.style.opacity).toBe('1'); // Immediately visible
    expect(wrapper.style.transform).toBe('none'); // No transform
  });

  it('should maintain functionality when animations are disabled', () => {
    const mockMediaQuery = {
      matches: true, // Reduced motion enabled
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    mockMatchMedia.mockReturnValue(mockMediaQuery);
    
    const { rerender } = render(
      <SlideTransition isVisible={false}>
        <div>Content</div>
      </SlideTransition>
    );
    
    let wrapper = screen.getByText('Content').parentElement!;
    expect(wrapper.style.transform).toBe('none');
    
    rerender(
      <SlideTransition isVisible={true}>
        <div>Content</div>
      </SlideTransition>
    );
    
    // Content should still be visible
    expect(wrapper.style.transform).toBe('none');
    expect(screen.getByText('Content')).toBeVisible();
  });
});

describe('Performance Considerations', () => {
  it('should use GPU-accelerated properties', () => {
    render(<FadeIn><div>Test</div></FadeIn>);
    const wrapper = screen.getByText('Test').parentElement!;
    
    // Should use transform and opacity (GPU-accelerated)
    expect(wrapper.style.transition).toContain('opacity');
    expect(wrapper.style.transition).toContain('transform');
    expect(wrapper.style.transition).not.toContain('left');
    expect(wrapper.style.transition).not.toContain('top');
  });

  it('should avoid layout-thrashing properties', () => {
    // Test that we use transform instead of changing dimensions
    const transition = createTransition(['transform', 'opacity']);
    expect(transition).toContain('transform');
    expect(transition).toContain('opacity');
    expect(transition).not.toContain('width');
    expect(transition).not.toContain('height');
    expect(transition).not.toContain('margin');
    expect(transition).not.toContain('padding');
  });

  it('should provide reasonable duration defaults', () => {
    // Durations should be short enough for good UX
    expect(animationConfig.durations.micro).toBeLessThanOrEqual(150);
    expect(animationConfig.durations.short).toBeLessThanOrEqual(250);
    expect(animationConfig.durations.medium).toBeLessThanOrEqual(400);
    
    // But long enough to be perceivable
    expect(animationConfig.durations.micro).toBeGreaterThanOrEqual(50);
    expect(animationConfig.durations.short).toBeGreaterThanOrEqual(150);
  });
});