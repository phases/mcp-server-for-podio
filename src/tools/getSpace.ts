/**
 * Get Space Tool
 * 
 * Retrieves a single space by ID
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetSpaceResult {
  success: boolean;
  spaceId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a Podio space by ID
 * 
 * @param spaceId - The ID of the space to retrieve
 * @returns Space data
 */
export async function getSpace(spaceId: number): Promise<GetSpaceResult> {
  const result = await callPodioApi('spaces-get', {
    pathParams: { space_id: spaceId },
  });

  return {
    success: result.success,
    spaceId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

