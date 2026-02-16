/**
 * Get Contact Tool
 * 
 * Retrieves contact information
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetContactResult {
  success: boolean;
  contactId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get contact information
 * 
 * @param contactId - The ID of the contact
 * @returns Contact data
 */
export async function getContact(contactId: number): Promise<GetContactResult> {
  const result = await callPodioApi('contacts-get', {
    pathParams: { contact_id: contactId },
  });

  return {
    success: result.success,
    contactId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

