/**
 * Delete Hook Tool
 * 
 * Deletes a webhook
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteHookResult {
  success: boolean;
  hookId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Delete a webhook
 * 
 * @param hookId - The ID of the hook
 * @returns Deletion result
 */
export async function deleteHook(hookId: number): Promise<DeleteHookResult> {
  const result = await callPodioApi('hooks-delete', {
    pathParams: { hook_id: hookId },
  });

  return {
    success: result.success,
    hookId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

