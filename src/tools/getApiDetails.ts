/**
 * Get API Details Tool
 * 
 * Returns detailed information about a specific API endpoint by its ID.
 * Searches across all groups in the catalog to find the endpoint.
 */

import { loadAllGroups } from '../lib/catalogLoader.js';
import { ApiEndpoint } from '../types/api-catalog.js';

export interface ApiDetails {
  id: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  params: {
    path: Record<string, { type: string; required: boolean; description: string }>;
    query: Record<string, { type: string; required: boolean; description: string }>;
    body: Record<string, { type: string; required: boolean; description: string }>;
  };
  rateLimit: {
    limit: number;
    window: string;
  };
  responseFormat?: string;
  group: {
    id: string;
    name: string;
  };
}

export interface GetApiDetailsResult {
  endpoint: ApiDetails | null;
  found: boolean;
  message?: string;
}

/**
 * Get detailed information about a specific API endpoint
 * 
 * @param apiId - The ID of the API endpoint (e.g., "items-get", "apps-create")
 * @returns Detailed endpoint information
 */
export async function getApiDetails(apiId: string): Promise<GetApiDetailsResult> {
  if (!apiId || typeof apiId !== 'string' || apiId.trim() === '') {
    throw new Error('API ID parameter is required and must be a non-empty string');
  }

  try {
    const groups = loadAllGroups();
    const normalizedApiId = apiId.trim();

    // Search through all groups to find the endpoint
    let foundEndpoint: ApiEndpoint | null = null;
    let foundGroup = null;

    for (const group of groups) {
      if (group.endpoints && Array.isArray(group.endpoints)) {
        foundEndpoint = (group.endpoints as ApiEndpoint[]).find(
          (endpoint) => endpoint.id === normalizedApiId
        ) || null;
        if (foundEndpoint) {
          foundGroup = group;
          break;
        }
      }
    }

    // If endpoint not found, return clear error message
    if (!foundEndpoint || !foundGroup) {
      return {
        endpoint: null,
        found: false,
        message: `API endpoint with ID "${apiId}" not found in catalog. Use listApiGroups and listApisByGroup to browse available endpoints.`,
      };
    }

    // Build detailed response
    const details: ApiDetails = {
      id: foundEndpoint.id,
      method: foundEndpoint.method,
      path: foundEndpoint.path,
      summary: foundEndpoint.summary,
      description: foundEndpoint.description,
      params: {
        path: foundEndpoint.params?.path || {},
        query: foundEndpoint.params?.query || {},
        body: foundEndpoint.params?.body || {},
      },
      rateLimit: foundEndpoint.rateLimit,
      responseFormat: (foundEndpoint as any).responseFormat,
      group: {
        id: foundGroup.id,
        name: foundGroup.name,
      },
    };

    return {
      endpoint: details,
      found: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get API details: ${errorMessage}`);
  }
}

