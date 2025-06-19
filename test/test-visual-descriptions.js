import { spawn } from 'child_process';

async function testVisualDescriptions() {
  console.log('🎨 Testing Visual Descriptions for Components...\n');
  
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
        // Non-JSON output
      }
    });
  });
  
  server.stderr.on('data', (data) => {
    console.log('🔍 Server:', data.toString().trim());
  });
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Initialize
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'visual-test-client', version: '1.0.0' }
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Test components with different categories
  const testComponents = [
    { id: 'input', category: 'input', name: 'Input Component' },
    { id: 'card', category: 'card', name: 'Card Component' },
    { id: 'table', category: 'data-display', name: 'Table Component' },
    { id: 'dialog', category: 'overlay', name: 'Dialog Component' }
  ];
  
  for (let i = 0; i < testComponents.length; i++) {
    const component = testComponents[i];
    console.log(`📸 Testing visual description for ${component.name}...`);
    
    const screenshotRequest = {
      jsonrpc: '2.0',
      id: i + 2,
      method: 'tools/call',
      params: {
        name: 'get_component_screenshot',
        arguments: {
          componentId: component.id,
          theme: 'both'
        }
      }
    };
    
    server.stdin.write(JSON.stringify(screenshotRequest) + '\n');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = responses.find(r => r.id === i + 2);
    if (response?.result?.content) {
      console.log(`✅ ${component.name}: Success`);
      
      // Check for visual reference section
      const hasVisualRef = response.result.content.some(item => 
        item.text && item.text.includes('Visual Reference')
      );
      
      // Check for visual features
      const hasVisualFeatures = response.result.content.some(item => 
        item.text && item.text.includes('Key Visual Features')
      );
      
      // Check for use case recommendations
      const hasUseCases = response.result.content.some(item => 
        item.text && item.text.includes('Recommended for')
      );
      
      // Check for category URL
      const hasCategoryUrl = response.result.content.some(item => 
        item.text && item.text.includes('originui.com')
      );
      
      console.log(`   ✓ Visual Reference: ${hasVisualRef ? 'Yes' : 'No'}`);
      console.log(`   ✓ Visual Features: ${hasVisualFeatures ? 'Yes' : 'No'}`);
      console.log(`   ✓ Use Cases: ${hasUseCases ? 'Yes' : 'No'}`);
      console.log(`   ✓ Category URL: ${hasCategoryUrl ? 'Yes' : 'No'}`);
      
      // Show a sample of the visual description
      const visualText = response.result.content.find(item => 
        item.text && item.text.includes('Key Visual Features')
      );
      if (visualText) {
        const match = visualText.text.match(/Key Visual Features.*?- (.+?)(?:\n|$)/);
        if (match) {
          console.log(`   📝 Visual Description: "${match[1]}"`);
        }
      }
      
    } else if (response?.error) {
      console.log(`❌ ${component.name}: Error - ${response.error.message}`);
    } else {
      console.log(`⏳ ${component.name}: No response`);
    }
    
    console.log();
  }
  
  console.log('📊 Testing Summary:');
  console.log(`   Total components tested: ${testComponents.length}`);
  console.log(`   Successful responses: ${responses.filter(r => r.result?.content).length - 1}`); // -1 for init response
  
  server.kill();
  console.log('\n🎉 Visual descriptions testing complete!');
}

testVisualDescriptions().catch(console.error);