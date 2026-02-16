/**
 * Delete Item Tool
 * 
 * Deletes an item from a Podio app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteItemParams {
  itemId: number;
  appId?: number;
  appToken?: string;
}

export interface DeleteItemResult {
  success: boolean;
  itemId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Delete an item
 * 
 * @param params - Delete parameters
 * @returns Deletion result
 */
export async function deleteItem(params: DeleteItemParams): Promise<DeleteItemResult> {
  // Explicitly use app auth if appId and appToken are provided
  const useAppAuth = params.appId !== undefined && params.appToken !== undefined;
  
  const result = await callPodioApi(
    'items-delete',
    { pathParams: { item_id: params.itemId } },
    useAppAuth ? true : undefined, // Use app auth if credentials provided
    params.appId,
    params.appToken
  );

  return {
    success: result.success,
    itemId: params.itemId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

