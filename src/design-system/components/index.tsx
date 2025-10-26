/**
 * Component Library Architecture
 * 
 * Bulletproof, scalable component system with proper API design,
 * props strategy, and theme integration. Built for management 
 * change-proof flexibility.
 */

import React from 'react';
import { tokenCSS } from '../design-tokens';

// Component API design patterns
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
}

export interface ThemeableProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
}

export interface LayoutProps {
  margin?: string;
  padding?: string;
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
}

// Component composition utilities
export const createStyledComponent = (
  baseComponent: React.ComponentType<any>,
  defaultStyles: React.CSSProperties,
  themeMapping?: Record<string, string>
) => {
  return React.forwardRef<any, any>((props, ref) => {
    const { className, style, variant, size, ...restProps } = props;
    
    const computedStyles = {
      ...defaultStyles,
      ...style
    };
    
    // Apply theme-based styling
    if (variant && themeMapping?.[variant]) {
      computedStyles.background = themeMapping[variant];
    }
    
    const computedClassName = [
      'design-system-component',
      variant && `variant-${variant}`,
      size && `size-${size}`,
      className
    ].filter(Boolean).join(' ');
    
    return React.createElement(baseComponent, {
      ...restProps,
      ref,
      className: computedClassName,
      style: computedStyles
    });
  });
};

