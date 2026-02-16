/**
 * Get App Tool
 * 
 * Retrieves app definition by ID
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetAppResult {
  success: boolean;
  appId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a Podio app definition
 * 
 * @param appId - The ID of the app
 * @returns App definition
 */
export async function getApp(appId: number): Promise<GetAppResult> {
  const result = await callPodioApi('apps-get', { pathParams: { app_id: appId } });

  return {
    success: result.success,
    appId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

