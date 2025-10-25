/**
 * Category System - Writer Theme
 *
 * Centralized category definitions for the Writer's Tool.
 * Categories provide color-coded visual organization via 4px decorator strips.
 *
 * Current Implementation: 6 categories
 * (Design Thesis defines 8, but starting with 6 for MVP)
 *
 * Design Philosophy (from WRITER-DESIGN-THESIS.md):
 * - Colors are categorical, not decorative
 * - Instant visual scanning ("show me all conflict scenes")
 * - Accessibility: colors + text labels for color-blind users
 * - Brutalist aesthetic: sharp, functional, no gradients
 */

/**
 * Category value type
 * The string literal type for category identifiers
 */
export type CategoryValue = 'conflict' | 'character' | 'location' | 'theme' | 'action' | 'dialogue';

/**
 * Category metadata
 * Full information about a category including display and styling
 */
export interface Category {
  /** Category identifier (used in data storage) */
  value: CategoryValue;

  /** Display label (shown in UI) */
  label: string;

  /** Hex color for decorator strip */
  color: string;

  /** Brief description of category purpose */
  description: string;
}

/**
 * All available categories
 *
 * Color choices:
 * - conflict: Rose red (#e11d48) - High tension, conflict scenes
 * - character: Blue (#3b82f6) - Character development, backstory
 * - location: Amber (#f59e0b) - Setting, place descriptions
 * - theme: Purple (#8b5cf6) - Thematic elements, motifs
 * - action: Orange (#f97316) - Physical action sequences
 * - dialogue: Pink (#ec4899) - Dialogue-heavy scenes
 *
 * Note: Design Thesis specifies slightly different colors for action/dialogue
 * and includes 2 additional categories (internal, transition). Current implementation
 * uses the colors below which are already deployed and tested.
 *
 * See: docs/WRITER-DESIGN-THESIS.md - "Challenge 1: Colored Index Cards"
 */
export const CATEGORIES: readonly Category[] = [
  {
    value: 'conflict',
    label: 'Conflict',
    color: '#e11d48',
    description: 'High tension, conflict scenes, dramatic confrontations',
  },
  {
    value: 'character',
    label: 'Character',
    color: '#3b82f6',
    description: 'Character development, backstory, emotional moments',
  },
  {
    value: 'location',
    label: 'Location',
    color: '#f59e0b',
    description: 'Setting descriptions, place establishment, world-building',
  },
  {
    value: 'theme',
    label: 'Theme',
    color: '#8b5cf6',
    description: 'Thematic elements, motifs, symbolic content',
  },
  {
    value: 'action',
    label: 'Action',
    color: '#f97316',
    description: 'Physical action sequences, chase scenes, fight choreography',
  },
  {
    value: 'dialogue',
    label: 'Dialogue',
    color: '#ec4899',
    description: 'Dialogue-heavy scenes, verbal sparring, conversation',
  },
] as const;

/**
 * Default category for new cards
 */
export const DEFAULT_CATEGORY: CategoryValue = 'conflict';

/**
 * Category lookup map (value -> Category)
 * Optimized for fast lookups by category value
 */
const CATEGORY_MAP: ReadonlyMap<CategoryValue, Category> = new Map(
  CATEGORIES.map((cat) => [cat.value, cat])
);

/**
 * Get category metadata by value
 *
 * @param value - Category identifier
 * @returns Category metadata or undefined if not found
 *
 * @example
 * const category = getCategoryByValue('conflict');
 * console.log(category.label); // "Conflict"
 * console.log(category.color); // "#e11d48"
 */
export function getCategoryByValue(value: CategoryValue): Category | undefined {
  return CATEGORY_MAP.get(value);
}

/**
 * Get category color by value
 *
 * @param value - Category identifier
 * @returns Hex color string or gray fallback if category not found
 *
 * @example
 * const color = getCategoryColor('conflict'); // "#e11d48"
 * const unknownColor = getCategoryColor('invalid' as CategoryValue); // "#a3a3a3"
 */
export function getCategoryColor(value: CategoryValue | undefined): string {
  if (!value) return '#a3a3a3'; // gray-400 fallback
  return CATEGORY_MAP.get(value)?.color ?? '#a3a3a3';
}

/**
 * Get category label by value
 *
 * @param value - Category identifier
 * @returns Display label or "Unknown" if category not found
 *
 * @example
 * const label = getCategoryLabel('character'); // "Character"
 */
export function getCategoryLabel(value: CategoryValue | undefined): string {
  if (!value) return 'Unknown';
  return CATEGORY_MAP.get(value)?.label ?? 'Unknown';
}

/**
 * Get category description by value
 *
 * @param value - Category identifier
 * @returns Description text or empty string if category not found
 */
export function getCategoryDescription(value: CategoryValue | undefined): string {
  if (!value) return '';
  return CATEGORY_MAP.get(value)?.description ?? '';
}

/**
 * Validate if a string is a valid category value
 *
 * @param value - String to validate
 * @returns True if value is a valid CategoryValue
 *
 * @example
 * isValidCategory('conflict'); // true
 * isValidCategory('invalid'); // false
 */
export function isValidCategory(value: string): value is CategoryValue {
  return CATEGORY_MAP.has(value as CategoryValue);
}

/**
 * Get all category values
 * Useful for validation or iteration
 *
 * @returns Array of all category value strings
 */
export function getAllCategoryValues(): CategoryValue[] {
  return CATEGORIES.map((cat) => cat.value);
}
