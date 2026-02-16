/**
 * Create Status Tool
 * 
 * Creates a status message in a space
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateStatusParams {
  spaceId: number;
  value: string;
  fileIds?: number[];
}

export interface CreateStatusResult {
  success: boolean;
  statusId?: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a status message
 * 
 * @param params - Status creation parameters
 * @returns Created status data
 */
export async function createStatus(params: CreateStatusParams): Promise<CreateStatusResult> {
  const bodyParams: Record<string, unknown> = {
    value: params.value,
  };
  if (params.fileIds && params.fileIds.length > 0) {
    bodyParams.file_ids = params.fileIds;
  }

  const result = await callPodioApi('status-create', {
    pathParams: { space_id: params.spaceId },
    bodyParams,
  });

  return {
    success: result.success,
    statusId: (result.data as { status_id?: number })?.status_id,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

