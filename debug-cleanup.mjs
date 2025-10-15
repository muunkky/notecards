#!/usr/bin/env node

/**
 * Debug Script and Log Cleanup Utility
 * 
 * Part of SHAREVALIDATION sprint - cleans up scattered debugging scripts 
 * and logs from sharing system investigation and consolidates into organized structure.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

class DebugCleanupManager {
  constructor() {
    this.cleanupReport = {
      removedFiles: [],
      movedFiles: [],
      keptFiles: [],
      cleanedDirectories: [],
      errors: []
    };
  }

  async run() {
    console.log('🧹 Starting Debug Script and Log Cleanup');
    console.log('Part of SHAREVALIDATION sprint - organizing debug artifacts');
    
    try {
      // 1. Identify and categorize debug files
      await this.identifyDebugFiles();
      
      // 2. Clean up obsolete debug scripts
      await this.cleanupObsoleteScripts();
      
      // 3. Organize remaining debug utilities
      await this.organizeDebugUtilities();
      
      // 4. Clean up old log files
      await this.cleanupOldLogs();
      
      // 5. Create organized debug structure
      await this.createOrganizedStructure();
      
      // 6. Generate cleanup report
      await this.generateCleanupReport();
      
      console.log('✅ Debug cleanup completed successfully');
      
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      this.cleanupReport.errors.push(error.message);
    }
  }

  async identifyDebugFiles() {
    console.log('🔍 Identifying debug files and scripts...');
    
    const debugPatterns = [
      'debug-*.mjs',
      'debug-*.js',
      '*debug*.png',
      '*debug*.json',
      'test-*.mjs',
      '*temp*',
      '*.tmp'
    ];
    
    const searchPaths = [
      projectRoot,
      path.join(projectRoot, 'scripts'),
      path.join(projectRoot, 'test'),
      path.join(projectRoot, 'screenshots')
    ];
    
    for (const searchPath of searchPaths) {
      try {
        const files = await fs.readdir(searchPath);
        console.log(`  📁 Checking ${searchPath}: ${files.length} files`);
      } catch (error) {
        // Directory might not exist, that's OK
      }
    }
  }

  async cleanupObsoleteScripts() {
    console.log('🗑️ Cleaning up obsolete debug scripts...');
    
    // Remove empty or minimal debug files
    const emptyDebugFile = path.join(projectRoot, 'debug-firebase-admin.mjs');
    
    try {
      const content = await fs.readFile(emptyDebugFile, 'utf8');
      if (content.trim().length === 0) {
        await fs.unlink(emptyDebugFile);
        this.cleanupReport.removedFiles.push('debug-firebase-admin.mjs (empty file)');
        console.log('  ✅ Removed empty debug-firebase-admin.mjs');
      }
    } catch (error) {
      // File might not exist
    }
    
    // Archive old debug scripts to archive directory
    const debugScripts = [
      path.join(projectRoot, 'scripts', 'debug-page-content.mjs'),
      path.join(projectRoot, 'scripts', 'debug-cards.mjs')
    ];
    
    const archiveDir = path.join(projectRoot, 'scripts', 'archive', 'debug');
    await fs.mkdir(archiveDir, { recursive: true });
    
    for (const scriptPath of debugScripts) {
      try {
        const scriptName = path.basename(scriptPath);
        const archivePath = path.join(archiveDir, scriptName);
        
        await fs.rename(scriptPath, archivePath);
        this.cleanupReport.movedFiles.push(`${scriptName} → scripts/archive/debug/`);
        console.log(`  📦 Archived ${scriptName} to archive/debug/`);
        
      } catch (error) {
        this.cleanupReport.errors.push(`Failed to archive ${scriptPath}: ${error.message}`);
      }
    }
  }

  async organizeDebugUtilities() {
    console.log('📁 Organizing debug utilities...');
    
    // Create organized debug utilities directory
    const debugUtilsDir = path.join(projectRoot, 'scripts', 'debug-utils');
    await fs.mkdir(debugUtilsDir, { recursive: true });
    
    // Create modern debug utility script
    const modernDebugScript = `#!/usr/bin/env node

/**
 * Modern Debug Utilities for Sharing System
 * 
 * Consolidated debug utilities for investigating sharing system issues.
 * Replaces scattered debug scripts with organized, maintainable utilities.
 */

