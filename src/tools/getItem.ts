/**
 * Get Item Tool
 * 
 * Retrieves a single item by ID from a Podio app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetItemParams {
  itemId: number;
  fields?: string;
  appId?: number;
  appToken?: string;
}

export interface GetItemResult {
  success: boolean;
  itemId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a Podio item by ID
 * 
 * @param params - Item retrieval parameters
 * @returns Item data
 */
export async function getItem(params: GetItemParams | number, fields?: string): Promise<GetItemResult> {
  // Support both old signature (itemId, fields) and new signature (params object)
  let itemId: number;
  let appId: number | undefined;
  let appToken: string | undefined;
  let fieldsParam: string | undefined;

  if (typeof params === 'number') {
    // Legacy signature
    itemId = params;
    fieldsParam = fields;
  } else {
    // New signature
    itemId = params.itemId;
    fieldsParam = params.fields;
    appId = params.appId;
    appToken = params.appToken;
  }

  const result = await callPodioApi(
    'items-get',
    {
      pathParams: { item_id: itemId },
      queryParams: fieldsParam ? { fields: fieldsParam } : undefined,
    },
    undefined, // Auto-detect auth
    appId,
    appToken
  );

  return {
    success: result.success,
    itemId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

