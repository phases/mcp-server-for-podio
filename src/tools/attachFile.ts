/**
 * Attach File Tool
 * 
 * Attaches a file to an object (item, task, etc.)
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface AttachFileParams {
  fileId: number;
  refType: string;
  refId: number;
}

export interface AttachFileResult {
  success: boolean;
  fileId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Attach a file to an object
 * 
 * @param params - Attachment parameters
 * @returns Attachment result
 */
export async function attachFile(params: AttachFileParams): Promise<AttachFileResult> {
  const result = await callPodioApi('files-attach', {
    pathParams: { file_id: params.fileId },
    bodyParams: {
      ref_type: params.refType,
      ref_id: params.refId,
    },
  });

  return {
    success: result.success,
    fileId: params.fileId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

