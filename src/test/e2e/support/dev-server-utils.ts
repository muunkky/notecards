import { execSync } from 'child_process';

/**
 * Development Server Utilities
 * 
 * Utilities to check if dev server is running and get the correct port
 */

/**
 * Check if a port is in use
 */
async function isPortInUse(port: number): Promise<boolean> {
  try {
    // Use native fetch (Node.js 18+) or fallback to HTTP check
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`http://localhost:${port}`, { 
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status !== undefined;
  } catch (error) {
    // If fetch fails, try TCP connection check
    try {
      const net = await import('net');
      return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(1000);
        socket.on('connect', () => {
          socket.destroy();
          resolve(true);
        });
        
        socket.on('timeout', () => {
          socket.destroy();
          resolve(false);
        });
        
        socket.on('error', () => {
          resolve(false);
        });
        
        socket.connect(port, 'localhost');
      });
    } catch (netError) {
      return false;
    }
  }
}

/**
 * Find the active development server port
 */
export async function findDevServerPort(): Promise<number | null> {
  const commonPorts = [5174, 5173, 3000, 4173, 8080, 5000]; // 5174 first (from vite.config.ts)
  
  for (const port of commonPorts) {
    if (await isPortInUse(port)) {
      console.log(`?o. Found dev server on port ${port}`);
      return port;
    }
  }
  
  return null;
}

/**
 * Get the development server URL
 */
export async function getDevServerUrl(): Promise<string> {
  const port = await findDevServerPort();
  
  if (!port) {
    throw new Error('Development server not running. Please start it with: npm run dev');
  }
  
  return `http://localhost:${port}`;
}

/**
 * Check if npm run dev is running
 */
export function isDevServerRunning(): boolean {
  try {
    // Check for common dev server processes
    const processes = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV', { 
      encoding: 'utf8',
      timeout: 5000 
    });
    
    // Look for vite, dev-server, or similar in process list
    const hasDevProcess = processes.includes('vite') || 
                         processes.includes('dev') || 
                         processes.includes('serve');
    
    return hasDevProcess;
  } catch (error) {
    // If we can't check processes, fall back to port check
    return false;
  }
}

/**
 * Ensure dev server is running before tests
 */
export async function ensureDevServer(): Promise<string> {
  console.log('dY"? Checking for development server...');
  
  const url = await getDevServerUrl().catch(() => null);
  
  if (!url) {
    console.log('??O Development server not found');
    console.log('');
    console.log('dYs? To start the development server:');
    console.log('   npm run dev');
    console.log('');
    console.log('Then run your tests again.');
    throw new Error('Development server required for E2E tests');
  }
  
  console.log(`?o. Development server running at: ${url}`);
  return url;
}

