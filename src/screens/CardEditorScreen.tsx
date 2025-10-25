/**
 * CardEditorScreen - Writer Theme Full-Screen Card Editor
 *
 * Full-screen interface for creating and editing cards.
 * Minimal design focused on writing - title, category, content.
 *
 * Features:
 * - Header with Cancel/Save buttons
 * - Title input (44px minimum height)
 * - Category picker dropdown (6 colors)
 * - Content textarea (auto-expanding)
 * - Brutalist aesthetic (sharp edges, black borders)
 * - Zero animations
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * IA: See .gitban/cards/an1cxy Section "3. Card Editor"
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Input } from '../design-system/components/Input';
import { Button } from '../design-system/components/Button';
import { CATEGORIES, CategoryValue, getCategoryColor } from '../domain/categories';

export interface CardEditorScreenProps {
  /** Initial title (for editing existing card) */
  initialTitle?: string;

  /** Initial category (for editing existing card) */
  initialCategory?: CategoryValue;

  /** Initial content (for editing existing card) */
  initialContent?: string;

  /** Whether this is creating a new card or editing existing */
  mode?: 'create' | 'edit';

  /** Callback when save is clicked */
  onSave?: (data: { title: string; category: CategoryValue; content: string }) => void;

  /** Callback when cancel is clicked */
  onCancel?: () => void;
}

export const CardEditorScreen: React.FC<CardEditorScreenProps> = ({
  initialTitle = '',
  initialCategory = 'conflict',
  initialContent = '',
  mode = 'create',
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [category, setCategory] = useState<CategoryValue>(initialCategory);
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  // Track if form has been modified
  useEffect(() => {
    const hasChanged =
      title !== initialTitle ||
      category !== initialCategory ||
      content !== initialContent;
    setIsDirty(hasChanged);
  }, [title, category, content, initialTitle, initialCategory, initialContent]);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Title is required');
      return;
    }
    onSave?.({ title, category, content });
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmDiscard = confirm('Discard unsaved changes?');
      if (!confirmDiscard) return;
    }
    onCancel?.();
  };

  // Container styles (full viewport)
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    background: 'var(--primitive-white)',
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--semantic-spacing-md)', // 16px
    background: 'var(--primitive-white)',
    borderBottom: '1px solid var(--primitive-black)',
    minHeight: '60px',
  };

  // Form container styles
  const formStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--semantic-spacing-md)', // 16px
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--semantic-spacing-md)', // 16px
  };

  // Category picker styles
  const categoryPickerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--semantic-spacing-xs)', // 8px
  };

  const categoryLabelStyles: React.CSSProperties = {
    fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
    fontWeight: 600,
    color: 'var(--primitive-black)',
    fontFamily: 'var(--semantic-typography-font-primary)',
  };

  const selectStyles: React.CSSProperties = {
    minHeight: '44px',
    padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)', // 12px 16px
    fontSize: 'var(--semantic-typography-font-size-md)', // 16px
    fontFamily: 'var(--semantic-typography-font-primary)',
    background: 'var(--primitive-white)',
    color: 'var(--primitive-black)',
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M6 9L1 4h10z' fill='%23000'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
  };

  // Category preview (colored square)
  const selectedColor = getCategoryColor(category);
  const categoryPreviewStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--semantic-spacing-xs)', // 8px
    marginTop: 'var(--semantic-spacing-xs)', // 8px
  };

  const colorSquareStyles: React.CSSProperties = {
    width: '24px',
    height: '24px',
    background: selectedColor,
    border: '1px solid var(--primitive-black)',
  };

  return (
    <>
      {/* Inject focus styles for select */}
      <style>{`
        select:focus {
          outline: 2px solid var(--primitive-black);
          outline-offset: 2px;
        }
      `}</style>

      <div style={containerStyles}>
        {/* Header */}
        <header style={headerStyles}>
          <Button variant="secondary" size="md" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            Save
          </Button>
        </header>

        {/* Form */}
        <div style={formStyles}>
          {/* Title Input */}
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="INT. COFFEE SHOP - DAY"
            required
          />

          {/* Category Picker */}
          <div style={categoryPickerStyles}>
            <label htmlFor="category-select" style={categoryLabelStyles}>
              Category
            </label>
            <select
              id="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as CategoryValue)}
              style={selectStyles}
            >
              {CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>

            {/* Category preview */}
            <div style={categoryPreviewStyles}>
              <div style={colorSquareStyles} aria-hidden="true" />
              <span
                style={{
                  fontSize: 'var(--semantic-typography-font-size-sm)',
                  color: 'var(--primitive-gray-600)',
                }}
              >
                {CATEGORIES.find((cat) => cat.value === category)?.label}
              </span>
            </div>
          </div>

          {/* Content Textarea */}
          <Input
            label="Content"
            multiline
            rows={15}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Sarah enters, nervous. Tom is already there, reading the letter she sent..."
          />
        </div>
      </div>
    </>
  );
};

CardEditorScreen.displayName = 'CardEditorScreen';

// NATIVE TODO: Add keyboard avoidance
// When input/textarea is focused, ensure it scrolls into view above keyboard.
// Use Capacitor Keyboard plugin for native keyboard management.

// NATIVE TODO: Add haptic feedback on save
// When card is successfully saved:
// if (Capacitor.isNativePlatform()) {
//   await Haptics.notification({ type: 'success' });
// }
