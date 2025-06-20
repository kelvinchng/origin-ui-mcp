import * as fs from 'fs/promises';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

export class FastRegistryService {
  private registry: RegistryData | null = null;
  private componentsMap: Map<string, ComponentRegistry> = new Map();
  private tagIndex: Map<string, ComponentRegistry[]> = new Map();
  private categoryIndex: Map<string, ComponentRegistry[]> = new Map();

  async initialize(): Promise<void> {
    try {
      // Try multiple paths to find the registry file
      const possiblePaths = [
        path.join(__dirname, 'complete-registry.json'), // Development
        path.join(__dirname, '..', 'src', 'complete-registry.json'), // npx install
        path.join(process.cwd(), 'src', 'complete-registry.json'), // Local
      ];
      
      let registryData: string | null = null;
      let usedPath: string | null = null;
      
      for (const registryPath of possiblePaths) {
        try {
          registryData = await fs.readFile(registryPath, 'utf-8');
          usedPath = registryPath;
          break;
        } catch (error) {
          // Try next path
          continue;
        }
      }
      
      if (!registryData) {
        throw new Error('Could not find complete-registry.json in any expected location');
      }
      
      this.registry = JSON.parse(registryData);
      
      // Build indexes for fast searching
      this.buildIndexes();
      
      if (this.registry) {
        console.log(`✅ Registry loaded: ${this.registry.totalComponents} components across ${this.registry.categories.length} categories`);
      }
    } catch (error) {
      console.error('❌ Failed to load registry:', error);
      throw new Error('Could not load OriginUI component registry');
    }
  }

