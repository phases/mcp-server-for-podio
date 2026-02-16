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

4. Configure Podio credentials:
   - **Config file is created automatically** when Cursor starts the MCP server
   - **IMPORTANT**: After enabling the MCP server in `.cursor/mcp.json`, you **must restart Cursor** for the server to start
   - After restarting Cursor, the config file will be created as `podio.config.json` in the project root directory
   - If the config file wasn't created automatically, use the `createConfigFile` tool in Cursor
   - Edit `podio.config.json` and replace placeholders with your Podio credentials:
   ```json
   {
     "clientId": "your-client-id",
     "clientSecret": "your-client-secret",
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
   - See `CONFIGURATION.md` for detailed instructions

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
2. **Restart Cursor** - This is required for the MCP server to start
3. The config file (`podio.config.json`) will be created automatically in the project root on first connection
4. Edit `podio.config.json` and fill in your Podio credentials (see `CONFIGURATION.md`)
5. Verify the connection works by using the `ping` tool or checking `getConfigStatus`

**Note:** Podio credentials are stored in `podio.config.json` in the project root (not in Cursor config) for better security. This file is automatically created when the MCP server starts.

## Available Tools

- `ping` - Health check tool that returns "pong"
- `getConfigStatus` - Check the status of the Podio configuration file
- `listAppFields` - List all fields available in a Podio app by app name
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

Podio credentials are stored in `podio.config.json` (created automatically in the project root directory when the MCP server starts):

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

