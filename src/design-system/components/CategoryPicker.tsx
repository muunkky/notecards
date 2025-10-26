/**
 * CategoryPicker Component - Writer Theme
 *
 * Mobile-native bottom sheet selector for choosing card categories.
 * Displays all 6 categories with color previews and descriptions.
 *
 * Features:
 * - Uses BottomSheet component for mobile-native feel
 * - 4px colored strip on each option (matches Card decorator)
 * - Category label and description
 * - Selected state indicator (checkmark)
 * - Zero animations (instant state changes)
 * - Sharp edges (brutalist aesthetic)
 * - Tap to select category
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * Philosophy: "Zero animations. Instant state changes. 0ms transitions."
 */

import * as React from 'react';
import { BottomSheet } from './BottomSheet';
import { CATEGORIES, CategoryValue, getCategoryColor } from '../../domain/categories';

export interface CategoryPickerProps {
  /** Controls whether the category picker is visible */
  isOpen: boolean;

  /** Called when the picker should be closed */
  onClose: () => void;

  /** Currently selected category (will be highlighted) */
  selectedCategory?: CategoryValue;

  /** Called when a category is selected */
  onSelectCategory: (category: CategoryValue) => void;

  /** Optional test ID for testing */
  testId?: string;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  testId = 'category-picker',
}) => {
  // Handle category selection
  const handleSelectCategory = (category: CategoryValue) => {
    onSelectCategory(category);
    onClose();
  };

  // Category option container styles
  const categoryOptionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--semantic-spacing-md)', // 16px
    cursor: 'pointer',
    borderBottom: '1px solid var(--primitive-gray-200)',
    transition: 'var(--primitive-transitions-none)', // 0ms
    position: 'relative',
  };

  // Color strip (4px decorator on left)
  const colorStripStyles = (color: string): React.CSSProperties => ({
    width: '4px',
    height: '100%',
    background: color,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  });

  // Category content area (label + description)
  const categoryContentStyles: React.CSSProperties = {
    marginLeft: '16px', // Space for color strip + padding
    flex: 1,
  };

  // Category label styles
  const categoryLabelStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-md)', // 16px
    fontWeight: 600,
    color: 'var(--primitive-black)',
    marginBottom: '4px',
  };

  // Category description styles
  const categoryDescriptionStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
    color: 'var(--primitive-gray-600)',
    lineHeight: 1.4,
  };

  // Selected indicator (checkmark on right)
  const selectedIndicatorStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: 'var(--primitive-black)',
    marginLeft: 'var(--semantic-spacing-md)', // 16px
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Select Category"
      testId={testId}
    >
      {/* Inject hover styles */}
      <style>{`
        .category-option:hover {
          background: var(--primitive-gray-50) !important;
        }
        .category-option:active {
          background: var(--primitive-gray-100) !important;
        }
      `}</style>

      {/* Category options list */}
      <div style={{ margin: 'calc(-1 * var(--semantic-spacing-md))' }}>
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.value;

          return (
            <div
              key={category.value}
              className="category-option"
              style={categoryOptionStyles}
              onClick={() => handleSelectCategory(category.value)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelectCategory(category.value);
                }
              }}
              data-testid={`${testId}-option-${category.value}`}
              aria-selected={isSelected}
            >
              {/* Color strip (4px decorator) */}
              <div style={colorStripStyles(category.color)} />

              {/* Category content */}
              <div style={categoryContentStyles}>
                <div style={categoryLabelStyles}>{category.label}</div>
                <div style={categoryDescriptionStyles}>{category.description}</div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div style={selectedIndicatorStyles} aria-label="Selected">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </BottomSheet>
  );
};

CategoryPicker.displayName = 'CategoryPicker';

// NATIVE TODO: Add haptic feedback on category selection
// When category is tapped:
// import { Haptics } from '@capacitor/haptics';
// await Haptics.impact({ style: 'light' });

// NATIVE TODO: Add search/filter for large category lists
// When category count exceeds 10:
// - Add search input at top of bottom sheet
// - Filter categories by label/description as user types
// - Clear search button
// - "No results" empty state