  private buildIndexes(): void {
    if (!this.registry) return;

    // Build component map
    this.registry.components.forEach(component => {
      this.componentsMap.set(component.id, component);
    });

    // Build tag index
    this.registry.components.forEach(component => {
      component.tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        if (!this.tagIndex.has(normalizedTag)) {
          this.tagIndex.set(normalizedTag, []);
        }
        this.tagIndex.get(normalizedTag)!.push(component);
      });
    });

    // Build category index
    this.registry.components.forEach(component => {
      const normalizedCategory = component.category.toLowerCase();
      if (!this.categoryIndex.has(normalizedCategory)) {
        this.categoryIndex.set(normalizedCategory, []);
      }
      this.categoryIndex.get(normalizedCategory)!.push(component);
    });
  }

  async searchComponents(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!this.registry) {
      await this.initialize();
    }

    const results = this.performSearch(query, category, limit);
    
    const resultText = results.length > 0 
      ? results.map(comp => 
          `**${comp.name}** (${comp.id})\n` +
          `Category: ${comp.category}\n` +
          `Tags: ${comp.tags.join(', ')}\n` +
          `Description: ${comp.description}\n` +
          `Styling: ${comp.styling.framework}${comp.styling.darkMode ? ' • Dark Mode' : ''}${comp.styling.responsive ? ' • Responsive' : ''}\n` +
          `Install: \`pnpm dlx shadcn@latest add ${comp.installUrl}\`\n` +
          `Visual: Use \`get_component_screenshot\` to see how this component looks\n`
        ).join('\n---\n')
      : `No components found matching "${query}"${category ? ` in category "${category}"` : ''}`;

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} component(s) from local registry:\n\n${resultText}\n\n💡 **Tip**: Use the \`get_component_screenshot\` tool with any component ID to see visual previews!`
        }
      ]
    };
  }

  private performSearch(query: string, category?: string, limit: number = 10): ComponentRegistry[] {
    const lowerQuery = query.toLowerCase();
    const results: ComponentRegistry[] = [];
    const seen = new Set<string>();

    // Strategy 1: Exact tag match
    if (this.tagIndex.has(lowerQuery)) {
      this.tagIndex.get(lowerQuery)!.forEach(comp => {
        if (!seen.has(comp.id) && this.matchesCategory(comp, category)) {
          results.push(comp);
          seen.add(comp.id);
        }
      });
    }

    // Strategy 2: Partial tag match
    if (results.length < limit) {
      for (const [tag, components] of this.tagIndex.entries()) {
        if (tag.includes(lowerQuery) || lowerQuery.includes(tag)) {
          components.forEach(comp => {
            if (!seen.has(comp.id) && this.matchesCategory(comp, category) && results.length < limit) {
              results.push(comp);
              seen.add(comp.id);
            }
          });
        }
      }
    }

    // Strategy 3: Name and description search
    if (results.length < limit) {
      this.registry!.components.forEach(comp => {
        if (!seen.has(comp.id) && this.matchesCategory(comp, category) && results.length < limit) {
          const nameMatch = comp.name.toLowerCase().includes(lowerQuery);
          const descMatch = comp.description.toLowerCase().includes(lowerQuery);
          const idMatch = comp.id.toLowerCase().includes(lowerQuery);
          
          if (nameMatch || descMatch || idMatch) {
            results.push(comp);
            seen.add(comp.id);
          }
        }
      });
    }

    // Strategy 4: Fuzzy category match
    if (results.length < limit && !category) {
      const categoryMatch = this.findBestCategoryMatch(lowerQuery);
      if (categoryMatch && this.categoryIndex.has(categoryMatch)) {
        const categoryComponents = this.categoryIndex.get(categoryMatch);
        if (categoryComponents) {
          categoryComponents.forEach(comp => {
            if (!seen.has(comp.id) && results.length < limit) {
              results.push(comp);
              seen.add(comp.id);
            }
          });
        }
      }
    }

    return results.slice(0, limit);
  }

  private matchesCategory(component: ComponentRegistry, category?: string): boolean {
    if (!category) return true;
    return component.category.toLowerCase() === category.toLowerCase();
  }

  private findBestCategoryMatch(query: string): string | null {
    const categories = Array.from(this.categoryIndex.keys());
    
    // Exact match
    if (categories.includes(query)) return query;
    
    // Partial match
    const partialMatch = categories.find(cat => cat.includes(query) || query.includes(cat));
    if (partialMatch) return partialMatch;
    
    // Plural/singular matching
    const singularQuery = query.replace(/s$/, '');
    const pluralQuery = query + 's';
    
    if (categories.includes(singularQuery)) return singularQuery;
    if (categories.includes(pluralQuery)) return pluralQuery;
    
    return null;
  }

  async getComponentDetails(componentId: string): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!this.registry) {
      await this.initialize();
    }

    const component = this.componentsMap.get(componentId);
    
    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `Component "${componentId}" not found in registry. Use search_components to find available components.`
          }
        ]
      };
    }

    const details = `# ${component.name}

**ID:** ${component.id}
**Category:** ${component.category}
**Tags:** ${component.tags.join(', ')}

## Styling Information
**Framework:** ${component.styling.framework}
**Dark Mode Support:** ${component.styling.darkMode ? '✅' : '❌'}
**Responsive Design:** ${component.styling.responsive ? '✅' : '❌'}
**Customizable:** ${component.styling.customizable ? '✅' : '❌'}

## Dependencies
**External:** ${component.dependencies.length > 0 ? component.dependencies.join(', ') : 'None'}
**Registry:** ${component.registryDependencies.length > 0 ? component.registryDependencies.join(', ') : 'None'}

## Installation
\`\`\`bash
pnpm dlx shadcn@latest add ${component.installUrl}
\`\`\`

## Description
${component.description}

## Metadata
**Type:** ${component.type}
**Last Updated:** ${component.metadata.lastUpdated}
**Verified:** ${component.metadata.verified ? '✅' : '❌'}
**Discovered From:** ${component.metadata.discoveredFrom}`;

    return {
      content: [
        {
          type: "text",
          text: details
        }
      ]
    };
  }

  async listComponents(
    category?: string,
    limit: number = 50
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!this.registry) {
      await this.initialize();
    }

    const filteredComponents = category 
      ? (this.categoryIndex.get(category.toLowerCase()) || [])
      : (this.registry?.components || []);
    
    const results = filteredComponents.slice(0, limit);
    
    const listText = results.map((comp, index) => 
      `${index + 1}. **${comp.name}** (${comp.id}) - ${comp.category}`
    ).join('\n');

    return {
      content: [
        {
          type: "text",
          text: `Available Components${category ? ` in "${category}"` : ''}:\n\n${listText}\n\nTotal: ${results.length} components (showing first ${limit})`
        }
      ]
    };
  }

  async getInstallCommand(componentId: string): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!this.registry) {
      await this.initialize();
    }

    const component = this.componentsMap.get(componentId);
    
    if (!component) {
      return {
        content: [
          {
            type: "text",
            text: `Component "${componentId}" not found. Use search_components to find available components.`
          }
        ]
      };
    }

    const installCommand = `pnpm dlx shadcn@latest add ${component.installUrl}`;
    
    return {
      content: [
        {
          type: "text",
          text: `Installation command for **${component.name}**:\n\n\`\`\`bash\n${installCommand}\n\`\`\`\n\nThis will install the component and its dependencies into your project.`
        }
      ]
    };
  }

  async getRegistryStats(): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (!this.registry) {
      await this.initialize();
    }

    if (!this.registry) {
      return {
        content: [
          {
            type: "text",
            text: "Registry not loaded. Please check the registry file."
          }
        ]
      };
    }

    const categoryStats = new Map<string, number>();
    this.registry.components.forEach(comp => {
      categoryStats.set(comp.category, (categoryStats.get(comp.category) || 0) + 1);
    });

    const topCategories = Array.from(categoryStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cat, count]) => `  ${cat}: ${count} components`)
      .join('\n');

    const stats = `# OriginUI Component Registry Stats

**Total Components:** ${this.registry.totalComponents}
**Categories:** ${this.registry.categories.length}
**Tags:** ${this.registry.tags.length}
**Last Updated:** ${new Date(this.registry.lastUpdated).toLocaleDateString()}
**Registry Version:** ${this.registry.version}

## Top Categories:
${topCategories}

## Available Categories:
${this.registry.categories.join(', ')}

## All Tags:
${this.registry.tags.join(', ')}`;

    return {
      content: [
        {
          type: "text",
          text: stats
        }
      ]
    };
  }
}