// Button Component - Primary building block
export interface ButtonProps extends BaseComponentProps, ThemeableProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      children,
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      type = 'button',
      onClick,
      'data-testid': testId,
      ...restProps
    } = props;
    
    const baseStyles: React.CSSProperties = {
      // Use design tokens for bulletproof theming
      background: tokenCSS.component.button.primary.background,
      color: tokenCSS.component.button.primary.text,
      border: `${tokenCSS.component.button.borderWidth} solid ${tokenCSS.component.button.primary.border}`,
      borderRadius: tokenCSS.component.button.borderRadius,
      padding: `${tokenCSS.component.button.paddingY} ${tokenCSS.component.button.paddingX}`,
      fontSize: tokenCSS.component.button.fontSize,
      fontWeight: tokenCSS.typography.body.fontWeight.medium,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokenCSS.semantic.spacing.xs,
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
      outline: 'none',
      textDecoration: 'none',
      userSelect: 'none'
    };
    
    // Variant-specific styles
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: tokenCSS.component.button.primary.background,
        color: tokenCSS.component.button.primary.text,
        borderColor: tokenCSS.component.button.primary.border
      },
      secondary: {
        background: tokenCSS.component.button.secondary.background,
        color: tokenCSS.component.button.secondary.text,
        borderColor: tokenCSS.component.button.secondary.border
      },
      danger: {
        background: tokenCSS.semantic.color.error,
        color: tokenCSS.color.white,
        borderColor: tokenCSS.semantic.color.error
      },
      success: {
        background: tokenCSS.semantic.color.success,
        color: tokenCSS.color.white,
        borderColor: tokenCSS.semantic.color.success
      },
      warning: {
        background: tokenCSS.semantic.color.warning,
        color: tokenCSS.color.gray900,
        borderColor: tokenCSS.semantic.color.warning
      },
      info: {
        background: tokenCSS.semantic.color.info,
        color: tokenCSS.color.white,
        borderColor: tokenCSS.semantic.color.info
      }
    };
    
    // Size-specific styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      xs: {
        padding: `${tokenCSS.semantic.spacing.xs} ${tokenCSS.semantic.spacing.sm}`,
        fontSize: tokenCSS.typography.body.small.fontSize
      },
      sm: {
        padding: `${tokenCSS.semantic.spacing.sm} ${tokenCSS.semantic.spacing.md}`,
        fontSize: tokenCSS.typography.body.small.fontSize
      },
      md: {
        padding: `${tokenCSS.component.button.paddingY} ${tokenCSS.component.button.paddingX}`,
        fontSize: tokenCSS.component.button.fontSize
      },
      lg: {
        padding: `${tokenCSS.semantic.spacing.md} ${tokenCSS.semantic.spacing.lg}`,
        fontSize: tokenCSS.typography.body.large.fontSize
      },
      xl: {
        padding: `${tokenCSS.semantic.spacing.lg} ${tokenCSS.semantic.spacing.xl}`,
        fontSize: tokenCSS.typography.heading.h3.fontSize
      }
    };
    
    const finalStyles = {
      ...baseStyles,
      ...variantStyles[variant],
      ...sizeStyles[size]
    };
    
    const computedClassName = [
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      fullWidth && 'btn-full-width',
      loading && 'btn-loading',
      disabled && 'btn-disabled',
      className
    ].filter(Boolean).join(' ');
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };
    
    return (
      <button
        {...restProps}
        ref={ref}
        type={type}
        className={computedClassName}
        style={finalStyles}
        onClick={handleClick}
        disabled={disabled || loading}
        data-testid={testId}
        aria-disabled={disabled || loading}
        aria-busy={loading}
      >
        {loading && (
          <span className="btn-spinner" aria-hidden="true">
            ⟳
          </span>
        )}
        {icon && iconPosition === 'left' && (
          <span className="btn-icon btn-icon-left" aria-hidden="true">
            {icon}
          </span>
        )}
        {children && <span className="btn-content">{children}</span>}
        {icon && iconPosition === 'right' && (
          <span className="btn-icon btn-icon-right" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Card Component - Layout building block
export interface CardProps extends BaseComponentProps, LayoutProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (props, ref) => {
    const {
      children,
      className,
      variant = 'default',
      padding = 'md',
      header,
      footer,
      onClick,
      hoverable = false,
      'data-testid': testId,
      ...restProps
    } = props;
    
    const baseStyles: React.CSSProperties = {
      background: tokenCSS.component.card.background,
      borderRadius: tokenCSS.component.card.borderRadius,
      overflow: 'hidden',
      transition: 'all 0.2s ease',
      cursor: onClick || hoverable ? 'pointer' : 'default'
    };
    
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        border: `${tokenCSS.component.card.borderWidth} solid ${tokenCSS.component.card.borderColor}`,
        boxShadow: tokenCSS.component.card.shadow
      },
      elevated: {
        border: 'none',
        boxShadow: tokenCSS.component.card.shadowElevated
      },
      outlined: {
        border: `2px solid ${tokenCSS.component.card.borderColor}`,
        boxShadow: 'none'
      },
      filled: {
        border: 'none',
        boxShadow: 'none',
        background: tokenCSS.semantic.color.backgroundSecondary
      }
    };
    
    const paddingStyles: Record<string, string> = {
      none: '0',
      sm: tokenCSS.semantic.spacing.sm,
      md: tokenCSS.component.card.contentPadding,
      lg: tokenCSS.semantic.spacing.lg
    };
    
    const finalStyles = {
      ...baseStyles,
      ...variantStyles[variant]
    };
    
    const computedClassName = [
      'card',
      `card-${variant}`,
      `card-padding-${padding}`,
      (onClick || hoverable) && 'card-interactive',
      className
    ].filter(Boolean).join(' ');
    
    return (
      <div
        {...restProps}
        ref={ref}
        className={computedClassName}
        style={finalStyles}
        onClick={onClick}
        data-testid={testId}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        {header && (
          <div
            className="card-header"
            style={{
              background: tokenCSS.component.card.headerBackground,
              color: tokenCSS.component.card.headerText,
              padding: tokenCSS.component.card.headerPadding,
              borderBottom: `1px solid ${tokenCSS.component.card.borderColor}`,
              fontWeight: tokenCSS.typography.heading.fontWeight
            }}
          >
            {header}
          </div>
        )}
        {children && (
          <div
            className="card-content"
            style={{
              padding: paddingStyles[padding],
              color: tokenCSS.component.card.contentText
            }}
          >
            {children}
          </div>
        )}
        {footer && (
          <div
            className="card-footer"
            style={{
              background: tokenCSS.component.card.headerBackground,
              padding: tokenCSS.component.card.headerPadding,
              borderTop: `1px solid ${tokenCSS.component.card.borderColor}`
            }}
          >
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Input Component - Form building block
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    const {
      className,
      type = 'text',
      value,
      defaultValue,
      placeholder,
      disabled = false,
      required = false,
      error = false,
      errorMessage,
      helperText,
      label,
      size = 'md',
      fullWidth = false,
      onChange,
      onFocus,
      onBlur,
      startIcon,
      endIcon,
      'data-testid': testId,
      ...restProps
    } = props;
    
    const inputId = React.useId();
    const errorId = React.useId();
    const helperTextId = React.useId();
    
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokenCSS.semantic.spacing.xs,
      width: fullWidth ? '100%' : 'auto'
    };
    
    const inputWrapperStyles: React.CSSProperties = {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    };
    
    const baseInputStyles: React.CSSProperties = {
      width: '100%',
      padding: tokenCSS.component.input.padding,
      border: `${tokenCSS.component.input.borderWidth} solid ${
        error ? tokenCSS.semantic.color.error : tokenCSS.component.input.borderColor
      }`,
      borderRadius: tokenCSS.component.input.borderRadius,
      background: disabled 
        ? tokenCSS.semantic.color.backgroundDisabled 
        : tokenCSS.component.input.background,
      color: disabled 
        ? tokenCSS.semantic.color.textDisabled 
        : tokenCSS.component.input.text,
      fontSize: tokenCSS.component.input.fontSize,
      fontFamily: tokenCSS.typography.body.fontFamily,
      outline: 'none',
      transition: 'all 0.2s ease',
      cursor: disabled ? 'not-allowed' : 'text'
    };
    
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: {
        padding: `${tokenCSS.semantic.spacing.xs} ${tokenCSS.semantic.spacing.sm}`,
        fontSize: tokenCSS.typography.body.small.fontSize
      },
      md: {
        padding: tokenCSS.component.input.padding,
        fontSize: tokenCSS.component.input.fontSize
      },
      lg: {
        padding: `${tokenCSS.semantic.spacing.md} ${tokenCSS.semantic.spacing.lg}`,
        fontSize: tokenCSS.typography.body.large.fontSize
      }
    };
    
    const finalInputStyles = {
      ...baseInputStyles,
      ...sizeStyles[size],
      paddingLeft: startIcon 
        ? `calc(${sizeStyles[size].padding?.toString().split(' ')[1] || tokenCSS.semantic.spacing.md} + 32px)` 
        : sizeStyles[size].padding?.toString().split(' ')[1],
      paddingRight: endIcon 
        ? `calc(${sizeStyles[size].padding?.toString().split(' ')[1] || tokenCSS.semantic.spacing.md} + 32px)` 
        : sizeStyles[size].padding?.toString().split(' ')[1]
    };
    
    const computedClassName = [
      'input',
      `input-${size}`,
      error && 'input-error',
      disabled && 'input-disabled',
      fullWidth && 'input-full-width',
      className
    ].filter(Boolean).join(' ');
    
    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
      color: disabled 
        ? tokenCSS.semantic.color.textDisabled 
        : tokenCSS.semantic.color.textSecondary,
      width: '16px',
      height: '16px'
    };
    
    return (
      <div style={containerStyles} className="input-container">
        {label && (
          <label
            htmlFor={inputId}
            style={{
              color: disabled 
                ? tokenCSS.semantic.color.textDisabled 
                : tokenCSS.semantic.color.textPrimary,
              fontSize: tokenCSS.typography.body.fontSize,
              fontWeight: tokenCSS.typography.body.fontWeight.medium,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            className="input-label"
          >
            {label}
            {required && (
              <span
                style={{ color: tokenCSS.semantic.color.error, marginLeft: '2px' }}
                aria-label="required"
              >
                *
              </span>
            )}
          </label>
        )}
        
        <div style={inputWrapperStyles} className="input-wrapper">
          {startIcon && (
            <span
              style={{ ...iconStyles, left: sizeStyles[size].padding?.toString().split(' ')[1] }}
              className="input-icon input-icon-start"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}
          
          <input
            {...restProps}
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={computedClassName}
            style={finalInputStyles}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            data-testid={testId}
            aria-invalid={error}
            aria-describedby={[
              error && errorMessage ? errorId : '',
              helperText ? helperTextId : ''
            ].filter(Boolean).join(' ') || undefined}
          />
          
          {endIcon && (
            <span
              style={{ ...iconStyles, right: sizeStyles[size].padding?.toString().split(' ')[1] }}
              className="input-icon input-icon-end"
              aria-hidden="true"
            >
              {endIcon}
            </span>
          )}
        </div>
        
        {error && errorMessage && (
          <span
            id={errorId}
            style={{
              color: tokenCSS.semantic.color.error,
              fontSize: tokenCSS.typography.body.small.fontSize
            }}
            className="input-error-message"
            role="alert"
          >
            {errorMessage}
          </span>
        )}
        
        {helperText && !error && (
          <span
            id={helperTextId}
            style={{
              color: tokenCSS.semantic.color.textSecondary,
              fontSize: tokenCSS.typography.body.small.fontSize
            }}
            className="input-helper-text"
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Export Writer theme components
export { Button as WriterButton } from './Button';
export { Card as WriterCard } from './Card';
export { Input as WriterInput } from './Input';
export { BottomSheet } from './BottomSheet';
export { CategoryPicker } from './CategoryPicker';
export { AddCardButton } from './AddCardButton';
export { OverlayMenu } from './OverlayMenu';
export type { MenuItem } from './OverlayMenu';
export { CardItem } from './CardItem';
export type { CardItemProps } from './CardItem';
export { Toast } from './Toast';
export type { ToastProps } from './Toast';
export { SwipeableCardItem } from './SwipeableCardItem';
export type { SwipeableCardItemProps } from './SwipeableCardItem';

// Component composition helpers
export const ComponentLibrary = {
  Button,
  Card,
  Input,

  // Utility functions
  createStyledComponent,

  // Design system integration
  tokens: tokenCSS,

  // Version info
  version: '1.0.0'
};

export default ComponentLibrary;