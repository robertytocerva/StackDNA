type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && { context }),
  };
}

export function info(message: string, context?: Record<string, unknown>): void {
  const entry = formatLog('info', message, context);
  console.log(JSON.stringify(entry));
}

export function warn(message: string, context?: Record<string, unknown>): void {
  const entry = formatLog('warn', message, context);
  console.warn(JSON.stringify(entry));
}

export function error(message: string, context?: Record<string, unknown>): void {
  const entry = formatLog('error', message, context);
  console.error(JSON.stringify(entry));
}

export const logger = { info, warn, error };
