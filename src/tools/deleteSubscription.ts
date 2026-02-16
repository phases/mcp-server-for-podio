/**
 * Delete Subscription Tool
 * 
 * Unsubscribes from an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteSubscriptionParams {
  refType: string;
  refId: number;
}

export interface DeleteSubscriptionResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Unsubscribe from an object
 * 
 * @param params - Subscription parameters
 * @returns Unsubscription result
 */
export async function deleteSubscription(
  params: DeleteSubscriptionParams
): Promise<DeleteSubscriptionResult> {
  const result = await callPodioApi('subscriptions-delete', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    error: result.error,
    statusCode: result.statusCode,
  };
}

