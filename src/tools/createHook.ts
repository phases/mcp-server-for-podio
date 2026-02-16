/**
 * Create Hook Tool
 * 
 * Creates a webhook for an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateHookParams {
  refType: string;
  refId: number;
  url: string;
  type: string;
}

export interface CreateHookResult {
  success: boolean;
  hookId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a webhook
 * 
 * @param params - Hook creation parameters
 * @returns Created hook data
 */
export async function createHook(params: CreateHookParams): Promise<CreateHookResult> {
  const result = await callPodioApi('hooks-create', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
    bodyParams: {
      url: params.url,
      type: params.type,
    },
  });

  return {
    success: result.success,
    hookId: (result.data as { hook_id?: number })?.hook_id,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

