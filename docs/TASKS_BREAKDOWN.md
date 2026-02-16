# Podio MCP Server - Task Breakdown

This document outlines all tasks organized by sprint, with detailed requirements and acceptance criteria.

## Sprint 0: Project Setup

### Task 0.1: Initialize Node.js + TypeScript Project

- **Description**: Set up project structure with TypeScript, ESLint, Prettier, and necessary dependencies
- **Acceptance Criteria**:
  - package.json with TypeScript, @modelcontextprotocol/sdk, and other dependencies
  - tsconfig.json with proper compiler options
  - .gitignore configured
  - README.md with setup instructions
- **Dependencies**: None

### Task 0.2: Create Basic MCP Server Structure

- **Description**: Implement basic MCP server using @modelcontextprotocol/sdk with stdio transport
- **Acceptance Criteria**:
  - Server initializes correctly
  - stdio transport configured
  - Server can be started via npm script
  - Basic error handling in place
- **Dependencies**: Task 0.1

### Task 0.3: Implement Ping Tool

- **Description**: Create basic health check tool that returns "pong"
- **Acceptance Criteria**:
  - Tool registered with MCP server
  - Returns "pong" when called
  - Cursor can successfully call the tool
  - MCP server shows as Connected in Cursor settings
- **Dependencies**: Task 0.2

## Sprint 1: API Catalog Tools

### Task 1.1: Create Podio API Catalog JSON

- **Description**: Create comprehensive JSON file with Podio API endpoints organized by groups
- **Acceptance Criteria**:
  - JSON file includes all major API groups (items, apps, users, tasks, etc.)
  - Each endpoint has: id, method, path, params, rate limits, summary
  - File is valid JSON
  - File is placed in appropriate location (data/ or config/)
- **Dependencies**: None

### Task 1.2: Implement listApiGroups Tool

- **Description**: Create tool that returns all available API groups from catalog
- **Acceptance Criteria**:
  - Returns non-empty array of group names
  - Handles missing catalog file gracefully
  - Returns proper MCP tool response format
- **Dependencies**: Task 1.1

### Task 1.3: Implement listApisByGroup Tool

- **Description**: Create tool that returns all APIs in a specific group
- **Acceptance Criteria**:
  - Accepts group parameter
  - Returns all endpoints for that group
  - Handles invalid group names gracefully
  - Returns empty array for non-existent groups
- **Dependencies**: Task 1.1

### Task 1.4: Implement getApiDetails Tool

- **Description**: Create tool that returns detailed information about a specific API endpoint
- **Acceptance Criteria**:
  - Accepts API id parameter
  - Returns method, path, params, rate limits, summary
  - Handles invalid API ids gracefully
  - Returns clear error messages
- **Dependencies**: Task 1.1

### Task 1.5: Implement searchApis Tool

- **Description**: Create tool that searches API catalog by keyword
- **Acceptance Criteria**:
  - Accepts keyword parameter
  - Searches across id, path, and summary fields
  - Returns matching endpoints
  - Case-insensitive search
  - Handles empty results gracefully
- **Dependencies**: Task 1.1

## Sprint 2: Podio Authentication

### Task 2.1: Implement Podio Authentication Function

- **Description**: Create function to authenticate with Podio using app_id, app_token, and client credentials
- **Acceptance Criteria**:
  - Function accepts appId and appToken parameters
  - Reads PODIO_CLIENT_ID and PODIO_CLIENT_SECRET from environment
  - Makes POST request to /oauth/token/v2 with grant_type: app
  - Returns access_token on success
  - Handles all error cases (invalid credentials, network errors, etc.)
- **Dependencies**: Task 0.2

### Task 2.2: Add Authentication Error Handling

- **Description**: Implement comprehensive error handling for authentication failures
- **Acceptance Criteria**:
  - Returns human-readable error messages
  - Never exposes sensitive tokens in errors
  - Handles network timeouts
  - Handles invalid response formats
  - Server remains operational after errors
- **Dependencies**: Task 2.1

### Task 2.3: Add Environment Variable Validation

- **Description**: Validate required environment variables are present
- **Acceptance Criteria**:
  - Checks for PODIO_CLIENT_ID and PODIO_CLIENT_SECRET
  - Returns clear error if missing
  - Validates format (non-empty strings)
  - Error message guides user to fix issue
