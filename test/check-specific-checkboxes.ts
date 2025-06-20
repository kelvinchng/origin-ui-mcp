import fetch from 'node-fetch';
import { OriginUIService } from '../src/originui-service.js';

async function checkSpecificCheckboxes() {
  console.log('🔍 Checking specific checkbox components (comp-132 to comp-150)...\n');
  
  // First, check if these checkbox components exist in the registry
  const baseUrl = 'https://originui.com/r';
  const checkboxRange = Array.from({length: 19}, (_, i) => `comp-${132 + i}`);
  
  console.log('📍 Checking direct registry access for checkbox components:');
  const existingCheckboxes: string[] = [];
  
  for (const checkboxId of checkboxRange) {
    const url = `${baseUrl}/${checkboxId}.json`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        existingCheckboxes.push(checkboxId);
        console.log(`✅ ${checkboxId}: EXISTS in registry`);
      } else {
        console.log(`❌ ${checkboxId}: NOT FOUND (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${checkboxId}: ERROR - ${error}`);
    }
  }
  
  console.log(`\n📊 Registry Summary: ${existingCheckboxes.length}/19 checkbox components exist`);
  
  // Now check if our MCP server can find these components
  console.log('\n📍 Testing MCP server discovery for existing checkbox components:');
  const service = new OriginUIService();
  
  // Wait for discovery
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const foundByMcp: string[] = [];
  const notFoundByMcp: string[] = [];
  
  for (const checkboxId of existingCheckboxes.slice(0, 10)) { // Test first 10 to avoid overwhelming
    try {
      const searchResult = await service.searchComponents(checkboxId, undefined, 1);
      const text = searchResult.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        foundByMcp.push(checkboxId);
        console.log(`✅ ${checkboxId}: Found by MCP server`);
      } else {
        notFoundByMcp.push(checkboxId);
        console.log(`❌ ${checkboxId}: NOT found by MCP server`);
      }
    } catch (error) {
      notFoundByMcp.push(checkboxId);
      console.log(`❌ ${checkboxId}: MCP server error - ${error}`);
    }
  }
  
  console.log(`\n📊 MCP Discovery Results:`);
  console.log(`✅ Found by MCP: ${foundByMcp.length} checkbox components`);
  console.log(`❌ Not found by MCP: ${notFoundByMcp.length} checkbox components`);
  
  // Get installation commands for found checkboxes
  if (foundByMcp.length > 0) {
    console.log('\n📦 Installation commands for available checkbox components:');
    for (const checkboxId of foundByMcp.slice(0, 5)) {
      try {
        const installResult = await service.getInstallCommand(checkboxId);
        const installText = installResult.content[0].text;
        const commandMatch = installText.match(/```bash\n(.+)\n```/);
        if (commandMatch) {
          console.log(`   ${checkboxId}: ${commandMatch[1]}`);
        }
      } catch (error) {
        console.log(`   ${checkboxId}: Error getting install command`);
      }
    }
  }
  
  // Get details for a few checkbox components to understand their content
  if (foundByMcp.length > 0) {
    console.log('\n📋 Details for some checkbox components:');
    for (const checkboxId of foundByMcp.slice(0, 3)) {
      try {
        const detailsResult = await service.getComponentDetails(checkboxId);
        const detailsText = detailsResult.content[0].text;
        const nameMatch = detailsText.match(/# (.+)/);
        const name = nameMatch ? nameMatch[1] : checkboxId;
        console.log(`   ${checkboxId}: ${name}`);
      } catch (error) {
        console.log(`   ${checkboxId}: Error getting details`);
      }
    }
  }
  
  // Check the checkbox page source to understand the structure
  console.log('\n📍 Analyzing checkbox page HTML extraction:');
  try {
    const response = await fetch('https://originui.com/checkbox');
    if (response.ok) {
      const html = await response.text();
      console.log(`Checkbox page length: ${html.length} characters`);
      
      // Look for registry URLs
      const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
      console.log(`Found ${registryMatches.length} registry URLs on checkbox page`);
      
      // Check for comp-13x to comp-15x specifically  
      const checkboxCompMatches = html.match(/comp-1[3-5]\d/g) || [];
      console.log(`Found ${checkboxCompMatches.length} checkbox component IDs (comp-13x to comp-15x) in HTML`);
      
      if (checkboxCompMatches.length > 0) {
        const uniqueCheckboxIds = [...new Set(checkboxCompMatches)];
        console.log(`Unique checkbox component IDs found: ${uniqueCheckboxIds.join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`❌ Error analyzing checkbox page: ${error}`);
  }
  
  // Final summary
  console.log('\n🎯 Summary:');
  console.log(`📦 Total checkbox components available: ${existingCheckboxes.length}`);
  console.log(`✅ Accessible via MCP: ${foundByMcp.length}`);
  console.log(`❌ Missing from MCP search: ${notFoundByMcp.length}`);
  
  if (foundByMcp.length > 0) {
    console.log(`\n✅ Available checkbox components: ${foundByMcp.join(', ')}`);
  }
}

checkSpecificCheckboxes().catch(console.error);