import { OriginUIService } from '../src/originui-service.js';

async function findAllTabs() {
  console.log('🔍 Finding all tabs components in OriginUI...\n');
  
  const service = new OriginUIService();
  
  // Wait for background discovery to complete
  console.log('⏳ Waiting for comprehensive discovery to complete...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Search for tabs with high limit to get all results
  console.log('📍 Searching for tabs components (no limit)...');
  try {
    const result = await service.searchComponents('tabs', undefined, 100);
    const text = result.content[0].text;
    
    // Extract component information
    const componentMatches = text.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    const totalCount = componentMatches.length;
    
    console.log(`✅ Found ${totalCount} tabs components total:\n`);
    
    // List all tabs components with their IDs
    componentMatches.forEach((match, index) => {
      const nameMatch = match.match(/\*\*([^*]+)\*\* \(([^)]+)\)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const id = nameMatch[2];
        console.log(`${index + 1}. ${name} (${id})`);
      }
    });
    
    console.log(`\n📊 Total tabs components: ${totalCount}`);
    
    // Also search by navigation category to catch any we might have missed
    console.log('\n📍 Checking navigation category for additional tabs...');
    const navResult = await service.listComponents('navigation', 100);
    const navText = navResult.content[0].text;
    const navTabsMatches = navText.match(/\d+\.\s+\*\*[^*]*[Tt]ab[^*]*\*\*/g) || [];
    
    console.log(`✅ Found ${navTabsMatches.length} tabs-related components in navigation category`);
    if (navTabsMatches.length > 0) {
      navTabsMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Search failed:', error);
  }
}

findAllTabs().catch(console.error);