import browserService from '../services/browser-service.mjs';
import { createLogger } from '../browser-automation/utils/logger.mjs';

const logger = createLogger('debug-utils');

class SharingDebugger {
  constructor() {
    this.browserService = null;
  }

  async initialize() {
    logger.info('🔧 Initializing Sharing System Debugger');
    
    const connection = await browserService.initialize({ 
      headless: false, // Always visible for debugging
      persistent: true
    });
    this.browserService = browserService;
    
    logger.success('Debug environment ready');
  }

  async debugPageContent() {
    logger.info('🔍 Analyzing page content and authentication state');
    
    const { page } = this.browserService.getBrowser();
    
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        hasAuthElements: !!document.querySelector('[data-testid="email-input"], [data-testid="login-button"]'),
        hasDecks: !!document.querySelector('[data-testid="deck-list"], [data-testid="deck-item"]'),
        hasShareDialog: !!document.querySelector('[role="dialog"]'),
        elementCount: document.querySelectorAll('*').length,
        bodyText: document.body.innerText.substring(0, 300)
      };
    });
    
    logger.info('📄 Page Analysis Results', pageInfo);
    
    // Take debug screenshot
    await page.screenshot({ 
      path: \`debug-screenshots/page-content-\${Date.now()}.png\`,
      fullPage: true 
    });
    
    return pageInfo;
  }

  async debugSharingDialog(deckId) {
    logger.info('🔍 Debugging share dialog functionality', { deckId });
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Navigate to deck
      await page.goto(\`http://localhost:5173/decks/\${deckId}\`);
      
      // Take before screenshot
      await page.screenshot({ 
        path: \`debug-screenshots/before-share-\${deckId}-\${Date.now()}.png\`
      });
      
      // Click share button
      await page.click(\`[data-testid="share-button-\${deckId}"]\`);
      
      // Wait for dialog
      await page.waitForSelector('[role="dialog"]', { state: 'visible', timeout: 5000 });
      
      // Analyze dialog state
      const dialogInfo = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        return {
          visible: !!dialog,
          hasEmailInput: !!document.querySelector('input[type="email"]'),
          hasAddButton: !!document.querySelector('button:has-text("Add")'),
          hasCollaboratorList: !!document.querySelector('[data-testid="collaborator-list"]'),
          collaboratorCount: document.querySelectorAll('[data-testid="collaborator-row"]').length,
          dialogText: dialog ? dialog.innerText.substring(0, 200) : null
        };
      });
      
      logger.info('📋 Share Dialog Analysis', dialogInfo);
      
      // Take after screenshot
      await page.screenshot({ 
        path: \`debug-screenshots/share-dialog-\${deckId}-\${Date.now()}.png\`
      });
      
      return dialogInfo;
      
    } catch (error) {
      logger.error('Share dialog debugging failed', { error: error.message });
      return { error: error.message };
    }
  }

  async debugCollaboratorAddition(deckId, email) {
    logger.info('🔍 Debugging collaborator addition process', { deckId, email });
    
    const { page } = this.browserService.getBrowser();
    
    try {
      // Open share dialog
      await this.debugSharingDialog(deckId);
      
      const startTime = Date.now();
      
      // Fill email
      await page.fill('input[type="email"]', email);
      
      // Click add
      await page.click('button:has-text("Add")');
      
      // Wait for result
      await page.waitForTimeout(2000);
      
      const duration = Date.now() - startTime;
      
      // Check result
      const result = await page.evaluate((testEmail) => {
        const errorAlert = document.querySelector('[role="alert"]');
        const collaboratorList = document.querySelector('[data-testid="collaborator-list"]');
        
        return {
          hasError: !!errorAlert,
          errorText: errorAlert ? errorAlert.textContent : null,
          collaboratorAdded: collaboratorList ? collaboratorList.textContent.includes(testEmail) : false,
          collaboratorCount: document.querySelectorAll('[data-testid="collaborator-row"]').length
        };
      }, email);
      
      logger.info('➕ Collaborator Addition Result', { ...result, duration });
      
      // Take result screenshot
      await page.screenshot({ 
        path: \`debug-screenshots/collaborator-add-\${Date.now()}.png\`
      });
      
      return { ...result, duration };
      
    } catch (error) {
      logger.error('Collaborator addition debugging failed', { error: error.message });
      return { error: error.message };
    }
  }

  async cleanup() {
    try {
      await this.browserService?.close();
      logger.success('Debug session cleanup complete');
    } catch (error) {
      logger.error('Cleanup failed', { error: error.message });
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  const debugger = new SharingDebugger();
  
  try {
    await debugger.initialize();
    
    switch (command) {
      case 'page':
        await debugger.debugPageContent();
        break;
        
      case 'dialog':
        const deckId = args[1];
        if (!deckId) {
          console.error('Usage: node debug-utils.mjs dialog <deck-id>');
          process.exit(1);
        }
        await debugger.debugSharingDialog(deckId);
        break;
        
      case 'add':
        const addDeckId = args[1];
        const email = args[2];
        if (!addDeckId || !email) {
          console.error('Usage: node debug-utils.mjs add <deck-id> <email>');
          process.exit(1);
        }
        await debugger.debugCollaboratorAddition(addDeckId, email);
        break;
        
      case 'help':
      default:
        console.log(\`
🔍 Sharing System Debug Utilities

Usage: node debug-utils.mjs <command> [options]

Commands:
  page              Debug page content and authentication state
  dialog <deck-id>  Debug share dialog functionality
  add <deck-id> <email>  Debug collaborator addition process
  help              Show this help message

Examples:
  node debug-utils.mjs page
  node debug-utils.mjs dialog abc123
  node debug-utils.mjs add abc123 test@example.com
        \`);
        break;
    }
    
  } catch (error) {
    console.error('Debug utility failed:', error.message);
    process.exit(1);
  } finally {
    await debugger.cleanup();
  }
}

// Run CLI if this is the main module
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main();
}

export { SharingDebugger };
export default SharingDebugger;
`;
    
    const debugUtilPath = path.join(debugUtilsDir, 'sharing-debug-utils.mjs');
    await fs.writeFile(debugUtilPath, modernDebugScript);
    this.cleanupReport.keptFiles.push('scripts/debug-utils/sharing-debug-utils.mjs (new organized utility)');
    
    console.log('  ✅ Created organized debug utilities');
  }

  async cleanupOldLogs() {
    console.log('🧹 Cleaning up old log files...');
    
    // Clean up old deploy logs (keep only last 5)
    const deployLogDir = path.join(projectRoot, 'log', 'deploy');
    
    try {
      const files = await fs.readdir(deployLogDir);
      const logFiles = files.filter(f => f.startsWith('deploy-') && f.endsWith('.log'));
      
      // Sort by date (newest first)
      logFiles.sort().reverse();
      
      // Keep only the 5 most recent
      const filesToDelete = logFiles.slice(5);
      
      for (const file of filesToDelete) {
        const filePath = path.join(deployLogDir, file);
        await fs.unlink(filePath);
        this.cleanupReport.removedFiles.push(`log/deploy/${file}`);
        
        // Also remove associated .json and .raw.log files
        const baseName = file.replace('.log', '');
        const jsonFile = path.join(deployLogDir, `${baseName}.json`);
        const rawFile = path.join(deployLogDir, `${baseName}.raw.log`);
        
        try {
          await fs.unlink(jsonFile);
          this.cleanupReport.removedFiles.push(`log/deploy/${baseName}.json`);
        } catch (e) {}
        
        try {
          await fs.unlink(rawFile);
          this.cleanupReport.removedFiles.push(`log/deploy/${baseName}.raw.log`);
        } catch (e) {}
      }
      
      console.log(`  ✅ Cleaned up ${filesToDelete.length} old deploy log sets`);
      
    } catch (error) {
      this.cleanupReport.errors.push(`Deploy log cleanup failed: ${error.message}`);
    }
    
    // Clean up old MCP logs (keep only last 3)
    const logsDir = path.join(projectRoot, 'logs');
    
    try {
      const files = await fs.readdir(logsDir);
      const mcpLogs = files.filter(f => f.startsWith('mcp-puppeteer-') && f.endsWith('.log.gz'));
      
      // Sort and keep only latest 3
      mcpLogs.sort().reverse();
      const mcpToDelete = mcpLogs.slice(3);
      
      for (const file of mcpToDelete) {
        const filePath = path.join(logsDir, file);
        await fs.unlink(filePath);
        this.cleanupReport.removedFiles.push(`logs/${file}`);
      }
      
      console.log(`  ✅ Cleaned up ${mcpToDelete.length} old MCP logs`);
      
    } catch (error) {
      this.cleanupReport.errors.push(`MCP log cleanup failed: ${error.message}`);
    }
  }

  async createOrganizedStructure() {
    console.log('📁 Creating organized debug structure...');
    
    // Create debug screenshots directory
    const screenshotDir = path.join(projectRoot, 'debug-screenshots');
    await fs.mkdir(screenshotDir, { recursive: true });
    
    // Create .gitignore for debug screenshots
    const gitignoreContent = `# Debug screenshots - temporary files
*.png
*.jpg
*.jpeg
*.gif

# Keep directory but ignore contents
!.gitkeep
`;
    
    await fs.writeFile(path.join(screenshotDir, '.gitignore'), gitignoreContent);
    await fs.writeFile(path.join(screenshotDir, '.gitkeep'), '');
    
    // Create README for debug utilities
    const readmeContent = `# Debug Utilities

This directory contains organized debugging utilities for the sharing system.

## Scripts

- \`sharing-debug-utils.mjs\` - Modern consolidated debug utilities

## Usage

\`\`\`bash
# Debug page content
node scripts/debug-utils/sharing-debug-utils.mjs page

# Debug share dialog
node scripts/debug-utils/sharing-debug-utils.mjs dialog <deck-id>

# Debug collaborator addition
node scripts/debug-utils/sharing-debug-utils.mjs add <deck-id> <email>
\`\`\`

## Archive

Archived debug scripts can be found in \`scripts/archive/debug/\`.

## Screenshots

Debug screenshots are saved to \`debug-screenshots/\` and are automatically ignored by git.
`;
    
    await fs.writeFile(path.join(projectRoot, 'scripts', 'debug-utils', 'README.md'), readmeContent);
    
    console.log('  ✅ Created organized debug structure');
  }

  async generateCleanupReport() {
    console.log('📊 Generating cleanup report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        removedFiles: this.cleanupReport.removedFiles.length,
        movedFiles: this.cleanupReport.movedFiles.length,
        keptFiles: this.cleanupReport.keptFiles.length,
        errors: this.cleanupReport.errors.length
      },
      details: this.cleanupReport
    };
    
    const reportPath = path.join(projectRoot, 'debug-cleanup-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Cleanup Summary:');
    console.log(`  🗑️  Removed: ${report.summary.removedFiles} files`);
    console.log(`  📦 Moved: ${report.summary.movedFiles} files`);
    console.log(`  ✅ Kept/Created: ${report.summary.keptFiles} files`);
    console.log(`  ❌ Errors: ${report.summary.errors} issues`);
    
    if (this.cleanupReport.errors.length > 0) {
      console.log('\\n⚠️  Errors encountered:');
      this.cleanupReport.errors.forEach(error => console.log(`    ${error}`));
    }
    
    console.log(`\\n📄 Full report saved: debug-cleanup-report.json`);
  }
}

// Run cleanup if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const cleanup = new DebugCleanupManager();
  cleanup.run().catch(console.error);
}

export { DebugCleanupManager };
export default DebugCleanupManager;