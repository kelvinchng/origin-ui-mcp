import fetch from 'node-fetch';
import { OriginUIService } from '../src/originui-service.js';

async function checkSpecificBadges() {
  console.log('🔍 Checking specific badge components (comp-413 to comp-425)...\n');
  
  // First, check if these badge components exist in the registry
  const baseUrl = 'https://originui.com/r';
  const badgeIds = Array.from({length: 13}, (_, i) => `comp-${413 + i}`);
  
  console.log('📍 Checking direct registry access for badge components:');
  const existingBadges: string[] = [];
  
  for (const badgeId of badgeIds) {
    const url = `${baseUrl}/${badgeId}.json`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        existingBadges.push(badgeId);
        console.log(`✅ ${badgeId}: EXISTS in registry`);
      } else {
        console.log(`❌ ${badgeId}: NOT FOUND (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${badgeId}: ERROR - ${error}`);
    }
  }
  
  console.log(`\n📊 Registry Summary: ${existingBadges.length}/13 badge components exist`);
  
  // Now check if our MCP server can find these components
  console.log('\n📍 Testing MCP server discovery for existing badge components:');
  const service = new OriginUIService();
  
  // Wait for discovery
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  for (const badgeId of existingBadges.slice(0, 5)) { // Test first 5 to avoid overwhelming
    try {
      const searchResult = await service.searchComponents(badgeId, undefined, 1);
      const text = searchResult.content[0].text;
      
      if (!text.includes('Found 0 component')) {
        console.log(`✅ ${badgeId}: Found by MCP server`);
      } else {
        console.log(`❌ ${badgeId}: NOT found by MCP server`);
      }
    } catch (error) {
      console.log(`❌ ${badgeId}: MCP server error - ${error}`);
    }
  }
  
  // Check the badge page source to see if our extraction is working
  console.log('\n📍 Analyzing badge page HTML extraction:');
  try {
    const response = await fetch('https://originui.com/badge');
    if (response.ok) {
      const html = await response.text();
      console.log(`Badge page length: ${html.length} characters`);
      
      // Look for registry URLs
      const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
      console.log(`Found ${registryMatches.length} registry URLs on badge page`);
      
      if (registryMatches.length > 0) {
        console.log('Sample registry URLs from badge page:');
        registryMatches.slice(0, 10).forEach((url, index) => {
          console.log(`   ${index + 1}. ${url}`);
        });
      }
      
      // Check for comp-413 to comp-425 specifically
      const badgeCompMatches = html.match(/comp-4(1[3-9]|2[0-5])/g) || [];
      console.log(`\nFound ${badgeCompMatches.length} badge component IDs (comp-413 to comp-425) in HTML`);
      
      if (badgeCompMatches.length > 0) {
        console.log('Badge component IDs found:', [...new Set(badgeCompMatches)].join(', '));
      }
    }
  } catch (error) {
    console.log(`❌ Error analyzing badge page: ${error}`);
  }
  
  // Test our discovery system with a manual trigger
  console.log('\n📍 Testing manual discovery trigger:');
  try {
    const discoveryResult = await service.discoverComponents(true);
    const discoveryText = discoveryResult.content[0].text;
    console.log('Discovery result:', discoveryText.substring(0, 300));
    
    // Search again after discovery
    const postDiscoveryResult = await service.searchComponents('badge', undefined, 20);
    const postDiscoveryText = postDiscoveryResult.content[0].text;
    const postDiscoveryCount = (postDiscoveryText.match(/\*\*.*?\*\*/g) || []).length;
    console.log(`\nAfter manual discovery: Found ${postDiscoveryCount} badge components`);
  } catch (error) {
    console.log(`❌ Manual discovery failed: ${error}`);
  }
}

checkSpecificBadges().catch(console.error);