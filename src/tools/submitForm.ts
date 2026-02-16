/**
 * Submit Form Tool
 * 
 * Submits data to a form
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface SubmitFormParams {
  formId: number;
  fields: Record<string, unknown>;
}

export interface SubmitFormResult {
  success: boolean;
  itemId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Submit data to a form
 * 
 * @param params - Form submission parameters
 * @returns Submission result
 */
export async function submitForm(params: SubmitFormParams): Promise<SubmitFormResult> {
  const result = await callPodioApi('forms-submit', {
    pathParams: { form_id: params.formId },
    bodyParams: {
      fields: params.fields,
    },
  });

  return {
    success: result.success,
    itemId: (result.data as { item_id?: number })?.item_id,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

