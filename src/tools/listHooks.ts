/**
 * List Hooks Tool
 * 
 * Retrieves all webhooks for an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListHooksParams {
  refType: string;
  refId: number;
}

export interface ListHooksResult {
  success: boolean;
  hooks?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all webhooks for an object
 * 
 * @param params - Hook parameters
 * @returns List of webhooks
 */
export async function listHooks(params: ListHooksParams): Promise<ListHooksResult> {
  const result = await callPodioApi('hooks-list', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    hooks: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

