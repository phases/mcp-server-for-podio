/**
 * List Subscriptions Tool
 * 
 * Retrieves subscriptions for an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListSubscriptionsParams {
  refType: string;
  refId: number;
}

export interface ListSubscriptionsResult {
  success: boolean;
  subscriptions?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List subscriptions for an object
 * 
 * @param params - Subscription parameters
 * @returns List of subscriptions
 */
export async function listSubscriptions(
  params: ListSubscriptionsParams
): Promise<ListSubscriptionsResult> {
  const result = await callPodioApi('subscriptions-list', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    subscriptions: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

