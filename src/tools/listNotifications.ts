/**
 * List Notifications Tool
 * 
 * Retrieves notifications for the authenticated user
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListNotificationsParams {
  viewed?: boolean;
  starred?: boolean;
}

export interface ListNotificationsResult {
  success: boolean;
  notifications?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List notifications
 * 
 * @param params - Filter parameters
 * @returns List of notifications
 */
export async function listNotifications(
  params: ListNotificationsParams = {}
): Promise<ListNotificationsResult> {
  const queryParams: Record<string, boolean | undefined> = {};
  if (params.viewed !== undefined) {
    queryParams.viewed = params.viewed;
  }
  if (params.starred !== undefined) {
    queryParams.starred = params.starred;
  }

  const result = await callPodioApi('notifications-list', {
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    notifications: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

