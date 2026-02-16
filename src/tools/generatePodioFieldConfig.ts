/**
 * Generate Podio Field Config Tool
 * 
 * Orchestrates the full workflow:
 * 1. Authenticate with Podio
 * 2. Fetch app definition
 * 3. Extract fields
 * 4. Generate TypeScript file
 */

import { getPodioAccessToken } from '../lib/auth.js';
import { fetchPodioApp } from '../lib/podio.js';
import { extractFields } from '../lib/fieldExtractor.js';
import { generateTypeScriptFile, generateConstantName } from '../lib/codeGenerator.js';
import { join } from 'path';
import { PodioError } from '../lib/errors.js';

export interface GeneratePodioFieldConfigParams {
  appId: number;
  appToken: string;
  outputPath?: string;
}

export interface GeneratePodioFieldConfigResult {
  success: boolean;
  filePath: string;
  fieldCount: number;
  constantName: string;
  appName: string;
  appId: number;
  message?: string;
}

/**
 * Generate Podio field configuration TypeScript file
 * 
 * @param params - Generation parameters
 * @returns Generation result
 */
export async function generatePodioFieldConfig(
  params: GeneratePodioFieldConfigParams
): Promise<GeneratePodioFieldConfigResult> {
  const { appId, appToken, outputPath } = params;

  // Validate inputs
  if (!appId || typeof appId !== 'number' || appId <= 0) {
    throw new PodioError('appId must be a positive number');
  }

  if (!appToken || typeof appToken !== 'string' || appToken.trim() === '') {
    throw new PodioError('appToken must be a non-empty string');
  }

  try {
    // Step 1: Authenticate with Podio
    const accessToken = await getPodioAccessToken(appId, appToken);

    // Step 2: Fetch app definition
    const appDefinition = await fetchPodioApp(accessToken, appId);

    // Step 3: Extract fields
    const extractionResult = extractFields(appDefinition);

    if (extractionResult.total === 0) {
      throw new PodioError(
        `App "${appDefinition.name}" (app_id: ${appId}) has no fields. Cannot generate configuration.`
      );
    }

    // Step 4: Determine output path
    const finalOutputPath =
      outputPath ||
      join(process.cwd(), 'src', 'config', 'podio', `app.${appId}.fields.ts`);

    // Step 5: Generate TypeScript file
    const generatedPath = generateTypeScriptFile(
      appDefinition.name,
      appId,
      extractionResult.fields,
      finalOutputPath
    );

    // Step 6: Return result
    return {
      success: true,
      filePath: generatedPath,
      fieldCount: extractionResult.total,
      constantName: generateConstantName(appDefinition.name),
      appName: appDefinition.name,
      appId: appId,
      message: `Successfully generated field configuration for app "${appDefinition.name}" with ${extractionResult.total} fields.`,
    };
  } catch (error) {
    // Re-throw PodioError as-is (already has proper formatting)
    if (error instanceof PodioError) {
      throw error;
    }

    // Wrap other errors
    throw new PodioError(
      `Failed to generate Podio field configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

