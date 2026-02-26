/**
 * Podio Configuration
 *
 * Manages Podio credentials from a local config file.
 * The config file is created on first run if it doesn't exist.
 * Supports both organization-level and app-level authentication.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PodioAppConfig {
  name: string;
  appId: number;
  appToken: string;
}

export interface PodioConfig {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
  apps?: PodioAppConfig[];
}

// API base URL is hardcoded in the server
export const PODIO_API_BASE_URL = 'https://api.podio.com';

// Config file location: podio.config.json in the project root (where the MCP server is)
const CONFIG_FILE_NAME = 'podio.config.json';

/**
 * Get the project root directory (where package.json is located)
 * This is where the MCP server code lives and where podio.config.json should be created
 */
function getProjectRoot(): string {
  // When running from dist/, we need to go up one level
  // When running from src/, we need to go up one level
  // process.cwd() should be the project root when the server is started
  return process.cwd();
}

/**
 * Get the config file path (exported for tools)
 * Returns path to podio.config.json in the project root directory
 */
export function getConfigFilePath(): string {
  return join(getProjectRoot(), CONFIG_FILE_NAME);
}

/**
 * Default config template with placeholders
 */
const DEFAULT_CONFIG: PodioConfig = {
  clientId: 'YOUR_PODIO_CLIENT_ID_HERE',
  clientSecret: 'YOUR_PODIO_CLIENT_SECRET_HERE',
  username: 'YOUR_PODIO_USERNAME_HERE',
  password: 'YOUR_PODIO_PASSWORD_HERE',
  apps: [
    {
      name: 'Example App',
      appId: 0,
      appToken: 'YOUR_APP_TOKEN_HERE',
    },
  ],
};

/**
 * Create default config file if it doesn't exist
 * Creates podio.config.json in the project root directory (where the MCP server is)
 * This is called automatically when the MCP server starts (when Cursor connects)
 */
