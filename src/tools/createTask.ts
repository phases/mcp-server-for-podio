/**
 * Create Task Tool
 * 
 * Creates a new task
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface CreateTaskParams {
  text: string;
  dueOn?: string;
  responsible?: number;
  private?: boolean;
  refType?: string;
  refId?: number;
}

export interface CreateTaskResult {
  success: boolean;
  data?: unknown;
  error?: string;
  statusCode?: number;
}

/**
 * Create a new task
 * 
 * @param params - Task creation parameters
 * @returns Created task data
 */
export async function createTask(params: CreateTaskParams): Promise<CreateTaskResult> {
  const bodyParams: Record<string, unknown> = {
    text: params.text,
  };

  if (params.dueOn) {
    bodyParams.due_on = params.dueOn;
  }
  if (params.responsible !== undefined) {
    bodyParams.responsible = params.responsible;
  }
  if (params.private !== undefined) {
    bodyParams.private = params.private;
  }
  if (params.refType) {
    bodyParams.ref_type = params.refType;
  }
  if (params.refId !== undefined) {
    bodyParams.ref_id = params.refId;
  }

  const result = await callPodioApi('tasks-create', { bodyParams });

  return {
    success: result.success,
    data: result.data,
    error: result.error,
    statusCode: result.statusCode,
  };
}

