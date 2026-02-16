/**
 * Call Podio API Tool
 * 
 * Generic tool for calling any Podio API endpoint from the catalog
 */

import { callPodioApi, ApiCallParams } from '../lib/apiCaller.js';

export interface CallPodioApiResult {
  endpointId: string;
  success: boolean;
  statusCode: number;
  data: unknown;
  error?: string;
}

/**
 * Call a Podio API endpoint
 * 
 * @param endpointId - The catalog endpoint ID (e.g., "items-get", "apps-list")
 * @param pathParams - Path parameters (e.g., { item_id: 123 })
 * @param queryParams - Query parameters (e.g., { limit: 10 })
 * @param bodyParams - Body parameters for POST/PUT requests
 * @param useAppAuth - Whether to use app-level authentication (requires appId and appToken)
 * @param appId - App ID for app-level authentication
 * @param appToken - App token for app-level authentication
 * @returns API call result
 */
export async function callPodioApiTool(
  endpointId: string,
  pathParams?: Record<string, string | number>,
  queryParams?: Record<string, string | number | boolean | undefined>,
  bodyParams?: Record<string, unknown>,
  useAppAuth = false,
  appId?: number,
  appToken?: string
): Promise<CallPodioApiResult> {
  const params: ApiCallParams = {
    pathParams,
    queryParams,
    bodyParams,
  };

  const result = await callPodioApi(endpointId, params, useAppAuth, appId, appToken);

  return {
    endpointId,
    success: result.success,
    statusCode: result.statusCode,
    data: result.data,
    error: result.error,
  };
}

