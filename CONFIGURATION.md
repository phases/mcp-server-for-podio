# Podio Configuration Guide

## Overview

The Podio MCP Server uses a configuration file stored in the project root directory to manage Podio credentials. This keeps sensitive information secure and separate from version control (the file is in `.gitignore`).

<<<<<<< HEAD
## Configuration File Location
=======
- **Local (stdio)**: When Cursor runs the server locally, a **config file** (`podio.config.json`) is created in your project root on first connection. You edit that file and the server reads it. The file is in `.gitignore`.
- **Remote (HTTP/SSE / Docker)**: When you connect to a remote server (e.g. Docker at `http://localhost:3016/sse`), the server **does not create a config file**. Reason: the server process runs inside the container (or on another host); its working directory is not your project, so it cannot create `podio.config.json` in your project root. Instead, you provide config from the client by calling the **`setPodioConfig`** tool (podio_system, operation `set_config`) with your `clientId`, `clientSecret`, and `apps`. The server uses that config for your session only.

The Docker image does not include or require `podio.config.json`; config is always provided by the client for remote connections.

## Configuration File Location (local / stdio only)
>>>>>>> ac901e2 (feat: added landing page)

The configuration file is automatically created in the project root directory (where the MCP server code is):

```
podio.config.json
```

On first server start (when Cursor enables the MCP connection), the file is created automatically with placeholders that you need to fill in.

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

### 1. Enable MCP Connection in Cursor

**The config file is created automatically when Cursor enables the MCP connection!**

1. **Restart Cursor** (if not already done)
2. **Cursor automatically starts the MCP server** when it connects
3. **Server creates the config file** automatically as `podio.config.json` in the project root
4. **Check Cursor's MCP logs** or server output for confirmation

You'll see messages like:

```
[Podio Config] ✅ Config file created at: /path/to/project/podio.config.json
[Podio Config] 📝 Please edit this file and replace placeholders with your Podio credentials
```

**No manual server start needed!** The config file is created automatically when Cursor connects to the MCP server.

See `docs/HOW_CONFIG_CREATION_WORKS.md` for detailed explanation of the automatic creation process.

### 2. Edit the Config File

Open `podio.config.json` in the project root directory and fill in your Podio credentials:

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
5. Returns all fields

## Security Notes

- ✅ **Config file is in project root** - Easy to find and edit
- ✅ **Not in version control** - The config file is in `.gitignore` and never committed to git
- ✅ **Local file only** - Config file stays on your machine
- ⚠️ **Keep it secure** - Don't share the config file with others
- ⚠️ **File permissions** - Consider setting restrictive permissions: `chmod 600 podio.config.json`

## Verification

To verify your configuration is working:

1. Check the config file exists and has values:

   ```bash
   cat podio.config.json
   ```

2. Test with MCP tools:
   - Use the `listAppFields` tool with an app name
   - If credentials are invalid, you'll get a clear error message

## Troubleshooting

### Config File Not Created

If the config file isn't created automatically:

1. Check file permissions in the project directory
2. Verify the server has write access to the project root directory
3. Restart Cursor to trigger the automatic creation

### Invalid Credentials Error

If you see "Podio credentials not configured":

1. Verify `podio.config.json` exists in the project root
2. Check that `clientId` and `clientSecret` are filled in (not empty strings)
3. Verify the JSON is valid (no syntax errors)

### App Not Found

If you query an app that's not in the config:

- Check the app name matches exactly (case-insensitive)
- Verify the app is in the `apps` array
- Check for typos in the app name

### Permission Errors

If you get permission errors:

1. Check file permissions: `ls -la podio.config.json`
2. Ensure the file is readable: `chmod 600 podio.config.json`

## Example Config File

See `podio.config.json.example` in the project root for a template. The actual config file `podio.config.json` is created automatically in the same location.

## How It Works

1. **On MCP Server Start**: Server checks for `podio.config.json` in the project root
2. **If Missing**: Creates the file with default placeholders
3. **User Fills Config**: User edits the file with their credentials
4. **MCP Tools Use Config**: When tools are called, they read from the config file
5. **App Lookup**: Tools can find apps by name and use their credentials automatically
