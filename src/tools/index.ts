import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getConsolidatedTools } from './consolidated.js';

/**
 * Register all available tools
 * Returns array of tool definitions for MCP server
 */
export async function registerTools(_server: any): Promise<Tool[]> {
  const tools: Tool[] = getConsolidatedTools();

  // Call Podio API tool remains separate for generic access
  tools.push({
    name: 'callPodioApi',
    description:
      'Call any Podio API endpoint from the catalog. Use getApiDetails to see available endpoints and their parameters. Example: "call the items-get endpoint with item_id 123"',
    inputSchema: {
      type: 'object',
      properties: {
        endpointId: {
          type: 'string',
          description:
            'The catalog endpoint ID (e.g., "items-get", "apps-list", "users-me"). Use getApiDetails to find endpoint IDs.',
        },
        pathParams: {
          type: 'object',
          description:
            'Path parameters as key-value pairs (e.g., { "item_id": 123, "app_id": 456 })',
          additionalProperties: {
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
        },
        queryParams: {
          type: 'object',
          description:
            'Query parameters as key-value pairs (e.g., { "limit": 10, "completed": true })',
          additionalProperties: {
            oneOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }],
          },
        },
        bodyParams: {
          type: 'object',
          description:
            'Body parameters for POST/PUT requests (e.g., { "fields": {...}, "text": "Task description" })',
          additionalProperties: true,
        },
        useAppAuth: {
          type: 'boolean',
          description:
            'Whether to use app-level authentication instead of organization-level (default: false)',
        },
        appId: {
          type: 'number',
          description: 'App ID for app-level authentication (required if useAppAuth is true)',
        },
        appToken: {
          type: 'string',
          description: 'App token for app-level authentication (required if useAppAuth is true)',
        },
      },
      required: ['endpointId'],
    },
  });

  return tools;
}
