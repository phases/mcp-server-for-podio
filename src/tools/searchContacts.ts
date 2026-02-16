/**
 * Search Contacts Tool
 * 
 * Searches for contacts
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface SearchContactsParams {
  query: string;
  limit?: number;
}

export interface SearchContactsResult {
  success: boolean;
  results?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Search contacts
 * 
 * @param params - Search parameters
 * @returns Search results
 */
export async function searchContacts(params: SearchContactsParams): Promise<SearchContactsResult> {
  const queryParams: Record<string, string | number> = {
    query: params.query,
  };
  if (params.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  const result = await callPodioApi('contacts-search', {
    queryParams,
  });

  return {
    success: result.success,
    results: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

