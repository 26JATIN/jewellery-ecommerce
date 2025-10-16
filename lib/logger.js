/**
 * Centralized Logging Utility
 * Provides consistent logging across the application with environment-aware behavior
 * In production: Only errors and warnings are logged
 * In development: All log levels are shown
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// Log levels
const LogLevel = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
};

class Logger {
    constructor(context = '') {
        this.context = context;
    }

    /**
     * Format log message with context and timestamp
     */
    _formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const contextStr = this.context ? `[${this.context}]` : '';
        const prefix = `${timestamp} ${level.toUpperCase()} ${contextStr}`;
        
        if (data !== undefined) {
            return `${prefix} ${message}`;
        }
        return `${prefix} ${message}`;
    }

    /**
     * Log error messages (always logged in all environments)
     */
    error(message, error = null) {
        const formatted = this._formatMessage(LogLevel.ERROR, message);
        console.error(formatted);
        if (error) {
            if (error.stack && isDevelopment) {
                console.error(error.stack);
            } else if (error.message) {
                console.error('Error details:', error.message);
            } else {
                console.error('Error details:', error);
            }
        }
    }

    /**
     * Log warning messages (always logged in all environments)
     */
    warn(message, data = null) {
        const formatted = this._formatMessage(LogLevel.WARN, message);
        console.warn(formatted);
        if (data && isDevelopment) {
            console.warn('Data:', data);
        }
    }

    /**
     * Log informational messages (only in development)
     */
    info(message, data = null) {
        if (!isDevelopment) return;
        
        const formatted = this._formatMessage(LogLevel.INFO, message);
        console.log(formatted);
        if (data !== null && data !== undefined) {
            console.log('Data:', data);
        }
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message, data = null) {
        if (!isDevelopment) return;
        
        const formatted = this._formatMessage(LogLevel.DEBUG, message);
        console.log(formatted);
        if (data !== null && data !== undefined) {
            console.log('Debug data:', data);
        }
    }

    /**
     * Log success messages (only in development)
     */
    success(message, data = null) {
        if (!isDevelopment) return;
        
        const formatted = this._formatMessage(LogLevel.INFO, `✅ ${message}`);
        console.log(formatted);
        if (data !== null && data !== undefined) {
            console.log('Data:', data);
        }
    }
}

/**
 * Create a logger instance for a specific context
 * @param {string} context - Context name (e.g., 'AuthService', 'ProductAPI')
 * @returns {Logger} Logger instance
 */
export function createLogger(context) {
    return new Logger(context);
}

// Default logger instance
export const logger = new Logger();

// Export for convenience
export default logger;
