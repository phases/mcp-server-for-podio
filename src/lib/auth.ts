/**
 * Podio Authentication
 * 
 * Handles Podio OAuth authentication using:
 * - App-level tokens (app_id + app_token)
 * - Organization credentials (username + password)
 */

import axios from 'axios';
import {
  getPodioClientId,
  getPodioClientSecret,
  getPodioApiBaseUrl,
  isPodioConfigured,
  getOrganizationCredentials,
  isOrganizationConfigured,
} from '../config/podio.config.js';
import { PodioError, sanitizeErrorMessage } from './errors.js';

export interface PodioTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

/**
 * Token cache entry
 */
interface TokenCacheEntry {
  token: string;
  expiresAt: number;
}

/**
 * In-memory token cache
 * Key format: "app:{appId}:{appToken}" or "org:{username}"
 */
const tokenCache = new Map<string, TokenCacheEntry>();

/**
 * Cache TTL buffer: expire tokens 5 minutes before actual expiration
 * to avoid using expired tokens
 */
const CACHE_TTL_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Clear expired tokens from cache
 */
function clearExpiredTokens(): void {
  const now = Date.now();
  for (const [key, entry] of tokenCache.entries()) {
    if (entry.expiresAt <= now) {
      tokenCache.delete(key);
    }
  }
}

/**
 * Get cache key for app-level authentication
 */
function getAppCacheKey(appId: number, appToken: string): string {
  return `app:${appId}:${appToken}`;
}

/**
 * Get cache key for organization-level authentication
 */
function getOrgCacheKey(username: string): string {
  return `org:${username}`;
}

/**
 * Get Podio access token using app-level authentication
 * Uses token caching to avoid unnecessary authentication calls.
 * 
 * @param appId - Podio app ID
 * @param appToken - Podio app token
 * @returns Access token for API requests
 */
