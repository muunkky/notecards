/**
 * Structured Logger for Browser Automation Framework
 * 
 * Provides consistent, structured logging across all automation scripts.
 * Supports different log levels and structured output format.
 */

import config from './config.mjs';

class Logger {
  constructor(context = 'automation') {
    this.context = context;
    this.level = config.logging.level;
    this.structured = config.logging.structured;
    this.startTime = Date.now();
  }

  _log(level, message, data = {}) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    const currentLevel = levels[this.level] || 1;
    const messageLevel = levels[level] || 1;

    if (messageLevel < currentLevel) return;

    const timestamp = new Date().toISOString();
    const elapsed = Date.now() - this.startTime;

    if (this.structured) {
      const logEntry = {
        timestamp,
        level: level.toUpperCase(),
        context: this.context,
        elapsed: `${elapsed}ms`,
        message,
        ...data
      };
      
      const icon = this._getIcon(level);
      console.log(`${icon} ${JSON.stringify(logEntry, null, 2)}`);
    } else {
      const icon = this._getIcon(level);
      const prefix = `${icon} [${level.toUpperCase()}] ${this.context}`;
      console.log(`${prefix}: ${message}`, data);
    }
  }

  _getIcon(level) {
    const icons = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️', 
      error: '❌'
    };
    return icons[level] || 'ℹ️';
  }

  debug(message, data) {
    this._log('debug', message, data);
  }

  info(message, data) {
    this._log('info', message, data);
  }

  warn(message, data) {
    this._log('warn', message, data);
  }

  error(message, data) {
    this._log('error', message, data);
  }

  // Specialized logging methods for common automation scenarios
  step(stepNumber, description, data = {}) {
    this.info(`Step ${stepNumber}: ${description}`, data);
  }

  success(message, data = {}) {
    this.info(`✅ ${message}`, data);
  }

  failure(message, data = {}) {
    this.error(`❌ ${message}`, data);
  }

  timer(label) {
    const startTime = Date.now();
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.info(`⏱️ ${label} completed`, { duration: `${duration}ms` });
        return duration;
      }
    };
  }

  screenshot(filename, description = '') {
    this.info(`📸 Screenshot captured: ${filename}`, { description });
  }

  test(testName, status, details = {}) {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏸️';
    this.info(`${icon} Test: ${testName}`, { status, ...details });
  }

  authentication(step, status, details = {}) {
    const icon = status === 'success' ? '🔑' : status === 'failure' ? '🚫' : '🔄';
    this.info(`${icon} Auth ${step}`, { status, ...details });
  }

  browser(action, details = {}) {
    this.info(`🌐 Browser: ${action}`, details);
  }

  performance(metric, value, unit = 'ms') {
    this.info(`📊 Performance: ${metric}`, { value, unit });
  }
}

// Factory function to create logger with context
export function createLogger(context) {
  return new Logger(context);
}

// Default logger instance
export const logger = new Logger();

export default logger;