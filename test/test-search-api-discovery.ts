import { OriginUIService } from '../src/originui-service.js';

async function testSearchAPIDiscovery() {
  console.log('🚀 Testing Enhanced Search API Discovery System...\n');
  
  const service = new OriginUIService();
  
  // Test 1: Trigger comprehensive discovery with search API
  console.log('📍 Test 1: Trigger comprehensive search API discovery');
  try {
    const result = await service.discoverComponents(true);
    console.log('✅ Search API discovery completed!');
    const text = result.content[0].text;
    console.log('   Result:', text.substring(0, 400) + '...\n');
  } catch (error) {
    console.log('❌ Search API discovery failed:', error);
  }
  
  // Test 2: Search for tabs components (should find many more now)
  console.log('📍 Test 2: Search for tabs components using enhanced discovery');
  try {
    const result = await service.searchComponents('tabs', undefined, 50);
    console.log('✅ Tabs search successful!');
    const text = result.content[0].text;
    const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
    console.log(`   Found ${componentCount} tabs components`);
    
    // Extract component IDs
    const componentIds = text.match(/\(([^)]+)\)/g) || [];
    console.log(`   Component IDs: ${componentIds.slice(0, 10).join(', ')}${componentIds.length > 10 ? '...' : ''}`);
  } catch (error) {
    console.log('❌ Tabs search failed:', error);
  }
  
  // Test 3: Search for navbar components
  console.log('\n📍 Test 3: Search for navbar components');
  try {
    const result = await service.searchComponents('navbar', undefined, 50);
    const text = result.content[0].text;
    const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
    console.log(`✅ Found ${componentCount} navbar components`);
  } catch (error) {
    console.log('❌ Navbar search failed:', error);
  }
  
  // Test 4: Test various component types with the new discovery
  console.log('\n📍 Test 4: Search diverse component types with enhanced discovery');
  const testQueries = ['button', 'input', 'modal', 'form', 'authentication', 'payment', 'chart', 'calendar'];
  
  for (const query of testQueries) {
    try {
      const result = await service.searchComponents(query, undefined, 10);
      const text = result.content[0].text;
      const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
      console.log(`   ${componentCount > 0 ? '✅' : '⚠️'} ${query}: Found ${componentCount} components`);
    } catch (error) {
      console.log(`   ❌ ${query} search failed:`, error);
    }
  }
  
  // Test 5: Check for compound/complex component types
  console.log('\n📍 Test 5: Test compound component types (new capability)');
  const compoundQueries = ['credit card', 'drag and drop', 'range slider', 'vertical tabs', 'text editor'];
  
  for (const query of compoundQueries) {
    try {
      const result = await service.searchComponents(query, undefined, 5);
      const text = result.content[0].text;
      const componentCount = (text.match(/\*\*.*?\*\*/g) || []).length;
      console.log(`   ${componentCount > 0 ? '✅' : '⚠️'} "${query}": Found ${componentCount} components`);
    } catch (error) {
      console.log(`   ❌ "${query}" search failed:`, error);
    }
  }
  
  console.log('\n🎉 Enhanced search API discovery testing complete!');
  console.log('\n📊 Summary: This should show significantly more components found via the search API approach');
}

testSearchAPIDiscovery().catch(console.error);