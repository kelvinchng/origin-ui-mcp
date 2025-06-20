import { OriginUIService } from '../src/originui-service.js';

async function findAllBadges() {
  console.log('🔍 Finding all badge components in OriginUI using enhanced MCP server...\n');
  
  const service = new OriginUIService();
  
  // Wait for background discovery to complete
  console.log('⏳ Waiting for enhanced discovery to complete...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Search for badge components with high limit to get all results
  console.log('📍 Searching for badge components (no limit)...');
  try {
    const result = await service.searchComponents('badge', undefined, 100);
    const text = result.content[0].text;
    
    // Extract component information
    const componentMatches = text.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    const totalCount = componentMatches.length;
    
    console.log(`✅ Found ${totalCount} badge components total:\n`);
    
    // List all badge components with their IDs
    componentMatches.forEach((match, index) => {
      const nameMatch = match.match(/\*\*([^*]+)\*\* \(([^)]+)\)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const id = nameMatch[2];
        console.log(`${index + 1}. ${name} (${id})`);
      }
    });
    
    console.log(`\n📊 Total badge components: ${totalCount}`);
    
    // Get installation commands for the first few badges
    if (componentMatches.length > 0) {
      console.log('\n📦 Installation commands for top badge components:');
      const firstFewIds = componentMatches.slice(0, 5).map(match => {
        const idMatch = match.match(/\(([^)]+)\)/);
        return idMatch ? idMatch[1] : null;
      }).filter(Boolean);
      
      for (const componentId of firstFewIds) {
        try {
          const installResult = await service.getInstallCommand(componentId);
          const installText = installResult.content[0].text;
          const commandMatch = installText.match(/```bash\n(.+)\n```/);
          if (commandMatch) {
            console.log(`   ${componentId}: ${commandMatch[1]}`);
          }
        } catch (error) {
          console.log(`   ${componentId}: Error getting install command`);
        }
      }
    }
    
    // Also search for "badges" plural to catch any additional ones
    console.log('\n📍 Checking for "badges" (plural) components...');
    const badgesResult = await service.searchComponents('badges', undefined, 50);
    const badgesText = badgesResult.content[0].text;
    const badgesMatches = badgesText.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    
    if (badgesMatches.length > 0) {
      console.log(`✅ Found ${badgesMatches.length} additional components with "badges" in search`);
    } else {
      console.log(`ℹ️ No additional components found for "badges"`);
    }
    
    // Search for feedback category (badges are often feedback components)
    console.log('\n📍 Checking feedback category for badge-related components...');
    const feedbackResult = await service.listComponents('feedback', 50);
    const feedbackText = feedbackResult.content[0].text;
    const badgeInFeedback = feedbackText.match(/\d+\.\s+\*\*[^*]*[Bb]adge[^*]*\*\*/g) || [];
    
    console.log(`✅ Found ${badgeInFeedback.length} badge-related components in feedback category`);
    if (badgeInFeedback.length > 0) {
      badgeInFeedback.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Search failed:', error);
  }
  
  // Check if there's a dedicated badge page like we found for tabs and navbar
  console.log('\n📍 Checking if OriginUI has a dedicated badge page...');
  try {
    // Test a few badge components to get their screenshots/details
    const testBadgeIds = ['badge', 'comp-badge-1', 'comp-badge', 'badges'];
    
    for (const badgeId of testBadgeIds) {
      try {
        const detailsResult = await service.getComponentDetails(badgeId);
        const detailsText = detailsResult.content[0].text;
        
        if (!detailsText.includes('Error fetching')) {
          console.log(`✅ Found detailed info for ${badgeId}`);
          console.log(`   ${detailsText.substring(0, 200)}...`);
          break;
        }
      } catch (error) {
        // Component doesn't exist, continue
      }
    }
  } catch (error) {
    console.log('❌ Error checking badge page:', error);
  }
  
  console.log('\n🎉 Badge component discovery complete!');
  console.log('\n💡 Recommendation: Use these badge components for status indicators, notifications, and labels in your design system');
}

findAllBadges().catch(console.error);