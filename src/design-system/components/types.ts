/**
 * Component Library Type Definitions
 * 
 * Comprehensive TypeScript definitions for bulletproof component API design.
 * Management change-proof through strict typing and proper interface segregation.
 */

import React from 'react';

// Base component patterns
export interface BaseComponentProps {
  /**
   * Additional CSS class names to apply to the component.
   * Should be used sparingly - prefer variant/size props for styling.
   */
  className?: string;
  
  /**
   * Test identifier for automated testing.
   * Should be descriptive and unique within the component tree.
   */
  'data-testid'?: string;
  
  /**
   * Child components or content to render.
   */
  children?: React.ReactNode;
  
  /**
   * Unique identifier for the component.
   * Useful for form controls and accessibility.
   */
  id?: string;
}

// Themeable component interface
export interface ThemeableProps {
  /**
   * Visual variant of the component.
   * Maps to design system color tokens for consistent theming.
   */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
  
  /**
   * Size variant of the component.
   * Maps to design system spacing and typography tokens.
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the component is disabled.
   * Affects both visual appearance and interaction behavior.
   */
  disabled?: boolean;
}

// Layout and spacing props
export interface LayoutProps {
  /**
   * External margin using design system spacing tokens.
   * Use semantic tokens (xs, sm, md, lg, xl) instead of raw values.
   */
  margin?: string;
  
  /**
   * Internal padding using design system spacing tokens.
   * Use semantic tokens (xs, sm, md, lg, xl) instead of raw values.
   */
  padding?: string;
  
  /**
   * CSS display property.
   * Common values for component layout control.
   */
  display?: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  
  /**
   * Whether the component should take full width of its container.
   */
  fullWidth?: boolean;
}

// Interactive component interface
export interface InteractiveProps {
  /**
   * Whether the component should show hover effects.
   * Useful for cards, list items, and other clickable elements.
   */
  hoverable?: boolean;
  
  /**
   * Whether the component is in a loading state.
   * Should disable interactions and show loading indicators.
   */
  loading?: boolean;
  
  /**
   * Accessibility label for screen readers.
   * Required for interactive components without text content.
   */
  'aria-label'?: string;
  
  /**
   * Describes the current element to assistive technologies.
   */
  'aria-describedby'?: string;
  
  /**
   * Indicates if the element has invalid input.
   */
  'aria-invalid'?: boolean;
}

// Form component interfaces
export interface FormComponentProps extends BaseComponentProps, InteractiveProps {
  /**
   * The name attribute for form submission.
   */
  name?: string;
  
  /**
   * Whether the field is required for form submission.
   */
  required?: boolean;
  
  /**
   * Whether the field has a validation error.
   */
  error?: boolean;
  
  /**
   * Error message to display when field has validation error.
   */
  errorMessage?: string;
  
  /**
   * Helper text to guide user input.
   */
  helperText?: string;
  
  /**
   * Field label for accessibility and UX.
   */
  label?: string;
}

// Button component types
export interface ButtonProps extends BaseComponentProps, ThemeableProps, InteractiveProps {
  /**
   * Click event handler.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * HTML button type attribute.
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Icon to display alongside button text.
   */
  icon?: React.ReactNode;
  
  /**
   * Position of the icon relative to button text.
   */
  iconPosition?: 'left' | 'right';
  
  /**
   * Whether button should span full width of container.
   */
  fullWidth?: boolean;
  
  /**
   * Button style variant for different use cases.
   */
  styleVariant?: 'filled' | 'outlined' | 'text' | 'ghost';
}

// Input component types
export interface InputProps extends FormComponentProps, ThemeableProps {
  /**
   * HTML input type.
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'date' | 'time';
  
  /**
   * Controlled component value.
   */
  value?: string;
  
  /**
   * Uncontrolled component default value.
   */
  defaultValue?: string;
  
  /**
   * Placeholder text when input is empty.
   */
  placeholder?: string;
  
  /**
   * Maximum number of characters allowed.
   */
  maxLength?: number;
  
  /**
   * Minimum number of characters required.
   */
  minLength?: number;
  
  /**
   * Regular expression pattern for validation.
   */
  pattern?: string;
  
  /**
   * Whether the input should automatically get focus.
   */
  autoFocus?: boolean;
  
  /**
   * Whether the input should have autocomplete.
   */
  autoComplete?: string;
  
  /**
   * Whether the input is read-only.
   */
  readOnly?: boolean;
  
