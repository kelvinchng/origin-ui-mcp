import fetch from 'node-fetch';

async function checkSpecificTabs() {
  console.log('🔍 Checking specific tabs components (comp-426 to comp-445)...\n');
  
  const baseUrl = 'https://originui.com/r';
  const foundComponents: string[] = [];
  const missingComponents: string[] = [];
  
  // Check the range comp-426 to comp-445 (20 components as seen on the page)
  for (let i = 426; i <= 445; i++) {
    const componentId = `comp-${i.toString().padStart(3, '0')}`;
    const url = `${baseUrl}/${componentId}.json`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        foundComponents.push(componentId);
        console.log(`✅ ${componentId}: EXISTS`);
      } else {
        missingComponents.push(componentId);
        console.log(`❌ ${componentId}: NOT FOUND (${response.status})`);
      }
    } catch (error) {
      missingComponents.push(componentId);
      console.log(`❌ ${componentId}: ERROR - ${error}`);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Found: ${foundComponents.length} components`);
  console.log(`❌ Missing: ${missingComponents.length} components`);
  
  if (foundComponents.length > 0) {
    console.log(`\n✅ Existing components: ${foundComponents.join(', ')}`);
  }
  
  if (missingComponents.length > 0) {
    console.log(`\n❌ Missing components: ${missingComponents.join(', ')}`);
  }
  
  // Also check the comp-400 range we found before
  console.log(`\n🔍 Double-checking comp-400 to comp-404 range...`);
  for (let i = 400; i <= 404; i++) {
    const componentId = `comp-${i.toString().padStart(3, '0')}`;
    const url = `${baseUrl}/${componentId}.json`;
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`${response.ok ? '✅' : '❌'} ${componentId}: ${response.ok ? 'EXISTS' : 'NOT FOUND'}`);
    } catch (error) {
      console.log(`❌ ${componentId}: ERROR`);
    }
  }
}

checkSpecificTabs().catch(console.error);