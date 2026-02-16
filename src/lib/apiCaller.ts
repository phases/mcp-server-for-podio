/**
 * Generic Podio API Caller
 * 
 * Handles making authenticated API calls to Podio endpoints
 * with proper error handling and response validation
 */

import axios from 'axios';
import { createPodioClient } from './podio.js';
import { getPodioOrganizationAccessToken } from './auth.js';
import { PodioError } from './errors.js';
import { loadAllGroups } from './catalogLoader.js';
import { ApiEndpoint } from '../types/api-catalog.js';
import { findAppByAppId } from '../config/podio.config.js';

export interface ApiCallParams {
  pathParams?: Record<string, string | number>;
  queryParams?: Record<string, string | number | boolean | undefined>;
  bodyParams?: Record<string, unknown>;
}

export interface ApiCallResult {
  success: boolean;
  statusCode: number;
  data: unknown;
  headers?: Record<string, string>;
  error?: string;
  validated?: boolean;
  catalogMatch?: boolean;
}

/**
 * Replace path parameters in endpoint path
 */
function replacePathParams(path: string, params: Record<string, string | number>): string {
  let result = path;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

/**
 * Determine the recommended authentication type for an endpoint
 * Based on endpoint path patterns and group type
 */
function determineAuthType(endpoint: ApiEndpoint, appId?: number, appToken?: string): 'app' | 'organization' {
  // If app credentials are explicitly provided, use app auth
  if (appId && appToken) {
    return 'app';
  }

  // Check endpoint path patterns
  const path = endpoint.path.toLowerCase();

  // App-specific endpoints (require app auth)
  if (
    path.includes('/app/') ||
    path.includes('/item/') ||
    path.includes('/view/') ||
    path.includes('/form/') ||
    endpoint.id.startsWith('items-') ||
    endpoint.id.startsWith('apps-') ||
    endpoint.id.startsWith('views-') ||
    endpoint.id.startsWith('forms-')
  ) {
    return 'app';
  }

  // Organization/space/user endpoints (require org auth)
  if (
    path.includes('/org/') ||
    path.includes('/space/') ||
    path.includes('/user/') ||
    path.includes('/contact/') ||
    path.includes('/notification/') ||
    path.includes('/stream/') ||
    path.includes('/calendar/') ||
    path.includes('/search/') ||
    endpoint.id.startsWith('orgs-') ||
    endpoint.id.startsWith('spaces-') ||
    endpoint.id.startsWith('users-') ||
    endpoint.id.startsWith('contacts-') ||
    endpoint.id.startsWith('notifications-') ||
    endpoint.id.startsWith('stream-') ||
    endpoint.id.startsWith('calendar-') ||
    endpoint.id.startsWith('search-')
  ) {
    return 'organization';
  }

  // Tasks, comments, status, subscriptions, tags, hooks can work with either
  // Default to organization auth if no app credentials provided
  return 'organization';
}

/**
 * Make an API call to Podio
 * 
 * @param endpointId - The catalog endpoint ID (e.g., "items-get")
 * @param params - Path, query, and body parameters
 * @param useAppAuth - Whether to use app-level auth (optional, auto-detected if not provided)
 * @param appId - App ID for app-level auth
 * @param appToken - App token for app-level auth
 * @returns API call result
 */
export async function callPodioApi(
  endpointId: string,
  params: ApiCallParams = {},
  useAppAuth?: boolean,
  appId?: number,
  appToken?: string
): Promise<ApiCallResult> {
  try {
    // Get endpoint details from catalog
    const groups = loadAllGroups();
    let endpoint: ApiEndpoint | null = null;

    for (const group of groups) {
      const found = (group.endpoints as ApiEndpoint[]).find((e) => e.id === endpointId);
      if (found) {
        endpoint = found;
        break;
      }
    }

    if (!endpoint) {
      throw new PodioError(`Endpoint "${endpointId}" not found in catalog`);
    }

    // Determine authentication type
    const recommendedAuthType = determineAuthType(endpoint, appId, appToken);
    const shouldUseAppAuth = useAppAuth !== undefined
      ? useAppAuth
      : recommendedAuthType === 'app';

    // Get access token
    let accessToken: string;
    if (shouldUseAppAuth) {
      if (!appId || !appToken) {
        // Try to get app credentials from provided appId or path params
        const effectiveAppId = appId || (params.pathParams?.app_id as number | undefined);

        if (effectiveAppId) {
          // Try to find app config by appId
          const appConfig = findAppByAppId(effectiveAppId);
          if (appConfig && appConfig.appToken) {
            const { getPodioAccessToken } = await import('./auth.js');
            accessToken = await getPodioAccessToken(appConfig.appId, appConfig.appToken);
          } else {
            throw new PodioError(
              `App-level authentication required for endpoint "${endpointId}", but app credentials not found for appId ${effectiveAppId}. ` +
              `Please provide appToken, or configure the app in podio.config.json.`
            );
          }
        } else {
          throw new PodioError(
            `App-level authentication required for endpoint "${endpointId}", but appId and appToken not provided.`
          );
        }
      } else {
        const { getPodioAccessToken } = await import('./auth.js');
        accessToken = await getPodioAccessToken(appId, appToken);
      }
    } else {
      accessToken = await getPodioOrganizationAccessToken();
    }

    // Create authenticated client
    const client = createPodioClient(accessToken);

    // Build path with parameters
    let path = endpoint.path;
    if (params.pathParams) {
      path = replacePathParams(path, params.pathParams);
    }

    // Validate required path parameters
    const requiredPathParams = Object.entries(endpoint.params?.path || {})
      .filter(([_, param]) => param.required)
      .map(([key]) => key);

    for (const param of requiredPathParams) {
      if (!params.pathParams || !(param in params.pathParams)) {
        throw new PodioError(`Required path parameter "${param}" is missing`);
      }
    }

    // Build query string
    const queryParams = params.queryParams || {};
    const filteredQueryParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        filteredQueryParams[key] = String(value);
      }
    }

    // Prepare request
    const requestConfig: any = {
      params: Object.keys(filteredQueryParams).length > 0 ? filteredQueryParams : undefined,
      timeout: 30000,
      validateStatus: (status: number) => status < 600, // Don't throw on any status
    };

    let response;
    const method = endpoint.method.toLowerCase();

    try {
      switch (method) {
        case 'get':
          response = await client.get(path, requestConfig);
          break;
        case 'post':
          response = await client.post(path, params.bodyParams || {}, requestConfig);
          break;
        case 'put':
          response = await client.put(path, params.bodyParams || {}, requestConfig);
          break;
        case 'delete':
          response = await client.delete(path, requestConfig);
          break;
        case 'patch':
          response = await client.patch(path, params.bodyParams || {}, requestConfig);
          break;
        default:
          throw new PodioError(`Unsupported HTTP method: ${endpoint.method}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status || 500;
        const errorMessage = error.response?.data?.error_description || error.message;

        return {
          success: false,
          statusCode,
          data: error.response?.data || {},
          error: errorMessage,
        };
      }
      throw error;
    }

    // Handle response
    const statusCode = response.status;
    const isSuccess = statusCode >= 200 && statusCode < 300;

    return {
      success: isSuccess,
      statusCode,
      data: response.data,
      headers: response.headers as Record<string, string>,
      validated: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      statusCode: 0,
      data: {},
      error: errorMessage,
    };
  }
}

/**
 * Validate catalog endpoint against actual API response
 * 
 * @param endpointId - The catalog endpoint ID
 * @param testParams - Test parameters to use
 * @returns Validation result
 */
export async function validateEndpoint(
  endpointId: string,
  testParams: ApiCallParams
): Promise<{
  endpointId: string;
  valid: boolean;
  issues: string[];
  actualResponse?: unknown;
  catalogResponseFormat?: string;
}> {
  const issues: string[] = [];

  try {
    // Get catalog endpoint details
    const groups = loadAllGroups();
    let endpoint: ApiEndpoint | null = null;

    for (const group of groups) {
      const found = (group.endpoints as ApiEndpoint[]).find((e) => e.id === endpointId);
      if (found) {
        endpoint = found;
        break;
      }
    }

    if (!endpoint) {
      return {
        endpointId,
        valid: false,
        issues: [`Endpoint not found in catalog`],
      };
    }

    const catalogResponseFormat = (endpoint as any).responseFormat;

    // Make actual API call
    const result = await callPodioApi(endpointId, testParams);

    if (!result.success) {
      issues.push(`API call failed: ${result.error || 'Unknown error'}`);
      return {
        endpointId,
        valid: false,
        issues,
        catalogResponseFormat,
      };
    }

    // Basic validation - check if response is an object/array
    const actualResponse = result.data;
    if (catalogResponseFormat) {
      // Simple validation based on response format hint
      if (catalogResponseFormat.includes('[') && !Array.isArray(actualResponse)) {
        issues.push(`Expected array response but got ${typeof actualResponse}`);
      } else if (catalogResponseFormat.includes('{') && typeof actualResponse !== 'object') {
        issues.push(`Expected object response but got ${typeof actualResponse}`);
      }
    }

    return {
      endpointId,
      valid: issues.length === 0,
      issues,
      actualResponse,
      catalogResponseFormat,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      endpointId,
      valid: false,
      issues: [`Validation error: ${errorMessage}`],
    };
  }
}

