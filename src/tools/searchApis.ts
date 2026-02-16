/**
 * Search APIs Tool
 * 
 * Searches the Podio API catalog by keyword across endpoint IDs, paths, and summaries.
 * Performs case-insensitive search and returns matching endpoints.
 */

import { loadAllGroups } from '../lib/catalogLoader.js';
import { ApiEndpoint } from '../types/api-catalog.js';

export interface SearchResultEndpoint {
  id: string;
  method: string;
  path: string;
  summary: string;
  group: {
    id: string;
    name: string;
  };
}

export interface SearchApisResult {
  keyword: string;
  matches: SearchResultEndpoint[];
  total: number;
  searchedFields: string[];
}

/**
 * Search API catalog by keyword
 * 
 * Searches across endpoint id, path, and summary fields (case-insensitive).
 * 
 * @param keyword - Search keyword
 * @returns Matching endpoints
 */
export async function searchApis(keyword: string): Promise<SearchApisResult> {
  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    throw new Error('Keyword parameter is required and must be a non-empty string');
  }

  try {
    const groups = loadAllGroups();
    const normalizedKeyword = keyword.toLowerCase().trim();
    const matches: SearchResultEndpoint[] = [];

    // Search through all groups and endpoints
    for (const group of groups) {
      if (group.endpoints && Array.isArray(group.endpoints)) {
        for (const endpoint of group.endpoints as ApiEndpoint[]) {
          // Search in id, path, and summary fields (case-insensitive)
          const idMatch = endpoint.id.toLowerCase().includes(normalizedKeyword);
          const pathMatch = endpoint.path.toLowerCase().includes(normalizedKeyword);
          const summaryMatch = endpoint.summary.toLowerCase().includes(normalizedKeyword);

          if (idMatch || pathMatch || summaryMatch) {
            matches.push({
              id: endpoint.id,
              method: endpoint.method,
              path: endpoint.path,
              summary: endpoint.summary,
              group: {
                id: group.id,
                name: group.name,
              },
            });
          }
        }
      }
    }

    return {
      keyword: keyword.trim(),
      matches,
      total: matches.length,
      searchedFields: ['id', 'path', 'summary'],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to search APIs: ${errorMessage}`);
  }
}

