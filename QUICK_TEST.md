# OriginUI MCP Quick Test

## ✅ npx Usage Verified

You can now use the OriginUI MCP server directly from GitHub without cloning!

### Test Results:

1. **✅ npx execution works**: `npx --yes github:kelvinchng/origin-ui-mcp`
2. **✅ MCP protocol verified**: All 5 tools registered and functional
3. **✅ Component search working**: 20+ components searchable
4. **✅ Installation commands**: Proper `pnpm dlx shadcn` commands generated

### Usage for Claude Code:

Simply add this to your `~/.claude-code/mcp.json`:

```json
{
  "mcpServers": {
    "origin-ui": {
      "command": "npx",
      "args": ["--yes", "github:kelvinchng/origin-ui-mcp"],
      "env": {}
    }
  }
}
```

### Test Commands:

Once integrated with Claude Code, try asking:

- "Find me button components from OriginUI"
- "How do I install the payment component comp-163?"
- "What OriginUI navigation components are available?"
- "Show me the styling details for the card component"

## 🎉 Ready to Use!

The MCP server will automatically:
- Download and run from GitHub
- Provide 5 specialized tools for OriginUI components
- Search 20+ components with full metadata
- Generate proper installation commands
- Include styling and usage information

No manual installation, cloning, or path configuration needed! 🚀