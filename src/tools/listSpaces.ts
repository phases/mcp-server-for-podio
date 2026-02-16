/**
 * List Spaces Tool
 * 
 * Lists all spaces accessible to the authenticated user
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListSpacesParams {
  orgId?: number;
}

export interface ListSpacesResult {
  success: boolean;
  spaces?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List spaces
 * 
 * @param params - Filter parameters
 * @returns List of spaces
 */
export async function listSpaces(params: ListSpacesParams = {}): Promise<ListSpacesResult> {
  const queryParams: Record<string, number | undefined> = {};
  if (params.orgId !== undefined) {
    queryParams.org_id = params.orgId;
  }

  const result = await callPodioApi('spaces-list', {
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    spaces: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

