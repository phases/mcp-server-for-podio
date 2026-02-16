/**
 * List Views Tool
 * 
 * Retrieves all views for an app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListViewsResult {
  success: boolean;
  appId: number;
  views?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all views for an app
 * 
 * @param appId - The ID of the app
 * @returns List of views
 */
export async function listViews(appId: number): Promise<ListViewsResult> {
  const result = await callPodioApi('views-list', {
    pathParams: { app_id: appId },
  });

  return {
    success: result.success,
    appId,
    views: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

