# Cursor Connection Setup

## MCP config (npx)

Add to `.cursor/mcp.json` (or your client’s MCP settings):

```json
{
  "mcpServers": {
    "podio-developer-mcp": {
      "command": "npx",
      "args": ["-y", "@phasesdk/mcp-server-for-podio"]
    }
  }
}
```

## Config file

Create `podio.config.json` in the working directory used by the MCP process (often your project root):

```bash
cp podio.config.json.example podio.config.json
```

Fill in `clientId`, `clientSecret`, and `apps`. See [CONFIGURATION.md](./CONFIGURATION.md).

## Verify

1. Restart Cursor
2. Confirm `podio-developer-mcp` is connected
3. Call `podio_system` with `{ "operation": "ping" }`

## Local path (from source)

```json
{
  "mcpServers": {
    "podio-developer-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server-for-podio/dist/index.js"]
    }
  }
}
```

Replace the path after `npm install && npm run build` in a clone of this repo.
