/**
 * Create Comment Tool
 * 
 * Adds a comment to an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateCommentParams {
  value: string;
  externalId?: string;
}

export interface CreateCommentResult {
  success: boolean;
  refType: string;
  refId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Add a comment to an object
 * 
 * @param refType - Object type: "item", "task", "status", etc.
 * @param refId - The ID of the object
 * @param params - Comment parameters
 * @returns Created comment data
 */
export async function createComment(
  refType: string,
  refId: number,
  params: CreateCommentParams
): Promise<CreateCommentResult> {
  const bodyParams: Record<string, unknown> = {
    value: params.value,
  };

  if (params.externalId) {
    bodyParams.external_id = params.externalId;
  }

  const result = await callPodioApi('comments-create', {
    pathParams: { ref_type: refType, ref_id: refId },
    bodyParams,
  });

  return {
    success: result.success,
    refType,
    refId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

