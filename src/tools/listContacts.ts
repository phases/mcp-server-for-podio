/**
 * List Contacts Tool
 * 
 * Lists contacts, optionally filtered
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListContactsParams {
  spaceId?: number;
  orgId?: number;
}

export interface ListContactsResult {
  success: boolean;
  contacts?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List contacts
 * 
 * @param params - Filter parameters
 * @returns List of contacts
 */
export async function listContacts(params: ListContactsParams = {}): Promise<ListContactsResult> {
  const queryParams: Record<string, number | undefined> = {};
  if (params.spaceId !== undefined) {
    queryParams.space_id = params.spaceId;
  }
  if (params.orgId !== undefined) {
    queryParams.org_id = params.orgId;
  }

  const result = await callPodioApi('contacts-list', {
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  return {
    success: result.success,
    contacts: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

