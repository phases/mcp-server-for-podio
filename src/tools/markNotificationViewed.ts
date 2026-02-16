/**
 * Mark Notification Viewed Tool
 * 
 * Marks a notification as viewed
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface MarkNotificationViewedResult {
  success: boolean;
  notificationId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Mark a notification as viewed
 * 
 * @param notificationId - The ID of the notification
 * @returns Result
 */
export async function markNotificationViewed(
  notificationId: number
): Promise<MarkNotificationViewedResult> {
  const result = await callPodioApi('notifications-mark-viewed', {
    pathParams: { notification_id: notificationId },
  });

  return {
    success: result.success,
    notificationId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

