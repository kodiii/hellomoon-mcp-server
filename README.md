# HelloMoon Documentation MCP Server

A Model Context Protocol (MCP) server that provides access to HelloMoon's documentation and API information. This server scrapes and parses HelloMoon's official documentation to answer questions about their Solana data streaming platform.

## Features

- 📚 **Documentation Access**: Fetch content from HelloMoon's official documentation
- 🔍 **Smart Search**: Search across documentation for specific topics
- 📊 **Datastream Info**: Get detailed information about available datastream types
- 🚀 **Setup Guides**: Access quickstart and setup instructions
- 💾 **Caching**: Built-in caching to reduce API calls and improve performance

## Available Tools

### Core Tools
- `search_documentation` - Search HelloMoon documentation for specific topics
- `get_datastream_info` - Get detailed information about a specific datastream type
- `list_available_datastreams` - List all available HelloMoon datastream types
- `get_api_endpoints` - Get information about HelloMoon API endpoints
- `get_setup_instructions` - Get setup and quickstart instructions
- `answer_question` - Answer questions about HelloMoon based on documentation

### Available Resources
- `hellomoon-docs://quickstart` - Stream Builder Quickstart documentation
- `hellomoon-docs://datastreams/overview` - Overview of all available datastreams
- `hellomoon-docs://api/reference` - HelloMoon API reference documentation
- `hellomoon-docs://page/{slug}` - Access any documentation page by slug
- `hellomoon-docs://datastream/{type}` - Documentation for specific datastream types

## Installation

### Prerequisites
- Node.js 18+ and npm
- MCP-compatible client (like Cline/Claude Dev)

### Quick Install

#### Option 1: NPM Package (Recommended)
```bash
npx hellomoon-mcp-server
```

#### Option 2: Local Installation
1. Clone this repository:
```bash
git clone https://github.com/kodiii/hellomoon-mcp-server.git
cd hellomoon-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

### Configuration

#### For Cline/Claude Dev
Add to your MCP settings file (`cline_mcp_settings.json`):

```json
{
  "mcpServers": {
    "hellomoon-docs": {
      "command": "npx",
      "args": ["hellomoon-mcp-server"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

#### For Claude Desktop
Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "hellomoon-docs": {
      "command": "npx",
      "args": ["hellomoon-mcp-server"]
    }
  }
}
```

#### Local Development
If you've cloned locally, use the full path:

```json
{
  "mcpServers": {
    "hellomoon-docs": {
      "command": "node",
      "args": ["/path/to/hellomoon-mcp-server/build/index.js"],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📖 [HelloMoon Documentation](https://docs.hellomoon.io)
- 💬 [HelloMoon Discord](https://discord.com/hellomoon)
- 🐛 [Report Issues](https://github.com/kodiii/hellomoon-mcp-server/issues)

## Disclaimer

This is an unofficial MCP server that scrapes HelloMoon's public documentation. It is not affiliated with or endorsed by HelloMoon. For official API access and support, please visit [HelloMoon's official website](https://hellomoon.io).