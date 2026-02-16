/**
 * Catalog Loader
 * 
 * Handles loading of split catalog files.
 * Supports both single-file (legacy) and split-file (new) formats.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PodioApiCatalog, ApiGroup } from '../types/api-catalog.js';

/**
 * Catalog index structure (metadata only)
 */
export interface CatalogIndex {
  version: string;
  lastUpdated: string;
  baseUrl: string;
  documentation: string;
  rateLimit: Record<string, unknown>;
  groups: Array<{
    id: string;
    name: string;
    description: string;
    endpointCount: number;
  }>;
}

/**
 * Group file structure (full group data)
 */
export interface GroupFile {
  id: string;
  name: string;
  description: string;
  endpoints: Array<unknown>;
}

/**
 * Get the catalog directory path
 * 
 * Uses the code location (via import.meta.url) to find the catalog relative to the project root,
 * rather than relying on process.cwd() which depends on where the process was started.
 * Falls back to process.cwd() if the catalog isn't found relative to the code location.
 */
function getCatalogDir(): string {
  // Get the directory where this file is located
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentFileDir = dirname(currentFilePath);
  
  // Navigate from src/lib/ to project root, then to data/catalog
  // When running from dist/, the path will be dist/lib/, so we go up 2 levels
  // When running from src/, the path will be src/lib/, so we go up 2 levels
  const projectRoot = join(currentFileDir, '..', '..');
  const catalogDir = join(projectRoot, 'data', 'catalog');
  
  // If catalog exists at the code-relative path, use it
  if (existsSync(join(catalogDir, 'index.json'))) {
    return catalogDir;
  }
  
  // Fallback to process.cwd() for backward compatibility
  // This allows the catalog to be in the working directory if not found relative to code
  const fallbackCatalogDir = join(process.cwd(), 'data', 'catalog');
  return fallbackCatalogDir;
}

/**
 * Get the legacy catalog file path (for backward compatibility)
 */
function getLegacyCatalogPath(): string {
  // Try code-relative path first
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentFileDir = dirname(currentFilePath);
  const projectRoot = join(currentFileDir, '..', '..');
  const legacyPath = join(projectRoot, 'data', 'podio_api_catalog.json');
  
  // If exists at code-relative path, use it
  if (existsSync(legacyPath)) {
    return legacyPath;
  }
  
  // Fallback to process.cwd()
  return join(process.cwd(), 'data', 'podio_api_catalog.json');
}

/**
 * Check if split catalog format exists
 */
function hasSplitCatalog(): boolean {
  const catalogDir = getCatalogDir();
  const indexPath = join(catalogDir, 'index.json');
  return existsSync(indexPath);
}

/**
 * Load catalog index (metadata only)
 */
export function loadCatalogIndex(): CatalogIndex {
  const catalogDir = getCatalogDir();
  const indexPath = join(catalogDir, 'index.json');

  if (!existsSync(indexPath)) {
    throw new Error(
      `Catalog index not found at ${indexPath}. ` +
        `Please ensure the catalog is properly set up in data/catalog/`
    );
  }

  try {
    const indexContent = readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(indexContent) as CatalogIndex;

    if (!index.groups || !Array.isArray(index.groups)) {
      throw new Error('Invalid catalog index structure: groups array is missing or invalid');
    }

    return index;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in catalog index: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load a specific group file
 */
export function loadGroupFile(groupId: string): GroupFile {
  const catalogDir = getCatalogDir();
  const groupPath = join(catalogDir, 'groups', `${groupId}.json`);

  if (!existsSync(groupPath)) {
    throw new Error(
      `Group file not found: ${groupPath}. ` +
        `Group ID "${groupId}" may not exist in the catalog.`
    );
  }

  try {
    const groupContent = readFileSync(groupPath, 'utf-8');
    const group = JSON.parse(groupContent) as GroupFile;

    if (!group.endpoints || !Array.isArray(group.endpoints)) {
      throw new Error(`Invalid group file structure: endpoints array is missing in ${groupId}`);
    }

    return group;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in group file ${groupId}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Load all group files (for search operations)
 */
export function loadAllGroups(): GroupFile[] {
  const catalogDir = getCatalogDir();
  const groupsDir = join(catalogDir, 'groups');

  if (!existsSync(groupsDir)) {
    throw new Error(`Groups directory not found: ${groupsDir}`);
  }

  const groupFiles: GroupFile[] = [];
  const files = readdirSync(groupsDir);

  for (const file of files) {
    if (file.endsWith('.json')) {
      const groupId = file.replace('.json', '');
      try {
        const group = loadGroupFile(groupId);
        groupFiles.push(group);
      } catch (error) {
        // Skip invalid files, but log warning
        console.error(`Warning: Failed to load group file ${file}: ${error}`);
      }
    }
  }

  return groupFiles;
}

/**
 * Load full catalog (for backward compatibility or when all data is needed)
 * Supports both split and legacy single-file formats
 */
export function loadFullCatalog(): PodioApiCatalog {
  // Try split catalog first
  if (hasSplitCatalog()) {
    const index = loadCatalogIndex();
    const groups: ApiGroup[] = [];

    for (const groupMeta of index.groups) {
      const group = loadGroupFile(groupMeta.id);
      groups.push({
        id: group.id,
        name: group.name,
        description: group.description,
        endpoints: group.endpoints as any[], // Type assertion for compatibility
      });
    }

    return {
      version: index.version,
      lastUpdated: index.lastUpdated,
      groups,
    };
  }

  // Fallback to legacy single-file format
  const legacyPath = getLegacyCatalogPath();
  if (!existsSync(legacyPath)) {
    throw new Error(
      `Catalog not found. Expected either:\n` +
        `  - Split format: ${getCatalogDir()}/index.json\n` +
        `  - Legacy format: ${legacyPath}`
    );
  }

  try {
    const catalogContent = readFileSync(legacyPath, 'utf-8');
    const catalog = JSON.parse(catalogContent) as PodioApiCatalog;

    if (!catalog.groups || !Array.isArray(catalog.groups)) {
      throw new Error('Invalid catalog structure: groups array is missing or invalid');
    }

    return catalog;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in catalog file: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Find a group by ID or name (case-insensitive)
 */
export function findGroupByIdOrName(identifier: string): GroupFile | null {
  const index = loadCatalogIndex();
  const normalized = identifier.toLowerCase().trim();

  // Find in index
  const groupMeta = index.groups.find(
    (g) => g.id.toLowerCase() === normalized || g.name.toLowerCase() === normalized
  );

  if (!groupMeta) {
    return null;
  }

  // Load the full group file
  return loadGroupFile(groupMeta.id);
}

