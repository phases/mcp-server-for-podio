# Config File Placeholders

## Overview

When the MCP server starts for the first time, it creates `~/.podio-mcp/config.json` with helpful placeholders that show you exactly what to fill in.

## Default Config File with Placeholders

When created, your config file will look like this:

```json
{
  "clientId": "YOUR_PODIO_CLIENT_ID_HERE",
  "clientSecret": "YOUR_PODIO_CLIENT_SECRET_HERE",
  "username": "YOUR_PODIO_USERNAME_HERE",
  "password": "YOUR_PODIO_PASSWORD_HERE",
  "apps": [
    {
      "name": "Example App",
      "appId": 0,
      "appToken": "YOUR_APP_TOKEN_HERE"
    }
  ]
}
```

## What to Replace

### Required Fields

Replace these placeholders with your actual values:

1. **`YOUR_PODIO_CLIENT_ID_HERE`** → Your Podio OAuth Client ID
   - Get from: Podio → Settings → Developer → API
   - Example: `"podio-client-abc123xyz"`

2. **`YOUR_PODIO_CLIENT_SECRET_HERE`** → Your Podio OAuth Client Secret
   - Get from: Podio → Settings → Developer → API
   - Example: `"podio-secret-def456uvw"`

### Optional Fields

3. **`YOUR_PODIO_USERNAME_HERE`** → Your Podio username/email
   - Only needed for organization-level APIs
   - Example: `"john.doe@example.com"`

4. **`YOUR_PODIO_PASSWORD_HERE`** → Your Podio password
   - Only needed for organization-level APIs
   - Example: `"your-podio-password"`

### App Configuration

5. **Replace the example app** with your real apps:

   - **`"Example App"`** → Your app name (what you'll type in commands)
   - **`0`** → Your actual app ID (a number from Podio)
   - **`"YOUR_APP_TOKEN_HERE"`** → Your actual app token (from Podio)

   Or add more apps to the array.

## Example: After Filling Placeholders

Here's what your config should look like after filling in the values:

```json
{
  "clientId": "podio-client-abc123xyz",
  "clientSecret": "podio-secret-def456uvw",
  "username": "john.doe@example.com",
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

## Important Notes

- ✅ **Replace ALL placeholders** before using Podio features
- ✅ **Remove the example app** if you don't need it, or replace it with your real app
- ✅ **Keep placeholders** if you don't need that feature (e.g., username/password for app-only usage)
- ⚠️ **Don't leave placeholders** in fields you plan to use
- ⚠️ **The example app** (appId: 0) will be ignored by the server

## Validation

The server will:
- ✅ Ignore placeholder values when checking configuration
- ✅ Show clear errors if you try to use features with placeholders still present
- ✅ Filter out example apps (appId: 0) from available apps list

## Quick Checklist

Before using the MCP server:

- [ ] Replaced `YOUR_PODIO_CLIENT_ID_HERE` with actual client ID
- [ ] Replaced `YOUR_PODIO_CLIENT_SECRET_HERE` with actual client secret
- [ ] Replaced example app with your real app(s) OR removed it
- [ ] (Optional) Filled in username/password if needed for org APIs
- [ ] Saved the config file
- [ ] Restarted Cursor

## Getting Your Values

See `docs/EXAMPLE_CONFIG.md` for detailed instructions on where to find each value in Podio.

