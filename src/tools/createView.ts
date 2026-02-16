/**
 * Create View Tool
 * 
 * Creates a new view for an app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateViewParams {
  appId: number;
  name: string;
  type: string;
  filters?: Record<string, unknown>;
}

export interface CreateViewResult {
  success: boolean;
  viewId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a new view
 * 
 * @param params - View creation parameters
 * @returns Created view data
 */
export async function createView(params: CreateViewParams): Promise<CreateViewResult> {
  const bodyParams: Record<string, unknown> = {
    name: params.name,
    type: params.type,
  };
  if (params.filters) {
    bodyParams.filters = params.filters;
  }

  const result = await callPodioApi('views-create', {
    pathParams: { app_id: params.appId },
    bodyParams,
  });

  return {
    success: result.success,
    viewId: (result.data as { view_id?: number })?.view_id,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

