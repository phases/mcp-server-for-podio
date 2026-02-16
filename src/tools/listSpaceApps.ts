/**
 * List Space Apps Tool
 * 
 * Lists all apps in a space
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListSpaceAppsResult {
  success: boolean;
  spaceId: number;
  apps?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all apps in a space
 * 
 * @param spaceId - The ID of the space
 * @returns List of apps in the space
 */
export async function listSpaceApps(spaceId: number): Promise<ListSpaceAppsResult> {
  const result = await callPodioApi('spaces-apps', {
    pathParams: { space_id: spaceId },
  });

  return {
    success: result.success,
    spaceId,
    apps: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

