/**
 * Dev Server Manager for E2E Tests
 * 
 * Automatically starts and manages the Vite dev server for E2E testing.
 * Features:
 * - Smart detection of existing dev servers
 * - Auto-start with PID tracking
 * - Graceful cleanup
 * - Cross-platform support
 */

import { spawn, ChildProcess } from 'node:child_process'
import { once } from 'node:events'

interface DevServerInfo {
  url: string
  port: number
  pid?: number
  weStarted: boolean
}

let devServerProcess: ChildProcess | null = null
let serverInfo: DevServerInfo | null = null

const DEFAULT_PORT = 5174
const STARTUP_TIMEOUT_MS = 60000 // 60 seconds for server startup
const PROBE_INTERVAL_MS = 500 // Check every 500ms
const SHUTDOWN_TIMEOUT_MS = 5000 // 5 seconds for graceful shutdown

/**
 * Check if dev server is already running on specified port
 */
async function isDevServerRunning(port: number = DEFAULT_PORT): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(2000)
    })
    // Any response (even errors) means something is listening
    return true
  } catch (error) {
    // Connection refused or timeout = not running
    return false
  }
}

/**
 * Wait for dev server to become responsive
 */
async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const startTime = Date.now()
  const port = new URL(url).port || '80'
  
  while (Date.now() - startTime < timeoutMs) {
    if (await isDevServerRunning(Number(port))) {
      console.log(`✅ Dev server is ready at ${url}`)
      return
    }
    await new Promise(resolve => setTimeout(resolve, PROBE_INTERVAL_MS))
  }
  
  throw new Error(`Dev server failed to start within ${timeoutMs}ms`)
}

/**
 * Get platform-specific kill command for display
 */
function getKillCommand(pid: number): string {
  return process.platform === 'win32' 
    ? `taskkill /F /PID ${pid}`
    : `kill ${pid}`
}

/**
 * Start dev server in detached mode
 */
async function startDevServer(port: number): Promise<DevServerInfo> {
  const url = `http://127.0.0.1:${port}`
  
  console.log('🚀 Starting dev server...')
  console.log(`   Port: ${port}`)
  console.log(`   URL: ${url}`)
  
  // Spawn detached process
  devServerProcess = spawn('npm', ['run', 'dev'], {
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  })
  
  const pid = devServerProcess.pid!
  
  console.log(`✅ Dev server process started`)
  console.log(`📍 PID: ${pid}`)
  console.log(`⚠️  If tests hang, kill with: ${getKillCommand(pid)}`)
  
  // Handle unexpected process exit
  devServerProcess.on('exit', (code, signal) => {
    if (serverInfo?.weStarted) {
      console.log(`⚠️  Dev server exited unexpectedly (code: ${code}, signal: ${signal})`)
    }
  })
  
  // Capture output for debugging (but don't block)
  devServerProcess.stdout?.on('data', (data) => {
    const output = data.toString()
    // Only log important lines
    if (output.includes('Local:') || output.includes('ready in')) {
      console.log(`   ${output.trim()}`)
    }
  })
  
  devServerProcess.stderr?.on('data', (data) => {
    console.error(`   [dev server error] ${data.toString().trim()}`)
  })
  
  // Wait for server to be ready
  try {
    await waitForServer(url, STARTUP_TIMEOUT_MS)
  } catch (error) {
    // Startup failed, cleanup and re-throw
    await cleanupDevServer()
    throw error
  }
  
  return {
    url,
    port,
    pid,
    weStarted: true
  }
}

/**
 * Ensure dev server is running, starting it if necessary
 * Returns the dev server URL
 */
export async function ensureDevServer(port: number = DEFAULT_PORT): Promise<string> {
  // Return cached info if already set up
  if (serverInfo) {
    return serverInfo.url
  }
  
  const url = `http://127.0.0.1:${port}`
  
  // Check if server is already running
  if (await isDevServerRunning(port)) {
    console.log('✅ Dev server already running')
    console.log(`🌐 URL: ${url}`)
    
    serverInfo = {
      url,
      port,
      weStarted: false
    }
    
    return url
  }
  
  // Server not running, start it
  serverInfo = await startDevServer(port)
  
  // Register cleanup handlers
  registerCleanupHandlers()
  
  return serverInfo.url
}

/**
 * Cleanup dev server if we started it
 */
export async function cleanupDevServer(): Promise<void> {
  if (!serverInfo?.weStarted || !devServerProcess) {
    // We didn't start it, don't touch it
    return
  }
  
  const pid = devServerProcess.pid
  console.log(`🧹 Shutting down auto-started dev server (PID: ${pid})...`)
  
  try {
    // Try graceful shutdown first
    devServerProcess.kill('SIGTERM')
    
    // Wait for process to exit
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Shutdown timeout')), SHUTDOWN_TIMEOUT_MS)
    )
    
    const exitPromise = once(devServerProcess, 'exit')
    
    try {
      await Promise.race([exitPromise, timeout])
      console.log('✅ Dev server stopped gracefully')
    } catch {
      // Graceful shutdown failed, force kill
      console.log('⚠️  Force killing dev server...')
      devServerProcess.kill('SIGKILL')
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('✅ Dev server force stopped')
    }
  } catch (error) {
    console.error('⚠️  Failed to stop dev server:', (error as Error).message)
    console.error(`   You may need to manually kill PID: ${pid}`)
    console.error(`   Command: ${getKillCommand(pid!)}`)
  } finally {
    devServerProcess = null
    serverInfo = null
  }
}

/**
 * Register cleanup handlers for various exit scenarios
 */
function registerCleanupHandlers(): void {
  // Normal exit
  process.on('exit', () => {
    if (devServerProcess && !devServerProcess.killed) {
      // Synchronous kill on exit
      try {
        devServerProcess.kill('SIGKILL')
      } catch {}
    }
  })
  
  // Ctrl+C
  process.on('SIGINT', async () => {
    await cleanupDevServer()
    process.exit(130) // Standard exit code for SIGINT
  })
  
  // Kill signal
  process.on('SIGTERM', async () => {
    await cleanupDevServer()
    process.exit(143) // Standard exit code for SIGTERM
  })
  
  // Unhandled rejections
  process.on('unhandledRejection', async (reason) => {
    console.error('Unhandled rejection:', reason)
    await cleanupDevServer()
    process.exit(1)
  })
  
  // Uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error)
    await cleanupDevServer()
    process.exit(1)
  })
}

/**
 * Get current dev server info (for debugging)
 */
export function getDevServerInfo(): DevServerInfo | null {
  return serverInfo
}
