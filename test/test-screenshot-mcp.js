import { spawn } from 'child_process';

async function testScreenshotMCP() {
  console.log('📸 Testing Screenshot Function via MCP Protocol...\n');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responses = [];
  
  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      try {
        const response = JSON.parse(line);
        responses.push(response);
      } catch (e) {
        // Non-JSON output (like server startup message)
      }
    });
  });
  
  server.stderr.on('data', (data) => {
    console.log('🔍 Server:', data.toString().trim());
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Initialize the MCP connection
  console.log('📡 Step 1: Initialize MCP connection...');
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
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('✅ Initialize response:', responses.find(r => r.id === 1)?.result ? 'Success' : 'Failed');
  
  // List available tools
  console.log('\n📋 Step 2: List available tools...');
  const toolsRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  
  server.stdin.write(JSON.stringify(toolsRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const toolsResponse = responses.find(r => r.id === 2);
  if (toolsResponse?.result?.tools) {
    const screenshotTool = toolsResponse.result.tools.find(t => t.name === 'get_component_screenshot');
    console.log('✅ Screenshot tool found:', screenshotTool ? 'Yes' : 'No');
    if (screenshotTool) {
      console.log('   Description:', screenshotTool.description);
      console.log('   Parameters:', Object.keys(screenshotTool.inputSchema.properties));
    }
  }
  
  // Test 1: Screenshot tool with button component
  console.log('\n📸 Step 3: Test screenshot tool with button component...');
  const screenshotRequest1 = {
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'get_component_screenshot',
      arguments: {
        componentId: 'button',
        theme: 'both'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(screenshotRequest1) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const screenshotResponse1 = responses.find(r => r.id === 3);
  if (screenshotResponse1?.result?.content) {
    console.log('✅ Button screenshot test: Success');
    console.log('   Content items:', screenshotResponse1.result.content.length);
    screenshotResponse1.result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`   ${index + 1}. TEXT: ${item.text.substring(0, 80)}...`);
      } else if (item.type === 'image') {
        console.log(`   ${index + 1}. IMAGE: ${item.image_url}`);
      }
    });
  } else if (screenshotResponse1?.error) {
    console.log('❌ Button screenshot test failed:', screenshotResponse1.error.message);
  } else {
    console.log('⏳ Button screenshot test: No response yet');
  }
  
  // Test 2: Screenshot tool with payment component
  console.log('\n💳 Step 4: Test screenshot tool with payment component...');
  const screenshotRequest2 = {
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'get_component_screenshot',
      arguments: {
        componentId: 'comp-163',
        theme: 'light'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(screenshotRequest2) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const screenshotResponse2 = responses.find(r => r.id === 4);
  if (screenshotResponse2?.result?.content) {
    console.log('✅ Payment screenshot test: Success');
    console.log('   Content items:', screenshotResponse2.result.content.length);
    screenshotResponse2.result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`   ${index + 1}. TEXT: ${item.text.substring(0, 80)}...`);
      } else if (item.type === 'image') {
        console.log(`   ${index + 1}. IMAGE: ${item.image_url}`);
      }
    });
  } else if (screenshotResponse2?.error) {
    console.log('❌ Payment screenshot test failed:', screenshotResponse2.error.message);
  } else {
    console.log('⏳ Payment screenshot test: No response yet');
  }
  
  // Test 3: Screenshot tool with non-existent component
  console.log('\n❓ Step 5: Test with non-existent component...');
  const screenshotRequest3 = {
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'get_component_screenshot',
      arguments: {
        componentId: 'non-existent-component'
      }
    }
  };
  
  server.stdin.write(JSON.stringify(screenshotRequest3) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const screenshotResponse3 = responses.find(r => r.id === 5);
  if (screenshotResponse3?.result?.content) {
    console.log('✅ Non-existent component test: Handled gracefully');
    console.log('   Response:', screenshotResponse3.result.content[0].text.substring(0, 100));
  } else if (screenshotResponse3?.error) {
    console.log('❌ Non-existent component test error:', screenshotResponse3.error.message);
  }
  
  // Test 4: Enhanced search with visual hints
  console.log('\n🔍 Step 6: Test enhanced search with visual hints...');
  const searchRequest = {
    jsonrpc: '2.0',
    id: 6,
    method: 'tools/call',
    params: {
      name: 'search_components',
      arguments: {
        query: 'payment',
        limit: 1
      }
    }
  };
  
  server.stdin.write(JSON.stringify(searchRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const searchResponse = responses.find(r => r.id === 6);
  if (searchResponse?.result?.content) {
    console.log('✅ Enhanced search test: Success');
    const searchText = searchResponse.result.content[0].text;
    console.log('   Has visual hint:', searchText.includes('get_component_screenshot') ? 'Yes' : 'No');
    console.log('   Has tip section:', searchText.includes('💡') ? 'Yes' : 'No');
  }
  
  console.log('\n📊 Summary:');
  console.log('Total responses received:', responses.length);
  console.log('Screenshot tool available:', responses.some(r => r.result?.tools?.some(t => t.name === 'get_component_screenshot')));
  console.log('All tests completed!');
  
  server.kill();
  
  console.log('\n🎉 Screenshot function testing complete!');
}

testScreenshotMCP().catch(console.error);