/**
 * List Apps Tool
 * 
 * Lists all apps accessible to the authenticated user
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListAppsResult {
  success: boolean;
  apps?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all accessible apps
 * 
 * @param spaceId - Optional space ID to filter apps
 * @returns List of apps
 */
export async function listApps(spaceId?: number): Promise<ListAppsResult> {
  const result = await callPodioApi('apps-list', {
    queryParams: spaceId ? { space_id: spaceId } : undefined,
  });

  return {
    success: result.success,
    apps: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

