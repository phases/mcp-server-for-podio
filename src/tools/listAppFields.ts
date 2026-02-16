/**
 * List App Fields Tool
 *
 * Lists all fields available in a Podio app by app name.
 * Uses app-level authentication (app_id + app_token) to access the app.
 * Looks up app configuration from config file.
 */

import { findAppByName, getAppNames } from '../config/podio.config.js';
import { getPodioAccessToken } from '../lib/auth.js';
import { fetchPodioApp } from '../lib/podio.js';
import { PodioError } from '../lib/errors.js';

export interface ListAppFieldsResult {
  appName: string;
  appId: number;
  fields: Array<{
    fieldId: number;
    externalId: string;
    type: string;
    label: string;
    description?: string;
  }>;
  totalFields: number;
}

/**
 * List all fields in a Podio app by name
 *
 * @param appName - Name of the app (case-insensitive)
 * @returns App fields information
 */
export async function listAppFields(appName: string): Promise<ListAppFieldsResult> {
  // Find app configuration by name
  const appConfig = findAppByName(appName);

  if (!appConfig) {
    const availableApps = getAppNames();
    if (availableApps.length === 0) {
      throw new PodioError(
        `App "${appName}" not found in configuration. No apps are configured. ` +
          `Please add apps to podio.config.json with name and appId.`
      );
    }

    throw new PodioError(
      `App "${appName}" not found in configuration. ` +
        `Available apps: ${availableApps.join(', ')}. ` +
        `Please check the app name or add it to podio.config.json.`
    );
  }

  // Authenticate with Podio using app-level credentials (app_id + app_token)
  if (!appConfig.appToken) {
    throw new PodioError(
      `App "${appName}" is missing appToken in configuration. ` +
        `Please add appToken to the app configuration in podio.config.json.`
    );
  }
  const accessToken = await getPodioAccessToken(appConfig.appId, appConfig.appToken);

  // Fetch app definition
  const appDefinition = await fetchPodioApp(accessToken, appConfig.appId);

  // Extract fields
  const fields = (appDefinition.fields || []).map(field => ({
    fieldId: field.field_id,
    externalId: field.external_id,
    type: field.type,
    label: field.label,
    description: field.description,
  }));

  return {
    appName: appConfig.name,
    appId: appConfig.appId,
    fields,
    totalFields: fields.length,
  };
}
