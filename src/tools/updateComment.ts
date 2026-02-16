/**
 * Update Comment Tool
 * 
 * Updates a comment
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface UpdateCommentResult {
  success: boolean;
  commentId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Update a comment
 * 
 * @param commentId - The ID of the comment
 * @param value - Updated comment text
 * @returns Updated comment data
 */
export async function updateComment(commentId: number, value: string): Promise<UpdateCommentResult> {
  const result = await callPodioApi('comments-update', {
    pathParams: { comment_id: commentId },
    bodyParams: { value },
  });

  return {
    success: result.success,
    commentId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

