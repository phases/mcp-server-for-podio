/**
 * Get Organization Members Tool
 * 
 * Lists all members of an organization
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetOrganizationMembersResult {
  success: boolean;
  orgId: number;
  members?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * Get all members of an organization
 * 
 * @param orgId - The ID of the organization
 * @returns List of organization members
 */
export async function getOrganizationMembers(orgId: number): Promise<GetOrganizationMembersResult> {
  const result = await callPodioApi('orgs-members', {
    pathParams: { org_id: orgId },
  });

  return {
    success: result.success,
    orgId,
    members: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

