import { OriginUIService } from '../src/originui-service.js';

async function findSpecificNavbars() {
  console.log('🔍 Finding all 20 navbar components (comp-577 to comp-596)...\n');
  
  const service = new OriginUIService();
  
  // Wait for discovery to complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check the specific navbar range comp-577 to comp-596 (20 components)
  const navbarIds = Array.from({length: 20}, (_, i) => `comp-${(577 + i).toString()}`);
  
  console.log(`🎨 Getting details for all 20 navbar components from OriginUI navbar page:\n`);
  
  const foundComponents: string[] = [];
  const notFoundComponents: string[] = [];
  
  for (let i = 0; i < navbarIds.length; i++) {
    const componentId = navbarIds[i];
    const componentNumber = i + 1;
    
    console.log(`📍 Checking navbar ${componentNumber}/20: ${componentId}`);
    
    try {
      // Try to search for this specific component
      const searchResult = await service.searchComponents(componentId, undefined, 1);
      const text = searchResult.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        foundComponents.push(componentId);
        console.log(`✅ ${componentId}: Found in MCP`);
        
        // Get installation command
        const installResult = await service.getInstallCommand(componentId);
        const installText = installResult.content[0].text;
        const commandMatch = installText.match(/```bash\n(.+)\n```/);
        if (commandMatch) {
          console.log(`   💾 Install: ${commandMatch[1]}`);
        }
      } else {
        notFoundComponents.push(componentId);
        console.log(`❌ ${componentId}: NOT found in MCP`);
      }
    } catch (error) {
      notFoundComponents.push(componentId);
      console.log(`❌ ${componentId}: Error - ${error}`);
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 Navbar Discovery Results:`);
  console.log(`✅ Found in MCP: ${foundComponents.length}/20 navbar components`);
  console.log(`❌ Missing from MCP: ${notFoundComponents.length}/20 navbar components`);
  
  if (foundComponents.length > 0) {
    console.log(`\n✅ Available navbar components: ${foundComponents.join(', ')}`);
  }
  
  if (notFoundComponents.length > 0) {
    console.log(`\n❌ Missing navbar components: ${notFoundComponents.join(', ')}`);
  }
  
  // Also check for some additional navbar-related components
  console.log(`\n🔍 Checking for additional navbar-related components...`);
  const additionalSearches = ['navbar', 'navigation-menu', 'comp-200', 'comp-201'];
  
  for (const searchTerm of additionalSearches) {
    try {
      const result = await service.searchComponents(searchTerm, undefined, 1);
      const text = result.content[0].text;
      const found = !text.includes('Found 0 component');
      console.log(`${found ? '✅' : '❌'} ${searchTerm}: ${found ? 'Found' : 'Not found'}`);
    } catch (error) {
      console.log(`❌ ${searchTerm}: Error`);
    }
  }
  
  // Summary
  const totalNavbarComponents = foundComponents.length + (foundComponents.includes('navbar') ? 0 : 1); // Add basic navbar if not in range
  console.log(`\n🌟 Total navbar components available: ${totalNavbarComponents}`);
  console.log(`📄 OriginUI navbar page: https://originui.com/navbar`);
  console.log(`📦 Install any navbar: pnpm dlx shadcn@latest add https://originui.com/r/[component-id].json`);
}

findSpecificNavbars().catch(console.error);