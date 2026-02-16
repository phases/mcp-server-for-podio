/**
 * Complete Task Tool
 * 
 * Marks a task as completed
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CompleteTaskResult {
  success: boolean;
  taskId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Mark a task as completed
 * 
 * @param taskId - The ID of the task
 * @returns Task completion result
 */
export async function completeTask(taskId: number): Promise<CompleteTaskResult> {
  const result = await callPodioApi('tasks-complete', { pathParams: { task_id: taskId }, bodyParams: {} });

  return {
    success: result.success,
    taskId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

