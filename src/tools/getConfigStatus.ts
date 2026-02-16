/**
 * Get Config Status Tool
 * 
 * Returns the status of the Podio configuration file
 */

import { getConfigFilePath, isPodioConfigured, getAppNames } from '../config/podio.config.js';
import { existsSync, readFileSync } from 'fs';

export interface ConfigStatus {
  configFileExists: boolean;
  configFilePath: string;
  isConfigured: boolean;
  hasPlaceholders: boolean;
  configuredApps: string[];
  message: string;
}

/**
 * Get the status of the Podio configuration
 */
export async function getConfigStatus(): Promise<ConfigStatus> {
  const configFilePath = getConfigFilePath();
  const exists = existsSync(configFilePath);

  if (!exists) {
    return {
      configFileExists: false,
      configFilePath,
      isConfigured: false,
      hasPlaceholders: true,
      configuredApps: [],
      message:
        `Config file not found at ${configFilePath}. ` +
        `The file should be created automatically when the MCP server starts. ` +
        `If it doesn't exist, restart Cursor to trigger config file creation.`,
    };
  }

  try {
    const configContent = readFileSync(configFilePath, 'utf-8');
    const config = JSON.parse(configContent);

    const hasPlaceholders =
      config.clientId?.includes('YOUR_PODIO_CLIENT_ID') ||
      config.clientSecret?.includes('YOUR_PODIO_CLIENT_SECRET') ||
      false;

    const isConfigured = isPodioConfigured();
    const configuredApps = getAppNames();

    let message = '';
    if (hasPlaceholders) {
      message =
        `Config file exists but contains placeholders. ` +
        `Please edit ${configFilePath} and replace placeholders with your actual Podio credentials.`;
    } else if (!isConfigured) {
      message =
        `Config file exists but clientId or clientSecret are missing or empty. ` +
        `Please fill in these required fields in ${configFilePath}.`;
    } else {
      message = `Config file is configured. ${configuredApps.length} app(s) available: ${configuredApps.join(', ') || 'none'}.`;
    }

    return {
      configFileExists: true,
      configFilePath,
      isConfigured,
      hasPlaceholders,
      configuredApps,
      message,
    };
  } catch (error) {
    return {
      configFileExists: true,
      configFilePath,
      isConfigured: false,
      hasPlaceholders: true,
      configuredApps: [],
      message: `Error reading config file: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

