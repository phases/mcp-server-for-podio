/**
 * Search Tool
 * 
 * Searches across Podio for items, tasks, statuses, etc.
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface SearchParams {
  query: string;
  refType?: string;
  limit?: number;
}

export interface SearchResult {
  success: boolean;
  results?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Search across Podio
 * 
 * @param params - Search parameters
 * @returns Search results
 */
export async function search(params: SearchParams): Promise<SearchResult> {
  const queryParams: Record<string, string | number> = {
    query: params.query,
  };
  if (params.refType) {
    queryParams.ref_type = params.refType;
  }
  if (params.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  const result = await callPodioApi('search-query', {
    queryParams,
  });

  return {
    success: result.success,
    results: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

