/**
 * Screenshot Utilities for Browser Automation Framework
 * 
 * Manages screenshot capture, organization, and cleanup.
 * Provides consistent naming and storage across automation scripts.
 */

import fs from 'fs/promises';
import path from 'path';
import config from './config.mjs';
import { createLogger } from './logger.mjs';

const logger = createLogger('screenshots');

export class ScreenshotManager {
  constructor(testName = 'automation') {
    this.testName = testName;
    this.screenshotCount = 0;
    this.sessionId = this.generateSessionId();
    this.baseDir = config.screenshots.directory;
  }

  generateSessionId() {
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .slice(0, -5); // Remove milliseconds and Z
    return `${this.testName}_${timestamp}`;
  }

  async ensureDirectory() {
    try {
      const sessionDir = path.join(this.baseDir, this.sessionId);
      await fs.mkdir(sessionDir, { recursive: true });
      return sessionDir;
    } catch (error) {
      logger.error('Failed to create screenshot directory', { 
        error: error.message 
      });
      throw error;
    }
  }

  async capture(page, name, description = '', options = {}) {
    try {
      const sessionDir = await this.ensureDirectory();
      this.screenshotCount++;

      const filename = this.generateFilename(name);
      const filepath = path.join(sessionDir, filename);

      const screenshotOptions = {
        quality: config.screenshots.quality,
        fullPage: config.screenshots.fullPage,
        ...options
      };

      await page.screenshot({
        path: filepath,
        ...screenshotOptions
      });

      logger.screenshot(filename, description);
      
      return {
        filepath,
        filename,
        sessionDir,
        count: this.screenshotCount
      };

    } catch (error) {
      logger.error('Screenshot capture failed', { 
        name, 
        error: error.message 
      });
      throw error;
    }
  }

  generateFilename(name) {
    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const counter = this.screenshotCount.toString().padStart(2, '0');
    const timestamp = config.screenshots.timestamp ? 
      `_${Date.now()}` : '';

    return `${counter}_${sanitized}${timestamp}.png`;
  }

  async captureSequence(page, steps) {
    const results = [];
    
    for (const step of steps) {
      const { name, description, action, options } = step;
      
      try {
        // Perform action if provided
        if (action && typeof action === 'function') {
          await action();
          // Wait for UI updates
          await page.waitForTimeout(config.timeouts.shortDelay);
        }

        // Capture screenshot
        const result = await this.capture(page, name, description, options);
        results.push({ ...result, step: name, success: true });

      } catch (error) {
        logger.error(`Screenshot sequence failed at step: ${name}`, {
          error: error.message
        });
        results.push({ 
          step: name, 
          success: false, 
          error: error.message 
        });
      }
    }

    return results;
  }

  async captureTestEvidence(page, testName, evidence) {
    const results = [];

    for (const item of evidence) {
      const { type, name, selector, description } = item;

      try {
        let screenshotOptions = {};

        if (type === 'element' && selector) {
          const element = await page.$(selector);
          if (element) {
            screenshotOptions.clip = await element.boundingBox();
          }
        }

        const result = await this.capture(
          page, 
          `${testName}_${name}`, 
          description,
          screenshotOptions
        );

        results.push({ ...result, type, success: true });

      } catch (error) {
        logger.error(`Test evidence capture failed: ${name}`, {
          error: error.message
        });
        results.push({ 
          name, 
          type, 
          success: false, 
          error: error.message 
        });
      }
    }

    return results;
  }

  async captureError(page, error, context = '') {
    try {
      const errorName = `error_${context || 'unknown'}`;
      const description = `Error captured: ${error.message}`;
      
      return await this.capture(page, errorName, description, {
        fullPage: true // Capture full page for error diagnosis
      });

    } catch (captureError) {
      logger.error('Error screenshot capture failed', {
        originalError: error.message,
        captureError: captureError.message
      });
    }
  }

  async cleanup(keepLatest = 5) {
    try {
      const baseDir = config.screenshots.directory;
      const entries = await fs.readdir(baseDir, { withFileTypes: true });
      
      const sessionDirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => ({
          name: entry.name,
          path: path.join(baseDir, entry.name)
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Newest first

      // Keep only the latest sessions
      const toDelete = sessionDirs.slice(keepLatest);

      for (const dir of toDelete) {
        await fs.rm(dir.path, { recursive: true, force: true });
        logger.info(`Cleaned up old screenshots: ${dir.name}`);
      }

      logger.info(`Screenshot cleanup completed`, {
        kept: sessionDirs.length - toDelete.length,
        deleted: toDelete.length
      });

    } catch (error) {
      logger.error('Screenshot cleanup failed', { 
        error: error.message 
      });
    }
  }

  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      testName: this.testName,
      screenshotCount: this.screenshotCount,
      baseDirectory: this.baseDir
    };
  }
}

// Utility functions
export async function quickScreenshot(page, name, description = '') {
  const manager = new ScreenshotManager('quick');
  return await manager.capture(page, name, description);
}

export async function captureTestResults(page, testResults) {
  const manager = new ScreenshotManager('test-results');
  const evidence = testResults.map(result => ({
    type: 'full',
    name: result.name,
    description: `Test result: ${result.status}`
  }));
  
  return await manager.captureTestEvidence(page, 'results', evidence);
}

export { ScreenshotManager };
export default ScreenshotManager;