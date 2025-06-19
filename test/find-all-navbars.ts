import { OriginUIService } from '../src/originui-service.js';

async function findAllNavbars() {
  console.log('🔍 Finding all navbar components in OriginUI...\n');
  
  const service = new OriginUIService();
  
  // Wait for background discovery to complete
  console.log('⏳ Waiting for comprehensive discovery to complete...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Search for navbars with high limit to get all results
  console.log('📍 Searching for navbar components (no limit)...');
  try {
    const result = await service.searchComponents('navbar', undefined, 100);
    const text = result.content[0].text;
    
    // Extract component information
    const componentMatches = text.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    const totalCount = componentMatches.length;
    
    console.log(`✅ Found ${totalCount} navbar components total:\n`);
    
    // List all navbar components with their IDs
    componentMatches.forEach((match, index) => {
      const nameMatch = match.match(/\*\*([^*]+)\*\* \(([^)]+)\)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const id = nameMatch[2];
        console.log(`${index + 1}. ${name} (${id})`);
      }
    });
    
    console.log(`\n📊 Total navbar components: ${totalCount}`);
    
    // Also search by navigation category to catch any we might have missed
    console.log('\n📍 Checking navigation category for additional navbars...');
    const navResult = await service.listComponents('navigation', 100);
    const navText = navResult.content[0].text;
    const navbarMatches = navText.match(/\d+\.\s+\*\*[^*]*[Nn]avbar[^*]*\*\*/g) || [];
    
    console.log(`✅ Found ${navbarMatches.length} navbar-related components in navigation category`);
    if (navbarMatches.length > 0) {
      navbarMatches.forEach((match, index) => {
        console.log(`${index + 1}. ${match}`);
      });
    }
    
    // Search for "nav" to catch any additional navigation components
    console.log('\n📍 Searching for "nav" components...');
    const navSearchResult = await service.searchComponents('nav', undefined, 50);
    const navSearchText = navSearchResult.content[0].text;
    const navSearchMatches = navSearchText.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    
    console.log(`✅ Found ${navSearchMatches.length} "nav" components total`);
    
    // Extract unique navigation component IDs
    const allNavIds = new Set();
    navSearchMatches.forEach(match => {
      const idMatch = match.match(/\(([^)]+)\)/);
      if (idMatch) {
        allNavIds.add(idMatch[1]);
      }
    });
    
    console.log(`📋 Unique navigation component IDs: ${Array.from(allNavIds).join(', ')}`);
    
  } catch (error) {
    console.log('❌ Search failed:', error);
  }
  
  // Also check if there's a specific navbar category/page
  console.log('\n📍 Checking if OriginUI has a dedicated navbar page...');
  try {
    // Try searching for components that might be on a navbar-specific page
    const specificResult = await service.searchComponents('navigation', 'navigation', 100);
    const specificText = specificResult.content[0].text;
    const specificMatches = specificText.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    
    console.log(`✅ Found ${specificMatches.length} components in navigation category`);
    
  } catch (error) {
    console.log('❌ Navigation category search failed:', error);
  }
}

findAllNavbars().catch(console.error);