/**
 * Animation and Motion Design System
 * 
 * Consistent animation framework with timing functions, transition utilities,
 * micro-interactions, and accessibility considerations. Built for performance
 * and reduced motion support.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Core animation configuration
export const animationConfig = {
  // Duration scale - based on natural rhythm
  durations: {
    instant: 0,           // 0ms - immediate feedback
    micro: 100,           // 100ms - micro-interactions
    short: 200,           // 200ms - quick transitions
    medium: 300,          // 300ms - standard transitions
    long: 500,            // 500ms - complex animations
    extended: 1000,       // 1000ms - dramatic effects
  },
  
  // Easing functions - natural motion curves
  easings: {
    // Standard easings
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    
    // Custom cubic-bezier curves for natural motion
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    emphasized: 'cubic-bezier(0.2, 0, 0, 1)',
    decelerated: 'cubic-bezier(0, 0, 0.2, 1)',
    accelerated: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  
  // Animation delays for sequencing
  delays: {
    none: 0,
    short: 50,
    medium: 100,
    long: 200,
    stagger: 75,          // For staggered animations
  },
  
  // Transform utilities
  transforms: {
    slideUp: 'translateY(-100%)',
    slideDown: 'translateY(100%)',
    slideLeft: 'translateX(-100%)',
    slideRight: 'translateX(100%)',
    fadeIn: 'scale(0.95)',
    fadeOut: 'scale(1.05)',
    bounce: 'scale(1.1)',
    rotate: 'rotate(180deg)',
  },
} as const;

// CSS animation utilities
export const createTransition = (
  property: string | string[],
  duration: keyof typeof animationConfig.durations = 'medium',
  easing: keyof typeof animationConfig.easings = 'smooth',
  delay: keyof typeof animationConfig.delays = 'none'
): string => {
  const props = Array.isArray(property) ? property.join(', ') : property;
  const durationMs = animationConfig.durations[duration];
  const easingCurve = animationConfig.easings[easing];
  const delayMs = animationConfig.delays[delay];
  
  return `${props} ${durationMs}ms ${easingCurve} ${delayMs}ms`;
};

export const createKeyframes = (name: string, keyframes: Record<string, React.CSSProperties>): string => {
  const keyframeRules = Object.entries(keyframes)
    .map(([percentage, styles]) => {
      const styleString = Object.entries(styles)
        .map(([prop, value]) => `${prop.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}: ${value}`)
        .join('; ');
      return `${percentage} { ${styleString} }`;
    })
    .join(' ');
  
  return `@keyframes ${name} { ${keyframeRules} }`;
};

// Reduced motion detection and support
export const useReducedMotion = (): boolean => {
  const [reducedMotion, setReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return reducedMotion;
};

// Animation hooks and utilities
export const useAnimation = (
  enabled: boolean = true,
  options: {
    duration?: keyof typeof animationConfig.durations;
    easing?: keyof typeof animationConfig.easings;
    delay?: keyof typeof animationConfig.delays;
  } = {}
) => {
  const reducedMotion = useReducedMotion();
  const {
    duration = 'medium',
    easing = 'smooth',
    delay = 'none',
  } = options;
  
  const shouldAnimate = enabled && !reducedMotion;
  
  const getTransition = (property: string | string[]) => {
    if (!shouldAnimate) return 'none';
    return createTransition(property, duration, easing, delay);
  };
  
  const getDuration = () => {
    if (!shouldAnimate) return 0;
    return animationConfig.durations[duration];
  };
  
  return {
    shouldAnimate,
    getTransition,
    getDuration,
    reducedMotion,
  };
};

// Intersection Observer hook for scroll-triggered animations
export const useIntersectionAnimation = (
  options: {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
  } = {}
) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            setHasTriggered(true);
          }
        } else if (!triggerOnce && !hasTriggered) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );
    
    observer.observe(element);
    return () => observer.unobserve(element);
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);
  
  return {
    elementRef,
    isVisible,
    hasTriggered,
  };
};

// Common animation components
export interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: keyof typeof animationConfig.durations;
  delay?: keyof typeof animationConfig.delays;
  distance?: string;
  className?: string;
  style?: React.CSSProperties;
  triggerOnMount?: boolean;
  triggerOnScroll?: boolean;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  direction = 'up',
  duration = 'medium',
  delay = 'none',
  distance = '2rem',
  className,
  style,
  triggerOnMount = true,
  triggerOnScroll = false,
}) => {
  const [isVisible, setIsVisible] = useState(!triggerOnMount && !triggerOnScroll);
  const { shouldAnimate, getTransition } = useAnimation(true, { duration, delay });
  const { elementRef, isVisible: scrollVisible } = useIntersectionAnimation({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (triggerOnMount) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [triggerOnMount]);
  
  useEffect(() => {
    if (triggerOnScroll && scrollVisible) {
      setIsVisible(true);
    }
  }, [triggerOnScroll, scrollVisible]);
  
  const getInitialTransform = () => {
    if (!shouldAnimate) return 'none';
    
    switch (direction) {
      case 'up': return `translateY(${distance})`;
      case 'down': return `translateY(-${distance})`;
      case 'left': return `translateX(${distance})`;
      case 'right': return `translateX(-${distance})`;
      default: return 'none';
    }
  };
  
  const animationStyles: React.CSSProperties = {
    opacity: shouldAnimate ? (isVisible ? 1 : 0) : 1,
    transform: shouldAnimate ? (isVisible ? 'none' : getInitialTransform()) : 'none',
    transition: shouldAnimate ? getTransition(['opacity', 'transform']) : 'none',
    ...style,
  };
  
  return (
    <div
      ref={triggerOnScroll ? elementRef : undefined}
      className={className}
      style={animationStyles}
    >
      {children}
    </div>
  );
};

// Slide transition component
export interface SlideTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: keyof typeof animationConfig.durations;
  easing?: keyof typeof animationConfig.easings;
  className?: string;
  style?: React.CSSProperties;
}

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  children,
  isVisible,
  direction = 'up',
  duration = 'medium',
  easing = 'smooth',
  className,
  style,
}) => {
  const { shouldAnimate, getTransition } = useAnimation(true, { duration, easing });
  
  const getTransform = () => {
    if (!shouldAnimate) return 'none';
    if (isVisible) return 'translateX(0) translateY(0)';
    
    switch (direction) {
      case 'up': return 'translateY(100%)';
      case 'down': return 'translateY(-100%)';
      case 'left': return 'translateX(100%)';
      case 'right': return 'translateX(-100%)';
      default: return 'none';
    }
  };
  
  const animationStyles: React.CSSProperties = {
    transform: getTransform(),
    transition: shouldAnimate ? getTransition('transform') : 'none',
    overflow: 'hidden',
    ...style,
  };
  
  return (
    <div className={className} style={animationStyles}>
      {children}
    </div>
  );
};

// Scale animation component
export interface ScaleProps {
  children: React.ReactNode;
  isVisible: boolean;
  scale?: number;
  duration?: keyof typeof animationConfig.durations;
  easing?: keyof typeof animationConfig.easings;
  className?: string;
  style?: React.CSSProperties;
}

export const Scale: React.FC<ScaleProps> = ({
  children,
  isVisible,
  scale = 0.8,
  duration = 'medium',
  easing = 'bounce',
  className,
  style,
}) => {
  const { shouldAnimate, getTransition } = useAnimation(true, { duration, easing });
  
  const animationStyles: React.CSSProperties = {
    transform: shouldAnimate ? (isVisible ? 'scale(1)' : `scale(${scale})`) : 'scale(1)',
    opacity: shouldAnimate ? (isVisible ? 1 : 0) : 1,
    transition: shouldAnimate ? getTransition(['transform', 'opacity']) : 'none',
    ...style,
  };
  
  return (
    <div className={className} style={animationStyles}>
      {children}
    </div>
  );
};

// Stagger animation container
export interface StaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: keyof typeof animationConfig.durations;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

export const Stagger: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 75,
  duration = 'medium',
  direction = 'up',
  className,
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { elementRef, isVisible: scrollVisible } = useIntersectionAnimation({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  useEffect(() => {
    if (scrollVisible) {
      setIsVisible(true);
    }
  }, [scrollVisible]);
  
  return (
    <div ref={elementRef} className={className} style={style}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          direction={direction}
          duration={duration}
          delay={index * staggerDelay as any} // Type assertion for delay calculation
          triggerOnMount={false}
          triggerOnScroll={false}
          style={{ animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms' }}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
};

// Loading spinner with animations
export interface SpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
  speed?: keyof typeof animationConfig.durations;
  className?: string;
  style?: React.CSSProperties;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  color = 'currentColor',
  thickness = 2,
  speed = 'extended',
  className,
  style,
}) => {
  const { shouldAnimate, getDuration } = useAnimation();
  
  const spinnerStyles: React.CSSProperties = {
    width: size,
    height: size,
    border: `${thickness}px solid transparent`,
    borderTop: `${thickness}px solid ${color}`,
    borderRadius: '50%',
    animation: shouldAnimate ? `spin ${getDuration()}ms linear infinite` : 'none',
    ...style,
  };
  
  // Inject keyframes if animations are enabled
  useEffect(() => {
    if (shouldAnimate) {
      const styleSheet = document.styleSheets[0];
      const keyframes = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      
      try {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      } catch (e) {
        // Rule might already exist
      }
    }
  }, [shouldAnimate]);
  
  return <div className={className} style={spinnerStyles} />;
};

// Pulse animation component
export interface PulseProps {
  children: React.ReactNode;
  scale?: number;
  duration?: keyof typeof animationConfig.durations;
  infinite?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Pulse: React.FC<PulseProps> = ({
  children,
  scale = 1.05,
  duration = 'extended',
  infinite = false,
  className,
  style,
}) => {
  const { shouldAnimate, getDuration } = useAnimation();
  const [isAnimating, setIsAnimating] = useState(infinite);
  
  const animationStyles: React.CSSProperties = {
    animation: shouldAnimate && isAnimating 
      ? `pulse ${getDuration()}ms ease-in-out ${infinite ? 'infinite' : '1'}`
      : 'none',
    ...style,
  };
  
  // Inject pulse keyframes
  useEffect(() => {
    if (shouldAnimate) {
      const styleSheet = document.styleSheets[0];
      const keyframes = `
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(${scale}); }
        }
      `;
      
      try {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      } catch (e) {
        // Rule might already exist
      }
    }
  }, [shouldAnimate, scale]);
  
  const handleMouseEnter = () => {
    if (!infinite) setIsAnimating(true);
  };
  
  const handleAnimationEnd = () => {
    if (!infinite) setIsAnimating(false);
  };
  
  return (
    <div
      className={className}
      style={animationStyles}
      onMouseEnter={handleMouseEnter}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

// Hover lift effect
export interface HoverLiftProps {
  children: React.ReactNode;
  lift?: string;
  duration?: keyof typeof animationConfig.durations;
  easing?: keyof typeof animationConfig.easings;
  shadow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const HoverLift: React.FC<HoverLiftProps> = ({
  children,
  lift = '0.25rem',
  duration = 'short',
  easing = 'smooth',
  shadow = true,
  className,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { shouldAnimate, getTransition } = useAnimation(true, { duration, easing });
  
  const animationStyles: React.CSSProperties = {
    transform: shouldAnimate && isHovered ? `translateY(-${lift})` : 'translateY(0)',
    boxShadow: shouldAnimate && shadow && isHovered 
      ? '0 10px 25px rgba(0, 0, 0, 0.15)' 
      : shadow ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
    transition: shouldAnimate ? getTransition(['transform', 'box-shadow']) : 'none',
    cursor: 'pointer',
    ...style,
  };
  
  return (
    <div
      className={className}
      style={animationStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

// Animation presets for common patterns
export const animationPresets = {
  // Button interactions
  buttonPress: {
    transform: 'scale(0.98)',
    transition: createTransition('transform', 'micro', 'sharp'),
  },
  
  buttonHover: {
    transform: 'scale(1.02)',
    transition: createTransition('transform', 'short', 'smooth'),
  },
  
  // Card interactions
  cardHover: {
    transform: 'translateY(-0.25rem)',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    transition: createTransition(['transform', 'box-shadow'], 'medium', 'smooth'),
  },
  
  // Modal animations
  modalBackdrop: {
    opacity: 1,
    transition: createTransition('opacity', 'medium', 'smooth'),
  },
  
  modalContent: {
    transform: 'scale(1)',
    opacity: 1,
    transition: createTransition(['transform', 'opacity'], 'medium', 'bounce'),
  },
  
  // Loading states
  skeleton: {
    animation: `pulse ${animationConfig.durations.extended}ms ease-in-out infinite`,
  },
  
  // Page transitions
  pageEnter: {
    transform: 'translateX(0)',
    opacity: 1,
    transition: createTransition(['transform', 'opacity'], 'long', 'smooth'),
  },
  
  pageExit: {
    transform: 'translateX(-100%)',
    opacity: 0,
    transition: createTransition(['transform', 'opacity'], 'long', 'smooth'),
  },
} as const;

// CSS custom properties for animations
export const animationCSS = {
  // Duration variables
  '--animation-duration-instant': `${animationConfig.durations.instant}ms`,
  '--animation-duration-micro': `${animationConfig.durations.micro}ms`,
  '--animation-duration-short': `${animationConfig.durations.short}ms`,
  '--animation-duration-medium': `${animationConfig.durations.medium}ms`,
  '--animation-duration-long': `${animationConfig.durations.long}ms`,
  '--animation-duration-extended': `${animationConfig.durations.extended}ms`,
  
  // Easing variables
  '--animation-easing-linear': animationConfig.easings.linear,
  '--animation-easing-ease': animationConfig.easings.ease,
  '--animation-easing-ease-in': animationConfig.easings.easeIn,
  '--animation-easing-ease-out': animationConfig.easings.easeOut,
  '--animation-easing-ease-in-out': animationConfig.easings.easeInOut,
  '--animation-easing-bounce': animationConfig.easings.bounce,
  '--animation-easing-elastic': animationConfig.easings.elastic,
  '--animation-easing-sharp': animationConfig.easings.sharp,
  '--animation-easing-smooth': animationConfig.easings.smooth,
  '--animation-easing-emphasized': animationConfig.easings.emphasized,
  '--animation-easing-decelerated': animationConfig.easings.decelerated,
  '--animation-easing-accelerated': animationConfig.easings.accelerated,
  
  // Delay variables
  '--animation-delay-none': `${animationConfig.delays.none}ms`,
  '--animation-delay-short': `${animationConfig.delays.short}ms`,
  '--animation-delay-medium': `${animationConfig.delays.medium}ms`,
  '--animation-delay-long': `${animationConfig.delays.long}ms`,
  '--animation-delay-stagger': `${animationConfig.delays.stagger}ms`,
} as const;

// Animation performance utilities
export const optimizeForPerformance = (element: HTMLElement) => {
  // Add will-change property for better performance
  element.style.willChange = 'transform, opacity';
  
  // Force hardware acceleration
  element.style.transform = 'translateZ(0)';
  
  // Clean up after animation
  const cleanup = () => {
    element.style.willChange = 'auto';
    element.style.transform = '';
  };
  
  return cleanup;
};

// Export complete animation system
export const AnimationSystem = {
  // Core configuration
  config: animationConfig,
  
  // Utilities
  createTransition,
  createKeyframes,
  animationPresets,
  animationCSS,
  optimizeForPerformance,
  
  // Hooks
  useReducedMotion,
  useAnimation,
  useIntersectionAnimation,
  
  // Components
  FadeIn,
  SlideTransition,
  Scale,
  Stagger,
  Spinner,
  Pulse,
  HoverLift,
  
  // Version info
  version: '1.0.0',
};

export default AnimationSystem;