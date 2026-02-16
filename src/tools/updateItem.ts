/**
 * Update Item Tool
 * 
 * Updates an existing item in a Podio app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface UpdateItemParams {
  fields?: Record<string, unknown>;
  tags?: string[];
}

export interface UpdateItemResult {
  success: boolean;
  itemId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Update an existing item
 * 
 * @param itemId - The ID of the item to update
 * @param params - Update parameters
 * @returns Updated item data
 */
export async function updateItem(
  itemId: number,
  params: UpdateItemParams
): Promise<UpdateItemResult> {
  const bodyParams: Record<string, unknown> = {};

  if (params.fields) {
    bodyParams.fields = params.fields;
  }
  if (params.tags) {
    bodyParams.tags = params.tags;
  }

  const result = await callPodioApi('items-update', {
    pathParams: { item_id: itemId },
    bodyParams,
  });

  return {
    success: result.success,
    itemId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

