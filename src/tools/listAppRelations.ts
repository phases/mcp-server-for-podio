/**
 * List App Relations Tool (direct only)
 *
 * Lists apps directly linked from a given app via "app" (reference) fields.
 * Does not recurse into linked apps.
 */

import { findAppByName, findAppByAppId, getAppNames, isOrganizationConfigured } from '../config/podio.config.js';
import { getPodioAccessToken, getPodioOrganizationAccessToken } from '../lib/auth.js';
import { fetchPodioApp } from '../lib/podio.js';
import { getDirectAppRelations } from '../lib/appRelations.js';
import { PodioError } from '../lib/errors.js';

/** One linked app (with optional name from API) */
export interface LinkedAppInfo {
  appId: number;
  appName?: string;
}

/** One app-reference field and its linked apps */
export interface DirectRelationEntry {
  fieldId: number;
  externalId: string;
  label: string;
  linkedAppIds: number[];
  linkedApps?: LinkedAppInfo[];
}

/** Result of listing direct app relations */
export interface ListAppRelationsResult {
  appName: string;
  appId: number;
  relations: DirectRelationEntry[];
  totalLinkedAppIds: number;
}

/**
 * List direct app relations for an app (by name or ID).
 * Does not recurse into linked apps.
 *
 * @param params - { appName?: string, appId?: number } — provide one
 * @param fetchLinkedNames - if true, fetches each linked app's name from API (default true)
 */
export async function listAppRelations(
  params: { appName?: string; appId?: number },
  fetchLinkedNames = true
): Promise<ListAppRelationsResult> {
  const { appName, appId } = params;

  let resolvedAppId: number;
  let accessToken: string;

  if (appName !== undefined && appName !== '') {
    const appConfig = findAppByName(appName);
    if (!appConfig) {
      const available = getAppNames();
      throw new PodioError(
        `App "${appName}" not found in configuration.` +
          (available.length > 0 ? ` Available: ${available.join(', ')}.` : ' No apps configured.')
      );
    }
    resolvedAppId = appConfig.appId;
    if (isOrganizationConfigured()) {
      accessToken = await getPodioOrganizationAccessToken();
    } else {
      accessToken = await getPodioAccessToken(appConfig.appId, appConfig.appToken);
    }
  } else if (appId !== undefined && appId !== null && !Number.isNaN(Number(appId))) {
    resolvedAppId = Number(appId);
    if (isOrganizationConfigured()) {
      accessToken = await getPodioOrganizationAccessToken();
    } else {
      const appConfig = findAppByAppId(resolvedAppId);
      if (!appConfig) {
        throw new PodioError(
          `App ID ${resolvedAppId} is not in podio.config.json and organization credentials are not set.`
        );
      }
      accessToken = await getPodioAccessToken(appConfig.appId, appConfig.appToken);
    }
  } else {
    throw new PodioError('Provide either appName or appId.');
  }

  const appDefinition = await fetchPodioApp(accessToken, resolvedAppId);
  const relations = getDirectAppRelations(appDefinition);

  const allLinkedIds = new Set<number>();
  for (const r of relations) {
    for (const id of r.linkedAppIds) allLinkedIds.add(id);
  }

  const entries: DirectRelationEntry[] = [];

  for (const rel of relations) {
    const linkedApps: LinkedAppInfo[] | undefined = fetchLinkedNames
      ? []
      : undefined;

    if (fetchLinkedNames && linkedApps) {
      for (const linkedId of rel.linkedAppIds) {
        try {
          const linkedApp = await fetchPodioApp(accessToken, linkedId);
          linkedApps.push({
            appId: linkedId,
            appName: linkedApp.name ?? `App ${linkedId}`,
          });
        } catch {
          linkedApps.push({ appId: linkedId });
        }
      }
    }

    entries.push({
      fieldId: rel.fieldId,
      externalId: rel.externalId,
      label: rel.label,
      linkedAppIds: rel.linkedAppIds,
      linkedApps,
    });
  }

  return {
    appName: appDefinition.name ?? `App ${resolvedAppId}`,
    appId: resolvedAppId,
    relations: entries,
    totalLinkedAppIds: allLinkedIds.size,
  };
}
