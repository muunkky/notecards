/**
 * InstallPrompt Component
 *
 * PWA installation prompt with platform-specific UX.
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST BRUTALISM:
 * - Black button, white text, 0px radius, 0ms transitions
 * - Android: Trigger beforeinstallprompt
 * - iOS: Show manual "Add to Home Screen" instructions
 * - Dismissible with localStorage persistence
 * - Full accessibility (ARIA, keyboard, screen reader)
 * - Bottom-fixed positioning with safe area insets
 *
 * TDD: Built to pass install-prompt.test.tsx
 */

import React, { useState, useEffect } from 'react';
import { pwaDetector } from '../../services/pwa-detector.js';
import { announcer } from '../../design-system/accessibility/announcer.js';

export interface InstallPromptProps {
  /** Custom button text (default: "Install App") */
  text?: string;
  /** Force dismissed state (for testing) */
  dismissed?: boolean;
  /** Callback when user dismisses prompt */
  onDismiss?: () => void;
}

const DISMISS_KEY = 'pwa-prompt-dismissed';

export const InstallPrompt = React.forwardRef<HTMLDivElement, InstallPromptProps>(
  ({ text = 'Install App', dismissed: forceDismissed = false, onDismiss }, ref) => {
    const [isInstalled, setIsInstalled] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [showIOSModal, setShowIOSModal] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);

    useEffect(() => {
      // Check if already installed
      setIsInstalled(pwaDetector.isInstalled());

      // Check if previously dismissed
      const dismissed = localStorage.getItem(DISMISS_KEY) === 'true';
      setIsDismissed(dismissed);

      // Announce availability to screen reader
      if (!pwaDetector.isInstalled() && !dismissed) {
        announcer.announce('App can be installed', 'polite');
      }
    }, []);

    // Handle dismiss
    const handleDismiss = () => {
      setIsDismissed(true);
      localStorage.setItem(DISMISS_KEY, 'true');
      onDismiss?.();
    };

    // Handle Android install
    const handleAndroidInstall = async () => {
      setIsInstalling(true);
      announcer.announce('Installing app...', 'assertive');

      const result = await pwaDetector.triggerInstall();

      if (result === 'accepted') {
        announcer.announceSuccess('App installed');
        setIsInstalled(true);
      } else if (result === 'dismissed') {
        handleDismiss();
      }

      setIsInstalling(false);
    };

    // Handle iOS instructions
    const handleIOSInstructions = () => {
      setShowIOSModal(true);
    };

    // Handle button click based on platform
    const handleClick = () => {
      if (pwaDetector.isIOS()) {
        handleIOSInstructions();
      } else {
        handleAndroidInstall();
      }
    };

    // Handle keyboard events
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    };

    // Don't render if installed or dismissed
    if (isInstalled || isDismissed || forceDismissed) {
      return null;
    }

    // Container styles
    const containerStyles: React.CSSProperties = {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
      background: 'var(--primitive-white)',
      borderTop: '1px solid var(--primitive-black)',
      zIndex: 1000,
      transition: 'var(--primitive-transitions-none)', // 0ms
    };

    // Button styles (brutalist)
    const buttonStyles: React.CSSProperties = {
      background: 'var(--primitive-black)',
      color: 'var(--primitive-white)',
      border: '2px solid var(--primitive-black)',
      borderRadius: 'var(--primitive-radii-none)', // 0px
      padding: '14px 24px',
      fontSize: '16px',
      fontWeight: 600,
      minHeight: '44px', // Touch target
      cursor: 'pointer',
      transition: 'var(--primitive-transitions-none)', // 0ms
      outline: 'none',
    };

    const buttonFocusStyles: React.CSSProperties = {
      outline: '2px solid var(--primitive-black)',
      outlineOffset: '2px',
    };

    const dismissButtonStyles: React.CSSProperties = {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'transparent',
      border: 'none',
      color: 'var(--primitive-black)',
      fontSize: '24px',
      lineHeight: 1,
      cursor: 'pointer',
      padding: '8px',
      minWidth: '44px', // Touch target
      minHeight: '44px',
    };

    return (
      <>
        <div ref={ref} style={containerStyles}>
          <button
            type="button"
            role="button"
            aria-label="Install app"
            style={buttonStyles}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={(e) => Object.assign(e.currentTarget.style, buttonFocusStyles)}
            onBlur={(e) => Object.assign(e.currentTarget.style, { outline: 'none' })}
            disabled={isInstalling}
          >
            {text}
          </button>

          <button
            type="button"
            aria-label="Dismiss install prompt"
            style={dismissButtonStyles}
            onClick={handleDismiss}
          >
            ×
          </button>
        </div>

        {/* iOS Instructions Modal */}
        {showIOSModal && (
          <IOSInstructionsModal onClose={() => setShowIOSModal(false)} />
        )}
      </>
    );
  }
);

InstallPrompt.displayName = 'InstallPrompt';

/**
 * iOS Installation Instructions Modal
 */
interface IOSInstructionsModalProps {
  onClose: () => void;
}

const IOSInstructionsModal: React.FC<IOSInstructionsModalProps> = ({ onClose }) => {
  useEffect(() => {
    // Trap focus in modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)', // 75% black scrim
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '24px',
  };

  const modalStyles: React.CSSProperties = {
    background: 'var(--primitive-white)',
    border: '2px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
  };

  const headingStyles: React.CSSProperties = {
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: 700,
  };

  const instructionStyles: React.CSSProperties = {
    margin: '0 0 12px 0',
    lineHeight: 1.5,
  };

  const buttonStyles: React.CSSProperties = {
    background: 'var(--primitive-black)',
    color: 'var(--primitive-white)',
    border: '2px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: '16px',
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div
        style={modalStyles}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="iOS install instructions"
      >
        <h2 style={headingStyles}>Install on iOS</h2>
        <ol style={{ paddingLeft: '20px', margin: '0 0 16px 0' }}>
          <li style={instructionStyles}>
            Tap the <strong>Share button</strong> (Safari share icon) in your browser
          </li>
          <li style={instructionStyles}>
            Scroll down and tap <strong>"Add to Home Screen"</strong>
          </li>
          <li style={instructionStyles}>
            Tap <strong>"Add"</strong> in the top right corner
          </li>
        </ol>
        <button
          type="button"
          style={buttonStyles}
          onClick={onClose}
          aria-label="Close instructions"
        >
          Got it
        </button>
      </div>
    </div>
  );
};
