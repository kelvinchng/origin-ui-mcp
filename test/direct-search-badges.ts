import { OriginUIService } from '../src/originui-service.js';

async function directSearchBadges() {
  console.log('🔍 Direct search for specific badge component IDs...\n');
  
  const service = new OriginUIService();
  
  // Wait for discovery
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Search for comp-4xx components (where badges are located)
  console.log('📍 Searching for comp-4xx components (badge range):');
  const comp4Result = await service.searchComponents('comp-4', undefined, 50);
  const comp4Text = comp4Result.content[0].text;
  const comp4Matches = comp4Text.match(/comp-4\d+/g) || [];
  const uniqueComp4 = [...new Set(comp4Matches)];
  
  console.log(`Found ${uniqueComp4.length} comp-4xx components: ${uniqueComp4.join(', ')}\n`);
  
  // Search for each specific badge component individually
  const badgeIds = ['comp-413', 'comp-414', 'comp-415', 'comp-416', 'comp-417', 'comp-418', 'comp-419', 'comp-420', 'comp-421', 'comp-422', 'comp-423', 'comp-424', 'comp-425'];
  
  console.log('📍 Direct search for each badge component:');
  
  const foundBadges: string[] = [];
  const notFoundBadges: string[] = [];
  
  for (const badgeId of badgeIds) {
    try {
      const result = await service.searchComponents(badgeId, undefined, 1);
      const text = result.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        foundBadges.push(badgeId);
        console.log(`✅ ${badgeId}: Found`);
        
        // Get the component details
        const detailsResult = await service.getComponentDetails(badgeId);
        const detailsText = detailsResult.content[0].text;
        const nameMatch = detailsText.match(/# (.+)/);
        const name = nameMatch ? nameMatch[1] : 'Unknown';
        console.log(`   Name: ${name}`);
      } else {
        notFoundBadges.push(badgeId);
        console.log(`❌ ${badgeId}: Not found`);
      }
    } catch (error) {
      notFoundBadges.push(badgeId);
      console.log(`❌ ${badgeId}: Error - ${error}`);
    }
  }
  
  console.log(`\n📊 Results:`);
  console.log(`✅ Found: ${foundBadges.length}/13 badge components`);
  console.log(`❌ Not found: ${notFoundBadges.length}/13 badge components`);
  
  if (foundBadges.length > 0) {
    console.log(`\n✅ Available badge components: ${foundBadges.join(', ')}`);
    
    // Get installation commands for found badges
    console.log('\n📦 Installation commands for available badges:');
    for (const badgeId of foundBadges.slice(0, 5)) {
      try {
        const installResult = await service.getInstallCommand(badgeId);
        const installText = installResult.content[0].text;
        const commandMatch = installText.match(/```bash\n(.+)\n```/);
        if (commandMatch) {
          console.log(`   ${badgeId}: ${commandMatch[1]}`);
        }
      } catch (error) {
        console.log(`   ${badgeId}: Error getting install command`);
      }
    }
  }
  
  if (notFoundBadges.length > 0) {
    console.log(`\n❌ Missing badge components: ${notFoundBadges.join(', ')}`);
    console.log('These components exist in the registry but are not being discovered by the MCP server');
  }
  
  // Test if we can get details for a missing component directly
  if (notFoundBadges.length > 0) {
    const testId = notFoundBadges[0];
    console.log(`\n🔍 Testing direct component details for ${testId}:`);
    try {
      const detailsResult = await service.getComponentDetails(testId);
      const detailsText = detailsResult.content[0].text;
      
      if (!detailsText.includes('Error fetching')) {
        console.log(`✅ Direct details access works for ${testId}`);
        console.log(`   ${detailsText.substring(0, 200)}...`);
      } else {
        console.log(`❌ Direct details access failed for ${testId}`);
      }
    } catch (error) {
      console.log(`❌ Direct details error for ${testId}: ${error}`);
    }
  }
}

directSearchBadges().catch(console.error);