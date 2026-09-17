# Podio MCP Server

A Model Context Protocol (MCP) server for Podio. Inspect APIs, authenticate, manage items/tasks/apps, and generate TypeScript field configs from Cursor, Claude Desktop, or any MCP-compatible client.

## Features

- **Consolidated Podio tools** — items, apps/spaces, tasks, communication, search, metadata, system
- **Generic API caller** — call any catalogued Podio endpoint via `callPodioApi`
- **OAuth / app-token auth** — organization- and app-level tokens
- **API catalog** — browse and search Podio endpoints
- **HTTP/SSE mode** — optional remote access (Docker / `npm run start:http`)

## Prerequisites

- Node.js 18+
- Podio account with API access
- An MCP client (e.g. Cursor, Claude Desktop)

## Quick start (npm / npx)

Add to your MCP client config (e.g. Cursor `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "podio-developer-mcp": {
      "command": "npx",
      "args": ["-y", "podio-mcp-server"]
    }
  }
}
```

Create `podio.config.json` in the **working directory** the client uses for the server (often your project root):

```bash
cp podio.config.json.example podio.config.json
# edit clientId, clientSecret, apps
```

Restart the client, then verify with `podio_system` operation `ping` or `get_config_status`.

## Install from source

```bash
git clone https://github.com/rijoshrc/podio-mcp-server.git
cd podio-mcp-server
npm install
npm run build
```

Point the client at the built entry:

```json
{
  "mcpServers": {
    "podio-developer-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/podio-mcp-server/dist/index.js"]
    }
  }
}
```

## Development

```bash
npm run build
npm run dev
npm start
npm run lint
npm run format
```

HTTP mode (landing page + SSE):

```bash
npm run start:http
# open http://localhost:3016/
```

## Available tools

| Tool | Description |
|------|-------------|
| `podio_items` | Get, create, update, delete, filter items; field history / revisions |
| `podio_apps_spaces` | Orgs, spaces, apps, streams |
| `podio_tasks` | Get, list, create, update, complete tasks |
| `podio_communication` | Comments, statuses, notifications, tags, subscriptions |
| `podio_search` | Global / app search and contacts |
| `podio_metadata` | API catalog, app fields, app relations (incl. deep / CRM map), forms, views |
| `podio_system` | `ping`, `get_config_status`, field config generation, files, hooks, batch, calendar |
| `callPodioApi` | Call any endpoint from the bundled API catalog |

Most tools take an `operation` enum. Example: `podio_system` with `{ "operation": "ping" }`.

## Project structure

```
podio-mcp-server/
├── src/           # MCP server and tools
├── data/catalog/  # Podio API catalog (required at runtime)
├── dist/          # Compiled output
├── docs/          # Extra documentation
└── index.html     # HTTP landing page
```

## Configuration

See [CONFIGURATION.md](./CONFIGURATION.md). Required: `clientId`, `clientSecret`. Optional: `username`, `password`, `apps[]`.

Secrets live in `podio.config.json` (gitignored). Never commit that file.

## Landing page

In HTTP mode, **GET /** serves [index.html](./index.html) with connect instructions.

## Documentation

- [Configuration](./CONFIGURATION.md)
- [Deployment](./DEPLOYMENT.md)
- [Cursor setup](./docs/CURSOR_SETUP_GUIDE.md)
- [PRD](./docs/PRD.md)

## License

MIT

## Contributing

Issues and PRs welcome on [GitHub](https://github.com/rijoshrc/podio-mcp-server).
