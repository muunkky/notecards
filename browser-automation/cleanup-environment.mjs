/**
 * Environment Cleanup and Reset
 * 
 * Enhanced version of cleanup-dev-env.mjs with better organization.
 * Provides comprehensive cleanup of testing artifacts and environment reset.
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from './utils/config.mjs';
import { createLogger } from './utils/logger.mjs';

const execAsync = promisify(exec);
const logger = createLogger('cleanup');

class EnvironmentCleaner {
  constructor(options = {}) {
    this.deep = options.deep || false;
    this.force = options.force || false;
    this.cleanupItems = [];
  }

  async cleanBrowserSessions() {
    logger.step(1, 'Cleaning browser session data');
    
    const sessionDirs = [
      config.paths.chromeUserData,
      config.paths.chromeSessionData,
      '.browser-session',
      'chrome-user-data',
      'chrome-session-data'
    ];

    for (const dir of sessionDirs) {
      try {
        const exists = await this.pathExists(dir);
        if (exists) {
          await fs.rm(dir, { recursive: true, force: true });
          logger.success(`Cleaned browser session: ${dir}`);
          this.cleanupItems.push(`Browser session: ${dir}`);
        } else {
          logger.info(`Browser session not found: ${dir}`);
        }
      } catch (error) {
        logger.warn(`Could not clean browser session ${dir}`, { 
          error: error.message 
        });
      }
    }
  }

  async cleanScreenshots() {
    logger.step(2, 'Cleaning screenshot artifacts');

    try {
      const screenshotDir = config.paths.screenshots;
      const exists = await this.pathExists(screenshotDir);
      
      if (exists) {
        if (this.deep) {
          // Remove entire screenshot directory
          await fs.rm(screenshotDir, { recursive: true, force: true });
          logger.success('Removed all screenshots');
          this.cleanupItems.push('All screenshots');
        } else {
          // Keep recent screenshots, remove old ones
          const entries = await fs.readdir(screenshotDir, { withFileTypes: true });
          const sessionDirs = entries
            .filter(entry => entry.isDirectory())
            .map(entry => ({
              name: entry.name,
              path: path.join(screenshotDir, entry.name)
            }))
            .sort((a, b) => b.name.localeCompare(a.name)); // Newest first

          // Keep latest 3 sessions, remove others
          const toDelete = sessionDirs.slice(3);
          
          for (const dir of toDelete) {
            await fs.rm(dir.path, { recursive: true, force: true });
            logger.success(`Removed old screenshots: ${dir.name}`);
          }
          
          this.cleanupItems.push(`Old screenshots (${toDelete.length} sessions)`);
        }
      } else {
        logger.info('No screenshots to clean');
      }
    } catch (error) {
      logger.warn('Could not clean screenshots', { error: error.message });
    }
  }

  async cleanLogs() {
    logger.step(3, 'Cleaning log files');

    const logFiles = [
      'firestore-debug.log',
      'firebase-debug.log',
      './logs',
      './log'
    ];

    for (const logPath of logFiles) {
      try {
        const exists = await this.pathExists(logPath);
        if (exists) {
          const stat = await fs.stat(logPath);
          if (stat.isDirectory()) {
            await fs.rm(logPath, { recursive: true, force: true });
          } else {
            await fs.unlink(logPath);
          }
          logger.success(`Cleaned logs: ${logPath}`);
          this.cleanupItems.push(`Logs: ${logPath}`);
        }
      } catch (error) {
        logger.warn(`Could not clean logs ${logPath}`, { 
          error: error.message 
        });
      }
    }
  }

  async cleanTempFiles() {
    logger.step(4, 'Cleaning temporary files');

    const tempPaths = [
      config.paths.temp,
      './temp',
      './tmp',
      './.browser-temp'
    ];

    for (const tempPath of tempPaths) {
      try {
        const exists = await this.pathExists(tempPath);
        if (exists) {
          await fs.rm(tempPath, { recursive: true, force: true });
          logger.success(`Cleaned temp: ${tempPath}`);
          this.cleanupItems.push(`Temp files: ${tempPath}`);
        }
      } catch (error) {
        logger.warn(`Could not clean temp ${tempPath}`, { 
          error: error.message 
        });
      }
    }
  }

  async cleanNodeModules() {
    if (!this.deep) return;

    logger.step(5, 'Deep clean: Node modules cache');

    try {
      // Clean npm cache
      await execAsync('npm cache clean --force');
      logger.success('Cleaned npm cache');
      this.cleanupItems.push('npm cache');

      // Optionally remove node_modules (with confirmation)
      if (this.force) {
        const exists = await this.pathExists('./node_modules');
        if (exists) {
          await fs.rm('./node_modules', { recursive: true, force: true });
          logger.success('Removed node_modules');
          this.cleanupItems.push('node_modules');
        }
      }
    } catch (error) {
      logger.warn('Could not clean node modules', { error: error.message });
    }
  }

  async killOrphanProcesses() {
    logger.step(6, 'Killing orphan browser processes');

    try {
      if (process.platform === 'win32') {
        // Windows - kill Chrome processes
        await execAsync('taskkill /F /IM chrome.exe /T 2>nul || true');
        await execAsync('taskkill /F /IM msedge.exe /T 2>nul || true');
      } else {
        // Unix-like systems
        await execAsync('pkill -f chrome 2>/dev/null || true');
        await execAsync('pkill -f chromium 2>/dev/null || true');
      }
      
      logger.success('Orphan browser processes killed');
      this.cleanupItems.push('Orphan browser processes');
    } catch (error) {
      logger.warn('Could not kill orphan processes', { error: error.message });
    }
  }

  async resetFirebaseEmulators() {
    if (!this.deep) return;

    logger.step(7, 'Deep clean: Reset Firebase emulators');

    try {
      // Stop any running emulators
      await execAsync('firebase emulators:stop 2>/dev/null || true');
      
      // Clear emulator data
      const emulatorDirs = [
        './.firebase',
        './firebase-export',
        './emulator-data'
      ];

      for (const dir of emulatorDirs) {
        const exists = await this.pathExists(dir);
        if (exists) {
          await fs.rm(dir, { recursive: true, force: true });
          logger.success(`Cleaned emulator data: ${dir}`);
          this.cleanupItems.push(`Emulator data: ${dir}`);
        }
      }
    } catch (error) {
      logger.warn('Could not reset Firebase emulators', { 
        error: error.message 
      });
    }
  }

  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  async cleanup() {
    const timer = logger.timer('Environment cleanup');
    
    logger.info(`🧹 Starting environment cleanup (${this.deep ? 'deep' : 'standard'})`);
    
    try {
      await this.cleanBrowserSessions();
      await this.cleanScreenshots();
      await this.cleanLogs();
      await this.cleanTempFiles();
      await this.cleanNodeModules();
      await this.killOrphanProcesses();
      await this.resetFirebaseEmulators();

      timer.end();
      
      logger.success('Environment cleanup completed');
      this.generateSummary();
      this.showNextSteps();

    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
      throw error;
    }
  }

  generateSummary() {
    logger.info('📊 Cleanup Summary');
    console.log('\n✅ Cleaned items:');
    
    if (this.cleanupItems.length === 0) {
      console.log('   No items needed cleanup');
    } else {
      this.cleanupItems.forEach(item => {
        console.log(`   • ${item}`);
      });
    }
    
    console.log(`\n📈 Total items cleaned: ${this.cleanupItems.length}`);
  }

  showNextSteps() {
    logger.info('🚀 Recommended next steps');
    console.log('\n1. Run fresh authentication test:');
    console.log('   node browser-automation/start-authenticated-session.mjs');
    console.log('\n2. Run sharing system tests:');
    console.log('   node browser-automation/run-sharing-tests.mjs');
    console.log('\n3. If deep clean was performed, reinstall dependencies:');
    console.log('   npm install');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options = {
    deep: false,
    force: false
  };

  // Parse arguments
  for (const arg of args) {
    switch (arg) {
      case '--deep':
        options.deep = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--help':
        console.log(`
🧹 Environment Cleanup and Reset

Usage: node cleanup-environment.mjs [options]

Options:
  --deep     Perform deep cleanup (node_modules, emulators, etc.)
  --force    Force cleanup without confirmation
  --help     Show this help message

Examples:
  node cleanup-environment.mjs
  node cleanup-environment.mjs --deep
  node cleanup-environment.mjs --deep --force
        `);
        process.exit(0);
        break;
    }
  }

  // Confirmation for deep clean
  if (options.deep && !options.force) {
    console.log('⚠️  Deep cleanup will remove:');
    console.log('   • node_modules directory');
    console.log('   • All emulator data');
    console.log('   • All screenshots');
    console.log('   • npm cache');
    console.log('\nAre you sure? Add --force to skip this confirmation.');
    process.exit(1);
  }

  const cleaner = new EnvironmentCleaner(options);

  try {
    await cleaner.cleanup();
  } catch (error) {
    console.error('Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
export { EnvironmentCleaner };

// Run CLI if this is the main module  
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default EnvironmentCleaner;