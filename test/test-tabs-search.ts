import { OriginUIService } from '../src/originui-service.js';

async function testTabsSearch() {
  console.log('📂 Testing Tabs Component Search...\n');
  
  const service = new OriginUIService();
  
  // Test 1: Search for "tabs"
  console.log('📍 Test 1: Search for "tabs"');
  try {
    const result = await service.searchComponents('tabs', undefined, 10);
    console.log('✅ Search successful!');
    console.log(result.content[0].text);
  } catch (error) {
    console.log('❌ Search failed:', error);
  }
  
  console.log('\n📍 Test 2: Search in navigation category');
  try {
    const result = await service.searchComponents('tabs', 'navigation', 5);
    console.log('✅ Category search successful!');
    console.log(result.content[0].text);
  } catch (error) {
    console.log('❌ Category search failed:', error);
  }
  
  console.log('\n📍 Test 3: Get screenshot for tabs component');
  try {
    const result = await service.getComponentScreenshot('tabs', 'both');
    console.log('✅ Screenshot test successful!');
    console.log('Content items:', result.content.length);
    result.content.forEach((item, index) => {
      if (item.type === 'text') {
        console.log(`${index + 1}. TEXT: ${item.text?.substring(0, 100)}...`);
      } else if (item.type === 'image') {
        console.log(`${index + 1}. IMAGE: ${item.image_url}`);
      }
    });
  } catch (error) {
    console.log('❌ Screenshot test failed:', error);
  }
  
  console.log('\n🎉 Tabs component testing complete!');
}

testTabsSearch().catch(console.error);