/**
 * Ping Tool
 * 
 * Simple health check tool that returns "pong"
 * Used to verify MCP server connection and functionality
 */

export async function pingTool(): Promise<string> {
  return 'pong';
}

