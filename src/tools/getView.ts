/**
 * Get View Tool
 * 
 * Retrieves a view definition
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetViewResult {
  success: boolean;
  viewId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a view definition
 * 
 * @param viewId - The ID of the view
 * @returns View data
 */
export async function getView(viewId: number): Promise<GetViewResult> {
  const result = await callPodioApi('views-get', {
    pathParams: { view_id: viewId },
  });

  return {
    success: result.success,
    viewId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

