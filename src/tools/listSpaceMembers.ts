/**
 * List Space Members Tool
 * 
 * Lists all members of a space
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListSpaceMembersResult {
  success: boolean;
  spaceId: number;
  members?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all members of a space
 * 
 * @param spaceId - The ID of the space
 * @returns List of space members
 */
export async function listSpaceMembers(spaceId: number): Promise<ListSpaceMembersResult> {
  const result = await callPodioApi('spaces-members', {
    pathParams: { space_id: spaceId },
  });

  return {
    success: result.success,
    spaceId,
    members: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

