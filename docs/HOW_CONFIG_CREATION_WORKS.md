# How Config File Creation Works

## Automatic Creation When MCP Connection is Enabled

The Podio MCP Server **automatically creates** the configuration file when Cursor enables the MCP connection. Here's exactly how it works:

## The Flow

### Step 1: User Enables MCP in Cursor

1. User adds MCP server to `.cursor/mcp.json`:
   ```json
   {
     "mcpServers": {
       "podio-developer-mcp": {
         "command": "node",
         "args": ["/path/to/dist/index.js"]
       }
     }
   }
   ```

2. User restarts Cursor

### Step 2: Cursor Starts the MCP Server

1. Cursor reads `.cursor/mcp.json`
2. Cursor launches the MCP server process using the command specified
3. Server process starts running

### Step 3: Server Creates Config File

When the server starts, this happens automatically:

1. **`main()` function runs** (in `src/index.ts`)
2. **`ensureConfigFile()` is called** immediately
3. **Config directory created**: `~/.podio-mcp/` (if it doesn't exist)
4. **Config file created**: `~/.podio-mcp/config.json` with placeholders
5. **Server continues** and connects to Cursor

### Step 4: User Sees Confirmation

The server logs show:
```
[Podio Config] ✅ Config file created at: /home/username/.podio-mcp/config.json
[Podio Config] 📝 Please edit this file and replace placeholders with your Podio credentials
```

## Code Flow

```typescript
// src/index.ts
async function main() {
  // This runs FIRST when server starts
  ensureConfigFile();  // ← Creates config file automatically
  
  // Then server initializes
  const server = new Server(...);
  // ... rest of server setup
}

// src/config/podio.config.ts
export function ensureConfigFile(): void {
  // Creates ~/.podio-mcp/ directory
  // Creates ~/.podio-mcp/config.json with placeholders
  // Shows helpful messages
}
```

## When Config is Created

The config file is created automatically in these scenarios:

✅ **First time Cursor connects** - Config file doesn't exist yet
✅ **Every server start** - If config doesn't exist, it's created
✅ **When MCP is enabled** - Server starts → config created

## What Gets Created

The config file includes helpful placeholders:

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

## User Experience

### For the User:

1. **Enable MCP in Cursor** (add to `.cursor/mcp.json`)
2. **Restart Cursor**
3. **Config file is created automatically** ✅
4. **Edit the config file** with their credentials
5. **Use MCP tools** - Everything works!

### No Manual Steps Required:

- ❌ No need to run `npm start` manually
- ❌ No need to create directories
- ❌ No need to copy template files
- ✅ Just enable MCP and restart Cursor!

## Verification

### Check if Config Was Created

**Option 1: Check the file**
```bash
cat ~/.podio-mcp/config.json
```

**Option 2: Use MCP tool**
In Cursor: "Check the Podio config status"

**Option 3: Check server logs**
Look for `[Podio Config]` messages in Cursor's MCP output

## Error Handling

If config creation fails:

1. **Server logs the error** but continues running
2. **Ping tool still works** (doesn't need config)
3. **User sees clear error message** with instructions
4. **Server doesn't crash** - allows manual config creation

## Summary

✅ **Fully Automatic** - Config file created when MCP connection is enabled
✅ **No Manual Steps** - Just enable MCP in Cursor and restart
✅ **Helpful Placeholders** - Shows exactly what to fill in
✅ **Error Resilient** - Server continues even if config creation fails
✅ **User-Friendly** - Clear messages guide the user

The entire process is seamless - users just enable MCP in Cursor and the config file appears automatically!

