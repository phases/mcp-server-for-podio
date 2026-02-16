/**
 * Create Item Tool
 * 
 * Creates a new item in a Podio app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateItemParams {
  fields: Record<string, unknown>;
  tags?: string[];
  fileIds?: number[];
  externalId?: string;
  appToken?: string;
  hooks?: boolean; // Enable webhooks/triggers (default: false in Podio API)
}

export interface CreateItemResult {
  success: boolean;
  appId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a new item in a Podio app
 * 
 * @param appId - The ID of the app
 * @param params - Item creation parameters
 * @returns Created item data
 */
export async function createItem(
  appId: number,
  params: CreateItemParams
): Promise<CreateItemResult> {
  const bodyParams: Record<string, unknown> = {
    fields: params.fields,
  };

  if (params.tags) {
    bodyParams.tags = params.tags;
  }
  if (params.fileIds) {
    bodyParams.file_ids = params.fileIds;
  }
  if (params.externalId) {
    bodyParams.external_id = params.externalId;
  }

  // Build query parameters
  // Default to true (enable hooks) unless explicitly set to false
  const queryParams: Record<string, boolean> = {};
  const enableHooks = params.hooks !== undefined ? params.hooks : true;
  queryParams.hook = enableHooks; // Podio uses 'hook' (singular) as query param

  const result = await callPodioApi(
    'items-create',
    {
      pathParams: { app_id: appId },
      queryParams,
      bodyParams,
    },
    undefined, // Auto-detect auth (will use app auth for items-create)
    appId,
    params.appToken
  );

  return {
    success: result.success,
    appId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

