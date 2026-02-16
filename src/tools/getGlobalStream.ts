/**
 * Get Global Stream Tool
 * 
 * Retrieves the global activity stream
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetGlobalStreamParams {
  limit?: number;
  offset?: number;
}

export interface GetGlobalStreamResult {
  success: boolean;
  activities?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * Get the global activity stream
 * 
 * @param params - Stream parameters
 * @returns Activity stream data
 */
export async function getGlobalStream(
  params: GetGlobalStreamParams = {}
): Promise<GetGlobalStreamResult> {
  const queryParams: Record<string, number | undefined> = {};
  if (params.limit !== undefined) {
    queryParams.limit = params.limit;
  }
  if (params.offset !== undefined) {
    queryParams.offset = params.offset;
  }

  const result = await callPodioApi('stream-global', {
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    activities: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

