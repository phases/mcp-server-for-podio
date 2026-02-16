/**
 * Create Subscription Tool
 * 
 * Subscribes to an object
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateSubscriptionParams {
  refType: string;
  refId: number;
}

export interface CreateSubscriptionResult {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Subscribe to an object
 * 
 * @param params - Subscription parameters
 * @returns Subscription result
 */
export async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResult> {
  const result = await callPodioApi('subscriptions-create', {
    pathParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

