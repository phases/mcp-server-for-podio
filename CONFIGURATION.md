# Podio Configuration Guide

## Overview

The Podio MCP Server uses a configuration file to manage Podio credentials. This keeps sensitive information secure and separate from version control (the file is in `.gitignore`).

- **Local (stdio)**: When Cursor (or another MCP client) runs the server locally, create `podio.config.json` in the working directory the client uses (usually your project root). Copy from `podio.config.json.example` and fill in credentials. On first start the server may also create a placeholder file if none exists.
- **Remote (HTTP/SSE / Docker)**: The Docker image does not include `podio.config.json`. For remote deployments, mount or inject config into the server process working directory, or run with credentials available as a local `podio.config.json` on the host that you bind-mount. There is currently **no** remote `set_config` tool.

## Configuration File Location (local / stdio)

```
podio.config.json
```

Place this file in the directory where the MCP server process starts (project root when using a local clone; the cwd used by `npx` / Cursor when using npm).

## Configuration Structure

```json
{
  "clientId": "your-podio-client-id",
  "clientSecret": "your-podio-client-secret",
  "username": "your-podio-username",
  "password": "your-podio-password",
  "apps": [
    {
      "name": "Projects",
      "appId": 12345678,
      "appToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    },
    {
      "name": "Tasks",
      "appId": 87654321,
      "appToken": "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1"
    }
  ]
}
```

**See `docs/EXAMPLE_CONFIG.md` for detailed examples and step-by-step instructions.**

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

## Setup Instructions

### 1. Create the config file

```bash
cp podio.config.json.example podio.config.json
```

Or let the server create a placeholder on first start, then edit it.

### 2. Edit the Config File

Open `podio.config.json` and fill in your Podio credentials:

```json
{
  "clientId": "your-actual-client-id",
  "clientSecret": "your-actual-client-secret",
  "username": "your-username",
  "password": "your-password",
  "apps": [
    {
      "name": "Projects",
      "appId": 12345,
      "appToken": "your-actual-app-token"
    }
  ]
}
```

### 3. Get Podio Credentials

#### Client ID and Secret

1. Log in to your Podio account
2. Go to Settings → Developer → API
3. Create a new API client or use an existing one
4. Copy the Client ID and Client Secret

#### App ID and App Token

1. Navigate to your app in Podio
2. Go to App Settings → Developer
3. Find:
   - **App ID**: Numeric ID (e.g., 12345)
   - **App Token**: Long token string

#### Username and Password

- **Username**: Your Podio login email/username
- **Password**: Your Podio account password

**Note:** Username/password are only needed for organization-level APIs. Most app operations use app-level authentication.

### 4. Restart the Server

After updating the config file, restart the MCP server (or restart Cursor) for changes to take effect.

## Using Apps by Name

Once you've configured apps in the config file, you can reference them by name in MCP commands:

### Example: List Fields in an App

**Command in Cursor:**

```
List all the fields available in the app Projects
```

**What happens:**

1. MCP server looks up "Projects" in `podio.config.json`
2. Finds the app with `name: "Projects"`
3. Uses its `appId` and `appToken` for authentication
4. Fetches the app definition from Podio
5. Returns all fields (via `podio_metadata` operation `list_app_fields`)

## Security Notes

- Config file stays on your machine; it is listed in `.gitignore`
- Do not commit or share `podio.config.json`
- Consider restrictive permissions: `chmod 600 podio.config.json`

## Verification

1. Check the config file exists and has real values (not placeholders)
2. Use MCP tools to verify:
   - `podio_system` with operation `ping`
   - `podio_system` with operation `get_config_status`
   - `podio_metadata` with operation `list_app_fields` and an app name

## Troubleshooting

### Config File Missing

1. Create it from the example: `cp podio.config.json.example podio.config.json`
2. Ensure the server cwd is the directory containing the file
3. Restart Cursor / the MCP client

### Invalid Credentials Error

1. Verify `podio.config.json` exists
2. Check that `clientId` and `clientSecret` are filled in
3. Verify the JSON is valid

### App Not Found

- Check the app name matches (case-insensitive)
- Verify the app is in the `apps` array

### Permission Errors

1. Check file permissions: `ls -la podio.config.json`
2. Ensure the file is readable: `chmod 600 podio.config.json`

## Example Config File

See `podio.config.json.example` in the project root for a template.

## How It Works

1. On MCP server start, the server looks for `podio.config.json` in the process working directory
2. If missing, it may create a placeholder file with default values
3. You edit the file with real credentials
4. MCP tools read from that config when calling Podio APIs
