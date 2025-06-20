#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { FastRegistryService } from "./registry-service.js";

class OriginUIMCPServer {
  private server: Server;
  private registryService: FastRegistryService;

  constructor() {
    this.server = new Server(
      {
        name: "origin-ui-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.registryService = new FastRegistryService();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "search_components",
            description: "Search OriginUI components by name, category, or tags",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "Search query for component name, category, or tags",
                },
                category: {
                  type: "string",
                  description: "Filter by specific category (e.g., 'button', 'input', 'navbar')",
                  enum: ["button", "input", "select", "form", "navigation", "card", "data-display", "overlay", "feedback", "layout", "typography", "media", "component"]
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (default: 10)",
                  default: 10,
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_component_details",
            description: "Get detailed information about a specific OriginUI component",
            inputSchema: {
              type: "object",
              properties: {
                componentId: {
                  type: "string",
                  description: "Component ID (e.g., 'comp-163')",
                },
              },
              required: ["componentId"],
            },
          },
          {
            name: "list_components",
            description: "List all available OriginUI components with basic information",
            inputSchema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  description: "Filter by category",
                  enum: ["button", "input", "select", "form", "navigation", "card", "data-display", "overlay", "feedback", "layout", "typography", "media", "component"]
                },
                limit: {
                  type: "number",
                  description: "Maximum number of results to return (default: 50)",
                  default: 50,
                },
              },
            },
          },
          {
            name: "get_install_command",
            description: "Get the installation command for a specific component",
            inputSchema: {
              type: "object",
              properties: {
                componentId: {
                  type: "string",
                  description: "Component ID (e.g., 'comp-163')",
                },
              },
              required: ["componentId"],
            },
          },
          {
            name: "get_component_preview",
            description: "Get component preview information including styling and usage",
            inputSchema: {
              type: "object",
              properties: {
                componentId: {
                  type: "string",
                  description: "Component ID (e.g., 'comp-163')",
                },
              },
              required: ["componentId"],
            },
          },
          {
            name: "get_component_screenshot",
            description: "Get component screenshot/visual preview to help assess if it fits the project",
            inputSchema: {
              type: "object",
              properties: {
                componentId: {
                  type: "string",
                  description: "Component ID (e.g., 'comp-163')",
                },
                theme: {
                  type: "string",
                  description: "Theme preference for screenshot",
                  enum: ["light", "dark", "both"],
                  default: "both"
                },
              },
              required: ["componentId"],
            },
          },
          {
            name: "get_registry_stats",
            description: "Get comprehensive statistics about the OriginUI component registry",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new McpError(ErrorCode.InvalidRequest, "Missing arguments");
      }

      try {
        switch (name) {
          case "search_components":
            return await this.registryService.searchComponents(
              args.query as string,
              args.category as string | undefined,
              args.limit as number | undefined
            );

          case "get_component_details":
            return await this.registryService.getComponentDetails(
              args.componentId as string
            );

          case "list_components":
            return await this.registryService.listComponents(
              args.category as string | undefined,
              args.limit as number | undefined
            );

          case "get_install_command":
            return await this.registryService.getInstallCommand(
              args.componentId as string
            );

          case "get_component_preview":
            // For now, redirect to get_component_details
            return await this.registryService.getComponentDetails(
              args.componentId as string
            );

          case "get_component_screenshot":
            // Return helpful message about using registry stats
            return {
              content: [
                {
                  type: "text",
                  text: `Screenshots are not available in the fast registry. Visit https://originui.com/ to see component previews, or use \`get_component_details\` for component information.`
                }
              ]
            };

          case "get_registry_stats":
            return await this.registryService.getRegistryStats();

          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        if (error instanceof McpError) {
          throw error;
        }
        throw new McpError(
          ErrorCode.InternalError,
          `Error executing tool ${name}: ${error}`
        );
      }
    });
  }

  async run() {
    try {
      // Initialize the registry service
      await this.registryService.initialize();
      
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error("OriginUI MCP server running on stdio with fast registry");
    } catch (error) {
      console.error("Failed to start MCP server:", error);
      process.exit(1);
    }
  }
}

const server = new OriginUIMCPServer();
server.run().catch(console.error);