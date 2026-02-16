/**
 * Execute Batch Tool
 * 
 * Executes multiple API calls in a single request
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface BatchItem {
  method: string;
  url: string;
  body?: unknown;
}

export interface ExecuteBatchParams {
  items: BatchItem[];
}

export interface ExecuteBatchResult {
  success: boolean;
  results?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * Execute a batch of API calls
 * 
 * @param params - Batch execution parameters
 * @returns Batch execution results
 */
export async function executeBatch(params: ExecuteBatchParams): Promise<ExecuteBatchResult> {
  const result = await callPodioApi('batch-execute', {
    bodyParams: {
      items: params.items,
    },
  });

  return {
    success: result.success,
    results: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

