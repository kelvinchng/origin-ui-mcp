import { OriginUIService } from '../src/originui-service.js';

async function completeCheckboxSearch() {
  console.log('🔍 Complete checkbox component search...\n');
  
  const service = new OriginUIService();
  
  // Wait for discovery
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test all checkbox components from comp-132 to comp-150 + extra ones found
  const allCheckboxIds = [
    'comp-132', 'comp-133', 'comp-134', 'comp-135', 'comp-136', 
    'comp-137', 'comp-138', 'comp-139', 'comp-140', 'comp-141',
    'comp-142', 'comp-143', 'comp-144', 'comp-145', 'comp-146',
    'comp-147', 'comp-148', 'comp-149', 'comp-150', 'comp-151'
  ];
  
  console.log('📍 Testing all checkbox components individually:');
  
  const foundCheckboxes: string[] = [];
  const notFoundCheckboxes: string[] = [];
  
  for (const checkboxId of allCheckboxIds) {
    try {
      const result = await service.searchComponents(checkboxId, undefined, 1);
      const text = result.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        foundCheckboxes.push(checkboxId);
        console.log(`✅ ${checkboxId}: Found`);
      } else {
        notFoundCheckboxes.push(checkboxId);
        console.log(`❌ ${checkboxId}: Not found`);
      }
    } catch (error) {
      notFoundCheckboxes.push(checkboxId);
      console.log(`❌ ${checkboxId}: Error - ${error}`);
    }
  }
  
  console.log(`\n📊 Complete Checkbox Results:`);
  console.log(`✅ Found: ${foundCheckboxes.length}/20 checkbox components`);
  console.log(`❌ Not found: ${notFoundCheckboxes.length}/20 checkbox components`);
  
  if (foundCheckboxes.length > 0) {
    console.log(`\n✅ Available checkbox components: ${foundCheckboxes.join(', ')}`);
    
    // Get installation commands for all found checkboxes
    console.log('\n📦 Installation commands for all checkbox components:');
    for (const checkboxId of foundCheckboxes) {
      try {
        const installResult = await service.getInstallCommand(checkboxId);
        const installText = installResult.content[0].text;
        const commandMatch = installText.match(/```bash\n(.+)\n```/);
        if (commandMatch) {
          console.log(`${checkboxId}: ${commandMatch[1]}`);
        }
      } catch (error) {
        console.log(`${checkboxId}: Error getting install command`);
      }
    }
    
    // Get component details to understand what each checkbox does
    console.log('\n📋 Checkbox component descriptions:');
    for (const checkboxId of foundCheckboxes.slice(0, 10)) { // First 10 to avoid spam
      try {
        const detailsResult = await service.getComponentDetails(checkboxId);
        const detailsText = detailsResult.content[0].text;
        
        // Try to extract meaningful info
        const nameMatch = detailsText.match(/# (.+)/);
        const typeMatch = detailsText.match(/\*\*Type:\*\* (.+)/);
        
        const name = nameMatch ? nameMatch[1] : checkboxId;
        const type = typeMatch ? typeMatch[1] : 'checkbox component';
        
        console.log(`${checkboxId}: ${name} - ${type}`);
      } catch (error) {
        console.log(`${checkboxId}: Error getting details`);
      }
    }
  }
  
  if (notFoundCheckboxes.length > 0) {
    console.log(`\n❌ Missing checkbox components: ${notFoundCheckboxes.join(', ')}`);
  }
  
  // Also include the named checkbox components we found earlier
  console.log('\n📍 Including named checkbox components:');
  const namedCheckboxes = ['checkbox', 'checkbox-tree'];
  
  for (const namedCheckbox of namedCheckboxes) {
    try {
      const result = await service.searchComponents(namedCheckbox, undefined, 1);
      const text = result.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        console.log(`✅ ${namedCheckbox}: Available`);
        foundCheckboxes.push(namedCheckbox);
      }
    } catch (error) {
      console.log(`❌ ${namedCheckbox}: Error`);
    }
  }
  
  // Final summary
  const uniqueCheckboxes = [...new Set(foundCheckboxes)];
  
  console.log('\n🎉 Final Checkbox Component Summary:');
  console.log(`📦 Total unique checkbox components: ${uniqueCheckboxes.length}`);
  console.log(`📝 Component list: ${uniqueCheckboxes.join(', ')}`);
  
  console.log('\n💡 Checkbox component types available:');
  console.log('   • Basic checkboxes (comp-132, comp-133)');
  console.log('   • Colored and styled variants (comp-134, comp-135)');
  console.log('   • Todo-style checkboxes (comp-136, comp-137)');
  console.log('   • Form checkboxes with descriptions (comp-138-142)');
  console.log('   • Card-style selection boxes (comp-143-145)');
  console.log('   • Grouped checkbox selections (comp-146-148)');
  console.log('   • Named checkbox components (checkbox, checkbox-tree)');
}

completeCheckboxSearch().catch(console.error);