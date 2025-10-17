#!/usr/bin/env node

/**
 * Screenshot Cleanup Utility
 * 
 * Manages test screenshot files with options for cleanup and retention
 */

import { promises as fs } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = './screenshots';
const MAX_AGE_DAYS = 7; // Keep screenshots for 7 days
const MAX_FILES = 50;   // Keep maximum 50 files

async function getScreenshotFiles() {
  try {
    const files = await fs.readdir(SCREENSHOTS_DIR);
    const screenshots = [];
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        const filepath = join(SCREENSHOTS_DIR, file);
        const stats = await fs.stat(filepath);
        screenshots.push({
          name: file,
          path: filepath,
          created: stats.birthtime,
          size: stats.size
        });
      }
    }
    
    return screenshots.sort((a, b) => b.created - a.created);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('📁 Screenshots directory does not exist');
      return [];
    }
    throw error;
  }
}

async function cleanupOldScreenshots() {
  console.log('🧹 Cleaning up old screenshots...');
  
  const screenshots = await getScreenshotFiles();
  
  if (screenshots.length === 0) {
    console.log('📁 No screenshots found');
    return;
  }
  
  console.log(`📊 Found ${screenshots.length} screenshot files`);
  
  const now = new Date();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000; // Convert to milliseconds
  
  let deletedCount = 0;
  let deletedSize = 0;
  
  // Delete by age
  for (const screenshot of screenshots) {
    const age = now - screenshot.created;
    if (age > maxAge) {
      await fs.unlink(screenshot.path);
      deletedCount++;
      deletedSize += screenshot.size;
      console.log(`🗑️  Deleted (age): ${screenshot.name}`);
    }
  }
  
  // Delete excess files (keep newest)
  const remaining = screenshots.filter(s => {
    const age = now - s.created;
    return age <= maxAge;
  });
  
  if (remaining.length > MAX_FILES) {
    const toDelete = remaining.slice(MAX_FILES);
    for (const screenshot of toDelete) {
      await fs.unlink(screenshot.path);
      deletedCount++;
      deletedSize += screenshot.size;
      console.log(`🗑️  Deleted (excess): ${screenshot.name}`);
    }
  }
  
  if (deletedCount > 0) {
    const sizeMB = (deletedSize / 1024 / 1024).toFixed(2);
    console.log(`✅ Cleanup complete: ${deletedCount} files deleted, ${sizeMB}MB freed`);
  } else {
    console.log('✅ No cleanup needed');
  }
  
  const finalCount = screenshots.length - deletedCount;
  console.log(`📊 Screenshots remaining: ${finalCount}`);
}

async function listScreenshots() {
  console.log('📋 Screenshot Inventory:');
  console.log('========================');
  
  const screenshots = await getScreenshotFiles();
  
  if (screenshots.length === 0) {
    console.log('📁 No screenshots found');
    return;
  }
  
  let totalSize = 0;
  
  screenshots.forEach((screenshot, index) => {
    const sizeMB = (screenshot.size / 1024 / 1024).toFixed(2);
    const age = Math.floor((Date.now() - screenshot.created) / (24 * 60 * 60 * 1000));
    
    console.log(`${index + 1}. ${screenshot.name}`);
    console.log(`   📅 Created: ${screenshot.created.toISOString()}`);
    console.log(`   📏 Size: ${sizeMB}MB`);
    console.log(`   📆 Age: ${age} days`);
    console.log('');
    
    totalSize += screenshot.size;
  });
  
  const totalMB = (totalSize / 1024 / 1024).toFixed(2);
  console.log(`📊 Total: ${screenshots.length} files, ${totalMB}MB`);
}

async function clearAllScreenshots() {
  console.log('🧹 Clearing ALL screenshots...');
  
  const screenshots = await getScreenshotFiles();
  
  if (screenshots.length === 0) {
    console.log('📁 No screenshots to clear');
    return;
  }
  
  let deletedCount = 0;
  let deletedSize = 0;
  
  for (const screenshot of screenshots) {
    await fs.unlink(screenshot.path);
    deletedCount++;
    deletedSize += screenshot.size;
  }
  
  const sizeMB = (deletedSize / 1024 / 1024).toFixed(2);
  console.log(`✅ Cleared ${deletedCount} files, ${sizeMB}MB freed`);
}

// CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'cleanup':
    case 'clean':
      await cleanupOldScreenshots();
      break;
      
    case 'list':
    case 'ls':
      await listScreenshots();
      break;
      
    case 'clear':
    case 'purge':
      await clearAllScreenshots();
      break;
      
    default:
      console.log('📸 Screenshot Management Utility');
      console.log('================================');
      console.log('');
      console.log('Usage: node scripts/screenshot-cleanup.mjs <command>');
      console.log('');
      console.log('Commands:');
      console.log('  cleanup, clean  - Remove old screenshots (>7 days) and excess files');
      console.log('  list, ls        - List all screenshots with details');
      console.log('  clear, purge    - Remove ALL screenshots');
      console.log('');
      console.log('Configuration:');
      console.log(`  Max age: ${MAX_AGE_DAYS} days`);
      console.log(`  Max files: ${MAX_FILES}`);
      break;
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  main().catch(console.error);
}

export { cleanupOldScreenshots, listScreenshots, clearAllScreenshots };
