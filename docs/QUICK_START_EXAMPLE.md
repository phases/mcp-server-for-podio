# Quick Start: Example Config File

## Where to Find App Credentials

### In Podio:

1. **Log in** to https://podio.com
2. **Open your app** (e.g., "Projects")
3. **Click the gear icon** (⚙️) → **App Settings**
4. **Click "Developer"** tab
5. **You'll see:**
   - **App ID**: `12345678` (a number)
   - **App Token**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` (a long string)

## Example Config File

Here's a complete example of `~/.podio-mcp/config.json`:

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

## What Each Field Means

### `clientId` and `clientSecret`
- Get from: Podio → Settings → Developer → API
- These are your OAuth credentials (not app-specific)
- Required for all authentication

### `username` and `password`
- Your Podio login credentials
- Only needed for organization-level APIs
- Can be left empty if you only use app-level auth

### `apps` Array
Each app has three fields:

1. **`name`**: What you'll type in Cursor commands
   - Example: `"Projects"` → Use: "List fields in app Projects"
   - Case-insensitive: "projects" and "Projects" both work

2. **`appId`**: The numeric ID from Podio
   - Found in: App Settings → Developer
   - It's a **number** (no quotes)

3. **`appToken`**: The token string from Podio
   - Found in: App Settings → Developer
   - It's a **string** (needs quotes)

## Minimal Example (One App)

If you only need one app:

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "apps": [
    {
      "name": "My App",
      "appId": 12345678,
      "appToken": "your-app-token-from-podio"
    }
  ]
}
```

## After Saving

1. **Save** `~/.podio-mcp/config.json`
2. **Restart Cursor**
3. **Test**: "List all the fields available in the app Projects"

## Important Notes

- ✅ `appId` is a **number** (no quotes): `12345678`
- ✅ `appToken` is a **string** (with quotes): `"abc123..."`
- ✅ `name` is a **string** (with quotes): `"Projects"`
- ✅ Add commas between apps in the array
- ✅ Use valid JSON syntax

See `docs/EXAMPLE_CONFIG.md` for more detailed examples and troubleshooting.

