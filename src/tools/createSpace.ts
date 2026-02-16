/**
 * Create Space Tool
 * 
 * Creates a new space
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateSpaceParams {
  name: string;
  orgId: number;
  privacy: 'open' | 'closed';
}

export interface CreateSpaceResult {
  success: boolean;
  spaceId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a new space
 * 
 * @param params - Space creation parameters
 * @returns Created space data
 */
export async function createSpace(params: CreateSpaceParams): Promise<CreateSpaceResult> {
  const result = await callPodioApi('spaces-create', {
    bodyParams: {
      name: params.name,
      org_id: params.orgId,
      privacy: params.privacy,
    },
  });

  return {
    success: result.success,
    spaceId: (result.data as { space_id?: number })?.space_id,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

