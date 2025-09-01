import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

class TestLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    // Use absolute path to log/temp directory
    this.logDir = join(process.cwd(), 'log', 'temp');
    this.logFile = join(this.logDir, 'test-debug.log');
    
    // Ensure log directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
    
    // Clear log file at start
    this.clear();
  }

  clear() {
    try {
      writeFileSync(this.logFile, '');
    } catch (error) {
      // Ignore errors if file doesn't exist
    }
  }

  log(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = data 
      ? `[${timestamp}] ${message}: ${JSON.stringify(data, null, 2)}\n`
      : `[${timestamp}] ${message}\n`;
    
    try {
      appendFileSync(this.logFile, logEntry);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  error(message: string, error?: any) {
    const timestamp = new Date().toISOString();
    const errorInfo = error ? {
      message: error.message,
      stack: error.stack,
      code: error.code,
      ...error
    } : {};
    
    const logEntry = `[${timestamp}] ERROR: ${message}: ${JSON.stringify(errorInfo, null, 2)}\n`;
    
    try {
      appendFileSync(this.logFile, logEntry);
    } catch (err) {
      console.error('Failed to write error to log file:', err);
    }
  }

  debug(context: string, data: any) {
    this.log(`DEBUG [${context}]`, data);
  }

  getLogPath(): string {
    return this.logFile;
  }
}

// Export singleton instance
export const testLogger = new TestLogger();