  /**
   * Change event handler.
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  
  /**
   * Focus event handler.
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Blur event handler.
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  
  /**
   * Key press event handler.
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  
  /**
   * Icon to display at the start of the input.
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon to display at the end of the input.
   */
  endIcon?: React.ReactNode;
}

// Card component types
export interface CardProps extends BaseComponentProps, LayoutProps, InteractiveProps {
  /**
   * Visual style variant of the card.
   */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  
  /**
   * Internal padding size for card content.
   */
  paddingSize?: 'none' | 'sm' | 'md' | 'lg';
  
  /**
   * Header content to display at top of card.
   */
  header?: React.ReactNode;
  
  /**
   * Footer content to display at bottom of card.
   */
  footer?: React.ReactNode;
  
  /**
   * Click event handler for entire card.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Whether the card should have rounded corners.
   */
  rounded?: boolean;
  
  /**
   * Whether the card should have a border.
   */
  bordered?: boolean;
}

// Select/Dropdown component types
export interface SelectProps extends FormComponentProps, ThemeableProps {
  /**
   * Available options for selection.
   */
  options: SelectOption[];
  
  /**
   * Currently selected value(s).
   */
  value?: string | string[];
  
  /**
   * Default selected value(s) for uncontrolled component.
   */
  defaultValue?: string | string[];
  
  /**
   * Placeholder text when no option is selected.
   */
  placeholder?: string;
  
  /**
   * Whether multiple options can be selected.
   */
  multiple?: boolean;
  
  /**
   * Whether the dropdown is searchable.
   */
  searchable?: boolean;
  
  /**
   * Whether the dropdown is clearable.
   */
  clearable?: boolean;
  
  /**
   * Selection change event handler.
   */
  onChange?: (value: string | string[]) => void;
  
  /**
   * Search query change event handler.
   */
  onSearch?: (query: string) => void;
}

export interface SelectOption {
  /**
   * Unique value for the option.
   */
  value: string;
  
  /**
   * Display label for the option.
   */
  label: string;
  
  /**
   * Whether the option is disabled.
   */
  disabled?: boolean;
  
  /**
   * Optional icon to display with the option.
   */
  icon?: React.ReactNode;
  
  /**
   * Optional description text for the option.
   */
  description?: string;
}

// Modal/Dialog component types
export interface ModalProps extends BaseComponentProps {
  /**
   * Whether the modal is open/visible.
   */
  open: boolean;
  
  /**
   * Function to call when modal should be closed.
   */
  onClose: () => void;
  
  /**
   * Modal title for accessibility and UX.
   */
  title?: string;
  
  /**
   * Modal size variant.
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  /**
   * Whether clicking the backdrop should close the modal.
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Whether pressing Escape should close the modal.
   */
  closeOnEscape?: boolean;
  
  /**
   * Whether the modal should have a backdrop overlay.
   */
  hasBackdrop?: boolean;
  
  /**
   * Whether the modal should trap focus within it.
   */
  trapFocus?: boolean;
  
  /**
   * Modal header content.
   */
  header?: React.ReactNode;
  
  /**
   * Modal footer content.
   */
  footer?: React.ReactNode;
}

// Toast/Notification component types
export interface ToastProps extends BaseComponentProps, ThemeableProps {
  /**
   * Toast message content.
   */
  message: string;
  
  /**
   * Optional toast title.
   */
  title?: string;
  
  /**
   * How long the toast should be visible (in milliseconds).
   */
  duration?: number;
  
  /**
   * Whether the toast can be manually dismissed.
   */
  dismissible?: boolean;
  
  /**
   * Function to call when toast is dismissed.
   */
  onDismiss?: () => void;
  
  /**
   * Toast position on screen.
   */
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  
  /**
   * Optional action button for the toast.
   */
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Table component types
export interface TableProps extends BaseComponentProps {
  /**
   * Table column definitions.
   */
  columns: TableColumn[];
  
  /**
   * Table row data.
   */
  data: Record<string, any>[];
  
  /**
   * Whether the table should have striped rows.
   */
  striped?: boolean;
  
  /**
   * Whether the table should have hover effects on rows.
   */
  hoverable?: boolean;
  
  /**
   * Whether the table should have borders.
   */
  bordered?: boolean;
  
  /**
   * Whether the table should be responsive.
   */
  responsive?: boolean;
  
  /**
   * Loading state for the table.
   */
  loading?: boolean;
  
  /**
   * Empty state content when no data.
   */
  emptyState?: React.ReactNode;
  
  /**
   * Row selection configuration.
   */
  selection?: TableSelectionConfig;
  
