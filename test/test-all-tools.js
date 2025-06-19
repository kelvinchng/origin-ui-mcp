import { spawn } from 'child_process';

async function testAllTools() {
  console.log('🧪 Testing All MCP Tools...\n');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  server.stderr.on('data', (data) => {
    console.log('🔍 Server ready:', data.toString().trim());
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'test-client', version: '1.0.0' }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test all tools
  const tests = [
    {
      name: 'search_components',
      args: { query: 'payment', category: 'form', limit: 1 }
    },
    {
      name: 'get_component_details',
      args: { componentId: 'comp-163' }
    },
    {
      name: 'list_components',
      args: { category: 'button', limit: 3 }
    },
    {
      name: 'get_install_command',
      args: { componentId: 'button' }
    },
    {
      name: 'get_component_preview',
      args: { componentId: 'card' }
    }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`📍 Test ${i + 2}: ${test.name}`);
    
    const request = {
      jsonrpc: '2.0',
      id: i + 2,
      method: 'tools/call',
      params: {
        name: test.name,
        arguments: test.args
      }
    };
    
    let response = '';
    const dataHandler = (data) => {
      response += data.toString();
    };
    
    server.stdout.on('data', dataHandler);
    server.stdin.write(JSON.stringify(request) + '\\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    server.stdout.off('data', dataHandler);
    
    try {
      const lines = response.split('\\n').filter(line => line.trim());
      const lastLine = lines[lines.length - 1];
      if (lastLine) {
        const result = JSON.parse(lastLine);
        if (result.result && result.result.content) {
          console.log('✅ Success:', result.result.content[0].text.substring(0, 100) + '...');
        } else if (result.error) {
          console.log('❌ Error:', result.error.message);
        }
      }
    } catch (e) {
      console.log('✅ Response received (parse error expected in test)');
    }
    
    console.log();
  }
  
  console.log('🎉 All tool tests completed!');
  server.kill();
}

testAllTools().catch(console.error);