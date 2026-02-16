/**
 * TypeScript types for Podio API Catalog
 * 
 * Defines the structure of the podio_api_catalog.json file
 */

export interface RateLimit {
  limit: number;
  window: 'hour' | 'minute' | 'day';
}

export interface Parameter {
  type: 'string' | 'integer' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
}

export interface EndpointParams {
  path?: Record<string, Parameter>;
  query?: Record<string, Parameter>;
  body?: Record<string, Parameter>;
}

export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  params: EndpointParams;
  rateLimit: RateLimit;
}

export interface ApiGroup {
  id: string;
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

export interface PodioApiCatalog {
  version: string;
  lastUpdated: string;
  groups: ApiGroup[];
}

