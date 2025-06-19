import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testMCPProtocol() {
  console.log('🔌 Testing MCP Protocol Communication...\n');
  
  // Create MCP client with transport that spawns our server
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js']
  });
  
  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });
  
  try {
    // Connect to server
    console.log('📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully\n');
    
    // Test 1: List available tools
    console.log('📍 Test 1: List Tools');
    const toolsResponse = await client.request({
      method: 'tools/list'
    }, {});
    
    console.log('✅ Tools list retrieved');
    console.log(`Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach((tool: any) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();
    
    // Test 2: Call search_components tool
    console.log('📍 Test 2: Call search_components tool');
    const searchResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'search_components',
        arguments: {
          query: 'button',
          limit: 2
        }
      }
    }, {});
    
    console.log('✅ search_components tool called successfully');
    console.log('Response:', searchResponse.content[0].text.substring(0, 200) + '...\n');
    
    // Test 3: Call get_install_command tool
    console.log('📍 Test 3: Call get_install_command tool');
    const installResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'get_install_command',
        arguments: {
          componentId: 'comp-163'
        }
      }
    }, {});
    
    console.log('✅ get_install_command tool called successfully');
    console.log('Response:', installResponse.content[0].text.substring(0, 150) + '...\n');
    
    // Test 4: Call list_components tool
    console.log('📍 Test 4: Call list_components tool');
    const listResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'list_components',
        arguments: {
          category: 'button',
          limit: 3
        }
      }
    }, {});
    
    console.log('✅ list_components tool called successfully');
    console.log('Response:', listResponse.content[0].text.substring(0, 150) + '...\n');
    
    console.log('🎉 All MCP protocol tests passed!');
    
  } catch (error) {
    console.error('❌ MCP test failed:', error);
  } finally {
    // Clean up
    await client.close();
  }
}

testMCPProtocol().catch(console.error);