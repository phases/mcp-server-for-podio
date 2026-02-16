/**
 * Get Task Tool
 * 
 * Retrieves a task by ID
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface GetTaskResult {
  success: boolean;
  taskId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Get a task by ID
 * 
 * @param taskId - The ID of the task
 * @returns Task data
 */
export async function getTask(taskId: number): Promise<GetTaskResult> {
  const result = await callPodioApi('tasks-get', { pathParams: { task_id: taskId } });

  return {
    success: result.success,
    taskId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

