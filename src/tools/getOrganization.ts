/**
 * Get Organization Tool
 * 
 * Retrieves a single organization by ID
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetOrganizationResult {
  success: boolean;
  orgId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a Podio organization by ID
 * 
 * @param orgId - The ID of the organization to retrieve
 * @returns Organization data
 */
export async function getOrganization(orgId: number): Promise<GetOrganizationResult> {
  const result = await callPodioApi('orgs-get', {
    pathParams: { org_id: orgId },
  });

  return {
    success: result.success,
    orgId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

