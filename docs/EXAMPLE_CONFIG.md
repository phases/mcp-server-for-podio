# Example: How to Fill App Details in Config File

This guide shows you exactly how to fill in your Podio app details in the configuration file.

## Step-by-Step Guide

### Step 1: Find Your App Credentials in Podio

1. **Log in to Podio** at https://podio.com
2. **Navigate to your workspace**
3. **Open the app** you want to configure
4. **Go to App Settings** (gear icon in the app)
5. **Click on "Developer"** tab
6. **You'll see:**
   - **App ID**: A numeric ID (e.g., `12345678`)
   - **App Token**: A long alphanumeric string (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Step 2: Edit the Config File

Open `~/.podio-mcp/config.json` in your text editor.

### Step 3: Fill in the Details

Here's a complete example with all fields filled:

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
      "appToken": "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4"
    },
    {
      "name": "Customers",
      "appId": 11223344,
      "appToken": "m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6"
    }
  ]
}
```

## Field-by-Field Explanation

### Required Fields

#### `clientId` and `clientSecret`
These are your Podio OAuth credentials (not app-specific):
- Go to Podio → Settings → Developer → API
- Create or view your API client
- Copy the **Client ID** and **Client Secret**

**Example:**
```json
"clientId": "podio-client-abc123xyz",
"clientSecret": "podio-secret-def456uvw"
```

#### `apps` Array
Each app object contains:

**`name`** - Friendly name you'll use in MCP commands:
- Use descriptive names: "Projects", "Tasks", "Customers"
- Case doesn't matter: "projects" and "Projects" work the same
- Make it easy to remember and type

**`appId`** - The numeric app ID from Podio:
- Found in App Settings → Developer
- It's a number (no quotes needed in JSON)

**`appToken`** - The app token from Podio:
- Found in App Settings → Developer
- It's a long string (needs quotes in JSON)

**Example for one app:**
```json
{
  "name": "Projects",
  "appId": 12345678,
  "appToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
}
```

### Optional Fields

#### `username` and `password`
Only needed for organization-level APIs:
- Your Podio login email/username
- Your Podio account password
- Leave empty if you only use app-level authentication

**Example:**
```json
"username": "john.doe@example.com",
"password": "your-podio-password"
```

## Real-World Example

Here's what a real config file might look like for a company using Podio:

```json
{
  "clientId": "mycompany-podio-client-2024",
  "clientSecret": "your-podio-client-secret",
  "username": "developer@mycompany.com",
  "password": "SecurePassword123!",
  "apps": [
    {
      "name": "Projects",
      "appId": 12345678,
      "appToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
    },
    {
      "name": "Tasks",
      "appId": 87654321,
      "appToken": "z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"
    },
    {
      "name": "Customer Database",
      "appId": 11223344,
      "appToken": "m1n2o3p4q5r6s7t8u9v0w1x2y3z4a5b6c7d8e9f0"
    },
    {
      "name": "Invoices",
      "appId": 55667788,
      "appToken": "f0e9d8c7b6a5z4y3x2w1v0u9t8s7r6q5p4o3n2m1"
    }
  ]
}
```

## Minimal Example (Just One App)

If you only need one app, here's a minimal config:

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "apps": [
    {
      "name": "My App",
      "appId": 12345678,
      "appToken": "your-app-token-here"
    }
  ]
}
```

## After Filling the Config

1. **Save the file**: `~/.podio-mcp/config.json`
2. **Restart Cursor** (or restart the MCP server)
3. **Test it**: In Cursor, try:
   ```
   List all the fields available in the app Projects
   ```

## Common Mistakes to Avoid

### ❌ Wrong: Using quotes for appId
```json
{
  "name": "Projects",
  "appId": "12345678",  // ❌ Wrong - appId should be a number
  "appToken": "abc123"
}
```

### ✅ Correct: appId as number
```json
{
  "name": "Projects",
  "appId": 12345678,  // ✅ Correct - no quotes
  "appToken": "abc123"
}
```

### ❌ Wrong: Missing comma between apps
```json
"apps": [
  {
    "name": "Projects",
    "appId": 12345678,
    "appToken": "abc123"
  }  // ❌ Missing comma
  {
    "name": "Tasks",
    "appId": 87654321,
    "appToken": "def456"
  }
]
```

### ✅ Correct: Comma between apps
```json
"apps": [
  {
    "name": "Projects",
    "appId": 12345678,
    "appToken": "abc123"
  },  // ✅ Comma here
  {
    "name": "Tasks",
    "appId": 87654321,
    "appToken": "def456"
  }
]
```

### ❌ Wrong: Invalid JSON syntax
```json
{
  "clientId": "abc123",
  "clientSecret": "def456",
  apps: [  // ❌ Missing quotes around "apps"
    {
      name: "Projects",  // ❌ Missing quotes
      appId: 12345678,
      appToken: "abc123"  // ❌ Missing quotes
    }
  ]
}
```

### ✅ Correct: Valid JSON
```json
{
  "clientId": "abc123",
  "clientSecret": "def456",
  "apps": [  // ✅ Quotes around key
    {
      "name": "Projects",  // ✅ Quotes around string values
      "appId": 12345678,
      "appToken": "abc123"  // ✅ Quotes around string values
    }
  ]
}
```

## Validating Your Config

After editing, you can validate the JSON:

```bash
# Check if JSON is valid
cat ~/.podio-mcp/config.json | python3 -m json.tool

# Or use Node.js
node -e "JSON.parse(require('fs').readFileSync('~/.podio-mcp/config.json', 'utf-8'))"
```

If there are no errors, your JSON is valid!

## Quick Reference

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `clientId` | string | Yes | `"podio-client-abc123"` |
| `clientSecret` | string | Yes | `"podio-secret-def456"` |
| `username` | string | No | `"user@example.com"` |
| `password` | string | No | `"your-password"` |
| `apps` | array | No | `[{...}]` |
| `apps[].name` | string | Yes | `"Projects"` |
| `apps[].appId` | number | Yes | `12345678` |
| `apps[].appToken` | string | Yes | `"abc123..."` |

## Need Help?

- Check `CONFIGURATION.md` for general setup
- Check `docs/APP_CONFIGURATION.md` for app-specific details
- Verify your JSON syntax is correct
- Ensure app credentials are correct in Podio

