import { OriginUIService } from '../src/originui-service.js';

async function testMCPServer() {
  console.log('🧪 Testing OriginUI MCP Server...\n');
  
  const service = new OriginUIService();
  
  // Test 1: Search Components
  console.log('📍 Test 1: Search Components');
  try {
    const searchResult = await service.searchComponents('button', undefined, 3);
    console.log('✅ Search test passed');
    console.log('Result:', searchResult.content[0].text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Search test failed:', error);
  }
  
  // Test 2: List Components
  console.log('📍 Test 2: List Components');
  try {
    const listResult = await service.listComponents('form', 5);
    console.log('✅ List test passed');
    console.log('Result:', listResult.content[0].text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ List test failed:', error);
  }
  
  // Test 3: Get Install Command
  console.log('📍 Test 3: Get Install Command');
  try {
    const installResult = await service.getInstallCommand('button');
    console.log('✅ Install command test passed');
    console.log('Result:', installResult.content[0].text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Install command test failed:', error);
  }
  
  // Test 4: Component Details (will test with mock data since we don't have real API)
  console.log('📍 Test 4: Component Details');
  try {
    const detailsResult = await service.getComponentDetails('comp-163');
    console.log('✅ Component details test passed');
    console.log('Result:', detailsResult.content[0].text.substring(0, 300) + '...\n');
  } catch (error) {
    console.log('❌ Component details test failed:', error);
  }
  
  // Test 5: Component Preview
  console.log('📍 Test 5: Component Preview');
  try {
    const previewResult = await service.getComponentPreview('button');
    console.log('✅ Component preview test passed');
    console.log('Result:', previewResult.content[0].text.substring(0, 300) + '...\n');
  } catch (error) {
    console.log('❌ Component preview test failed:', error);
  }
  
  // Test 6: Search with Category Filter
  console.log('📍 Test 6: Search with Category Filter');
  try {
    const categorySearchResult = await service.searchComponents('radio', 'form', 2);
    console.log('✅ Category search test passed');
    console.log('Result:', categorySearchResult.content[0].text.substring(0, 200) + '...\n');
  } catch (error) {
    console.log('❌ Category search test failed:', error);
  }
  
  console.log('🎉 All tests completed!');
}

testMCPServer().catch(console.error);