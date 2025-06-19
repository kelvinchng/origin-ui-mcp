import { OriginUIService } from '../src/originui-service.js';

async function findTabsWithScreenshots() {
  console.log('🔍 Finding tabs components with visual previews for design system evaluation...\n');
  
  const service = new OriginUIService();
  
  // Wait for discovery to complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Get tabs components
  console.log('📍 Searching for tabs components...');
  const searchResult = await service.searchComponents('tabs', undefined, 10);
  console.log(searchResult.content[0].text);
  
  // Extract component IDs from the search results
  const componentMatches = searchResult.content[0].text.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
  const componentIds = componentMatches.map(match => {
    const idMatch = match.match(/\(([^)]+)\)/);
    return idMatch ? idMatch[1] : null;
  }).filter(Boolean);
  
  console.log(`\n🖼️ Getting screenshots for ${componentIds.length} tabs components...\n`);
  
  // Get screenshots for each tabs component
  for (const componentId of componentIds.slice(0, 6)) { // Limit to first 6 for manageable output
    console.log(`📸 Getting screenshot for ${componentId}...`);
    try {
      const screenshotResult = await service.getComponentScreenshot(componentId, 'both');
      
      console.log('\n' + '='.repeat(60));
      console.log(`🎨 COMPONENT: ${componentId}`);
      console.log('='.repeat(60));
      
      // Display the component information
      for (const content of screenshotResult.content) {
        if (content.type === 'text' && content.text) {
          console.log(content.text);
        } else if (content.type === 'image' && content.image_url) {
          console.log(`🖼️ Screenshot URL: ${content.image_url}`);
        }
      }
      
      // Get installation command
      const installResult = await service.getInstallCommand(componentId);
      console.log('\n📦 INSTALLATION:');
      console.log(installResult.content[0].text);
      
    } catch (error) {
      console.log(`❌ Failed to get screenshot for ${componentId}: ${error}`);
    }
    
    console.log('\n');
  }
  
  // Also check some specific numbered tabs components we know exist
  console.log('\n🔍 Checking specific numbered tabs components...');
  const specificTabsIds = ['comp-426', 'comp-430', 'comp-435', 'comp-440'];
  
  for (const componentId of specificTabsIds) {
    console.log(`\n📸 Getting details for ${componentId}...`);
    try {
      const detailsResult = await service.getComponentDetails(componentId);
      const screenshotResult = await service.getComponentScreenshot(componentId, 'light');
      
      console.log('\n' + '-'.repeat(40));
      console.log(`🎨 COMPONENT: ${componentId}`);
      console.log('-'.repeat(40));
      
      // Show details
      console.log(detailsResult.content[0].text.substring(0, 500) + '...');
      
      // Show screenshot info
      for (const content of screenshotResult.content) {
        if (content.type === 'image' && content.image_url) {
          console.log(`🖼️ Screenshot: ${content.image_url}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed to get details for ${componentId}: ${error}`);
    }
  }
}

findTabsWithScreenshots().catch(console.error);