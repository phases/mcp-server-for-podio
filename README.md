# Podio MCP Server

A Model Context Protocol (MCP) server for streamlining Podio integration development. This server provides tools to inspect Podio APIs, authenticate with Podio, fetch app metadata, and generate type-safe TypeScript configuration files.

## Features

- 🔍 **API Catalog Tools**: Browse and search Podio API endpoints
- 🔐 **Podio Authentication**: Secure OAuth authentication with app-level tokens
- 📋 **Field Config Generation**: Automated TypeScript config file generation
- 🛡️ **Error Handling**: Comprehensive error handling with human-readable messages
- 📚 **Developer Experience**: Clear documentation and examples

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Podio account with API access
- Cursor IDE (for MCP integration)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podio_mcp_server
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
   ```bash
   npm run build
   ```

4. **Create the configuration file** (required for local/stdio use):
   - The server does **not** create the config file for you. You must create it yourself.
   - **Location**: In the **project root** (same folder as `package.json`), create a file named `podio.config.json`.
   - **Easiest**: Copy the example and edit it:
     ```bash
     cp podio.config.json.example podio.config.json
     ```
   - Open `podio.config.json` and replace the placeholders with your Podio credentials:
     - `clientId` – from Podio Settings → Developer → API
     - `clientSecret` – from the same place
     - `username` / `password` – optional (for organization APIs)
     - `apps` – array of `{ "name": "Your App", "appId": <number>, "appToken": "<token>" }` (get app ID and token from each app’s Developer section)
   - Save the file. The server will read it when you use Podio tools.
   - **Remote (URL / Docker)**: If you connect to the server via a URL (e.g. Docker), do **not** create a file on the server. After connecting, call the **setPodioConfig** tool (podio_system, operation `set_config`) with the same config object. See [CONFIGURATION.md](./CONFIGURATION.md).

5. **Restart Cursor** after adding the MCP server to `.cursor/mcp.json` so the server starts.

## Development

### Build the project:
```bash
npm run build
```

### Run in development mode:
```bash
npm run dev
```

### Run the server:
```bash
npm start
```

### Linting and Formatting:
```bash
npm run lint
npm run format
```

## Cursor Integration

To use this MCP server with Cursor:

1. The server is already configured in `.cursor/mcp.json`
2. **Create** `podio.config.json` in the project root (copy from `podio.config.json.example` and add your credentials). See step 4 in [Installation](#installation).
3. **Restart Cursor** so the MCP server starts
4. Verify the connection with the `ping` tool or `getConfigStatus`

**Note:** Podio credentials are stored in `podio.config.json` in the project root (not in Cursor config). You must create this file yourself; the server does not create it.

## Available Tools

- `ping` - Health check tool that returns "pong"
- `getConfigStatus` - Check the status of the Podio configuration file
- `listAppFields` - List all fields available in a Podio app by app name
- `list_app_relations` (via `podio_metadata`) - List direct app relations for a given app (app-reference fields and linked apps).
- `listApiGroups` - List all API groups (coming soon)
- `listApisByGroup` - List APIs by group (coming soon)
- `getApiDetails` - Get detailed API information (coming soon)
- `searchApis` - Search API catalog (coming soon)
- `generatePodioFieldConfig` - Generate TypeScript field configuration (coming soon)

## Project Structure

```
podio_mcp_server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # MCP tool implementations
│   ├── lib/                  # Core libraries
│   └── config/               # Configuration files
├── data/                     # Data files (API catalog)
├── dist/                     # Compiled output
├── tests/                    # Test files
└── docs/                     # Documentation
```

## Configuration

Podio credentials are stored in `podio.config.json` in the project root. **You create this file** (e.g. copy from `podio.config.json.example` and edit). Required fields:

- `clientId` - Podio OAuth client ID (required)
- `clientSecret` - Podio OAuth client secret (required)
- `username` - Podio username (optional, for organization APIs)
- `password` - Podio password (optional, for organization APIs)
- `apps` - Array of app configurations with name, appId, and appToken

**Note:** The API base URL is hardcoded in the server and doesn't need configuration.

See `CONFIGURATION.md` for detailed setup instructions.

## Testing

Run tests:
```bash
npm test
```

## Landing page

When the server runs in HTTP mode (e.g. Docker or `npm run start:http`), **GET /** serves a landing page with an overview of the MCP server and instructions for adding it to Cursor and other AI tools. Open `http://localhost:3016/` in a browser, or deploy and open your public URL (e.g. `https://podiomcp.bitkit.dk/`). The static file is `index.html` in the project root.

## Documentation

- [PRD](./docs/PRD.md) - Product Requirements Document
- [Configuration](./CONFIGURATION.md) - Detailed configuration instructions
- [Verification Strategy](./docs/VERIFICATION_STRATEGY.md) - Testing checkpoints
- [Cursor Setup Guide](./docs/CURSOR_SETUP_GUIDE.md) - Cursor configuration
- [Task Enhancements](./docs/TASK_ENHANCEMENTS.md) - Implementation details

## License

MIT

## Contributing

See the project documentation for development guidelines and task breakdown.

