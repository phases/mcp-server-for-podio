/**
 * TypeScript Code Generator
 * 
 * Generates TypeScript files with Podio field configurations
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { ExtractedField, getTypeScriptType } from './fieldExtractor.js';

/**
 * Sanitize app name for use in TypeScript identifier
 */
function sanitizeAppName(appName: string): string {
  // Remove special characters, keep alphanumeric and spaces
  let sanitized = appName.replace(/[^a-zA-Z0-9\s]/g, '');
  
  // Convert to PascalCase
  sanitized = sanitized
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'App' + sanitized;
  }
  
  return sanitized;
}

/**
 * Generate constant name from app name
 */
export function generateConstantName(appName: string): string {
  const sanitized = sanitizeAppName(appName);
  return `podio${sanitized}Fields`;
}

/**
 * Generate JSDoc comment for a field
 */
function generateFieldJSDoc(field: ExtractedField): string {
  const lines: string[] = [];
  lines.push(`  /**`);
  lines.push(`   * ${field.label}`);
  
  if (field.description) {
    lines.push(`   * ${field.description}`);
  }
  
  lines.push(`   * @fieldId ${field.fieldId}`);
  lines.push(`   * @externalId ${field.externalId}`);
  lines.push(`   * @type ${field.type}`);
  
  if (field.required) {
    lines.push(`   * @required`);
  }
  
  if (field.unique) {
    lines.push(`   * @unique`);
  }
  
  lines.push(`   */`);
  return lines.join('\n');
}

/**
 * Generate TypeScript field definition
 */
function generateFieldDefinition(field: ExtractedField): string {
  const jsDoc = generateFieldJSDoc(field);
  const tsType = getTypeScriptType(field);
  
  return `${jsDoc}
  ${field.externalId}: {
    fieldId: ${field.fieldId};
    externalId: '${field.externalId}';
    type: '${field.type}';
    label: '${field.label.replace(/'/g, "\\'")}';
    ${field.description ? `description: '${field.description.replace(/'/g, "\\'")}';` : ''}
    ${field.required ? 'required: true;' : ''}
    ${field.unique ? 'unique: true;' : ''}
    tsType: '${tsType}';
  };`;
}

/**
 * Generate TypeScript file content
 */
function generateTypeScriptContent(
  appName: string,
  appId: number,
  fields: ExtractedField[]
): string {
  const constantName = generateConstantName(appName);
  const fieldDefinitions = fields.map(generateFieldDefinition).join('\n\n');
  
  return `/**
 * Podio Field Configuration
 * 
 * Auto-generated from Podio app: ${appName} (app_id: ${appId})
 * Generated on: ${new Date().toISOString()}
 * 
 * This file contains type-safe field definitions for Podio app integration.
 * Use these definitions when working with Podio items to ensure type safety.
 */

export interface PodioFieldDefinition {
  fieldId: number;
  externalId: string;
  type: string;
  label: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  tsType: string;
}

export interface PodioFields {
${fieldDefinitions}
}

/**
 * Podio field configuration for app: ${appName}
 * 
 * Usage example:
 * \`\`\`typescript
 * import { ${constantName} } from './podio.${appId}.fields';
 * 
 * // Access field by external ID
 * const titleField = ${constantName}.title;
 * 
 * // Use in API calls
 * const item = {
 *   fields: {
 *     [${constantName}.title.externalId]: 'My Item Title',
 *   }
 * };
 * \`\`\`
 */
export const ${constantName}: PodioFields = {
${fields.map(f => `  ${f.externalId}: {
    fieldId: ${f.fieldId},
    externalId: '${f.externalId}',
    type: '${f.type}',
    label: '${f.label.replace(/'/g, "\\'")}',
    ${f.description ? `description: '${f.description.replace(/'/g, "\\'")}',` : ''}
    ${f.required ? 'required: true,' : ''}
    ${f.unique ? 'unique: true,' : ''}
    tsType: '${getTypeScriptType(f)}',
  }`).join(',\n')}
};
`;
}

/**
 * Generate TypeScript file for Podio app fields
 * 
 * @param appName - Name of the Podio app
 * @param appId - Podio app ID
 * @param fields - Extracted field definitions
 * @param outputPath - Path where to write the file
 * @returns Path to generated file
 */
export function generateTypeScriptFile(
  appName: string,
  appId: number,
  fields: ExtractedField[],
  outputPath: string
): string {
  // Create directory if it doesn't exist
  const dir = dirname(outputPath);
  try {
    mkdirSync(dir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw new Error(`Failed to create directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Generate TypeScript content
  const content = generateTypeScriptContent(appName, appId, fields);

  // Write file
  try {
    writeFileSync(outputPath, content, 'utf-8');
  } catch (error) {
    throw new Error(
      `Failed to write TypeScript file to ${outputPath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return outputPath;
}

