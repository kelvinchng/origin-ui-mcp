import { OriginUIService } from '../src/originui-service.js';

async function searchAllTabsById() {
  console.log('🔍 Searching for all tabs components by specific IDs...\n');
  
  const service = new OriginUIService();
  
  // Wait for discovery to complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Search for all the specific tabs component IDs we know exist
  const tabsIds = [
    'tabs', // named component
    ...Array.from({length: 5}, (_, i) => `comp-${(400 + i).toString().padStart(3, '0')}`), // comp-400 to comp-404
    ...Array.from({length: 20}, (_, i) => `comp-${(426 + i).toString().padStart(3, '0')}`) // comp-426 to comp-445
  ];
  
  console.log(`🔍 Checking ${tabsIds.length} specific tabs component IDs...`);
  
  const foundComponents: string[] = [];
  const notFoundComponents: string[] = [];
  
  for (const tabId of tabsIds) {
    try {
      const result = await service.searchComponents(tabId, undefined, 1);
      const text = result.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        foundComponents.push(tabId);
        console.log(`✅ ${tabId}: Found in MCP`);
      } else {
        notFoundComponents.push(tabId);
        console.log(`❌ ${tabId}: NOT found in MCP`);
      }
    } catch (error) {
      notFoundComponents.push(tabId);
      console.log(`❌ ${tabId}: Error - ${error}`);
    }
  }
  
  console.log(`\n📊 MCP Discovery Results:`);
  console.log(`✅ Found in MCP: ${foundComponents.length}/${tabsIds.length} components`);
  console.log(`❌ Missing from MCP: ${notFoundComponents.length}/${tabsIds.length} components`);
  
  if (foundComponents.length > 0) {
    console.log(`\n✅ Found: ${foundComponents.join(', ')}`);
  }
  
  if (notFoundComponents.length > 0) {
    console.log(`\n❌ Missing: ${notFoundComponents.join(', ')}`);
  }
  
  // Try a broader search for "comp-4" to see what numbered components we have
  console.log(`\n🔍 Searching for comp-4xx components...`);
  const comp4Result = await service.searchComponents('comp-4', undefined, 50);
  const comp4Text = comp4Result.content[0].text;
  const comp4Matches = comp4Text.match(/comp-4\d+/g) || [];
  const uniqueComp4 = [...new Set(comp4Matches)];
  console.log(`Found ${uniqueComp4.length} comp-4xx components: ${uniqueComp4.join(', ')}`);
}

searchAllTabsById().catch(console.error);