import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

interface ComponentRegistry {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  installUrl: string;
  dependencies: string[];
  registryDependencies: string[];
  type: string;
  styling: {
    framework: string;
    darkMode: boolean;
    responsive: boolean;
    customizable: boolean;
  };
  metadata: {
    discoveredFrom: string;
    lastUpdated: string;
    verified: boolean;
  };
}

interface RegistryData {
  version: string;
  lastUpdated: string;
  totalComponents: number;
  categories: string[];
  tags: string[];
  components: ComponentRegistry[];
}

export class OriginUIRegistryBuilder {
  private readonly baseUrl = 'https://originui.com';
  private readonly registryUrl = 'https://originui.com/r';
  private discoveredComponents: Map<string, ComponentRegistry> = new Map();
  private categories: Set<string> = new Set();
  private allTags: Set<string> = new Set();

  // Known category pages from OriginUI
  private readonly knownCategories = [
    'accordion', 'alert', 'avatar', 'badge', 'banner', 'breadcrumb', 'button', 'calendar',
    'checkbox', 'collapsible', 'combobox', 'command', 'crop', 'dialog', 'dropdown', 'input',
    'label', 'notification', 'otp', 'pagination', 'popover', 'radio', 'select', 'slider',
    'sonner', 'stepper', 'table', 'tabs', 'textarea', 'timeline', 'switch', 'tooltip',
    'card', 'chart', 'form', 'navbar', 'sidebar', 'modal', 'toast'
  ];

  async buildCompleteRegistry(): Promise<void> {
    console.log('🚀 Starting comprehensive OriginUI registry build...\n');

    // Step 1: Discover all category pages
    console.log('📂 Step 1: Discovering category pages...');
    const categoryPages = await this.discoverAllCategoryPages();
    console.log(`Found ${categoryPages.length} category pages\n`);

    // Step 2: Extract components from each category page
    console.log('🔍 Step 2: Extracting components from category pages...');
    for (const category of categoryPages) {
      await this.extractComponentsFromCategory(category);
    }
    console.log(`Extracted ${this.discoveredComponents.size} unique components\n`);

    // Step 3: Discover numbered components (comp-001 to comp-999)
    console.log('🔢 Step 3: Discovering numbered components...');
    await this.discoverNumberedComponents();
    console.log(`Total components after numbered discovery: ${this.discoveredComponents.size}\n`);

    // Step 4: Fetch detailed information for all components
    console.log('📋 Step 4: Fetching detailed component information...');
    await this.enrichComponentDetails();
    console.log(`Enriched ${this.discoveredComponents.size} components with detailed information\n`);

    // Step 5: Build and save the registry
    console.log('💾 Step 5: Building and saving registry...');
    const registry = this.buildRegistry();
    await this.saveRegistry(registry);
    console.log(`✅ Registry saved with ${registry.totalComponents} components!`);

    // Step 6: Generate summary report
    this.generateSummaryReport(registry);
  }

  private async discoverAllCategoryPages(): Promise<string[]> {
    const categoryPages: Set<string> = new Set();

    // Add known categories
    this.knownCategories.forEach(cat => categoryPages.add(cat));

    // Try to discover additional categories from homepage
    try {
      const response = await fetch(this.baseUrl);
      if (response.ok) {
        const html = await response.text();
        
        // Extract category links from homepage
        const linkMatches = html.match(/href="\/([a-z][a-z-]*[a-z])"/g) || [];
        linkMatches.forEach(match => {
          const category = match.match(/href="\/([a-z][a-z-]*[a-z])"/)?.[1];
          if (category && this.isValidCategory(category)) {
            categoryPages.add(category);
          }
        });
      }
    } catch (error) {
      console.log('⚠️  Could not discover additional categories from homepage');
    }

    return Array.from(categoryPages).sort();
  }

  private isValidCategory(category: string): boolean {
    // Filter out non-component pages
    const excludedPages = [
      'search', 'about', 'pricing', 'contact', 'docs', 'blog', 'api', 'auth',
      'login', 'signup', 'dashboard', 'profile', 'settings', 'terms', 'privacy'
    ];
    
    return !excludedPages.includes(category) && 
           category.length > 2 && 
           /^[a-z-]+$/.test(category);
  }

