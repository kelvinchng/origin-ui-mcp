#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { OriginUIService } from "./originui-service.js";

class OriginUIMCPServer {
  private server: Server;
  private originUIService: OriginUIService;

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

    this.originUIService = new OriginUIService();
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
                  enum: ["button", "input", "select", "form", "navigation", "card", "data-display", "overlay", "feedback", "layout", "typography", "media"]
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
                  enum: ["button", "input", "select", "form", "navigation", "card", "data-display", "overlay", "feedback", "layout", "typography", "media"]
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
            return await this.originUIService.searchComponents(
              args.query as string,
              args.category as string | undefined,
              args.limit as number | undefined
            );

          case "get_component_details":
            return await this.originUIService.getComponentDetails(
              args.componentId as string
            );

          case "list_components":
            return await this.originUIService.listComponents(
              args.category as string | undefined,
              args.limit as number | undefined
            );

          case "get_install_command":
            return await this.originUIService.getInstallCommand(
              args.componentId as string
            );

          case "get_component_preview":
            return await this.originUIService.getComponentPreview(
              args.componentId as string
            );

          case "get_component_screenshot":
            return await this.originUIService.getComponentScreenshot(
              args.componentId as string,
              args.theme as string | undefined
            );

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
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("OriginUI MCP server running on stdio");
  }
}

const server = new OriginUIMCPServer();
server.run().catch(console.error);