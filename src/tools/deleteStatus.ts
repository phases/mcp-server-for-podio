/**
 * Delete Status Tool
 * 
 * Deletes a status message
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteStatusResult {
  success: boolean;
  statusId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Delete a status message
 * 
 * @param statusId - The ID of the status to delete
 * @returns Deletion result
 */
export async function deleteStatus(statusId: number): Promise<DeleteStatusResult> {
  const result = await callPodioApi('status-delete', {
    pathParams: { status_id: statusId },
  });

  return {
    success: result.success,
    statusId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

