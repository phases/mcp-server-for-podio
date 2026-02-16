/**
 * Get App Stream Tool
 * 
 * Retrieves the activity stream for an app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetAppStreamParams {
  appId: number;
  limit?: number;
}

export interface GetAppStreamResult {
  success: boolean;
  appId: number;
  activities?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get the activity stream for an app
 * 
 * @param params - Stream parameters
 * @returns Activity stream data
 */
export async function getAppStream(params: GetAppStreamParams): Promise<GetAppStreamResult> {
  const queryParams: Record<string, number | undefined> = {};
  if (params.limit !== undefined) {
    queryParams.limit = params.limit;
  }

  const result = await callPodioApi('stream-app', {
    pathParams: { app_id: params.appId },
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    appId: params.appId,
    activities: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

