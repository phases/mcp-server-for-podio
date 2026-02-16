/**
 * Update Task Tool
 * 
 * Updates an existing task
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface UpdateTaskParams {
  text?: string;
  status?: 'active' | 'completed';
  dueOn?: string;
}

export interface UpdateTaskResult {
  success: boolean;
  taskId: number;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Update a task
 * 
 * @param taskId - The ID of the task
 * @param params - Update parameters
 * @returns Updated task data
 */
export async function updateTask(
  taskId: number,
  params: UpdateTaskParams
): Promise<UpdateTaskResult> {
  const bodyParams: Record<string, unknown> = {};

  if (params.text) {
    bodyParams.text = params.text;
  }
  if (params.status) {
    bodyParams.status = params.status;
  }
  if (params.dueOn) {
    bodyParams.due_on = params.dueOn;
  }

  const result = await callPodioApi('tasks-update', {
    pathParams: { task_id: taskId },
    bodyParams,
  });

  return {
    success: result.success,
    taskId,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

