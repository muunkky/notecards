/**
 * PWA Detection Tests
 *
 * Comprehensive TDD coverage for Progressive Web App detection utilities.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { pwaDetector } from '../../services/pwa-detector.js';

describe('PWA Detector', () => {
  let detector = pwaDetector;

  beforeEach(() => {
    // Reset window properties before each test
    vi.stubGlobal('navigator', {
      standalone: false,
      userAgent: 'Mozilla/5.0',
    });
    vi.stubGlobal('matchMedia', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Installation Detection', () => {
    it('should detect if app is installed (standalone mode)', () => {
      vi.stubGlobal('navigator', {
        standalone: true,
        userAgent: 'Mozilla/5.0',
      });
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: true,
        media: '(display-mode: standalone)',
      }));

      expect(detector.isInstalled()).toBe(true);
    });

    it('should detect if app is not installed (browser mode)', () => {
      vi.stubGlobal('navigator', {
        standalone: false,
        userAgent: 'Mozilla/5.0',
      });
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: false,
        media: '(display-mode: browser)',
      }));

      expect(detector.isInstalled()).toBe(false);
    });

    it('should detect iOS standalone mode', () => {
      vi.stubGlobal('navigator', {
        standalone: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
      });

      expect(detector.isInstalled()).toBe(true);
    });

    it('should detect display-mode: standalone media query', () => {
      const mockMatchMedia = vi.fn().mockReturnValue({
        matches: true,
        media: '(display-mode: standalone)',
      });
      vi.stubGlobal('matchMedia', mockMatchMedia);

      expect(detector.isInstalled()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
    });
  });

  describe('Platform Detection', () => {
    it('should detect iOS platform', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        standalone: false,
      });

      expect(detector.isIOS()).toBe(true);
    });

    it('should detect Android platform', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        standalone: false,
      });

      expect(detector.isAndroid()).toBe(true);
    });

    it('should detect desktop platform', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        standalone: false,
      });

      expect(detector.isDesktop()).toBe(true);
    });

    it('should detect mobile platform (iOS or Android)', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        standalone: false,
      });

      expect(detector.isMobile()).toBe(true);
    });
  });

  describe('Install Prompt Support', () => {
    it('should detect if beforeinstallprompt is supported', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        standalone: false,
      });

      expect(detector.canInstall()).toBe(true);
    });

    it('should detect if beforeinstallprompt is not supported (iOS)', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        standalone: false,
      });

      expect(detector.canInstall()).toBe(false);
    });

    it('should capture beforeinstallprompt event', () => {
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      } as any;

      detector.captureInstallPrompt(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe('Install Prompt Triggering', () => {
    it('should trigger install prompt when available', async () => {
      const mockPrompt = vi.fn().mockResolvedValue(undefined);
      const mockEvent = {
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      } as any;

      detector.captureInstallPrompt(mockEvent);
      await detector.triggerInstall();

      expect(mockPrompt).toHaveBeenCalled();
    });

    it('should return user choice after prompt', async () => {
      const mockEvent = {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
        preventDefault: vi.fn(),
      } as any;

      detector.captureInstallPrompt(mockEvent);
      const result = await detector.triggerInstall();

      expect(result).toBe('accepted');
    });

    it('should handle prompt rejection', async () => {
      const mockEvent = {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
        preventDefault: vi.fn(),
      } as any;

      detector.captureInstallPrompt(mockEvent);
      const result = await detector.triggerInstall();

      expect(result).toBe('dismissed');
    });

    it('should not trigger install if no prompt available', async () => {
      const result = await detector.triggerInstall();
      expect(result).toBe(null);
    });
  });

  describe('iOS Install Instructions', () => {
    it('should detect if iOS install instructions are needed', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        standalone: false,
      });

      expect(detector.needsIOSInstructions()).toBe(true);
    });

    it('should not show iOS instructions if already installed', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        standalone: true,
      });

      expect(detector.needsIOSInstructions()).toBe(false);
    });

    it('should not show iOS instructions on Android', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        standalone: false,
      });

      expect(detector.needsIOSInstructions()).toBe(false);
    });
  });

  describe('Service Worker Support', () => {
    it('should detect if service workers are supported', () => {
      vi.stubGlobal('navigator', {
        serviceWorker: {},
      });

      expect(detector.supportsServiceWorker()).toBe(true);
    });

    it('should detect if service workers are not supported', () => {
      vi.stubGlobal('navigator', {});

      expect(detector.supportsServiceWorker()).toBe(false);
    });
  });

  describe('PWA Capabilities', () => {
    it('should get all PWA capabilities', () => {
      vi.stubGlobal('navigator', {
        userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
        standalone: false,
        serviceWorker: {},
      });
      vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({
        matches: false,
        media: '(display-mode: browser)',
      }));

      const capabilities = detector.getCapabilities();

      expect(capabilities).toEqual({
        isInstalled: false,
        canInstall: true,
        supportsServiceWorker: true,
        isIOS: false,
        isAndroid: true,
        needsIOSInstructions: false,
      });
    });
  });
});
