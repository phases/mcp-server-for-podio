/**
 * Get Space Stream Tool
 * 
 * Retrieves the activity stream for a space
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetSpaceStreamParams {
  spaceId: number;
  limit?: number;
}

export interface GetSpaceStreamResult {
  success: boolean;
  spaceId: number;
  activities?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get the activity stream for a space
 * 
 * @param params - Stream parameters
 * @returns Activity stream data
 */
export async function getSpaceStream(params: GetSpaceStreamParams): Promise<GetSpaceStreamResult> {
  const queryParams: Record<string, number | undefined> = {};
  if (params.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  const result = await callPodioApi('stream-space', {
    pathParams: { space_id: params.spaceId },
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    spaceId: params.spaceId,
    activities: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

