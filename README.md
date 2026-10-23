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
      "args": ["-y", "@phasesdk/mcp-server-for-podio"]
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
git clone https://github.com/phases/mcp-server-for-podio.git
cd mcp-server-for-podio
npm install
npm run build
```

Point the client at the built entry:

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
mcp-server-for-podio/
├── src/           # MCP server and tools
├── data/catalog/  # Podio API catalog (required at runtime)
├── dist/          # Compiled output
├── docs/          # Extra documentation
└── index.html     # HTTP landing page
```

## Configuration

See [CONFIGURATION.md](./CONFIGURATION.md). Required: `clientId`, `clientSecret`. Optional: `username`, `password`, `apps[]`.

Secrets live in `podio.config.json` (gitignored). Never commit that file.

## Deploy (HTTP / remote MCP)

Use this when clients connect over a URL (SSE), not local `npx`/stdio.

**Endpoints**

| Path | Purpose |
|------|---------|
| `GET /` | Landing page (`index.html`) |
| `GET /sse` | MCP SSE session |
| `POST /message?sessionId=...` | MCP messages |
| `GET /health` | Health check |

**Run locally in HTTP mode**

```bash
npm ci && npm run build
PORT=3016 BIND_ADDRESS=0.0.0.0 node dist/index.js
# or: npm run start:http
```

Create `podio.config.json` in the process working directory (copy from `podio.config.json.example`). Bind-mount it for Docker.

**Docker**

```bash
docker build -t mcp-server-for-podio .
docker run --rm -p 3016:3016 \
  -v "$PWD/podio.config.json:/app/podio.config.json:ro" \
  -e PORT=3016 \
  mcp-server-for-podio
```

**Remote client config**

```json
{
  "mcpServers": {
    "podio-developer-mcp": {
      "url": "https://your-host.example/sse"
    }
  }
}
```

Production reverse proxy, TLS, systemd/PM2: see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Publish (GitHub + npm)

Package is ready to ship. From a clean tree after `npm run build`:

1. **GitHub.** The published branch is **`main`** on `phases/mcp-server-for-podio`. Do not push `master`.

```bash
git remote add github git@github.com:phases/mcp-server-for-podio.git   # first time only
git push -u github HEAD:main
```

2. **npm** (logged in as a member of the `phasesdk` org):

```bash
npm whoami
npm publish --access public
```

Bump `version` in `package.json` before republishing. `prepublishOnly` runs `tsc` automatically. Published tarball includes `dist/`, `data/`, `index.html`, and the example config (see `files` in `package.json`).

## Landing page

In HTTP mode, **GET /** serves [index.html](./index.html) with connect instructions.

## Documentation

- [Configuration](./CONFIGURATION.md)
- [Deployment](./DEPLOYMENT.md) — reverse proxy, TLS, systemd/PM2
- [Cursor setup](./CURSOR_CONNECTION_SETUP.md)
- [PRD](./docs/PRD.md)

## License

MIT

## Contributing

Issues and PRs welcome once the GitHub repo is live: [phases/mcp-server-for-podio](https://github.com/phases/mcp-server-for-podio).
