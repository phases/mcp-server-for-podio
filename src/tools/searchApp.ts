/**
 * Search App Tool
 * 
 * Searches for items within a specific app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface SearchAppParams {
  appId: number;
  query: string;
  limit?: number;
}

export interface SearchAppResult {
  success: boolean;
  results?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Search within an app
 * 
 * @param params - Search parameters
 * @returns Search results
 */
export async function searchApp(params: SearchAppParams): Promise<SearchAppResult> {
  const bodyParams: Record<string, string | number> = {
    query: params.query,
  };
  if (params.limit !== undefined) {
    bodyParams.limit = params.limit;
  }

  const result = await callPodioApi('search-app', {
    pathParams: { app_id: params.appId },
    bodyParams,
  });

  return {
    success: result.success,
    results: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

