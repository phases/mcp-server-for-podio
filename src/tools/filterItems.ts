/**
 * Filter Items Tool
 * 
 * Filters items in a Podio app based on criteria
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface FilterItemsParams {
  filters?: Array<Record<string, unknown>>;
  sortBy?: string;
  sortDesc?: boolean;
  limit?: number;
  offset?: number;
}

export interface FilterItemsResult {
  success: boolean;
  appId: number;
  data?: {
    items?: unknown[];
    filtered?: number;
    total?: number;
  };
  error?: string;
  statusCode?: number;
}

/**
 * Filter items in a Podio app
 * 
 * @param appId - The ID of the app
 * @param params - Filter parameters
 * @returns Filtered items
 */
export async function filterItems(
  appId: number,
  params: FilterItemsParams = {}
): Promise<FilterItemsResult> {
  const bodyParams: Record<string, unknown> = {};

  if (params.filters) {
    bodyParams.filters = params.filters;
  }
  if (params.sortBy) {
    bodyParams.sort_by = params.sortBy;
  }
  if (params.sortDesc !== undefined) {
    bodyParams.sort_desc = params.sortDesc;
  }
  if (params.limit !== undefined) {
    bodyParams.limit = params.limit;
  }
  if (params.offset !== undefined) {
    bodyParams.offset = params.offset;
  }

  const result = await callPodioApi('items-filter', {
    pathParams: { app_id: appId },
    bodyParams,
  });

  return {
    success: result.success,
    appId,
    data: result.data as FilterItemsResult['data'],
    error: result.error,
    statusCode: result.statusCode,
  };
}