export function ensureConfigFile(): void {
  const configFilePath = getConfigFilePath();

  try {
    // Create config file if it doesn't exist
    if (!existsSync(configFilePath)) {
      writeFileSync(configFilePath, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8');
      console.error(
        `[Podio Config] ✅ Config file created at: ${configFilePath}\n` +
          `[Podio Config] 📝 Please edit this file and replace placeholders with your Podio credentials:\n` +
          `[Podio Config]    - clientId: YOUR_PODIO_CLIENT_ID_HERE\n` +
          `[Podio Config]    - clientSecret: YOUR_PODIO_CLIENT_SECRET_HERE\n` +
          `[Podio Config]    - username: YOUR_PODIO_USERNAME_HERE (optional, for organization APIs)\n` +
          `[Podio Config]    - password: YOUR_PODIO_PASSWORD_HERE (optional, for organization APIs)\n` +
          `[Podio Config]    - apps: Replace example app with your real apps\n` +
          `[Podio Config] 📖 See docs/EXAMPLE_CONFIG.md for detailed instructions.`
      );
    } else {
      // Config file exists - check if it still has placeholders
      try {
        const configContent = readFileSync(configFilePath, 'utf-8');
        const config = JSON.parse(configContent) as PodioConfig;
        const hasPlaceholders =
          (config.clientId && config.clientId.includes('YOUR_PODIO_CLIENT_ID')) ||
          (config.clientSecret && config.clientSecret.includes('YOUR_PODIO_CLIENT_SECRET'));

        if (hasPlaceholders) {
          console.error(
            `[Podio Config] ⚠️  Config file exists but contains placeholders.\n` +
              `[Podio Config] 📝 Please edit ${configFilePath} and fill in your Podio credentials.`
          );
        }
      } catch (error) {
        // If we can't read/parse the config, that's okay - it will be handled when actually used
        // Don't throw here to avoid breaking server startup
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `[Podio Config] ❌ Failed to create config file: ${errorMessage}\n` +
        `[Podio Config] 📍 Expected location: ${configFilePath}\n` +
        `[Podio Config] 💡 Please create the file manually or check directory permissions.`
    );
    // Don't throw - allow server to continue (ping tool can still work)
  }
}

/**
 * Load Podio configuration from file
 * Does not validate required fields - use specific getters for that
 */
export function loadPodioConfig(): PodioConfig {
<<<<<<< HEAD
  ensureConfigFile();
=======
  const sessionId = getCurrentSessionId();
  if (sessionId !== undefined) {
    const sessionConfig = getSessionConfig(sessionId);
    if (sessionConfig) {
      return sessionConfig;
    }
    throw new Error(
      'Podio config not set for this session. Call setPodioConfig with your Podio credentials (clientId, clientSecret, apps) first.'
    );
  }
>>>>>>> ac901e2 (feat: added landing page)

  const configFilePath = getConfigFilePath();

  try {
    const configContent = readFileSync(configFilePath, 'utf-8');
    const config = JSON.parse(configContent) as PodioConfig;

    // Merge with defaults
    return {
      ...DEFAULT_CONFIG,
      ...config,
      // Ensure apps array exists
      apps: config.apps || [],
    };
  } catch (error: unknown) {
    const err = error as NodeJS.ErrnoException;
    if (err?.code === 'ENOENT') {
      throw new Error(
        `Podio config file not found at ${configFilePath}. Create podio.config.json in the project root (copy from podio.config.json.example and add your credentials). See README.`
      );
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in ${configFilePath}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load Podio configuration and validate required fields for authentication
 */
/**
 * Validate configuration values
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate Podio configuration
 * Returns detailed validation results
 */
export function validatePodioConfig(config: PodioConfig): ValidationResult {
  const errors: string[] = [];
  const configPath = getConfigFilePath();

  // Validate clientId
  if (!config.clientId || typeof config.clientId !== 'string') {
    errors.push(
      `clientId is missing or invalid. Please provide a valid clientId in ${configPath}`
    );
  } else if (config.clientId.trim() === '') {
    errors.push(`clientId cannot be empty. Please fill in clientId in ${configPath}`);
  } else if (config.clientId.includes('YOUR_PODIO_CLIENT_ID')) {
    errors.push(
      `clientId contains placeholder value. Please replace 'YOUR_PODIO_CLIENT_ID' with your actual Podio client ID in ${configPath}`
    );
  }

  // Validate clientSecret
  if (!config.clientSecret || typeof config.clientSecret !== 'string') {
    errors.push(
      `clientSecret is missing or invalid. Please provide a valid clientSecret in ${configPath}`
    );
  } else if (config.clientSecret.trim() === '') {
    errors.push(`clientSecret cannot be empty. Please fill in clientSecret in ${configPath}`);
  } else if (config.clientSecret.includes('YOUR_PODIO_CLIENT_SECRET')) {
    errors.push(
      `clientSecret contains placeholder value. Please replace 'YOUR_PODIO_CLIENT_SECRET' with your actual Podio client secret in ${configPath}`
    );
  }

  // Validate apps array structure (if present)
  if (config.apps && Array.isArray(config.apps)) {
    config.apps.forEach((app, index) => {
      if (!app.name || typeof app.name !== 'string' || app.name.trim() === '') {
        errors.push(`App at index ${index} has invalid or missing name`);
      }
      if (typeof app.appId !== 'number' || app.appId < 0) {
        errors.push(`App "${app.name || `at index ${index}`}" has invalid appId (must be a positive number)`);
      }
      if (!app.appToken || typeof app.appToken !== 'string' || app.appToken.trim() === '') {
        errors.push(`App "${app.name || `at index ${index}`}" has invalid or missing appToken`);
      } else if (app.appToken.includes('YOUR_APP_TOKEN')) {
        errors.push(
          `App "${app.name}" has placeholder appToken. Please replace 'YOUR_APP_TOKEN' with your actual app token`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function loadPodioConfigWithValidation(): PodioConfig {
  const config = loadPodioConfig();
  const validation = validatePodioConfig(config);

  if (!validation.valid) {
    const errorMessage =
      `Podio configuration validation failed:\n${validation.errors.map(e => `  - ${e}`).join('\n')}\n\n` +
      `Please update ${getConfigFilePath()} with valid values.`;
    throw new Error(errorMessage);
  }

  return config;
}

/**
 * Get Podio client ID
 */
export function getPodioClientId(): string {
  const config = loadPodioConfigWithValidation();
  return config.clientId;
}

/**
 * Get Podio client secret
 */
export function getPodioClientSecret(): string {
  const config = loadPodioConfigWithValidation();
  return config.clientSecret;
}

/**
 * Get Podio API base URL (hardcoded in server)
 */
export function getPodioApiBaseUrl(): string {
  return PODIO_API_BASE_URL;
}

/**
 * Check if Podio is configured (clientId and clientSecret)
 * Returns false if placeholders are still present
 */
export function isPodioConfigured(): boolean {
  try {
    const config = loadPodioConfig();
    const hasClientId =
      config.clientId &&
      config.clientId !== '' &&
      !config.clientId.includes('YOUR_PODIO_CLIENT_ID');
    const hasClientSecret =
      config.clientSecret &&
      config.clientSecret !== '' &&
      !config.clientSecret.includes('YOUR_PODIO_CLIENT_SECRET');
    return !!(hasClientId && hasClientSecret);
  } catch {
    return false;
  }
}

/**
 * Find app configuration by name (case-insensitive)
 * Filters out placeholder apps (appId === 0 or placeholder tokens)
 */
export function findAppByName(appName: string): PodioAppConfig | null {
  try {
    const config = loadPodioConfig();
    if (!config.apps || config.apps.length === 0) {
      return null;
    }

    const normalizedName = appName.toLowerCase().trim();
    const app = config.apps.find(
      a =>
        a.name.toLowerCase().trim() === normalizedName &&
        a.appId !== 0 &&
        !a.appToken.includes('YOUR_APP_TOKEN')
    );

    return app || null;
  } catch {
    return null;
  }
}

/**
 * Find app configuration by app ID
 * Filters out placeholder apps (appId === 0 or placeholder tokens)
 */
export function findAppByAppId(appId: number): PodioAppConfig | null {
  try {
    const config = loadPodioConfig();
    if (!config.apps || config.apps.length === 0) {
      return null;
    }

    const app = config.apps.find(
      a =>
        a.appId === appId &&
        a.appId !== 0 &&
        !a.appToken.includes('YOUR_APP_TOKEN')
    );

    return app || null;
  } catch {
    return null;
  }
}

/**
 * Get all configured app names (excluding placeholder apps)
 */
export function getAppNames(): string[] {
  try {
    const config = loadPodioConfig();
    return (
      config.apps
        ?.filter(app => app.appId !== 0 && !app.appToken.includes('YOUR_APP_TOKEN'))
        .map(app => app.name) || []
    );
  } catch {
    return [];
  }
}

/**
 * Check if organization credentials (username/password) are configured
 * Returns false if placeholders are still present
 */
export function isOrganizationConfigured(): boolean {
  try {
    const config = loadPodioConfig();
    const hasUsername =
      config.username && config.username !== '' && !config.username.includes('YOUR_PODIO_USERNAME');
    const hasPassword =
      config.password && config.password !== '' && !config.password.includes('YOUR_PODIO_PASSWORD');
    return !!(hasUsername && hasPassword);
  } catch {
    return false;
  }
}

/**
 * Get organization credentials (username/password)
 */
export function getOrganizationCredentials(): { username: string; password: string } | null {
  try {
    const config = loadPodioConfig();
    if (config.username && config.password) {
      return {
        username: config.username,
        password: config.password,
      };
    }
    return null;
  } catch {
    return null;
  }
}
