/**
 * Mark All Notifications Viewed Tool
 * 
 * Marks all notifications as viewed
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface MarkAllNotificationsViewedResult {
  success: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Mark all notifications as viewed
 * 
 * @returns Result
 */
export async function markAllNotificationsViewed(): Promise<MarkAllNotificationsViewedResult> {
  const result = await callPodioApi('notifications-mark-all-viewed', {});

  return {
    success: result.success,
    error: result.error,
    statusCode: result.statusCode,
  };
}

