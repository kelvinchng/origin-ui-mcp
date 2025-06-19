import { OriginUIService } from '../src/originui-service.js';

async function testComprehensiveDiscovery() {
  console.log('🚀 Testing Comprehensive Discovery System (500+ components)...\n');
  
  const service = new OriginUIService();
  
  // Test 1: Trigger comprehensive discovery
  console.log('📍 Test 1: Trigger comprehensive component discovery');
  try {
    const result = await service.discoverComponents(true);
    console.log('✅ Comprehensive discovery completed!');
    const text = result.content[0].text;
    console.log('   Result:', text.substring(0, 300) + '...\n');
  } catch (error) {
    console.log('❌ Comprehensive discovery failed:', error);
  }
  
  // Test 2: Search for tabs after discovery
  console.log('📍 Test 2: Search for tabs components (should find many more now)');
  try {
    const result = await service.searchComponents('tabs', undefined, 10);
    console.log('✅ Tabs search successful!');
    const text = result.content[0].text;
    const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
    console.log(`   Found ${componentCount} tabs components`);
  } catch (error) {
    console.log('❌ Tabs search failed:', error);
  }
  
  // Test 3: Search for numbered components
  console.log('📍 Test 3: Search for numbered components (comp-xxx)');
  const numberedQueries = ['comp-001', 'comp-100', 'comp-200', 'comp-300'];
  
  for (const query of numberedQueries) {
    try {
      const result = await service.searchComponents(query, undefined, 1);
      const text = result.content[0].text;
      const found = !text.includes('Found 0 component');
      console.log(`   ${found ? '✅' : '❌'} ${query}: ${found ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`   ❌ ${query} search failed:`, error);
    }
  }
  
  // Test 4: Test various component categories
  console.log('\n📍 Test 4: Search diverse component types');
  const testQueries = ['button', 'input', 'calendar', 'table', 'dialog', 'avatar'];
  
  for (const query of testQueries) {
    try {
      const result = await service.searchComponents(query, undefined, 5);
      const text = result.content[0].text;
      const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
      console.log(`   ${componentCount > 0 ? '✅' : '⚠️'} ${query}: Found ${componentCount} components`);
    } catch (error) {
      console.log(`   ❌ ${query} search failed:`, error);
    }
  }
  
  console.log('\n🎉 Comprehensive discovery testing complete!');
}

testComprehensiveDiscovery().catch(console.error);