- **Dependencies**: Task 2.1

## Sprint 3: App Fetching + TypeScript Config Generation

### Task 3.1: Implement Podio App Fetching

- **Description**: Create function to fetch app definition from Podio API
- **Acceptance Criteria**:
  - Uses authenticated access token
  - Calls /app/{app_id} endpoint
  - Parses response correctly
  - Handles app not found errors
  - Handles permission errors
- **Dependencies**: Task 2.1

### Task 3.2: Implement Field Extraction Logic

- **Description**: Extract and structure field metadata from app definition
- **Acceptance Criteria**:
  - Extracts fieldId, externalId, type, and label for each field
  - Handles different field types correctly
  - Handles apps with no fields
  - Preserves field order
  - Creates structured field map
- **Dependencies**: Task 3.1

### Task 3.3: Create TypeScript Code Generator

- **Description**: Generate TypeScript file with field configuration
- **Acceptance Criteria**:
  - Generates valid TypeScript code
  - Exports constant with proper naming (podio<AppName>Fields)
  - Includes all field metadata (fieldId, externalId, type, label)
  - Creates directories recursively if needed
  - File passes TypeScript compilation
- **Dependencies**: Task 3.2

### Task 3.4: Implement generatePodioFieldConfig Tool

- **Description**: Create MCP tool that orchestrates authentication, fetching, and code generation
- **Acceptance Criteria**:
  - Accepts appId, appToken, and optional outputPath
  - Performs full workflow: auth → fetch → generate
  - Returns path to generated file, field count, and constant name
  - Never outputs sensitive tokens
  - Handles all error cases gracefully
  - Creates file at specified or default location
- **Dependencies**: Task 3.3, Task 2.1

## Sprint 4: Error Handling & Developer Experience

### Task 4.1: Implement Comprehensive Error Handling

- **Description**: Add error handling throughout all tools and functions
- **Acceptance Criteria**:
  - All tools catch and handle errors
  - Error messages are human-readable
  - Errors don't crash the MCP server
  - Error context is preserved for debugging
  - Different error types are categorized
- **Dependencies**: All previous tasks

### Task 4.2: Add Input Validation

- **Description**: Validate all tool inputs before processing
- **Acceptance Criteria**:
  - Validates parameter types
  - Validates parameter ranges (e.g., appId > 0)
  - Returns clear validation error messages
  - Prevents invalid operations early
- **Dependencies**: All previous tasks

### Task 4.3: Implement Rate Limit Protection

- **Description**: Add rate limit awareness and protection
- **Acceptance Criteria**:
  - Tracks rate limit headers from Podio API
  - Implements backoff strategy
  - Returns clear messages when rate limited
  - Prevents unnecessary API calls
- **Dependencies**: Task 2.1, Task 3.1

### Task 4.4: Add Logging Infrastructure

- **Description**: Implement structured logging for debugging and monitoring
- **Acceptance Criteria**:
  - Logs tool calls (without sensitive data)
  - Logs errors with context
  - Configurable log levels
  - Logs to console (and optionally file)
- **Dependencies**: All previous tasks

## Sprint 5: Integration & Polish

### Task 5.1: Add Config Regeneration Support

- **Description**: Ensure configs can be regenerated safely
- **Acceptance Criteria**:
  - Overwrites existing configs without errors
  - Preserves constant names for compatibility
  - Handles file permission errors
  - Validates generated file after creation
- **Dependencies**: Task 3.4

### Task 5.2: Create Developer Documentation

- **Description**: Write comprehensive documentation for using the MCP server
- **Acceptance Criteria**:
  - README with setup instructions
  - Tool usage examples
  - Environment variable documentation
  - Troubleshooting guide
- **Dependencies**: All previous tasks

### Task 5.3: Add Integration Examples

- **Description**: Create example scripts showing how to use generated configs
- **Acceptance Criteria**:
  - Example TypeScript file using generated config
  - Example integration code
  - Comments explaining usage
  - Examples in examples/ directory
- **Dependencies**: Task 3.4

### Task 5.4: Final Testing & Validation

- **Description**: Comprehensive testing of all tools and workflows
- **Acceptance Criteria**:
  - All tools tested with valid inputs
  - All tools tested with invalid inputs
  - Error cases tested
  - Integration tests pass
  - All Cursor checkpoints pass
- **Dependencies**: All previous tasks