  /**
   * Sorting configuration.
   */
  sorting?: TableSortingConfig;
  
  /**
   * Pagination configuration.
   */
  pagination?: TablePaginationConfig;
}

export interface TableColumn {
  /**
   * Unique key for the column.
   */
  key: string;
  
  /**
   * Display header for the column.
   */
  title: string;
  
  /**
   * Data key to extract value from row object.
   */
  dataKey?: string;
  
  /**
   * Custom render function for cell content.
   */
  render?: (value: any, row: Record<string, any>, index: number) => React.ReactNode;
  
  /**
   * Column width.
   */
  width?: string | number;
  
  /**
   * Whether the column is sortable.
   */
  sortable?: boolean;
  
  /**
   * Column alignment.
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Whether the column is fixed during horizontal scroll.
   */
  fixed?: 'left' | 'right';
}

export interface TableSelectionConfig {
  /**
   * Selection type.
   */
  type: 'single' | 'multiple';
  
  /**
   * Currently selected row keys.
   */
  selectedRowKeys: string[];
  
  /**
   * Function to call when selection changes.
   */
  onChange: (selectedRowKeys: string[], selectedRows: Record<string, any>[]) => void;
  
  /**
   * Function to determine if a row can be selected.
   */
  getCheckboxProps?: (row: Record<string, any>) => { disabled?: boolean };
}

export interface TableSortingConfig {
  /**
   * Currently sorted column key.
   */
  sortedColumn?: string;
  
  /**
   * Current sort direction.
   */
  sortDirection?: 'asc' | 'desc';
  
  /**
   * Function to call when sorting changes.
   */
  onChange: (column: string, direction: 'asc' | 'desc') => void;
}

export interface TablePaginationConfig {
  /**
   * Current page number (1-based).
   */
  current: number;
  
  /**
   * Number of items per page.
   */
  pageSize: number;
  
  /**
   * Total number of items.
   */
  total: number;
  
  /**
   * Whether to show page size selector.
   */
  showSizeChanger?: boolean;
  
  /**
   * Available page sizes.
   */
  pageSizeOptions?: number[];
  
  /**
   * Function to call when pagination changes.
   */
  onChange: (page: number, pageSize: number) => void;
}

// Utility types for component composition
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';
export type ComponentState = 'default' | 'hover' | 'active' | 'disabled' | 'loading';

// Ref types for component forwarding
export type ButtonRef = HTMLButtonElement;
export type InputRef = HTMLInputElement;
export type CardRef = HTMLDivElement;
export type SelectRef = HTMLSelectElement;
export type ModalRef = HTMLDivElement;

// Component factory types
export interface StyledComponentConfig {
  /**
   * Base component to wrap.
   */
  baseComponent: React.ComponentType<any>;
  
  /**
   * Default styles to apply.
   */
  defaultStyles: React.CSSProperties;
  
  /**
   * Theme variant to style mappings.
   */
  themeMapping?: Record<string, string>;
  
  /**
   * Size variant to style mappings.
   */
  sizeMapping?: Record<string, React.CSSProperties>;
  
  /**
   * Custom class name generator.
   */
  classNameGenerator?: (props: any) => string;
}

// Design system integration types
export interface DesignSystemTokens {
  /**
   * Color palette tokens.
   */
  colors: Record<string, string>;
  
  /**
   * Typography tokens.
   */
  typography: Record<string, any>;
  
  /**
   * Spacing tokens.
   */
  spacing: Record<string, string>;
  
  /**
   * Component-specific tokens.
   */
  components: Record<string, any>;
  
  /**
   * Semantic tokens.
   */
  semantic: Record<string, any>;
}

export interface ThemeConfig {
  /**
   * Theme name/identifier.
   */
  name: string;
  
  /**
   * Design tokens for this theme.
   */
  tokens: DesignSystemTokens;
  
  /**
   * CSS custom properties mapping.
   */
  cssProperties: Record<string, string>;
  
  /**
   * Component overrides for this theme.
   */
  componentOverrides?: Record<string, React.CSSProperties>;
}

// Component library configuration
export interface ComponentLibraryConfig {
  /**
   * Available themes.
   */
  themes: ThemeConfig[];
  
  /**
   * Default theme name.
   */
  defaultTheme: string;
  
  /**
   * Global component defaults.
   */
  componentDefaults: Record<string, any>;
  
  /**
   * Custom component registry.
   */
  customComponents?: Record<string, React.ComponentType<any>>;
  
  /**
   * Library version.
   */
  version: string;
}