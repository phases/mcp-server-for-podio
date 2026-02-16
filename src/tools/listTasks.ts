/**
 * List Tasks Tool
 * 
 * Lists tasks with optional filters
 */

import { callPodioApi } from '../lib/apiCaller.js';

export interface ListTasksParams {
  responsible?: number;
  spaceId?: number;
  appId?: number;
  orgId?: number;
  refType?: string;
  refId?: number;
  createdBy?: number;
  completedBy?: number;
  completed?: boolean;
}

export interface ListTasksResult {
  success: boolean;
  tasks?: unknown[];
  error?: string;
  statusCode?: number;
}

/**
 * List tasks
 * 
 * @param params - Filter parameters
 * @returns List of tasks
 */
export async function listTasks(params: ListTasksParams = {}): Promise<ListTasksResult> {
  const queryParams: Record<string, string | number | boolean | undefined> = {};

  // Podio API requires at least one filter parameter
  if (params.responsible !== undefined) {
    queryParams.responsible = params.responsible;
  }
  if (params.spaceId !== undefined) {
    queryParams.space_id = params.spaceId;
  }
  if (params.appId !== undefined) {
    queryParams.app_id = params.appId;
  }
  if (params.orgId !== undefined) {
    queryParams.org_id = params.orgId;
  }
  if (params.refType !== undefined) {
    queryParams.ref_type = params.refType;
  }
  if (params.refId !== undefined) {
    queryParams.ref_id = params.refId;
  }
  if (params.createdBy !== undefined) {
    queryParams.created_by = params.createdBy;
  }
  if (params.completedBy !== undefined) {
    queryParams.completed_by = params.completedBy;
  }
  if (params.completed !== undefined) {
    queryParams.completed = params.completed;
  }

  // Validate that at least one filter is provided
  if (Object.keys(queryParams).length === 0) {
    return {
      success: false,
      error:
        'At least one filter parameter is required: responsible, spaceId, appId, orgId, refType+refId, createdBy, or completedBy',
      statusCode: 400,
    };
  }

  const result = await callPodioApi('tasks-list', { queryParams });

  return {
    success: result.success,
    tasks: Array.isArray(result.data) ? result.data : undefined,
    error: result.error,
    statusCode: result.statusCode,
  };
}

