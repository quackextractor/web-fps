/**
 * Centralized logging utility that enforces timestamped, structured log output.
 */

type LogLevel = "INFO" | "WARN" | "ERROR";

function formatMessage(level: LogLevel, message: string): string {
    return `[${new Date().toISOString()}] [${level}] ${message}`;
}

export const logger = {
    info(message: string, ...args: unknown[]): void {
        console.log(formatMessage("INFO", message), ...args);
    },
    warn(message: string, ...args: unknown[]): void {
        console.warn(formatMessage("WARN", message), ...args);
    },
    error(message: string, ...args: unknown[]): void {
        console.error(formatMessage("ERROR", message), ...args);
    },
};