  private async extractComponentsFromCategory(category: string): Promise<void> {
    try {
      const categoryUrl = `${this.baseUrl}/${category}`;
      const response = await fetch(categoryUrl);
      
      if (!response.ok) {
        console.log(`❌ Category page not found: ${category}`);
        return;
      }

      const html = await response.text();
      
      // Extract registry URLs from the page
      const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
      const uniqueComponentIds = new Set<string>();

      registryMatches.forEach(match => {
        const componentId = match.match(/\/r\/([^"]+)\.json$/)?.[1];
        if (componentId) {
          uniqueComponentIds.add(componentId);
        }
      });

      // Create basic component entries
      uniqueComponentIds.forEach(componentId => {
        if (!this.discoveredComponents.has(componentId)) {
          this.discoveredComponents.set(componentId, {
            id: componentId,
            name: this.generateNameFromId(componentId, category),
            category: category,
            tags: [category, 'ui', 'component'],
            description: `${this.capitalizeFirst(category)} component from OriginUI`,
            installUrl: `${this.registryUrl}/${componentId}.json`,
            dependencies: [],
            registryDependencies: [],
            type: 'registry:ui',
            styling: {
              framework: 'Tailwind CSS',
              darkMode: true,
              responsive: true,
              customizable: true
            },
            metadata: {
              discoveredFrom: categoryUrl,
              lastUpdated: new Date().toISOString(),
              verified: false
            }
          });
        } else {
          // Add category as additional tag if not already present
          const existing = this.discoveredComponents.get(componentId)!;
          if (!existing.tags.includes(category)) {
            existing.tags.push(category);
          }
        }
      });

      this.categories.add(category);
      console.log(`  ✅ ${category}: Found ${uniqueComponentIds.size} components`);

    } catch (error) {
      console.log(`  ❌ ${category}: Error extracting components - ${error}`);
    }
  }

  private async discoverNumberedComponents(): Promise<void> {
    const batchSize = 50;
    const maxComponent = 600; // Start with reasonable range, can extend later
    
    for (let start = 1; start <= maxComponent; start += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, maxComponent - start + 1) }, (_, i) => start + i);
      
      console.log(`  Checking components ${start}-${Math.min(start + batchSize - 1, maxComponent)}...`);
      
      const batchPromises = batch.map(async (num) => {
        const componentId = `comp-${num.toString().padStart(3, '0')}`;
        const url = `${this.registryUrl}/${componentId}.json`;
        
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok && !this.discoveredComponents.has(componentId)) {
            this.discoveredComponents.set(componentId, {
              id: componentId,
              name: `Component ${num}`,
              category: 'component',
              tags: ['numbered', 'component', 'ui'],
              description: `Numbered component ${componentId} from OriginUI`,
              installUrl: url,
              dependencies: [],
              registryDependencies: [],
              type: 'registry:ui',
              styling: {
                framework: 'Tailwind CSS',
                darkMode: true,
                responsive: true,
                customizable: true
              },
              metadata: {
                discoveredFrom: 'numbered-discovery',
                lastUpdated: new Date().toISOString(),
                verified: false
              }
            });
            return componentId;
          }
        } catch (error) {
          // Ignore individual failures
        }
        return null;
      });

      const results = await Promise.all(batchPromises);
      const foundInBatch = results.filter(Boolean).length;
      
