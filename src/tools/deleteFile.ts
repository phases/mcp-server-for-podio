/**
 * Delete File Tool
 * 
 * Deletes a file
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface DeleteFileResult {
  success: boolean;
  fileId: number;
  error?: string;
  statusCode?: number;
}

/**
 * Delete a file
 * 
 * @param fileId - The ID of the file to delete
 * @returns Deletion result
 */
export async function deleteFile(fileId: number): Promise<DeleteFileResult> {
  const result = await callPodioApi('files-delete', {
    pathParams: { file_id: fileId },
  });

  return {
    success: result.success,
    fileId,
    error: result.error,
    statusCode: result.statusCode,
  };
}

