import { OriginUIService } from '../src/originui-service.js';

async function testDynamicDiscovery() {
  console.log('🚀 Testing Enhanced Dynamic Discovery System...\n');
  
  const service = new OriginUIService();
  
  // Wait a moment for background discovery to start
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 1: Search for tabs (should work now with dynamic discovery)
  console.log('📍 Test 1: Search for tabs components');
  try {
    const result = await service.searchComponents('tabs', undefined, 10);
    console.log('✅ Tabs search successful!');
    const text = result.content[0].text;
    const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
    console.log(`   Found ${componentCount} tabs components`);
    console.log('   Sample:', text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Tabs search failed:', error);
  }
  
  // Test 2: Trigger manual discovery
  console.log('📍 Test 2: Trigger manual component discovery');
  try {
    const result = await service.discoverComponents(false);
    console.log('✅ Manual discovery successful!');
    console.log('   Result:', result.content[0].text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Manual discovery failed:', error);
  }
  
  // Test 3: Search for various component types
  const testQueries = ['modal', 'dropdown', 'calendar', 'slider', 'tooltip'];
  
  for (const query of testQueries) {
    console.log(`📍 Test: Search for "${query}" components`);
    try {
      const result = await service.searchComponents(query, undefined, 5);
      const text = result.content[0].text;
      const found = text.includes('Found 0 component') ? 0 : 
                   (text.match(/\*\*.*?\*\*/g) || []).length;
      console.log(`   ${found > 0 ? '✅' : '⚠️'} Found ${found} ${query} components`);
    } catch (error) {
      console.log(`   ❌ ${query} search failed:`, error);
    }
  }
  
  // Test 4: List all components by category
  console.log('\n📍 Test 4: List components by navigation category');
  try {
    const result = await service.listComponents('navigation', 10);
    console.log('✅ Navigation category listing successful!');
    const text = result.content[0].text;
    const componentCount = (text.match(/\d+\./g) || []).length;
    console.log(`   Found ${componentCount} navigation components`);
  } catch (error) {
    console.log('❌ Navigation category listing failed:', error);
  }
  
  console.log('\n🎉 Dynamic discovery testing complete!');
}

testDynamicDiscovery().catch(console.error);