export async function getPodioAccessToken(
  appId: number,
  appToken: string
): Promise<string> {
  // Check if Podio is configured
  if (!isPodioConfigured()) {
    throw new PodioError(
      'Podio credentials not configured. Please fill in clientId and clientSecret in podio.config.json'
    );
  }

  // Clear expired tokens
  clearExpiredTokens();

  // Check cache first
  const cacheKey = getAppCacheKey(appId, appToken);
  const cached = tokenCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.token;
  }

  // Cache miss or expired - fetch new token
  const clientId = getPodioClientId();
  const clientSecret = getPodioClientSecret();
  const apiBaseUrl = getPodioApiBaseUrl();

  try {
    // Use URLSearchParams for proper form-urlencoded format
    // Podio OAuth v2 requires client_id and client_secret in the body
    const params = new URLSearchParams();
    params.append('grant_type', 'app');
    params.append('app_id', String(appId));
    params.append('app_token', String(appToken));
    params.append('client_id', String(clientId));
    params.append('client_secret', String(clientSecret));

    const response = await axios.post<PodioTokenResponse>(
      `${apiBaseUrl}/oauth/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      }
    );

    // Handle HTTP error responses
    if (response.status >= 400) {
      const statusCode = response.status;
      const errorData = response.data as any; // Error responses have different structure

      // Clear cache on authentication failures
      if (statusCode === 400 || statusCode === 401) {
        tokenCache.delete(cacheKey);
        const errorMessage =
          errorData?.error_description ||
          errorData?.error ||
          errorData?.error_detail ||
          JSON.stringify(errorData) ||
          'Invalid app credentials';
        // Include Podio's error message for debugging, but be careful about sensitive data
        let detailedMessage = 'Invalid app credentials';
        if (errorMessage && typeof errorMessage === 'string') {
          // Only include error if it doesn't contain actual tokens/secrets
          if (!errorMessage.match(/[a-f0-9]{32,}/i)) {
            detailedMessage = `Invalid app credentials: ${errorMessage}`;
          }
        }
        throw new PodioError(
          `${detailedMessage}. Please check your app_id and app_token in podio.config.json. Status: ${statusCode}`,
          statusCode,
          errorData
        );
      }

      if (statusCode === 429) {
        throw new PodioError(
          'Rate limit exceeded. Please wait before retrying authentication.',
          429
        );
      }

      // Generic HTTP error
      const errorMessage =
        errorData?.error_description ||
        errorData?.error ||
        `HTTP ${statusCode} error from Podio API`;
      const sanitizedMessage = sanitizeErrorMessage(errorMessage);

      throw new PodioError(
        `Podio authentication failed: ${sanitizedMessage}`,
        statusCode,
        errorData
      );
    }

    // Validate response structure
    if (!response.data) {
      throw new PodioError('Invalid response from Podio: empty response body');
    }

    if (typeof response.data !== 'object') {
      throw new PodioError('Invalid response from Podio: response is not a valid JSON object');
    }

    if (!response.data.access_token) {
      throw new PodioError(
        'Invalid response from Podio: missing access_token field. Please check your Podio API configuration.'
      );
    }

    if (typeof response.data.access_token !== 'string') {
      throw new PodioError('Invalid response from Podio: access_token is not a string');
    }

    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided

    // Validate expires_in is a number
    if (typeof expiresIn !== 'number' || expiresIn <= 0) {
      throw new PodioError('Invalid response from Podio: expires_in must be a positive number');
    }

    // Cache the token (expire 5 minutes before actual expiration)
    const expiresAt = now + expiresIn * 1000 - CACHE_TTL_BUFFER_MS;
    tokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt,
    });

    return accessToken;
  } catch (error) {
    // If it's already a PodioError, re-throw it
    if (error instanceof PodioError) {
      throw error;
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      // Network timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new PodioError(
          'Request timeout: Podio API did not respond within 30 seconds. Please check your network connection and try again.'
        );
      }

      // Network connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new PodioError(
          'Cannot connect to Podio API. Please check your network connection and ensure api.podio.com is accessible.'
        );
      }

      // SSL/TLS errors
      if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        throw new PodioError(
          'SSL certificate error when connecting to Podio API. Please check your system time and SSL configuration.'
        );
      }

      // Handle response parsing errors (malformed JSON)
      if (error.response && error.response.status >= 200 && error.response.status < 300) {
        // Success status but parsing failed
        throw new PodioError(
          'Invalid response format from Podio API. The server returned an unexpected response format.'
        );
      }

      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error_description || error.message;

      // Sanitize error message to avoid exposing sensitive data
      const sanitizedMessage = sanitizeErrorMessage(errorMessage);

      throw new PodioError(
        `Podio authentication failed: ${sanitizedMessage}`,
        statusCode,
        error.response?.data
      );
    }

    // Handle other error types
    if (error instanceof Error) {
      // Check for JSON parsing errors
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        throw new PodioError(
          'Invalid response format from Podio API. The server returned malformed JSON.'
        );
      }

      throw new PodioError(
        `Podio authentication error: ${sanitizeErrorMessage(error.message)}`
      );
    }

    // Unknown error type
    throw new PodioError('An unknown error occurred during Podio authentication');
  }
}

/**
 * Get Podio access token using organization-level authentication (username/password)
 * Uses token caching to avoid unnecessary authentication calls.
 * 
 * @returns Access token for API requests
 */
export async function getPodioOrganizationAccessToken(): Promise<string> {
  // Check if Podio is configured
  if (!isPodioConfigured()) {
    throw new PodioError(
      'Podio credentials not configured. Please fill in clientId and clientSecret in podio.config.json'
    );
  }

  if (!isOrganizationConfigured()) {
    throw new PodioError(
      'Organization credentials not configured. Please fill in username and password in podio.config.json'
    );
  }

  // Clear expired tokens
  clearExpiredTokens();

  const orgCredentials = getOrganizationCredentials();
  if (!orgCredentials) {
    throw new PodioError('Organization credentials not available');
  }

  // Check cache first
  const cacheKey = getOrgCacheKey(orgCredentials.username);
  const cached = tokenCache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.token;
  }

  // Cache miss or expired - fetch new token
  const clientId = getPodioClientId();
  const clientSecret = getPodioClientSecret();
  const apiBaseUrl = getPodioApiBaseUrl();

  try {
    // Use URLSearchParams for proper form-urlencoded format
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', String(orgCredentials.username));
    params.append('password', String(orgCredentials.password));

    // Podio OAuth uses Basic Auth for client credentials
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await axios.post<PodioTokenResponse>(
      `${apiBaseUrl}/oauth/token`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      }
    );

    // Handle HTTP error responses
    if (response.status >= 400) {
      const statusCode = response.status;
      const errorData = response.data as any; // Error responses have different structure

      // Clear cache on authentication failures
      if (statusCode === 400 || statusCode === 401) {
        tokenCache.delete(cacheKey);
        throw new PodioError(
          'Invalid organization credentials. Please check your username and password in podio.config.json',
          statusCode
        );
      }

      if (statusCode === 429) {
        throw new PodioError(
          'Rate limit exceeded. Please wait before retrying authentication.',
          429
        );
      }

      // Generic HTTP error
      const errorMessage =
        errorData?.error_description ||
        errorData?.error ||
        `HTTP ${statusCode} error from Podio API`;
      const sanitizedMessage = sanitizeErrorMessage(errorMessage);

      throw new PodioError(
        `Podio organization authentication failed: ${sanitizedMessage}`,
        statusCode,
        errorData
      );
    }

    // Validate response structure
    if (!response.data) {
      throw new PodioError('Invalid response from Podio: empty response body');
    }

    if (typeof response.data !== 'object') {
      throw new PodioError('Invalid response from Podio: response is not a valid JSON object');
    }

    if (!response.data.access_token) {
      throw new PodioError(
        'Invalid response from Podio: missing access_token field. Please check your Podio API configuration.'
      );
    }

    if (typeof response.data.access_token !== 'string') {
      throw new PodioError('Invalid response from Podio: access_token is not a string');
    }

    const accessToken = response.data.access_token;
    const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided

    // Validate expires_in is a number
    if (typeof expiresIn !== 'number' || expiresIn <= 0) {
      throw new PodioError('Invalid response from Podio: expires_in must be a positive number');
    }

    // Cache the token (expire 5 minutes before actual expiration)
    const expiresAt = now + expiresIn * 1000 - CACHE_TTL_BUFFER_MS;
    tokenCache.set(cacheKey, {
      token: accessToken,
      expiresAt,
    });

    return accessToken;
  } catch (error) {
    // If it's already a PodioError, re-throw it
    if (error instanceof PodioError) {
      throw error;
    }

    // Handle Axios errors
    if (axios.isAxiosError(error)) {
      // Network timeout
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new PodioError(
          'Request timeout: Podio API did not respond within 30 seconds. Please check your network connection and try again.'
        );
      }

      // Network connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new PodioError(
          'Cannot connect to Podio API. Please check your network connection and ensure api.podio.com is accessible.'
        );
      }

      // SSL/TLS errors
      if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        throw new PodioError(
          'SSL certificate error when connecting to Podio API. Please check your system time and SSL configuration.'
        );
      }

      // Handle response parsing errors (malformed JSON)
      if (error.response && error.response.status >= 200 && error.response.status < 300) {
        // Success status but parsing failed
        throw new PodioError(
          'Invalid response format from Podio API. The server returned an unexpected response format.'
        );
      }

      const statusCode = error.response?.status;
      const errorMessage = error.response?.data?.error_description || error.message;

      // Sanitize error message to avoid exposing sensitive data
      const sanitizedMessage = sanitizeErrorMessage(errorMessage);

      throw new PodioError(
        `Podio organization authentication failed: ${sanitizedMessage}`,
        statusCode,
        error.response?.data
      );
    }

    // Handle other error types
    if (error instanceof Error) {
      // Check for JSON parsing errors
      if (error.message.includes('JSON') || error.message.includes('parse')) {
        throw new PodioError(
          'Invalid response format from Podio API. The server returned malformed JSON.'
        );
      }

      throw new PodioError(
        `Podio authentication error: ${sanitizeErrorMessage(error.message)}`
      );
    }

    // Unknown error type
    throw new PodioError('An unknown error occurred during Podio authentication');
  }
}

/**
 * Clear all cached tokens (useful for testing or forced refresh)
 */
export function clearTokenCache(): void {
  tokenCache.clear();
}

