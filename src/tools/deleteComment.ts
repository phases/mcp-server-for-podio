/**
 * Delete Comment Tool
 * 
 * Deletes a comment
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteCommentResult {
  success: boolean;
  commentId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Delete a comment
 * 
 * @param commentId - The ID of the comment
 * @returns Deletion result
 */
export async function deleteComment(commentId: number): Promise<DeleteCommentResult> {
  const result = await callPodioApi('comments-delete', { pathParams: { comment_id: commentId } });

  return {
    success: result.success,
    commentId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

