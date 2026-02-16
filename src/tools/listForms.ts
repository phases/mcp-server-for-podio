/**
 * List Forms Tool
 * 
 * Retrieves all forms for an app
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListFormsResult {
  success: boolean;
  appId: number;
  forms?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List all forms for an app
 * 
 * @param appId - The ID of the app
 * @returns List of forms
 */
export async function listForms(appId: number): Promise<ListFormsResult> {
  const result = await callPodioApi('forms-list', {
    pathParams: { app_id: appId },
  });

  return {
    success: result.success,
    appId,
    forms: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

