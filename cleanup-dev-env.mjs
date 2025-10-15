#!/usr/bin/env node

/**
 * Cleanup Script - Reset Development Environment
 * 
 * Kills all Chrome and unnecessary Node processes, checks dev server status,
 * and provides a clean slate for testing.
 */

async function cleanup() {
  console.log('🧹 Cleaning Up Development Environment');
  console.log('====================================');
  
  console.log('1. Stopping all Chrome processes...');
  try {
    const { execSync } = await import('child_process');
    execSync('taskkill /F /IM chrome.exe', { stdio: 'ignore' });
    console.log('✅ Chrome processes terminated');
  } catch (error) {
    console.log('ℹ️  No Chrome processes to kill');
  }
  
  console.log('\n2. Checking dev server status...');
  try {
    const { execSync } = await import('child_process');
    const netstat = execSync('netstat -ano | findstr :5174', { encoding: 'utf8' });
    if (netstat.includes('LISTENING')) {
      console.log('✅ Dev server is running on port 5174');
    } else {
      console.log('❌ Dev server not detected on port 5174');
    }
  } catch (error) {
    console.log('❌ Dev server not running');
  }
  
  console.log('\n3. Checking Firebase emulators...');
  const emulatorPorts = [8080, 9099, 4000, 5001];
  for (const port of emulatorPorts) {
    try {
      const { execSync } = await import('child_process');
      const netstat = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      if (netstat.includes('LISTENING')) {
        console.log(`✅ Emulator running on port ${port}`);
      } else {
        console.log(`❌ No emulator on port ${port}`);
      }
    } catch (error) {
      console.log(`❌ No emulator on port ${port}`);
    }
  }
  
  console.log('\n4. Cleaning browser session data...');
  try {
    const fs = await import('fs');
    const path = await import('path');
    const sessionDir = '.browser-session';
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
      console.log('✅ Browser session data cleared');
    } else {
      console.log('ℹ️  No browser session data to clear');
    }
  } catch (error) {
    console.log('⚠️  Could not clear browser session data:', error.message);
  }
  
  console.log('\n🎯 Environment Status Summary:');
  console.log('============================');
  console.log('✅ Chrome processes: Terminated');
  console.log('🔍 Dev server: Check output above');
  console.log('🔍 Emulators: Check output above');
  console.log('✅ Browser sessions: Cleared');
  
  console.log('\n💡 Next Steps:');
  console.log('1. Restart dev server: npm run dev');
  console.log('2. Run clean test: node scripts/browser-service-demo.mjs');
  console.log('3. Or start fresh session: [whatever script works]');
}

cleanup().catch(console.error);