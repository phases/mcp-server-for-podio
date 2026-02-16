/**
 * Get User Status Tool
 * 
 * Retrieves the status of the authenticated user
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetUserStatusResult {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get current user status
 * 
 * @returns User status data
 */
export async function getUserStatus(): Promise<GetUserStatusResult> {
  const result = await callPodioApi('users-status', {});

  return {
    success: result.success,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

