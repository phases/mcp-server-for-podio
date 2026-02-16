/**
 * Get Status Tool
 * 
 * Retrieves a status message
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetStatusResult {
  success: boolean;
  statusId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a status message
 * 
 * @param statusId - The ID of the status
 * @returns Status data
 */
export async function getStatus(statusId: number): Promise<GetStatusResult> {
  const result = await callPodioApi('status-get', {
    pathParams: { status_id: statusId },
  });

  return {
    success: result.success,
    statusId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

