/**
 * Get Form Tool
 * 
 * Retrieves a form definition
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetFormResult {
  success: boolean;
  formId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a form definition
 * 
 * @param formId - The ID of the form
 * @returns Form data
 */
export async function getForm(formId: number): Promise<GetFormResult> {
  const result = await callPodioApi('forms-get', {
    pathParams: { form_id: formId },
  });

  return {
    success: result.success,
    formId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

