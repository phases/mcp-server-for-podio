/**
 * Verify Hook Tool
 * 
 * Verifies a webhook
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface VerifyHookResult {
  success: boolean;
  hookId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Verify a webhook
 * 
 * @param hookId - The ID of the hook
 * @returns Verification result
 */
export async function verifyHook(hookId: number): Promise<VerifyHookResult> {
  const result = await callPodioApi('hooks-verify', {
    pathParams: { hook_id: hookId },
  });

  return {
    success: result.success,
    hookId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

