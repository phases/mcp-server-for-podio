/**
 * App relations extraction
 *
 * Extracts "app" type fields and their linked app_ids from Podio app definitions.
 * Used to build the tree of related apps (e.g. project → invoice → account).
 */

import type { PodioAppDefinition, PodioField } from './podio.js';

/** One app-reference field and the app IDs it links to */
export interface DirectAppRelation {
  fieldId: number;
  externalId: string;
  label: string;
  linkedAppIds: number[];
}

/**
 * Get linked app_id(s) from a field config.
 * Podio uses config.settings.apps as array of { app_id: number }.
 */
function getLinkedAppIdsFromConfig(config: Record<string, unknown> | undefined): number[] {
  if (!config || typeof config !== 'object') return [];

  const settings = config.settings as Record<string, unknown> | undefined;
  if (settings) {
    // config.settings.apps (array of { app_id: number })
    if (Array.isArray(settings.apps)) {
      const ids = collectAppIdsFromEntries(settings.apps);
      if (ids.length > 0) return ids;
    }
    // config.settings.referenced_apps (array of { app_id: number } or numbers)
    if (Array.isArray(settings.referenced_apps)) {
      const ids = collectAppIdsFromEntries(settings.referenced_apps);
      if (ids.length > 0) return ids;
    }
  }

  // Fallback: config.apps (same shape)
  if (Array.isArray(config.apps)) {
    const ids = collectAppIdsFromEntries(config.apps);
    if (ids.length > 0) return ids;
  }

  return [];
}

function collectAppIdsFromEntries(entries: unknown[]): number[] {
  const ids: number[] = [];
  for (const entry of entries) {
    if (typeof entry === 'number' && !Number.isNaN(entry)) {
      ids.push(entry);
    } else if (entry && typeof entry === 'object' && 'app_id' in entry) {
      const id = (entry as { app_id: number }).app_id;
      if (typeof id === 'number' && !Number.isNaN(id)) ids.push(id);
    }
  }
  return ids;
}

/**
 * Extract direct app relations from an app definition.
 * Returns all fields of type "app" with their linked app_id(s) from config.
 */
export function getDirectAppRelations(appDefinition: PodioAppDefinition): DirectAppRelation[] {
  const fields = appDefinition.fields;
  if (!Array.isArray(fields)) return [];

  const result: DirectAppRelation[] = [];

  for (const field of fields as PodioField[]) {
    if (field.type !== 'app') continue;

    const linkedAppIds = getLinkedAppIdsFromConfig(field.config as Record<string, unknown> | undefined);
    result.push({
      fieldId: field.field_id,
      externalId: field.external_id,
      label: field.label,
      linkedAppIds,
    });
  }

  return result;
}
