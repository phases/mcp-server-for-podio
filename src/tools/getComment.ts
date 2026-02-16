/**
 * Get Comment Tool
 * 
 * Retrieves a comment by ID
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetCommentResult {
  success: boolean;
  commentId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a comment by ID
 * 
 * @param commentId - The ID of the comment
 * @returns Comment data
 */
export async function getComment(commentId: number): Promise<GetCommentResult> {
  const result = await callPodioApi('comments-get', { pathParams: { comment_id: commentId } });

  return {
    success: result.success,
    commentId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

