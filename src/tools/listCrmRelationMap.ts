/**
 * List full CRM relation map
 *
 * For every app in a space (default: CRM workspace), lists ALL app-type relations:
 * each field and each linked app. Surfaces connections we might otherwise miss
 * (e.g. Support → RMA in another workspace, shown as "no access").
 * Enables drill-down by including linked app details when accessible.
 */

import { isOrganizationConfigured } from '../config/podio.config.js';
import { getPodioOrganizationAccessToken } from '../lib/auth.js';
import { createPodioClient, fetchPodioApp } from '../lib/podio.js';
import { getDirectAppRelations } from '../lib/appRelations.js';
import type { PodioAppDefinition } from '../lib/podio.js';
import { PodioError } from '../lib/errors.js';

function getAppName(app: PodioAppDefinition | null): string {
  if (!app) return '?';
  const config = app?.config as { name?: string } | undefined;
  return config?.name ?? app?.name ?? `App ${app?.app_id ?? '?'}`;
}

export interface RelationLink {
  fieldId: number;
  externalId: string;
  fieldLabel: string;
  linkedAppId: number;
  linkedAppName: string;
  /** If we have access, one level of drill-down: that app's direct relations */
  drillDown?: RelationLink[];
}

export interface AppRelationMapEntry {
  appId: number;
  appName: string;
  relations: RelationLink[];
}

export interface ListCrmRelationMapResult {
  spaceId: number;
  /** All apps in the space with their full relation list */
  apps: AppRelationMapEntry[];
  totalRelations: number;
  /** When true, each relation includes drillDown for linked apps we can access */
  withDrillDown: boolean;
}

/**
 * Build full relation map for all apps in a space.
 * Optionally include one level of drill-down for each linked app we have access to.
 */
export async function listCrmRelationMap(
  spaceId: number,
  withDrillDown = true
): Promise<ListCrmRelationMapResult> {
  if (!isOrganizationConfigured()) {
    throw new PodioError(
      'CRM relation map requires organization credentials (username/password in podio.config.json).'
    );
  }

  const token = await getPodioOrganizationAccessToken();
  const client = createPodioClient(token);
  const spaceAppsRes = await client.get(`/app/space/${spaceId}/`);
  const spaceApps = Array.isArray(spaceAppsRes.data) ? spaceAppsRes.data : [];

  const appNames = new Map<number, string>();
  const getLinkedName = async (linkedId: number): Promise<string> => {
    const cached = appNames.get(linkedId);
    if (cached !== undefined) return cached;
    try {
      const app = await fetchPodioApp(token, linkedId);
      const name = getAppName(app);
      appNames.set(linkedId, name);
      return name;
    } catch {
      const name = '(no access – other workspace)';
      appNames.set(linkedId, name);
      return name;
    }
  };

  const appsResult: AppRelationMapEntry[] = [];
  let totalRelations = 0;

  for (const spaceApp of spaceApps) {
    const appId = spaceApp.app_id;
    const appName = getAppName(spaceApp);
    appNames.set(appId, appName);

    let appDefinition: PodioAppDefinition;
    try {
      appDefinition = await fetchPodioApp(token, appId);
    } catch {
      appsResult.push({ appId, appName, relations: [] });
      continue;
    }

    const directRels = getDirectAppRelations(appDefinition);
    const relations: RelationLink[] = [];

    for (const rel of directRels) {
      for (const linkedId of rel.linkedAppIds || []) {
        const linkedName = await getLinkedName(linkedId);
        const link: RelationLink = {
          fieldId: rel.fieldId,
          externalId: rel.externalId,
          fieldLabel: rel.label,
          linkedAppId: linkedId,
          linkedAppName: linkedName,
        };

        if (withDrillDown && !linkedName.startsWith('(no access')) {
          try {
            const linkedAppDef = await fetchPodioApp(token, linkedId);
            const linkedRels = getDirectAppRelations(linkedAppDef);
            link.drillDown = [];
            for (const lr of linkedRels) {
              for (const lid of lr.linkedAppIds || []) {
                const lname = await getLinkedName(lid);
                link.drillDown.push({
                  fieldId: lr.fieldId,
                  externalId: lr.externalId,
                  fieldLabel: lr.label,
                  linkedAppId: lid,
                  linkedAppName: lname,
                });
              }
            }
          } catch {
            // leave drillDown undefined
          }
        }

        relations.push(link);
        totalRelations += 1;
      }
    }

    appsResult.push({ appId, appName, relations });
  }

  return {
    spaceId,
    apps: appsResult,
    totalRelations,
    withDrillDown,
  };
}
