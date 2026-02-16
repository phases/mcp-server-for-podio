# Cursor Connection Setup - Quick Guide

## ✅ Server Status

The Podio MCP Server has been added to your Cursor configuration!

## Configuration Added

The server has been configured in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "podio-mcp": {
      "command": "node",
      "args": ["/var/www/html/AI/podio_mcp_server/dist/index.js"]
    }
  }
}
```

**Note:** No secrets are stored in the Cursor config! Podio credentials are managed separately.

## Next Steps

### 1. Config File Created Automatically ✅

**The config file is created automatically when Cursor enables the MCP connection!**

When you restart Cursor:
1. Cursor connects to the MCP server
2. Server starts and creates `~/.podio-mcp/config.json` automatically
3. Config file includes helpful placeholders
4. You can now edit it with your credentials

**No manual steps needed!** Just restart Cursor and the config file will be created.

### 2. Configure Podio Credentials (Optional for now)

The ping tool works without credentials, so you can test the connection first!

When you're ready to use Podio features:

1. **Edit `~/.podio-mcp/config.json`** (already created automatically) and add your credentials:
   ```json
   {
     "clientId": "your-podio-client-id",
     "clientSecret": "your-podio-client-secret",
     "username": "your-username",
     "password": "your-password",
     "apps": [
       {
         "name": "Projects",
         "appId": 12345,
         "appToken": "your-app-token"
       }
     ]
   }
   ```

3. See `CONFIGURATION.md` for detailed instructions.

### 2. Restart Cursor

1. Close Cursor completely
2. Reopen Cursor
3. The MCP server should automatically connect

### 3. Verify Connection

1. Open Cursor
2. Look for the MCP panel or status indicator
3. Check that "podio-mcp" shows as **Connected**

### 4. Test the Ping Tool

In Cursor chat, type:
```
Call the ping tool from the podio MCP server
```

Or simply:
```
Use the ping tool
```

**Expected Response:** `"pong"`

## Troubleshooting

### Server Not Connecting

1. **Check the path is correct:**
   - Verify `/var/www/html/AI/podio_mcp_server/dist/index.js` exists
   - Run: `ls -la /var/www/html/AI/podio_mcp_server/dist/index.js`

2. **Check Node.js is available:**
   - Run: `which node`
   - Verify: `node --version` (should be 18+)

3. **Check server builds:**
   ```bash
   cd /var/www/html/AI/podio_mcp_server
   npm run build
   ```

4. **Test server manually:**
   ```bash
   node /var/www/html/AI/podio_mcp_server/dist/index.js
   ```
   (Press Ctrl+C to stop)

### Connection Issues

- Check Cursor's MCP logs (usually in Cursor's output panel)
- Verify the server path in `.cursor/mcp.json`
- Ensure the file has correct permissions
- Try restarting Cursor

## Verification Checklist

- [ ] Cursor restarted
- [ ] MCP server shows as "Connected" in Cursor
- [ ] Ping tool callable from Cursor
- [ ] Response returns "pong"
- [ ] No errors in Cursor's MCP logs

## Success! 🎉

Once the ping tool works, you've successfully completed **Task 3 - First Testable Checkpoint**!

You can now proceed with:
- Task 4: Create Podio API Catalog JSON
- Task 5-8: Implement API catalog tools
- Task 9: Implement Podio Authentication

