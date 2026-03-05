/**
 * List Deep App Relations Tool
 *
 * From a seed app, discovers all related apps by following "app" (reference) fields
 * to maximum depth. Returns every reachable app and its direct relations (with names).
 */

import { isOrganizationConfigured } from '../config/podio.config.js';
import { getPodioOrganizationAccessToken } from '../lib/auth.js';
import { fetchPodioApp } from '../lib/podio.js';
import { getDirectAppRelations } from '../lib/appRelations.js';
import type { PodioAppDefinition } from '../lib/podio.js';
import { PodioError } from '../lib/errors.js';

function getAppName(app: PodioAppDefinition): string {
  const config = app?.config as { name?: string } | undefined;
  return config?.name ?? app?.name ?? `App ${app?.app_id ?? '?'}`;
}

export interface DeepRelationLink {
  fieldId: number;
  externalId: string;
  label: string;
  linkedAppId: number;
  linkedAppName: string;
}

export interface AppNode {
  appId: number;
  appName: string;
  level: number;
  relations: DeepRelationLink[];
}

export interface ListDeepAppRelationsResult {
  seedAppId: number;
  seedAppName: string;
  /** Apps by level (0 = seed, 1 = direct links, 2 = links from those, ...) */
  byLevel: AppNode[][];
  /** All apps in discovery order (BFS) */
  apps: AppNode[];
  totalApps: number;
  maxLevel: number;
}

/**
 * Discover all apps reachable from a seed app via app-reference fields, to maximum depth.
 * Uses BFS. Requires organization auth.
 */
export async function listDeepAppRelations(seedAppId: number): Promise<ListDeepAppRelationsResult> {
  if (!isOrganizationConfigured()) {
    throw new PodioError(
      'Deep relations require organization credentials (username/password in podio.config.json).'
    );
  }

  const accessToken = await getPodioOrganizationAccessToken();
  const visited = new Set<number>();
  const appNames = new Map<number, string>();
  const byLevel: AppNode[][] = [];
  const apps: AppNode[] = [];

  const queue: { appId: number; level: number }[] = [{ appId: seedAppId, level: 0 }];
  let maxLevel = 0;

  while (queue.length > 0) {
    const { appId, level } = queue.shift()!;
    if (visited.has(appId)) continue;
    visited.add(appId);

    let appDefinition: PodioAppDefinition;
    try {
      appDefinition = await fetchPodioApp(accessToken, appId);
    } catch (e) {
      appNames.set(appId, '(no access)');
      if (level >= byLevel.length) byLevel.push([]);
      byLevel[level].push({
        appId,
        appName: '(no access)',
        level,
        relations: [],
      });
      apps.push({ appId, appName: '(no access)', level, relations: [] });
      continue;
    }

    const appName = getAppName(appDefinition);
    appNames.set(appId, appName);
    const directRels = getDirectAppRelations(appDefinition);

    const relations: DeepRelationLink[] = [];
    const linkedIds = new Set<number>();

    for (const rel of directRels) {
      for (const linkedId of rel.linkedAppIds) {
        linkedIds.add(linkedId);
        let linkedName = appNames.get(linkedId);
        if (linkedName === undefined) {
          try {
            const linkedApp = await fetchPodioApp(accessToken, linkedId);
            linkedName = getAppName(linkedApp);
            appNames.set(linkedId, linkedName);
          } catch {
            linkedName = '(no access)';
            appNames.set(linkedId, linkedName);
          }
        }
        relations.push({
          fieldId: rel.fieldId,
          externalId: rel.externalId,
          label: rel.label,
          linkedAppId: linkedId,
          linkedAppName: linkedName,
        });
      }
    }

    const node: AppNode = { appId, appName, level, relations };
    if (level >= byLevel.length) byLevel.push([]);
    byLevel[level].push(node);
    apps.push(node);
    if (level > maxLevel) maxLevel = level;

    for (const linkedId of linkedIds) {
      if (!visited.has(linkedId)) queue.push({ appId: linkedId, level: level + 1 });
    }
  }

  const seedNode = apps.find((a) => a.appId === seedAppId);
  const seedAppName = seedNode?.appName ?? appNames.get(seedAppId) ?? `App ${seedAppId}`;

  return {
    seedAppId,
    seedAppName,
    byLevel,
    apps,
    totalApps: apps.length,
    maxLevel,
  };
}
