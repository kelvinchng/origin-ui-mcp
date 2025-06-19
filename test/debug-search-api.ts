import fetch from 'node-fetch';

async function debugSearchAPI() {
  console.log('🔍 Debugging OriginUI Search API...\n');
  
  // Test the search API with a specific tag
  const testTags = ['tabs', 'button', 'navbar'];
  
  for (const tag of testTags) {
    console.log(`📍 Testing search API for tag: "${tag}"`);
    const searchUrl = `https://originui.com/search?tags=${encodeURIComponent(tag)}`;
    console.log(`   URL: ${searchUrl}`);
    
    try {
      const response = await fetch(searchUrl);
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const html = await response.text();
        console.log(`   Response length: ${html.length} characters`);
        
        // Look for registry URLs
        const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
        console.log(`   Found ${registryMatches.length} registry URLs`);
        
        if (registryMatches.length > 0) {
          console.log(`   Sample registry URLs: ${registryMatches.slice(0, 3).join(', ')}`);
        }
        
        // Look for component IDs
        const compMatches = html.match(/comp-\d+/g) || [];
        console.log(`   Found ${compMatches.length} comp-XXX patterns`);
        
        if (compMatches.length > 0) {
          console.log(`   Sample comp IDs: ${compMatches.slice(0, 5).join(', ')}`);
        }
        
        // Look for data-component attributes
        const dataCompMatches = html.match(/data-component[^>]*>/g) || [];
        console.log(`   Found ${dataCompMatches.length} data-component attributes`);
        
        // Save a snippet for analysis
        if (html.length > 1000) {
          console.log(`   HTML snippet (first 500 chars):`);
          console.log(`   ${html.substring(0, 500)}...`);
        }
        
      } else {
        console.log(`   ❌ Request failed`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
    
    console.log(''); // spacing
  }
  
  // Also test the direct component page to understand the structure
  console.log('📍 Testing direct component page for comparison');
  try {
    const response = await fetch('https://originui.com/tabs');
    if (response.ok) {
      const html = await response.text();
      console.log(`   Tabs page length: ${html.length} characters`);
      
      const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
      console.log(`   Found ${registryMatches.length} registry URLs on tabs page`);
      
      if (registryMatches.length > 0) {
        console.log(`   Sample from tabs page: ${registryMatches.slice(0, 5).join(', ')}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error fetching tabs page: ${error}`);
  }
}

debugSearchAPI().catch(console.error);