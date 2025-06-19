import { OriginUIService } from '../src/originui-service.js';

async function testScreenshotDirect() {
  console.log('📸 Testing Screenshot Functionality Directly...\n');
  
  const service = new OriginUIService();
  
  // Test 1: Component with screenshots
  console.log('📍 Test 1: Button component (has screenshots)');
  try {
    const result = await service.getComponentScreenshot('button', 'both');
    console.log('✅ Success!');
    console.log('Content items:', result.content.length);
    result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`${index + 1}. TEXT: ${item.text?.substring(0, 150)}...`);
      } else if (item.type === 'image') {
        console.log(`${index + 1}. IMAGE: ${item.image_url}`);
      }
    });
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('\n📍 Test 2: Component without screenshots');
  try {
    const result = await service.getComponentScreenshot('input', 'both');
    console.log('✅ Success!');
    console.log('Content items:', result.content.length);
    result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`${index + 1}. TEXT: ${item.text?.substring(0, 150)}...`);
      }
    });
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('\n📍 Test 3: Search with visual hint');
  try {
    const result = await service.searchComponents('payment', 'form', 2);
    console.log('✅ Search with visual hints:');
    console.log(result.content[0].text.substring(0, 300) + '...');
  } catch (error) {
    console.log('❌ Error:', error);
  }
  
  console.log('\n🎉 All screenshot tests completed!');
}

testScreenshotDirect().catch(console.error);