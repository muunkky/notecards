/**
 * OverlayMenu Component - Writer Theme Context Menu
 *
 * Context-preserving overlay menu that appears near a trigger element.
 * Used for action menus (three-dot menus, context menus).
 *
 * Features:
 * - 75% black scrim backdrop
 * - Positioned near anchor element
 * - Menu items with click handlers
 * - Click outside to dismiss
 * - ESC key to dismiss
 * - Auto-dismiss after item click
 * - Zero animations (instant show/hide)
 * - Brutalist aesthetic (sharp edges, black borders)
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * Similar to: BottomSheet (different positioning)
 */

import * as React from 'react';
import { useEffect, useRef } from 'react';

export interface MenuItem {
  /** Label text for menu item */
  label: string;

  /** Click handler for menu item */
  onClick: () => void;

  /** Mark as danger action (red text) */
  danger?: boolean;
}

export interface OverlayMenuProps {
  /** Whether menu is open */
  isOpen: boolean;

  /** Callback when menu should close */
  onClose: () => void;

  /** Menu items to display */
  items: MenuItem[];

  /** Optional anchor element to position menu near */
  anchorEl?: HTMLElement | null;

  /** Test ID for testing */
  testId?: string;
}

export const OverlayMenu: React.FC<OverlayMenuProps> = ({
  isOpen,
  onClose,
  items,
  anchorEl,
  testId = 'overlay-menu',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay to avoid closing immediately on trigger click
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate menu position based on anchor element
  const getMenuPosition = (): React.CSSProperties => {
    if (!anchorEl) {
      // Default: centered on screen
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const rect = anchorEl.getBoundingClientRect();
    const menuWidth = 200; // Approximate menu width

    // Position below and to the right of anchor (default)
    let top = rect.bottom + 8;
    let left = rect.right - menuWidth;

    // Adjust if menu would go off screen
    if (top + 300 > window.innerHeight) {
      // Position above anchor instead
      top = rect.top - 8;
    }

    if (left < 8) {
      // Align to left edge
      left = 8;
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
    };
  };

  // Scrim styles (75% black backdrop)
  const scrimStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)', // 75% black
    zIndex: 1000,
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  // Menu container styles
  const menuStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 1001,
    background: 'var(--primitive-white)',
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px (sharp edges)
    minWidth: '200px',
    maxWidth: '300px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'var(--primitive-transitions-none)', // 0ms
    ...getMenuPosition(),
  };

  // Menu item styles
  const menuItemStyles = (danger: boolean = false): React.CSSProperties => ({
    display: 'block',
    width: '100%',
    padding: 'var(--semantic-spacing-sm)', // 12px
    background: 'var(--primitive-white)',
    border: 'none',
    borderBottom: '1px solid var(--primitive-gray-200)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: '15px',
    textAlign: 'left',
    color: danger ? 'var(--primitive-red-600)' : 'var(--primitive-black)',
    cursor: 'pointer',
    transition: 'var(--primitive-transitions-none)', // 0ms
  });

  // Handle menu item click
  const handleItemClick = (item: MenuItem) => {
    item.onClick();
    onClose(); // Auto-dismiss after click
  };

  return (
    <>
      {/* Inject hover styles */}
      <style>{`
        .overlay-menu-item:hover {
          background: var(--primitive-gray-50) !important;
        }
        .overlay-menu-item:active {
          background: var(--primitive-gray-100) !important;
        }
        .overlay-menu-item-danger:hover {
          background: var(--primitive-red-50) !important;
        }
        .overlay-menu-item-danger:active {
          background: var(--primitive-red-100) !important;
        }
        .overlay-menu-item:last-child {
          border-bottom: none !important;
        }
      `}</style>

      {/* Scrim backdrop */}
      <div
        style={scrimStyles}
        onClick={onClose}
        data-testid={`${testId}-scrim`}
        aria-hidden="true"
      />

      {/* Menu container */}
      <div
        ref={menuRef}
        style={menuStyles}
        role="menu"
        aria-label="Menu"
        data-testid={testId}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleItemClick(item)}
            style={menuItemStyles(item.danger)}
            className={item.danger ? 'overlay-menu-item overlay-menu-item-danger' : 'overlay-menu-item'}
            role="menuitem"
            data-testid={`${testId}-item-${index}`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
};

OverlayMenu.displayName = 'OverlayMenu';

// NATIVE TODO: Add haptic feedback on menu open/close
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
//
// const handleOpen = async () => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'light' });
//   }
// };
