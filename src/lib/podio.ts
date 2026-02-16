/**
 * Podio API Client
 * 
 * Handles API requests to Podio
 */

import axios, { AxiosInstance } from 'axios';
import { getPodioApiBaseUrl } from '../config/podio.config.js';
import { PodioError } from './errors.js';

/**
 * Podio Field Configuration
 * Based on Podio API documentation
 */
export interface PodioFieldConfig {
  [key: string]: unknown;
  // Common config properties
  required?: boolean;
  unique?: boolean;
  default_value?: unknown;
  settings?: Record<string, unknown>;
}

/**
 * Podio Field Definition
 * Represents a field in a Podio app
 */
export interface PodioField {
  field_id: number;
  external_id: string;
  type: string;
  label: string;
  description?: string;
  config?: PodioFieldConfig;
  [key: string]: unknown;
}

/**
 * Podio App Definition
 * Complete app structure from Podio API
 */
export interface PodioAppDefinition {
  app_id: number;
  name: string;
  status: string;
  fields: PodioField[];
  space?: {
    space_id: number;
    name: string;
    url: string;
  };
  icon?: string;
  icon_id?: number;
  link?: string;
  url?: string;
  url_label?: string;
  item_name?: string;
  [key: string]: unknown;
}

/**
 * Create authenticated HTTP client for Podio API
 * Includes retry logic for transient failures
 */
export function createPodioClient(accessToken: string): AxiosInstance {
  const apiBaseUrl = getPodioApiBaseUrl();

  const client = axios.create({
    baseURL: apiBaseUrl,
    headers: {
      Authorization: `OAuth2 ${accessToken}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
  });

  // Add request interceptor for retry logic
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const config = error.config;

      // Don't retry if retry count is already set and exceeded
      if (config && config.__retryCount !== undefined && config.__retryCount >= 2) {
        return Promise.reject(error);
      }

      // Only retry on network errors or 5xx server errors
      const shouldRetry =
        !error.response ||
        (error.response.status >= 500 && error.response.status < 600) ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT';

      if (shouldRetry && config) {
        config.__retryCount = config.__retryCount || 0;
        config.__retryCount += 1;

        // Exponential backoff: wait 1s, 2s
        const delay = config.__retryCount * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));

        return client(config);
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Fetch Podio app definition
 * 
 * @param accessToken - Podio access token
 * @param appId - Podio app ID
 * @returns App definition with fields
 */
export async function fetchPodioApp(
  accessToken: string,
  appId: number
): Promise<PodioAppDefinition> {
  const client = createPodioClient(accessToken);

  try {
    const response = await client.get<PodioAppDefinition>(`/app/${appId}`);

    if (!response.data) {
      throw new PodioError('Invalid response from Podio: missing app data');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error_description || error.message;

      // Handle specific Podio error codes
      if (statusCode === 404) {
        throw new PodioError(`App not found: app_id ${appId}`, 404);
      }

      if (statusCode === 403) {
        throw new PodioError(
          `Permission denied: You don't have access to app_id ${appId}`,
          403
        );
      }

      if (statusCode === 401) {
        throw new PodioError('Unauthorized: Invalid or expired access token', 401);
      }

      if (statusCode === 429) {
        throw new PodioError(
          'Rate limit exceeded. Please wait before retrying.',
          429
        );
      }

      if (statusCode && statusCode >= 500) {
        throw new PodioError(
          `Podio server error (${statusCode}). Please try again later.`,
          statusCode
        );
      }

      throw new PodioError(
        `Failed to fetch app: ${errorMessage}`,
        statusCode,
        error.response?.data
      );
    }

    // Network errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new PodioError('Request timeout. Please try again.');
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new PodioError('Cannot connect to Podio API. Please check your network connection.');
      }
    }

    throw new PodioError(
      `Podio API error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Podio Organization Definition
 * Represents an organization in Podio
 */
export interface PodioOrganization {
  org_id: number;
  name: string;
  url?: string;
  logo?: string;
  logo_id?: number;
  url_label?: string;
  premium?: boolean;
  role?: string;
  tier?: string;
  [key: string]: unknown;
}

/**
 * Fetch list of organizations accessible to the authenticated user
 * 
 * @param accessToken - Podio access token (organization-level)
 * @returns Array of organizations
 */
export async function fetchPodioOrganizations(
  accessToken: string
): Promise<PodioOrganization[]> {
  const client = createPodioClient(accessToken);

  try {
    const response = await client.get<PodioOrganization[]>('/org/');

    if (!response.data) {
      throw new PodioError('Invalid response from Podio: missing organization data');
    }

    if (!Array.isArray(response.data)) {
      throw new PodioError('Invalid response from Podio: expected array of organizations');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error_description || error.message;

      // Handle specific Podio error codes
      if (statusCode === 401) {
        throw new PodioError('Unauthorized: Invalid or expired access token', 401);
      }

      if (statusCode === 403) {
        throw new PodioError('Permission denied: You don\'t have access to list organizations', 403);
      }

      if (statusCode === 429) {
        throw new PodioError(
          'Rate limit exceeded. Please wait before retrying.',
          429
        );
      }

      if (statusCode && statusCode >= 500) {
        throw new PodioError(
          `Podio server error (${statusCode}). Please try again later.`,
          statusCode
        );
      }

      throw new PodioError(
        `Failed to fetch organizations: ${errorMessage}`,
        statusCode,
        error.response?.data
      );
    }

    // Network errors
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new PodioError('Request timeout. Please try again.');
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new PodioError('Cannot connect to Podio API. Please check your network connection.');
      }
    }

    throw new PodioError(
      `Podio API error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

