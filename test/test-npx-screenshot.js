import { spawn } from 'child_process';

async function testNpxScreenshot() {
  console.log('🌐 Testing Screenshot Function via npx (GitHub)...\n');
  
  console.log('📡 Starting MCP server via npx...');
  const server = spawn('npx', ['--yes', 'github:kelvinchng/origin-ui-mcp'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responses = [];
  let serverReady = false;
  
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        responses.push(response);
      } catch (e) {
        // Non-JSON output
      }
    });
  });
  
  server.stderr.on('data', (data) => {
    const output = data.toString().trim();
    console.log('🔍 Server:', output);
    if (output.includes('OriginUI MCP server running')) {
      serverReady = true;
    }
  });
  
  // Wait for server to download and start
  console.log('⏳ Waiting for server to download and start...');
  let attempts = 0;
  while (!serverReady && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  if (!serverReady) {
    console.log('❌ Server failed to start within 30 seconds');
    server.kill();
    return;
  }
  
  console.log('✅ Server is ready!');
  
  // Initialize
  console.log('\n📡 Initializing MCP connection...');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'npx-test-client', version: '1.0.0' }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test screenshot tool
  console.log('📸 Testing screenshot tool...');
  const screenshotRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'get_component_screenshot',
      arguments: {
        componentId: 'button',
        theme: 'both'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(screenshotRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const screenshotResponse = responses.find(r => r.id === 2);
  if (screenshotResponse?.result?.content) {
    console.log('✅ Screenshot tool works via npx!');
    console.log('   Content items:', screenshotResponse.result.content.length);
    screenshotResponse.result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`   ${index + 1}. TEXT: ${item.text.substring(0, 60)}...`);
      } else if (item.type === 'image') {
        console.log(`   ${index + 1}. IMAGE: ${item.image_url}`);
      }
    });
  } else if (screenshotResponse?.error) {
    console.log('❌ Screenshot tool failed:', screenshotResponse.error.message);
  } else {
    console.log('⏳ No response received');
  }
  
  // Test search with visual hints
  console.log('\n🔍 Testing enhanced search...');
  const searchRequest = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'search_components',
      arguments: {
        query: 'button',
        limit: 1
      }
    }
  };
  
  server.stdin.write(JSON.stringify(searchRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const searchResponse = responses.find(r => r.id === 3);
  if (searchResponse?.result?.content) {
    console.log('✅ Enhanced search works via npx!');
    const text = searchResponse.result.content[0].text;
    console.log('   Has visual hints:', text.includes('get_component_screenshot') ? 'Yes' : 'No');
  }
  
  console.log('\n🎉 npx screenshot testing complete!');
  server.kill();
}

testNpxScreenshot().catch(console.error);