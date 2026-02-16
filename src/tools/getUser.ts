/**
 * Get User Tool
 * 
 * Retrieves user information
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetUserResult {
  success: boolean;
  userId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get user information
 * 
 * @param userId - The ID of the user (optional, if not provided gets current user profile)
 * @returns User data
 */
export async function getUser(userId?: number): Promise<GetUserResult> {
  if (userId) {
    const result = await callPodioApi('users-get', { pathParams: { user_id: userId } });
    return {
      success: result.success,
      userId,
      data: result.data,
      error: result.error,
      statusCode: result.statusCode,
    };
  } else {
    // Get current user profile
    const result = await callPodioApi('users-profile', {});
    return {
      success: result.success,
      data: result.data,
      error: result.error,
      statusCode: result.statusCode,
    };
  }
}

