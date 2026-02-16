# Cursor MCP Server Setup Guide

This guide explains how to configure and test the Podio MCP Server in Cursor.

## Prerequisites

- Cursor IDE installed
- Node.js 18+ installed
- Podio MCP Server project set up (Tasks 1-2 completed)

## Configuration Steps

### 1. Build the MCP Server

First, ensure the server is built:

```bash
npm run build
```

Or if using ts-node directly:

```bash
npm run dev
```

### 2. Configure Cursor Settings

Open Cursor settings and navigate to MCP Servers configuration.

**Option A: Using Cursor Settings UI**
1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Search for "MCP" or "Model Context Protocol"
3. Click "Edit MCP Servers"
4. Add new server configuration

**Option B: Edit Settings JSON Directly**
1. Open Command Palette (Cmd/Ctrl + Shift + P)
2. Type "Preferences: Open User Settings (JSON)"
3. Add MCP server configuration

### 3. MCP Server Configuration

Add this configuration to your Cursor settings:

```json
{
  "mcpServers": {
    "podio-mcp": {
      "command": "node",
      "args": ["/var/www/html/AI/podio_mcp_server/dist/index.js"],
      "env": {
        "PODIO_CLIENT_ID": "your-client-id",
        "PODIO_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**For Development (using ts-node):**

```json
{
  "mcpServers": {
    "podio-mcp": {
      "command": "npx",
      "args": ["ts-node", "/var/www/html/AI/podio_mcp_server/src/index.ts"],
      "env": {
        "PODIO_CLIENT_ID": "your-client-id",
        "PODIO_CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

**Note:** Replace the path with your actual project path.

### 4. Environment Variables

Set environment variables for Podio authentication:

- `PODIO_CLIENT_ID`: Your Podio OAuth client ID
- `PODIO_CLIENT_SECRET`: Your Podio OAuth client secret

You can set these:
- In the MCP server configuration (as shown above)
- In a `.env` file (if using dotenv)
- As system environment variables

## Verification Steps

### Step 1: Check Connection Status

1. Open Cursor
2. Look for MCP panel or status indicator
3. Verify "podio-mcp" shows as **Connected**

If it shows "Disconnected" or has an error:
- Check the server path is correct
- Verify Node.js is in PATH
- Check server logs for errors
- Ensure dependencies are installed

### Step 2: Test Ping Tool (FIRST TEST)

This is the first testable checkpoint (Task 3).

1. Open Cursor chat
2. Type: "Call the ping tool from the podio MCP server"
3. Or: "Use the ping tool"
4. Verify response is: `"pong"`

**Expected Response:**
```
The ping tool returned: "pong"
```

### Step 3: Verify Server Logs

Check the server console/logs for:
- Server started successfully
- No error messages
- Tool calls being received
- Responses being sent

## Troubleshooting

### Server Not Connecting

**Issue:** MCP server shows as "Disconnected"

**Solutions:**
1. Verify the path to `index.js` is correct
2. Check Node.js is installed: `node --version`
3. Ensure dependencies are installed: `npm install`
4. Check server starts manually: `node dist/index.js`
5. Verify stdio transport is configured correctly

### Ping Tool Not Working

**Issue:** Ping tool doesn't return "pong"

**Solutions:**
1. Check server logs for errors
2. Verify tool is registered correctly
3. Check MCP response format
4. Ensure stdio transport is working
5. Test server manually with MCP client

### Environment Variables Not Loading

**Issue:** Authentication fails due to missing env vars

**Solutions:**
1. Verify env vars in MCP config
2. Check `.env` file exists (if using dotenv)
3. Test env vars are accessible: `process.env.PODIO_CLIENT_ID`
4. Restart Cursor after changing env vars

## Testing Other Tools

After ping works, test other tools:

### Test listApiGroups
```
"Call listApiGroups from the podio MCP server"
```

### Test listApisByGroup
```
"Call listApisByGroup with group 'items'"
```

### Test generatePodioFieldConfig
```
"Call generatePodioFieldConfig with appId 12345 and appToken 'abc123'"
```

## Development Workflow

1. **Make Changes**: Edit code in `src/`
2. **Rebuild**: Run `npm run build` (or use ts-node in dev)
3. **Restart Cursor**: Restart Cursor to reload MCP server
4. **Test**: Use Cursor chat to test tools
5. **Verify**: Check logs and responses

## Next Steps

After verifying ping works:
1. ✅ Task 3 complete - First testable checkpoint passed
2. Continue with Task 4 - Create API Catalog
3. Test each tool as you build it
4. Follow verification checklists in VERIFICATION_STRATEGY.md

## Additional Resources

- See `VERIFICATION_STRATEGY.md` for all test checkpoints
- See `PRD.md` for Cursor checkpoint requirements
- Check TaskMaster tasks for detailed subtasks

