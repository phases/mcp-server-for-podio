/**
 * List Comments Tool
 * 
 * Lists comments for an object (item, task, status, etc.)
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListCommentsResult {
  success: boolean;
  refType: string;
  refId: number;
  comments?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List comments for an object
 * 
 * @param refType - Object type: "item", "task", "status", etc.
 * @param refId - The ID of the object
 * @returns List of comments
 */
export async function listComments(refType: string, refId: number): Promise<ListCommentsResult> {
  const result = await callPodioApi('comments-list', {
    pathParams: { ref_type: refType, ref_id: refId },
  });

  return {
    success: result.success,
    refType,
    refId,
    comments: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

