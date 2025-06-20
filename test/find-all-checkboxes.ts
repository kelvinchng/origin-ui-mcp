import { OriginUIService } from '../src/originui-service.js';

async function findAllCheckboxes() {
  console.log('🔍 Finding all checkbox components in OriginUI using enhanced MCP server...\n');
  
  const service = new OriginUIService();
  
  // Wait for background discovery to complete
  console.log('⏳ Waiting for enhanced discovery to complete...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Search for checkbox components with high limit to get all results
  console.log('📍 Searching for checkbox components (no limit)...');
  try {
    const result = await service.searchComponents('checkbox', undefined, 100);
    const text = result.content[0].text;
    
    // Extract component information
    const componentMatches = text.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    const totalCount = componentMatches.length;
    
    console.log(`✅ Found ${totalCount} checkbox components via search:\n`);
    
    // List all checkbox components with their IDs
    componentMatches.forEach((match, index) => {
      const nameMatch = match.match(/\*\*([^*]+)\*\* \(([^)]+)\)/);
      if (nameMatch) {
        const name = nameMatch[1];
        const id = nameMatch[2];
        console.log(`${index + 1}. ${name} (${id})`);
      }
    });
    
    console.log(`\n📊 Total via "checkbox" search: ${totalCount}`);
    
    // Also search for "checkboxes" plural
    console.log('\n📍 Searching for "checkboxes" (plural)...');
    const pluralResult = await service.searchComponents('checkboxes', undefined, 50);
    const pluralText = pluralResult.content[0].text;
    const pluralMatches = pluralText.match(/\*\*([^*]+)\*\* \(([^)]+)\)/g) || [];
    
    console.log(`✅ Found ${pluralMatches.length} components via "checkboxes" search`);
    
    // Search in input category (checkboxes are often input components)
    console.log('\n📍 Checking input category for checkbox-related components...');
    const inputResult = await service.listComponents('input', 100);
    const inputText = inputResult.content[0].text;
    const checkboxInInput = inputText.match(/\d+\.\s+\*\*[^*]*[Cc]heckbox[^*]*\*\*/g) || [];
    
    console.log(`✅ Found ${checkboxInInput.length} checkbox-related components in input category`);
    if (checkboxInInput.length > 0) {
      checkboxInInput.forEach((match, index) => {
        console.log(`   ${index + 1}. ${match}`);
      });
    }
    
    // Now check if there are specific numbered checkbox components like we found for badges
    console.log('\n📍 Checking for numbered checkbox components...');
    
    // Based on the pattern, checkboxes might be in a specific range
    // Let's check the comp-4xx range and comp-3xx range for potential checkboxes
    const ranges = [
      { start: 300, end: 320, name: 'comp-3xx' },
      { start: 100, end: 120, name: 'comp-1xx' },
      { start: 50, end: 70, name: 'comp-5x' }
    ];
    
    const allFoundCheckboxes: string[] = [];
    
    for (const range of ranges) {
      console.log(`\n📍 Testing ${range.name} range for checkbox components:`);
      
      for (let i = range.start; i <= range.end; i++) {
        const paddedNum = i.toString().padStart(3, '0');
        const componentId = `comp-${paddedNum}`;
        
        try {
          const result = await service.searchComponents(componentId, undefined, 1);
          const text = result.content[0].text;
          
          if (!text.includes('Found 0 component')) {
            // Get component details to see if it's checkbox-related
            const detailsResult = await service.getComponentDetails(componentId);
            const detailsText = detailsResult.content[0].text;
            
            // Check if it contains checkbox-related content
            if (detailsText.toLowerCase().includes('checkbox') || 
                detailsText.toLowerCase().includes('check') ||
                detailsText.toLowerCase().includes('tick')) {
              allFoundCheckboxes.push(componentId);
              console.log(`✅ ${componentId}: Potential checkbox component`);
            }
          }
        } catch (error) {
          // Skip errors, component doesn't exist or can't be accessed
        }
        
        // Small delay to avoid overwhelming
        if (i % 5 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }
    
    console.log(`\n📊 Found ${allFoundCheckboxes.length} numbered checkbox components: ${allFoundCheckboxes.join(', ')}`);
    
    // Get installation commands for the first few checkbox components
    const allCheckboxes = [...new Set([
      ...componentMatches.map(match => {
        const idMatch = match.match(/\(([^)]+)\)/);
        return idMatch ? idMatch[1] : null;
      }).filter(Boolean),
      ...allFoundCheckboxes
    ])];
    
    if (allCheckboxes.length > 0) {
      console.log('\n📦 Installation commands for checkbox components:');
      for (const componentId of allCheckboxes.slice(0, 5)) {
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
    
    console.log(`\n🎉 Total unique checkbox components found: ${allCheckboxes.length}`);
    
  } catch (error) {
    console.log('❌ Search failed:', error);
  }
  
  console.log('\n💡 Recommendation: Use these checkbox components for forms, settings, and user selections in your design system');
}

findAllCheckboxes().catch(console.error);