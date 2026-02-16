/**
 * List API Groups Tool
 * 
 * Returns all available API groups from the Podio API catalog.
 * This is the first API catalog browsing tool.
 */

import { loadCatalogIndex } from '../lib/catalogLoader.js';

export interface ApiGroupInfo {
  id: string;
  name: string;
  description: string;
  endpointCount: number;
}

export interface ListApiGroupsResult {
  groups: ApiGroupInfo[];
  total: number;
  catalogVersion: string;
  lastUpdated: string;
}

/**
 * List all available API groups from the catalog
 * 
 * @returns Array of API group information
 */
export async function listApiGroups(): Promise<ListApiGroupsResult> {
  try {
    const index = loadCatalogIndex();

    const groups: ApiGroupInfo[] = index.groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description,
      endpointCount: group.endpointCount || 0,
    }));

    return {
      groups,
      total: groups.length,
      catalogVersion: index.version || 'unknown',
      lastUpdated: index.lastUpdated || 'unknown',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to list API groups: ${errorMessage}`);
  }
}

