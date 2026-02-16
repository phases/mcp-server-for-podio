/**
 * List Organizations Tool
 * 
 * Lists all organizations accessible to the authenticated user
 * Uses organization-level authentication (username/password)
 */

import { getPodioOrganizationAccessToken } from '../lib/auth.js';
import { fetchPodioOrganizations, PodioOrganization } from '../lib/podio.js';

export interface ListOrganizationsResult {
  organizations: Array<{
    orgId: number;
    name: string;
    url?: string;
    role?: string;
    premium?: boolean;
    tier?: string;
  }>;
  totalCount: number;
}

/**
 * List all organizations accessible to the authenticated user
 * 
 * @returns List of organizations with details
 */
export async function listOrganizations(): Promise<ListOrganizationsResult> {
  // Authenticate with Podio using organization credentials (username/password)
  const accessToken = await getPodioOrganizationAccessToken();

  // Fetch organizations
  const organizations = await fetchPodioOrganizations(accessToken);

  // Transform to result format
  const result: ListOrganizationsResult = {
    organizations: organizations.map((org: PodioOrganization) => ({
      orgId: org.org_id,
      name: org.name,
      url: org.url,
      role: org.role,
      premium: org.premium,
      tier: org.tier,
    })),
    totalCount: organizations.length,
  };

  return result;
}

