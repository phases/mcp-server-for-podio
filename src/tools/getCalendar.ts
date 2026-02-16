/**
 * Get Calendar Tool
 * 
 * Retrieves calendar events
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetCalendarParams {
  dateFrom?: string;
  dateTo?: string;
  spaceId?: number;
}

export interface GetCalendarResult {
  success: boolean;
  events?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * Get calendar events
 * 
 * @param params - Calendar parameters
 * @returns Calendar events
 */
export async function getCalendar(params: GetCalendarParams = {}): Promise<GetCalendarResult> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params.dateFrom) {
    queryParams.date_from = params.dateFrom;
  }
  if (params.dateTo) {
    queryParams.date_to = params.dateTo;
  }
  if (params.spaceId !== undefined) {
    queryParams.space_id = params.spaceId;
  }

  const result = await callPodioApi('calendar-get', {
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    events: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

