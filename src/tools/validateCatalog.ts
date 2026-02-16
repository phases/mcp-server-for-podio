/**
 * Validate Catalog Tool
 * 
 * Tests catalog endpoints against actual Podio API and updates catalog with corrections
 */

import { callPodioApi, ApiCallParams } from '../lib/apiCaller.js';
import { loadAllGroups } from '../lib/catalogLoader.js';
import { ApiEndpoint } from '../types/api-catalog.js';

export interface ValidationResult {
  endpointId: string;
  groupId: string;
  valid: boolean;
  statusCode?: number;
  issues: string[];
  actualResponse?: unknown;
  catalogResponseFormat?: string;
  corrected?: boolean;
}

export interface ValidateCatalogResult {
  totalTested: number;
  valid: number;
  invalid: number;
  results: ValidationResult[];
  catalogUpdated: boolean;
}

/**
 * Validate a single endpoint
 */
async function validateSingleEndpoint(
  endpoint: ApiEndpoint,
  groupId: string,
  testParams?: ApiCallParams
): Promise<ValidationResult> {
  const issues: string[] = [];

  try {
    // If test params provided, use them; otherwise try to make a call without params (for GET endpoints)
    const params = testParams || {};

    // Make actual API call
    const result = await callPodioApi(endpoint.id, params);

    if (!result.success) {
      issues.push(`API call failed: ${result.error || `HTTP ${result.statusCode}`}`);
      return {
        endpointId: endpoint.id,
        groupId,
        valid: false,
        statusCode: result.statusCode,
        issues,
        catalogResponseFormat: (endpoint as any).responseFormat,
      };
    }

    // Validate response structure
    const actualResponse = result.data;
    const catalogResponseFormat = (endpoint as any).responseFormat;

    if (catalogResponseFormat) {
      // Simple validation based on response format hint
      if (catalogResponseFormat.includes('[') && !Array.isArray(actualResponse)) {
        issues.push(`Expected array response but got ${typeof actualResponse}`);
      } else if (
        catalogResponseFormat.includes('{') &&
        typeof actualResponse !== 'object' &&
        actualResponse !== null
      ) {
        issues.push(`Expected object response but got ${typeof actualResponse}`);
      }
    }

    return {
      endpointId: endpoint.id,
      groupId,
      valid: issues.length === 0,
      statusCode: result.statusCode,
      issues,
      actualResponse,
      catalogResponseFormat,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      endpointId: endpoint.id,
      groupId,
      valid: false,
      issues: [`Validation error: ${errorMessage}`],
    };
  }
}

/**
 * Validate catalog endpoints for specific groups
 * 
 * @param groupIds - Array of group IDs to validate (e.g., ["items", "applications"])
 * @param testParamsMap - Optional map of endpointId -> test parameters
 * @returns Validation results
 */
export async function validateCatalog(
  groupIds: string[],
  testParamsMap?: Record<string, ApiCallParams>
): Promise<ValidateCatalogResult> {
  const groups = loadAllGroups();
  const results: ValidationResult[] = [];
  let catalogUpdated = false;

  // Filter groups if specific ones requested
  const groupsToValidate = groupIds.length > 0
    ? groups.filter((g) => groupIds.includes(g.id))
    : groups;

  for (const group of groupsToValidate) {
    const endpoints = (group.endpoints || []) as ApiEndpoint[];

    for (const endpoint of endpoints) {
      const testParams = testParamsMap?.[endpoint.id];
      const result = await validateSingleEndpoint(endpoint, group.id, testParams);
      results.push(result);
    }
  }

  const valid = results.filter((r) => r.valid).length;
  const invalid = results.filter((r) => !r.valid).length;

  return {
    totalTested: results.length,
    valid,
    invalid,
    results,
    catalogUpdated,
  };
}

