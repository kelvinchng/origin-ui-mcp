# OriginUI MCP Server

A Model Context Protocol (MCP) server that provides access to OriginUI components, enabling Claude Code agents to search, browse, and install OriginUI components seamlessly.

## Features

- **Component Search**: Search components by name, category, or tags
- **Component Details**: Get comprehensive information about specific components
- **Installation Commands**: Generate proper `pnpm dlx shadcn@latest add` commands
- **Component Preview**: View styling information and usage examples
- **Category Filtering**: Browse components by category (buttons, inputs, forms, etc.)

## Installation

### Option 1: Install from GitHub (Recommended)

```bash
git clone https://github.com/yourusername/origin-ui-mcp.git
cd origin-ui-mcp
npm install
npm run build
```

### Option 2: Global Installation (Coming Soon)

```bash
npm install -g origin-ui-mcp
```

## Claude Code Integration

### Step 1: Add to Claude Code MCP Configuration

Create or edit your Claude Code MCP configuration file at `~/.claude-code/mcp.json`:

```json
{
  "mcpServers": {
    "origin-ui": {
      "command": "node",
      "args": ["/absolute/path/to/origin-ui-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

**Important**: Replace `/absolute/path/to/origin-ui-mcp/` with the actual path where you cloned the repository.

### Step 2: Restart Claude Code

After adding the MCP configuration, restart Claude Code to load the OriginUI MCP server.

### Step 3: Verify Integration

You can verify the integration is working by asking Claude Code:

```
"What OriginUI components are available for buttons?"
```

Claude Code should now be able to search, describe, and provide installation commands for OriginUI components.

## Usage Examples

Once integrated with Claude Code, you can ask questions like:

- **"Find me payment-related components"**
- **"How do I install the button component?"** 
- **"What styling options does the card component have?"**
- **"Show me all navigation components"**
- **"I need a component for user input forms"**

Claude Code will use the MCP server to provide accurate information and installation commands.

### Available Tools

#### `search_components`
Search for OriginUI components by name, category, or tags.

**Parameters:**
- `query` (string, required): Search query
- `category` (string, optional): Filter by category
- `limit` (number, optional): Maximum results (default: 10)

**Example:**
```typescript
search_components({
  query: "payment",
  category: "form",
  limit: 5
})
```

#### `get_component_details`
Get detailed information about a specific component.

**Parameters:**
- `componentId` (string, required): Component ID (e.g., "comp-163")

**Example:**
```typescript
get_component_details({
  componentId: "comp-163"
})
```

#### `list_components`
List all available components with basic information.

**Parameters:**
- `category` (string, optional): Filter by category
- `limit` (number, optional): Maximum results (default: 50)

#### `get_install_command`
Get the installation command for a specific component.

**Parameters:**
- `componentId` (string, required): Component ID

**Returns:**
```bash
pnpm dlx shadcn@latest add https://originui.com/r/comp-163.json
```

#### `get_component_preview`
Get component preview with styling information and usage examples.

**Parameters:**
- `componentId` (string, required): Component ID

## Component Categories

- `button` - Button components
- `input` - Input and form controls
- `select` - Select and dropdown components
- `navbar` - Navigation components
- `card` - Card and container components
- `form` - Form-related components
- `layout` - Layout components
- `navigation` - Navigation elements
- `feedback` - Feedback and status components
- `data-display` - Data display components
- `overlay` - Modal and overlay components
- `typography` - Text and typography components
- `media` - Media components

## Example Usage with Claude Code

```typescript
// Search for button components
const buttons = await search_components({
  query: "button",
  category: "button",
  limit: 10
});

// Get details for a specific component
const details = await get_component_details({
  componentId: "comp-163"
});

// Get installation command
const installCmd = await get_install_command({
  componentId: "comp-163"
});

// Install the component
// pnpm dlx shadcn@latest add https://originui.com/r/comp-163.json
```

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Start the MCP server
npm start
```

## How It Works

1. **Component Discovery**: The server maintains a registry of OriginUI components with metadata
2. **Dynamic Fetching**: Component details are fetched from OriginUI's JSON registry on demand
3. **Caching**: Components are cached for 5 minutes to improve performance
4. **Installation**: Generates proper `pnpm dlx shadcn@latest add` commands with correct URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.