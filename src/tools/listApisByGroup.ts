/**
 * List APIs By Group Tool
 * 
 * Returns all API endpoints for a specific group from the Podio API catalog.
 * Allows filtering APIs by group name or ID.
 */

import { findGroupByIdOrName } from '../lib/catalogLoader.js';
import { ApiEndpoint } from '../types/api-catalog.js';

export interface ApiEndpointInfo {
  id: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  rateLimit: {
    limit: number;
    window: string;
  };
}

export interface ListApisByGroupResult {
  groupId: string;
  groupName: string;
  endpoints: ApiEndpointInfo[];
  total: number;
  message?: string;
}

/**
 * List all API endpoints for a specific group
 * 
 * @param group - Group name or ID (case-insensitive)
 * @returns Array of endpoints for the specified group
 */
export async function listApisByGroup(group: string): Promise<ListApisByGroupResult> {
  if (!group || typeof group !== 'string' || group.trim() === '') {
    throw new Error('Group parameter is required and must be a non-empty string');
  }

  try {
    const normalizedGroup = group.toLowerCase().trim();

    // Find the group by ID or name (case-insensitive)
    const foundGroup = findGroupByIdOrName(normalizedGroup);

    // If group not found, return empty array (as per requirements)
    if (!foundGroup) {
      return {
        groupId: normalizedGroup,
        groupName: group,
        endpoints: [],
        total: 0,
        message: `No API group found matching "${group}". Use listApiGroups to see available groups.`,
      };
    }

    // Extract endpoint information
    const endpoints: ApiEndpointInfo[] = ((foundGroup.endpoints || []) as ApiEndpoint[]).map(
      (endpoint) => ({
        id: endpoint.id,
        method: endpoint.method,
        path: endpoint.path,
        summary: endpoint.summary,
        description: endpoint.description,
        rateLimit: endpoint.rateLimit,
      })
    );

    return {
      groupId: foundGroup.id,
      groupName: foundGroup.name,
      endpoints,
      total: endpoints.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list APIs by group: ${errorMessage}`);
  }
}

