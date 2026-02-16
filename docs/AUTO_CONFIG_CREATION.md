# Automatic Config File Creation

## How It Works

The Podio MCP Server **automatically creates** the configuration file when Cursor enables the MCP connection.

## Automatic Creation Flow

1. **User enables MCP in Cursor**
   - Cursor reads `.cursor/mcp.json`
   - Cursor starts the MCP server process

2. **Server starts and creates config**
   - Server's `main()` function runs
   - `ensureConfigFile()` is called immediately
   - Config directory `~/.podio-mcp/` is created if needed
   - Config file `~/.podio-mcp/config.json` is created with placeholders

3. **Config file ready**
   - File is created with helpful placeholders
   - User can now edit it with their credentials
   - Server continues running and ready to use

## When Config is Created

The config file is created **automatically** in these scenarios:

- ✅ **First time Cursor connects** to the MCP server
- ✅ **When server starts** (via `npm start` or Cursor connection)
- ✅ **If config file doesn't exist** (even on subsequent starts)

## Config File Location

The config file is created in your home directory:

- **Linux/Mac**: `~/.podio-mcp/config.json`
- **Windows**: `%USERPROFILE%\.podio-mcp\config.json`

## What Gets Created

When the config file is created, it includes:

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

All fields have clear placeholders showing what to fill in.

## Verification

### Check if Config Was Created

You can verify the config file was created:

1. **Check the file exists:**
   ```bash
   ls -la ~/.podio-mcp/config.json
   ```

2. **View the config:**
   ```bash
   cat ~/.podio-mcp/config.json
   ```

3. **Use the MCP tool:**
   In Cursor, ask: "Check the Podio config status"
   Or: "Use the getConfigStatus tool"

### Server Logs

When the server starts, you'll see messages in the server logs:

```
[Podio Config] ✅ Config file created at: /home/username/.podio-mcp/config.json
[Podio Config] 📝 Please edit this file and replace placeholders with your Podio credentials
```

## Troubleshooting

### Config File Not Created

If the config file isn't created automatically:

1. **Check Cursor connection:**
   - Verify MCP server shows as "Connected" in Cursor
   - Check Cursor's MCP logs for errors

2. **Check permissions:**
   - Verify you have write access to your home directory
   - Check: `ls -la ~/`

3. **Manual creation:**
   ```bash
   mkdir -p ~/.podio-mcp
   # Copy from example or create manually
   ```

4. **Check server logs:**
   - Look for `[Podio Config]` messages
   - Check for permission errors

### Permission Errors

If you see permission errors:

```bash
# Check directory permissions
ls -la ~/.podio-mcp/

# Fix permissions if needed
chmod 755 ~/.podio-mcp/
chmod 644 ~/.podio-mcp/config.json
```

### Config File in Wrong Location

The config file should be in `~/.podio-mcp/config.json`. If it's elsewhere:

1. Check the server is using the correct home directory
2. Verify `process.env.HOME` or `process.env.USERPROFILE` is set correctly
3. Check server logs for the actual path used

## Using the Config Status Tool

The MCP server includes a `getConfigStatus` tool to check your configuration:

**In Cursor:**
```
Check the Podio config status
```

**Or:**
```
Use the getConfigStatus tool
```

**Response includes:**
- Whether config file exists
- Config file path
- Whether it's configured (no placeholders)
- List of configured apps
- Helpful message about what needs to be done

## Best Practices

1. **Let it create automatically** - Don't create the file manually unless needed
2. **Check after first connection** - Verify config was created after enabling MCP
3. **Edit placeholders** - Replace all placeholders with your actual credentials
4. **Use getConfigStatus** - Check config status before using Podio features
5. **Keep it secure** - Don't share the config file (it's in your home directory)

## Summary

✅ **Config file is created automatically** when Cursor enables the MCP connection
✅ **No manual setup required** - just enable MCP in Cursor
✅ **Placeholders included** - shows exactly what to fill in
✅ **Status tool available** - check config status anytime via MCP

The entire process is automatic - just enable the MCP connection in Cursor!

