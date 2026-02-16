/**
 * Delete Tags Tool
 * 
 * Removes tags from an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteTagsParams {
  refType: string;
  refId: number;
  text: string[];
}

export interface DeleteTagsResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Remove tags from an object
 * 
 * @param params - Tag parameters
 * @returns Tag deletion result
 */
export async function deleteTags(params: DeleteTagsParams): Promise<DeleteTagsResult> {
  const result = await callPodioApi('tags-delete', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
    bodyParams: {
      text: params.text,
    },
  });

  return {
    success: result.success,
    error: result.error,
    statusCode: result.statusCode,
  };
}

