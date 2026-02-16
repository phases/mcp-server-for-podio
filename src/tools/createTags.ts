/**
 * Create Tags Tool
 * 
 * Adds tags to an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateTagsParams {
  refType: string;
  refId: number;
  text: string[];
}

export interface CreateTagsResult {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Add tags to an object
 * 
 * @param params - Tag parameters
 * @returns Tag creation result
 */
export async function createTags(params: CreateTagsParams): Promise<CreateTagsResult> {
  const result = await callPodioApi('tags-create', {
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
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

