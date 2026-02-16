/**
 * Error handling utilities
 */

export class MCPError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

export class PodioError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly podioError?: unknown
  ) {
    super(message);
    this.name = 'PodioError';
  }
}

/**
 * Format error for MCP response
 * Ensures no sensitive data is exposed
 */
export function formatError(error: unknown): string {
  if (error instanceof MCPError || error instanceof PodioError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose stack traces or sensitive information
    return error.message;
  }

  return 'An unknown error occurred';
}

/**
 * Check if error message contains sensitive data
 */
export function containsSensitiveData(message: string): boolean {
  const sensitivePatterns = [
    /token/i,
    /password/i,
    /secret/i,
    /key/i,
    /credential/i,
  ];

  return sensitivePatterns.some((pattern) => pattern.test(message));
}

/**
 * Sanitize error message to remove sensitive data
 */
export function sanitizeErrorMessage(message: string): string {
  if (containsSensitiveData(message)) {
    return 'An error occurred. Please check your configuration.';
  }
  return message;
}

