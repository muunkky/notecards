/**
 * Screen Reader Announcer Tests
 *
 * Comprehensive TDD coverage for ARIA live region announcements.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { announcer } from '../../design-system/accessibility/announcer.js';

describe('Screen Reader Announcer', () => {
  beforeEach(() => {
    // Clean up any existing live regions
    announcer.cleanup();
  });

  afterEach(() => {
    announcer.cleanup();
  });

  describe('Initialization', () => {
    it('should create polite live region on initialize', () => {
      announcer.initialize();

      const regions = document.querySelectorAll('[aria-live="polite"]');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should create assertive live region on initialize', () => {
      announcer.initialize();

      const regions = document.querySelectorAll('[aria-live="assertive"]');
      expect(regions.length).toBeGreaterThan(0);
    });

    it('should set role="status" on live regions', () => {
      announcer.initialize();

      const regions = document.querySelectorAll('[role="status"]');
      expect(regions.length).toBeGreaterThanOrEqual(2); // polite + assertive
    });

    it('should set aria-atomic="true" on live regions', () => {
      announcer.initialize();

      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.getAttribute('aria-atomic')).toBe('true');
    });

    it('should visually hide live regions', () => {
      announcer.initialize();

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.style.position).toBe('absolute');
      expect(region.style.left).toBe('-10000px');
      expect(region.style.overflow).toBe('hidden');
    });

    it('should not initialize twice', () => {
      announcer.initialize();
      const firstCount = document.querySelectorAll('[aria-live]').length;

      announcer.initialize();
      const secondCount = document.querySelectorAll('[aria-live]').length;

      expect(firstCount).toBe(secondCount);
    });
  });

  describe('Basic Announcements', () => {
    beforeEach(() => {
      announcer.initialize();
    });

    it('should announce polite message', async () => {
      announcer.announce('Test message', 'polite');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Test message');
    });

    it('should announce assertive message', async () => {
      announcer.announce('Urgent message', 'assertive');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="assertive"]') as HTMLElement;
      expect(region.textContent).toBe('Urgent message');
    });

    it('should default to polite announcement', async () => {
      announcer.announce('Default message');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const politeRegion = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(politeRegion.textContent).toBe('Default message');
    });

    it('should not announce if message is empty', async () => {
      announcer.announce('', 'polite');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('');
    });

    it('should not announce if priority is "off"', async () => {
      announcer.announce('Test message', 'off');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('');
    });
  });

  describe('Announcement Options', () => {
    beforeEach(() => {
      announcer.initialize();
    });

    it('should delay announcement', async () => {
      announcer.announce('Delayed message', 'polite', { delay: 50 });

      // Check immediately (should be empty)
      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('');

      // Wait for delay
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(region.textContent).toBe('Delayed message');
    });

    it('should clear announcement after timeout', async () => {
      announcer.announce('Temporary message', 'polite', { timeout: 50 });

      await new Promise((resolve) => setTimeout(resolve, 10));
      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Temporary message');

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 60));
      expect(region.textContent).toBe('');
    });

    it('should cancel pending announcement', async () => {
      announcer.announce('First message', 'polite', { delay: 50 });
      announcer.announce('Second message', 'polite');

      await new Promise((resolve) => setTimeout(resolve, 60));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Second message');
    });
  });

  describe('Card Action Announcements', () => {
    beforeEach(() => {
      announcer.initialize();
    });

    it('should announce card action with title', async () => {
      announcer.announceCardAction('created', 'My Card');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Card "My Card" created');
    });

    it('should announce card action without title', async () => {
      announcer.announceCardAction('created');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Card created');
    });

    it('should announce card deletion with undo', async () => {
      announcer.announceCardDeleted('My Card', true);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="assertive"]') as HTMLElement;
      expect(region.textContent).toContain('Card "My Card" deleted');
      expect(region.textContent).toContain('Undo available');
    });

    it('should announce card deletion without undo', async () => {
      announcer.announceCardDeleted('My Card', false);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="assertive"]') as HTMLElement;
      expect(region.textContent).toBe('Card "My Card" deleted');
      expect(region.textContent).not.toContain('Undo');
    });

    it('should announce card reordered', async () => {
      announcer.announceCardReordered('My Card', 3, 10);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Card "My Card" moved to position 3 of 10');
    });
  });

  describe('Reorder Mode Announcements', () => {
    beforeEach(() => {
      announcer.initialize();
    });

    it('should announce reorder mode activated', async () => {
      announcer.announceReorderMode(true);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toContain('Reorder mode activated');
      expect(region.textContent).toContain('Escape to cancel');
    });

    it('should announce reorder mode deactivated', async () => {
      announcer.announceReorderMode(false);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Reorder mode deactivated');
    });
  });

  describe('Status Announcements', () => {
    beforeEach(() => {
      announcer.initialize();
    });

    it('should announce error message assertively', async () => {
      announcer.announceError('Something went wrong');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="assertive"]') as HTMLElement;
      expect(region.textContent).toBe('Error: Something went wrong');
    });

    it('should announce success message politely', async () => {
      announcer.announceSuccess('Operation completed');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Operation completed');
    });

    it('should announce navigation', async () => {
      announcer.announceNavigation('Deck List');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const region = document.querySelector('[aria-live="polite"]') as HTMLElement;
      expect(region.textContent).toBe('Navigated to Deck List');
    });
  });

  describe('Cleanup', () => {
    it('should remove live regions on cleanup', () => {
      announcer.initialize();
      expect(document.querySelectorAll('[aria-live]').length).toBeGreaterThan(0);

      announcer.cleanup();
      expect(document.querySelectorAll('[aria-live]').length).toBe(0);
    });

    it('should clear pending timeouts on cleanup', async () => {
      announcer.initialize();
      announcer.announce('Test', 'polite', { delay: 1000 });

      announcer.cleanup();

      await new Promise((resolve) => setTimeout(resolve, 1100));
      // Should not crash or cause errors
    });

    it('should allow reinitialization after cleanup', () => {
      announcer.initialize();
      announcer.cleanup();

      announcer.initialize();
      const regions = document.querySelectorAll('[aria-live]');
      expect(regions.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Auto-initialization', () => {
    it('should auto-initialize on first announce', async () => {
      // Start fresh
      announcer.cleanup();
      expect(document.querySelectorAll('[aria-live]').length).toBe(0);

      announcer.announce('Test message');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const regions = document.querySelectorAll('[aria-live]');
      expect(regions.length).toBeGreaterThan(0);
    });
  });
});
