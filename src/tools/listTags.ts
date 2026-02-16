/**
 * List Tags Tool
 * 
 * Retrieves tags for an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListTagsParams {
  refType: string;
  refId: number;
}

export interface ListTagsResult {
  success: boolean;
  tags?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List tags for an object
 * 
 * @param params - Tag parameters
 * @returns List of tags
 */
export async function listTags(params: ListTagsParams): Promise<ListTagsResult> {
  const result = await callPodioApi('tags-list', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    tags: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

