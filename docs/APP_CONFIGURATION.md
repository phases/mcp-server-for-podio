# Podio App Configuration Guide

## Overview

The Podio MCP Server supports multiple authentication methods and app management:

1. **Organization-level authentication** - For organization-related APIs (username/password)
2. **App-level authentication** - For app-specific APIs (app_id + app_token)
3. **App name lookup** - Find and use apps by friendly names

## Configuration Structure

Your `~/.podio-mcp/config.json` file supports the following structure:

```json
{
  "clientId": "your-podio-client-id",
  "clientSecret": "your-podio-client-secret",
  "username": "your-podio-username",
  "password": "your-podio-password",
  "apps": [
    {
      "name": "Projects",
      "appId": 12345,
      "appToken": "your-app-token-here"
    },
    {
      "name": "Tasks",
      "appId": 67890,
      "appToken": "your-app-token-here"
    }
  ]
}
```

## Field Descriptions

### Required Fields

- `clientId` - Your Podio OAuth client ID (required for all authentication)
- `clientSecret` - Your Podio OAuth client secret (required for all authentication)

### Optional Fields

- `username` - Your Podio username/email (for organization-level APIs)
- `password` - Your Podio password (for organization-level APIs)
- `apps` - Array of app configurations
  - `name` - Friendly name for the app (used in MCP commands, case-insensitive)
  - `appId` - Podio app ID (numeric)
  - `appToken` - Podio app token

**Note:** The API base URL (`https://api.podio.com`) is hardcoded in the server and doesn't need to be configured.

## Using Apps by Name

Once you've configured apps in `~/.podio-mcp/config.json`, you can reference them by name in MCP commands:

### Example: List Fields in an App

**Command in Cursor:**
```
List all the fields available in the app Projects
```

**What happens:**
1. MCP server looks up "Projects" in `~/.podio-mcp/config.json`
2. Finds the app with `name: "Projects"`
3. Uses its `appId` and `appToken` for authentication
4. Fetches the app definition from Podio
5. Returns all fields

### Example: Multiple Apps

If you have multiple apps configured:

```json
{
  "apps": [
    { "name": "Projects", "appId": 12345, "appToken": "..." },
    { "name": "Tasks", "appId": 67890, "appToken": "..." },
    { "name": "Customers", "appId": 11111, "appToken": "..." }
  ]
}
```

You can query any of them:
- "List all the fields available in the app Projects"
- "List all the fields available in the app Tasks"
- "List all the fields available in the app Customers"

## Getting App Credentials

### Finding App ID and App Token

1. **Log in to Podio**
2. **Navigate to your app**
3. **Go to App Settings → Developer**
4. **Find:**
   - **App ID**: Numeric ID (e.g., 12345)
   - **App Token**: Long token string

### Finding Organization Credentials

- **Username**: Your Podio login email/username
- **Password**: Your Podio account password

**Note:** Organization credentials are only needed for organization-level APIs. Most app operations use app-level authentication.

## Configuration Examples

### Minimal Configuration (App Authentication Only)

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "apps": [
    {
      "name": "My App",
      "appId": 12345,
      "appToken": "your-token"
    }
  ]
}
```

### Full Configuration (All Features)

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "username": "user@example.com",
  "password": "your-password",
  "apps": [
    {
      "name": "Projects",
      "appId": 12345,
      "appToken": "token1"
    },
    {
      "name": "Tasks",
      "appId": 67890,
      "appToken": "token2"
    }
  ]
}
```

## Available MCP Tools

### `listAppFields`

Lists all fields in a Podio app by name.

**Usage:**
```
List all the fields available in the app [AppName]
```

**Parameters:**
- `appName` - Name of the app (must match name in config, case-insensitive)

**Returns:**
- App name and ID
- List of all fields with:
  - Field ID
  - External ID
  - Type
  - Label
  - Description (if available)
- Total field count

**Example Response:**
```json
{
  "appName": "Projects",
  "appId": 12345,
  "fields": [
    {
      "fieldId": 1,
      "externalId": "title",
      "type": "text",
      "label": "Title",
      "description": "Project title"
    },
    {
      "fieldId": 2,
      "externalId": "status",
      "type": "category",
      "label": "Status"
    }
  ],
  "totalFields": 2
}
```

## Error Messages

### App Not Found

If you query an app that's not in the config:

```
App "MyApp" not found in configuration. 
Available apps: Projects, Tasks. 
Please check the app name or add it to ~/.podio-mcp/config.json.
```

### No Apps Configured

If no apps are configured:

```
App "MyApp" not found in configuration. 
No apps are configured. 
Please add apps to ~/.podio-mcp/config.json with name, appId, and appToken.
```

### Missing Credentials

If clientId/clientSecret are missing:

```
Podio credentials not configured. 
Please fill in clientId and clientSecret in ~/.podio-mcp/config.json
```

## Best Practices

1. **Use descriptive app names** - Make them easy to remember and type
2. **Keep names consistent** - Use the same naming convention for all apps
3. **Case-insensitive matching** - App names are matched case-insensitively
4. **Secure your config file** - Never share `~/.podio-mcp/config.json` with others
5. **Set file permissions** - Consider `chmod 600 ~/.podio-mcp/config.json`
6. **Use organization credentials only when needed** - Most operations use app-level auth

## Troubleshooting

### App Name Not Working

- Check the exact name in `~/.podio-mcp/config.json` (case doesn't matter, but spelling does)
- Verify the app is in the `apps` array
- Check for typos in the app name

### Authentication Fails

- Verify `clientId` and `clientSecret` are correct
- Check `appId` and `appToken` are correct for the app
- Ensure the app token hasn't expired or been regenerated

### Fields Not Showing

- Verify you have access to the app in Podio
- Check the app ID is correct
- Ensure the app token is valid

## Config File Location

The config file is located in your home directory:
- **Linux/Mac**: `~/.podio-mcp/config.json`
- **Windows**: `%USERPROFILE%\.podio-mcp\config.json`

The directory and file are created automatically on first server start.