      if (foundInBatch > 0) {
        console.log(`    Found ${foundInBatch} numbered components in this batch`);
      }
    }
  }

  private async enrichComponentDetails(): Promise<void> {
    const components = Array.from(this.discoveredComponents.values());
    const batchSize = 10;
    
    for (let i = 0; i < components.length; i += batchSize) {
      const batch = components.slice(i, i + batchSize);
      console.log(`  Processing components ${i + 1}-${Math.min(i + batchSize, components.length)} of ${components.length}...`);
      
      const batchPromises = batch.map(async (component) => {
        try {
          const response = await fetch(component.installUrl);
          if (response.ok) {
            const data = await response.json() as any;
            
            // Enrich component with actual data
            component.name = data.name || component.name;
            component.type = data.type || component.type;
            component.dependencies = data.dependencies || [];
            component.registryDependencies = data.registryDependencies || [];
            
            // Enhance tags based on component data
            if (data.tags) {
              data.tags.forEach((tag: string) => {
                if (!component.tags.includes(tag)) {
                  component.tags.push(tag);
                  this.allTags.add(tag);
                }
              });
            }

            // Try to infer additional tags from component content
            if (data.files) {
              const additionalTags = this.inferTagsFromContent(data.files, component.id);
              additionalTags.forEach(tag => {
                if (!component.tags.includes(tag)) {
                  component.tags.push(tag);
                  this.allTags.add(tag);
                }
              });
            }

            // Update category if we can infer a better one
            const betterCategory = this.inferCategoryFromTags(component.tags);
            if (betterCategory !== 'component') {
              component.category = betterCategory;
              this.categories.add(betterCategory);
            }

            component.metadata.verified = true;
            component.metadata.lastUpdated = new Date().toISOString();
          }
        } catch (error) {
          console.log(`    ⚠️  Could not enrich ${component.id}: ${error}`);
        }
      });

      await Promise.all(batchPromises);
    }
  }

  private inferTagsFromContent(files: any[], componentId: string): string[] {
    const tags: string[] = [];
    
    const allContent = files.map(f => f.content || '').join(' ').toLowerCase();
    
    // Tag inference rules
    const tagRules = [
      { keywords: ['button', 'btn'], tag: 'button' },
      { keywords: ['input', 'textfield'], tag: 'input' },
      { keywords: ['checkbox', 'check'], tag: 'checkbox' },
      { keywords: ['radio'], tag: 'radio' },
      { keywords: ['select', 'dropdown'], tag: 'select' },
      { keywords: ['modal', 'dialog'], tag: 'dialog' },
      { keywords: ['table', 'datagrid'], tag: 'table' },
      { keywords: ['tab', 'tabs'], tag: 'tabs' },
      { keywords: ['card'], tag: 'card' },
      { keywords: ['form'], tag: 'form' },
      { keywords: ['navigation', 'nav'], tag: 'navigation' },
      { keywords: ['alert', 'notification'], tag: 'alert' },
      { keywords: ['tooltip'], tag: 'tooltip' },
      { keywords: ['popover'], tag: 'popover' },
      { keywords: ['accordion'], tag: 'accordion' },
      { keywords: ['slider', 'range'], tag: 'slider' },
      { keywords: ['switch', 'toggle'], tag: 'switch' },
      { keywords: ['avatar'], tag: 'avatar' },
      { keywords: ['badge'], tag: 'badge' },
      { keywords: ['breadcrumb'], tag: 'breadcrumb' },
      { keywords: ['pagination'], tag: 'pagination' },
      { keywords: ['stepper'], tag: 'stepper' },
      { keywords: ['timeline'], tag: 'timeline' },
      { keywords: ['calendar', 'date'], tag: 'calendar' },
      { keywords: ['loading', 'spinner'], tag: 'loading' }
    ];

    tagRules.forEach(rule => {
      if (rule.keywords.some(keyword => allContent.includes(keyword) || componentId.includes(keyword))) {
        tags.push(rule.tag);
      }
    });

    return tags;
  }

  private inferCategoryFromTags(tags: string[]): string {
    const categoryMap: { [key: string]: string } = {
      'button': 'button',
      'input': 'input',
      'select': 'select',
      'checkbox': 'input',
      'radio': 'input',
      'form': 'form',
      'card': 'layout',
      'dialog': 'overlay',
      'modal': 'overlay',
      'popover': 'overlay',
      'tooltip': 'overlay',
      'table': 'data-display',
      'tabs': 'navigation',
      'navigation': 'navigation',
      'breadcrumb': 'navigation',
      'pagination': 'navigation',
      'stepper': 'navigation',
      'alert': 'feedback',
      'notification': 'feedback',
      'badge': 'feedback',
      'avatar': 'media',
      'timeline': 'data-display',
      'calendar': 'input',
      'accordion': 'layout',
      'slider': 'input',
      'switch': 'input'
    };

    for (const tag of tags) {
      if (categoryMap[tag]) {
        return categoryMap[tag];
      }
    }

    return 'component';
  }

  private buildRegistry(): RegistryData {
    const components = Array.from(this.discoveredComponents.values());
    
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalComponents: components.length,
      categories: Array.from(this.categories).sort(),
      tags: Array.from(this.allTags).sort(),
      components: components.sort((a, b) => a.id.localeCompare(b.id))
    };
  }

  private async saveRegistry(registry: RegistryData): Promise<void> {
    const outputPath = path.join(process.cwd(), 'src', 'complete-registry.json');
    await fs.writeFile(outputPath, JSON.stringify(registry, null, 2));
    console.log(`Registry saved to: ${outputPath}`);
  }

  private generateSummaryReport(registry: RegistryData): void {
    console.log('\n📊 REGISTRY BUILD SUMMARY');
    console.log('========================');
    console.log(`Total Components: ${registry.totalComponents}`);
    console.log(`Categories: ${registry.categories.length}`);
    console.log(`Tags: ${registry.tags.length}`);
    
    console.log('\n📂 Categories:');
    const componentsByCategory = new Map<string, number>();
    registry.components.forEach(comp => {
      componentsByCategory.set(comp.category, (componentsByCategory.get(comp.category) || 0) + 1);
    });
    
    Array.from(componentsByCategory.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} components`);
      });

    console.log('\n🏷️  Most Common Tags:');
    const tagCounts = new Map<string, number>();
    registry.components.forEach(comp => {
      comp.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    
    Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count} components`);
      });

    console.log(`\n✅ Registry build completed successfully!`);
    console.log(`Last updated: ${registry.lastUpdated}`);
  }

  private generateNameFromId(componentId: string, category: string): string {
    if (componentId.startsWith('comp-')) {
      const number = componentId.replace('comp-', '');
      return `${this.capitalizeFirst(category)} Component ${number}`;
    }
    
    return this.capitalizeFirst(componentId.replace(/-/g, ' '));
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Run the registry builder
async function main() {
  const builder = new OriginUIRegistryBuilder();
  await builder.buildCompleteRegistry();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}