/**
 * Get File Tool
 * 
 * Retrieves file information
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetFileResult {
  success: boolean;
  fileId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get file information
 * 
 * @param fileId - The ID of the file
 * @returns File data
 */
export async function getFile(fileId: number): Promise<GetFileResult> {
  const result = await callPodioApi('files-get', {
    pathParams: { file_id: fileId },
  });

  return {
    success: result.success,
    fileId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

