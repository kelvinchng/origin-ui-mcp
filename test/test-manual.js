import { spawn } from 'child_process';

async function testManualMCP() {
  console.log('🔧 Testing MCP Server with Manual JSON-RPC...\n');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseData = '';
  
  server.stdout.on('data', (data) => {
    responseData += data.toString();
    console.log('📨 Server response:', data.toString());
  });
  
  server.stderr.on('data', (data) => {
    console.log('🔍 Server stderr:', data.toString());
  });
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 1: Initialize
  console.log('📍 Test 1: Initialize');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: List tools
  console.log('📍 Test 2: List Tools');
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Call search tool
  console.log('📍 Test 3: Call Search Tool');
  const searchRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_components',
      arguments: {
        query: 'button',
        limit: 2
      }
    }
  };
  
  server.stdin.write(JSON.stringify(searchRequest) + '\n');
  
  // Wait for response
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('🎯 Manual test completed. Check responses above.');
  
  server.kill();
}

testManualMCP().catch(console.error);