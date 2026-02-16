/**
 * Field Extraction Logic
 * 
 * Extracts and structures field metadata from Podio app definitions
 */

import { PodioAppDefinition, PodioField } from './podio.js';

/**
 * Extracted field metadata
 */
export interface ExtractedField {
  fieldId: number;
  externalId: string;
  type: string;
  label: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  config?: Record<string, unknown>;
}

/**
 * Field extraction result
 */
export interface FieldExtractionResult {
  fields: ExtractedField[];
  total: number;
  byType: Record<string, ExtractedField[]>;
}

/**
 * Map Podio field types to TypeScript types
 */
function mapPodioTypeToTypeScript(podioType: string): string {
  const typeMap: Record<string, string> = {
    text: 'string',
    number: 'number',
    date: 'string', // ISO date string
    datetime: 'string', // ISO datetime string
    category: 'string | number', // Can be string (option text) or number (option id)
    app: 'number', // App reference (item_id)
    contact: 'number', // Contact ID
    location: 'string', // Location string
    duration: 'number', // Duration in seconds
    calculation: 'number | string', // Can be number or string depending on calculation
    embed: 'string', // URL
    file: 'number[]', // Array of file IDs
    image: 'number[]', // Array of image IDs
    question: 'string | number', // Answer can be text or option ID
    money: 'number', // Amount in cents
    phone: 'string',
    email: 'string',
    progress: 'number', // 0-100
    rating: 'number', // Rating value
    state: 'string', // State value
    relationship: 'number[]', // Array of related item IDs
  };

  return typeMap[podioType.toLowerCase()] || 'unknown';
}

/**
 * Extract field metadata from Podio field
 */
function extractFieldMetadata(field: PodioField): ExtractedField {
  const config = field.config || {};
  
  return {
    fieldId: field.field_id,
    externalId: field.external_id,
    type: field.type,
    label: field.label,
    description: field.description,
    required: config.required === true,
    unique: config.unique === true,
    config: config,
  };
}

/**
 * Extract all fields from Podio app definition
 * Preserves field order from Podio API
 * 
 * @param appDefinition - Podio app definition from API
 * @returns Structured field extraction result
 */
export function extractFields(appDefinition: PodioAppDefinition): FieldExtractionResult {
  if (!appDefinition.fields || !Array.isArray(appDefinition.fields)) {
    return {
      fields: [],
      total: 0,
      byType: {},
    };
  }

  // Extract fields preserving order
  const extractedFields: ExtractedField[] = appDefinition.fields.map(extractFieldMetadata);

  // Group by type
  const byType: Record<string, ExtractedField[]> = {};
  extractedFields.forEach((field) => {
    if (!byType[field.type]) {
      byType[field.type] = [];
    }
    byType[field.type].push(field);
  });

  return {
    fields: extractedFields,
    total: extractedFields.length,
    byType,
  };
}

/**
 * Get TypeScript type for a field
 * 
 * @param field - Extracted field
 * @returns TypeScript type string
 */
export function getTypeScriptType(field: ExtractedField): string {
  return mapPodioTypeToTypeScript(field.type);
}

/**
 * Get all unique field types in the app
 * 
 * @param result - Field extraction result
 * @returns Array of unique field types
 */
export function getFieldTypes(result: FieldExtractionResult): string[] {
  return Object.keys(result.byType);
}

