import fetch from 'node-fetch';
import { COMPONENTS_REGISTRY, ComponentMetadata, CATEGORIES } from './components-registry.js';
import { SimpleOriginUIDiscovery } from './simple-discovery.js';

export interface OriginUIComponent {
  id: string;
  name: string;
  type: string;
  description?: string;
  category?: string;
  tags: string[];
  dependencies: {
    external?: string[];
    registry?: string[];
  };
  files: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  installUrl: string;
  previewUrl?: string;
  styling?: {
    framework: string;
    darkMode: boolean;
    responsive: boolean;
    customizable: boolean;
  };
}

export interface ComponentSearchResult {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
  installUrl: string;
  styling?: {
    framework: string;
    darkMode: boolean;
    responsive: boolean;
    customizable: boolean;
  };
}

export class OriginUIService {
  private readonly baseUrl = 'https://originui.com';
  private readonly registryUrl = 'https://originui.com/r';
  private componentsCache: Map<string, OriginUIComponent> = new Map();
  private componentsList: ComponentSearchResult[] = [];
  private lastCacheUpdate = 0;
  private readonly cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private simpleDiscovery: SimpleOriginUIDiscovery;
  private discoveryInProgress = false;

  constructor() {
    this.simpleDiscovery = new SimpleOriginUIDiscovery();
    this.initializeComponentsList();
  }

  private initializeComponentsList() {
    // Start with static registry
    this.componentsList = COMPONENTS_REGISTRY.map(comp => ({
      id: comp.id,
      name: comp.name,
      category: comp.category,
      tags: comp.tags,
      description: comp.description,
      installUrl: comp.installUrl,
      styling: comp.styling
    }));

    // Trigger dynamic discovery in background (non-blocking)
    this.performDynamicDiscovery();
  }

  private async performDynamicDiscovery() {
    if (this.discoveryInProgress) return;
    
    try {
      this.discoveryInProgress = true;
      console.error('🚀 Starting background tag-based component discovery...');
      
      // Get all available tags and discover components for each
      const allTags = this.simpleDiscovery.getAllTags();
      const discoveredComponents: ComponentSearchResult[] = [];
      const existingIds = new Set(this.componentsList.map(comp => comp.id));
      
      // Discover components for core tags to populate initial cache
      const coreTags = ['button', 'input', 'select', 'checkbox', 'tabs', 'dialog', 'card', 'form'];
      
      for (const tag of coreTags) {
        try {
          const tagComponents = await this.simpleDiscovery.searchComponentsByTag(tag);
          
          const newComponents = tagComponents
            .filter(comp => !existingIds.has(comp.id))
            .map(comp => ({
              id: comp.id,
              name: comp.name,
              category: comp.category,
              tags: comp.tags,
              description: comp.description,
              installUrl: comp.installUrl,
              styling: comp.styling
            }));
          
          discoveredComponents.push(...newComponents);
          newComponents.forEach(comp => existingIds.add(comp.id));
          
        } catch (error) {
          console.error(`❌ Failed to discover components for tag "${tag}": ${error}`);
        }
      }

      this.componentsList.push(...discoveredComponents);
      console.error(`✅ Tag-based discovery complete: ${discoveredComponents.length} new components added`);
      
    } catch (error) {
      console.error('❌ Tag-based discovery failed:', error);
    } finally {
      this.discoveryInProgress = false;
    }
  }

  async searchComponents(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    // First try static registry search
    const staticResults = this.componentsList.filter(component => {
      const matchesQuery = 
        component.name.toLowerCase().includes(query.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        (component.description && component.description.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = !category || component.category === category;
      
      return matchesQuery && matchesCategory;
    });

    // If static search finds results, use them
    let results = staticResults;
    let searchMethod = 'static registry';

    // If no static results, try dynamic search using tags
    if (results.length === 0) {
      const bestTag = this.simpleDiscovery.findBestMatchingTag(query);
      if (bestTag) {
        console.error(`🔍 No static results for "${query}", trying dynamic search with tag "${bestTag}"`);
        const dynamicResults = await this.simpleDiscovery.searchComponentsByTag(bestTag);
        
        // Filter by category if specified
        results = category 
          ? dynamicResults.filter(comp => comp.category === category)
          : dynamicResults;
        
        searchMethod = `dynamic search (tag: ${bestTag})`;
      }
    }

    const finalResults = results.slice(0, limit);
    
    const resultText = finalResults.length > 0 
      ? finalResults.map(comp => 
          `**${comp.name}** (${comp.id})\\n` +
          `Category: ${comp.category}\\n` +
          `Tags: ${comp.tags.join(', ')}\\n` +
          `Description: ${comp.description || 'N/A'}\\n` +
          `Styling: ${comp.styling?.framework || 'Tailwind CSS'}${comp.styling?.darkMode ? ' • Dark Mode' : ''}${comp.styling?.responsive ? ' • Responsive' : ''}\\n` +
          `Install: \`pnpm dlx shadcn@latest add ${comp.installUrl}\`\\n` +
          `Visual: Use \`get_component_screenshot\` to see how this component looks\\n`
        ).join('\\n---\\n')
      : `No components found matching "${query}"${category ? ` in category "${category}"` : ''}. Try variations like "checkbox", "button", "input", etc.`;

    console.error(`🔍 Search for "${query}" via ${searchMethod}: found ${finalResults.length} results`);

    return {
      content: [
        {
          type: "text",
          text: `Found ${finalResults.length} component(s) via ${searchMethod}:\\n\\n${resultText}\\n\\n💡 **Tip**: Use the \`get_component_screenshot\` tool with any component ID to see visual previews and decide if it fits your project!`
        }
      ]
    };
  }

  async getComponentDetails(componentId: string): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const component = await this.fetchComponent(componentId);
      
      const registryComponent = COMPONENTS_REGISTRY.find(comp => comp.id === componentId);
      
      const details = `# ${component.name || componentId}

**Type:** ${component.type}
**Category:** ${component.category || 'N/A'}
**Tags:** ${component.tags.join(', ')}

## Styling Information
**Framework:** ${registryComponent?.styling.framework || 'Tailwind CSS'}
**Dark Mode Support:** ${registryComponent?.styling.darkMode ? '✅' : '❌'}
**Responsive Design:** ${registryComponent?.styling.responsive ? '✅' : '❌'}
**Customizable:** ${registryComponent?.styling.customizable ? '✅' : '❌'}

## Dependencies
${component.dependencies.external ? `**External:** ${component.dependencies.external.join(', ')}` : 'None'}
${component.dependencies.registry ? `**Registry:** ${component.dependencies.registry.join(', ')}` : 'None'}

## Installation
\`\`\`bash
pnpm dlx shadcn@latest add ${component.installUrl}
\`\`\`

## Description
${registryComponent?.description || 'No description available'}

## Files
${component.files.map(file => `- **${file.name}** (${file.type})`).join('\\n')}

## Code Preview
\`\`\`tsx
${component.files.find(f => f.type === 'registry:ui')?.content || 'No UI code available'}
\`\`\``;

      return {
        content: [
          {
            type: "text",
            text: details
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching component details for ${componentId}: ${error}`
          }
        ]
      };
    }
  }

  async listComponents(
    category?: string,
    limit: number = 50
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    const filteredComponents = category 
      ? this.componentsList.filter(comp => comp.category === category)
      : this.componentsList;
    
    const results = filteredComponents.slice(0, limit);
    
    const listText = results.map((comp, index) => 
      `${index + 1}. **${comp.name}** (${comp.id}) - ${comp.category}`
    ).join('\\n');

    return {
      content: [
        {
          type: "text",
          text: `Available Components${category ? ` in "${category}"` : ''}:\\n\\n${listText}\\n\\nTotal: ${results.length} components`
        }
      ]
    };
  }

  async getInstallCommand(componentId: string): Promise<{ content: Array<{ type: string; text: string }> }> {
    const component = this.componentsList.find(comp => comp.id === componentId);
    
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
          text: `Installation command for **${component.name}**:\\n\\n\`\`\`bash\\n${installCommand}\\n\`\`\`\\n\\nThis will install the component and its dependencies into your project.`
        }
      ]
    };
  }

  async getComponentPreview(componentId: string): Promise<{ content: Array<{ type: string; text: string }> }> {
    try {
      const component = await this.fetchComponent(componentId);
      
      const preview = `# ${component.name || componentId} Preview

## Styling
- Built with **Tailwind CSS**
- Uses **Radix UI** primitives for accessibility
- Supports **dark/light mode**
- Responsive design

## Default Styling Classes
${this.extractTailwindClasses(component.files)}

## Usage Example
\`\`\`tsx
${this.generateUsageExample(component)}
\`\`\`

## Installation
\`\`\`bash
pnpm dlx shadcn@latest add ${component.installUrl}
\`\`\``;

      return {
        content: [
          {
            type: "text",
            text: preview
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching component preview for ${componentId}: ${error}`
          }
        ]
      };
    }
  }

  async getComponentScreenshot(componentId: string, theme: string = 'both'): Promise<{ content: Array<{ type: string; text?: string; image_url?: string }> }> {
    const registryComponent = COMPONENTS_REGISTRY.find(comp => comp.id === componentId);
    
    if (!registryComponent) {
      return {
        content: [
          {
            type: "text",
            text: `Component "${componentId}" not found. Use search_components to find available components.`
          }
        ]
      };
    }

    const content: Array<{ type: string; text?: string; image_url?: string }> = [];
    
    // Add component information
    content.push({
      type: "text",
      text: `# ${registryComponent.name} (${componentId}) - Visual Preview\n\n**Description**: ${registryComponent.description}\n**Category**: ${registryComponent.category}\n**Tags**: ${registryComponent.tags.join(', ')}\n\n**Installation**: \`pnpm dlx shadcn@latest add ${registryComponent.installUrl}\`\n\n`
    });

    // If screenshots are available, show them
    if (registryComponent.screenshots) {
      if (registryComponent.screenshots.light && (theme === 'light' || theme === 'both')) {
        content.push({
          type: "text",
          text: "## Light Theme Preview"
        });
        content.push({
          type: "image",
          image_url: registryComponent.screenshots.light
        });
      }

      if (registryComponent.screenshots.dark && (theme === 'dark' || theme === 'both')) {
        content.push({
          type: "text",
          text: theme === 'both' ? "## Dark Theme Preview" : "## Dark Theme Preview"
        });
        content.push({
          type: "image",
          image_url: registryComponent.screenshots.dark
        });
      }

      if (registryComponent.screenshots.preview && !registryComponent.screenshots.light && !registryComponent.screenshots.dark) {
        content.push({
          type: "text",
          text: "## Component Preview"
        });
        content.push({
          type: "image",
          image_url: registryComponent.screenshots.preview
        });
      }

      if (registryComponent.screenshots.mobile) {
        content.push({
          type: "text",
          text: "## Mobile/Responsive View"
        });
        content.push({
          type: "image",
          image_url: registryComponent.screenshots.mobile
        });
      }
    }

    // If no screenshots, provide helpful alternatives
    if (!registryComponent.screenshots || content.length === 1) {
      const categoryUrl = this.getCategoryUrl(registryComponent.category);
      
      content.push({
        type: "text",
        text: `## Visual Reference\n\nTo see how this component looks:\n\n1. **Live Examples**: Visit ${categoryUrl} to see this component in action\n2. **Interactive Demo**: Components on OriginUI show both light and dark themes\n3. **Responsive Design**: All components are mobile-friendly\n\n**Key Visual Features**:\n- ${this.getVisualDescription(registryComponent)}\n\n**Recommended for**: ${this.getUseCaseDescription(registryComponent)}`
      });
    }

    return { content };
  }

  private getCategoryUrl(category: string): string {
    const categoryUrls: { [key: string]: string } = {
      'button': 'https://originui.com/buttons',
      'input': 'https://originui.com/inputs',
      'select': 'https://originui.com/selects',
      'form': 'https://originui.com/',
      'navigation': 'https://originui.com/navbars',
      'card': 'https://originui.com/',
      'data-display': 'https://originui.com/',
      'overlay': 'https://originui.com/',
      'feedback': 'https://originui.com/'
    };
    
    return categoryUrls[category] || 'https://originui.com/';
  }

  private getVisualDescription(component: ComponentMetadata): string {
    const descriptions: { [key: string]: string } = {
      'button': 'Clean, modern button styling with hover states and focus rings',
      'input': 'Minimal input fields with subtle borders and focus states',
      'select': 'Dropdown components with smooth animations and clear selection states',
      'form': 'Well-spaced form layouts with consistent styling',
      'navigation': 'Clean navigation bars with responsive mobile toggles',
      'card': 'Subtle shadows and rounded corners for content containers',
      'data-display': 'Clean tables and lists with good typography',
      'overlay': 'Smooth modal animations with backdrop blur effects',
      'feedback': 'Clear status indicators with appropriate color coding'
    };
    
    return descriptions[component.category] || 'Modern, accessible design following design system principles';
  }

  private getUseCaseDescription(component: ComponentMetadata): string {
    if (component.tags.includes('payment')) return 'E-commerce checkout flows, payment forms';
    if (component.tags.includes('navigation')) return 'Website headers, mobile menus, sidebar navigation';
    if (component.tags.includes('form')) return 'User input, data collection, settings pages';
    if (component.tags.includes('button')) return 'Actions, CTAs, interactive elements';
    if (component.tags.includes('data')) return 'Tables, lists, data presentation';
    
    return 'General UI components for modern web applications';
  }

  private async fetchComponent(componentId: string): Promise<OriginUIComponent> {
    if (this.componentsCache.has(componentId) && 
        Date.now() - this.lastCacheUpdate < this.cacheExpiry) {
      return this.componentsCache.get(componentId)!;
    }

    const url = `${this.registryUrl}/${componentId}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch component: ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    const component: OriginUIComponent = {
      id: componentId,
      name: data.name || componentId,
      type: data.type || 'registry:component',
      category: this.inferCategory(data.tags || []),
      tags: data.tags || [],
      dependencies: {
        external: data.dependencies || [],
        registry: data.registryDependencies || []
      },
      files: data.files || [],
      installUrl: url
    };

    this.componentsCache.set(componentId, component);
    this.lastCacheUpdate = Date.now();
    
    return component;
  }

  private inferCategory(tags: string[]): string {
    const categoryMap: { [key: string]: string } = {
      'button': 'button',
      'input': 'input',
      'select': 'select',
      'form': 'form',
      'card': 'card',
      'navbar': 'navigation',
      'nav': 'navigation',
      'modal': 'overlay',
      'dialog': 'overlay',
      'table': 'data-display',
      'list': 'data-display'
    };

    for (const tag of tags) {
      if (categoryMap[tag.toLowerCase()]) {
        return categoryMap[tag.toLowerCase()];
      }
    }

    return 'component';
  }

  private extractTailwindClasses(files: Array<{ content: string; type: string }>): string {
    const uiFile = files.find(f => f.type === 'registry:ui');
    if (!uiFile) return 'No styling information available';

    const classMatches = uiFile.content.match(/className="([^"]+)"/g) || [];
    const classes = classMatches.map(match => match.replace(/className="([^"]+)"/, '$1')).join(' ');
    
    return classes || 'No Tailwind classes found';
  }

  private generateUsageExample(component: OriginUIComponent): string {
    const componentName = component.name.replace(/\\s+/g, '');
    
    return `import { ${componentName} } from "@/components/ui/${component.id}";

export default function Example() {
  return (
    <${componentName} />
  );
}`;
  }

  async discoverComponents(force: boolean = false): Promise<{ content: Array<{ type: string; text: string }> }> {
    if (this.discoveryInProgress && !force) {
      return {
        content: [
          {
            type: "text",
            text: "🔍 Component discovery is already in progress. Please wait for it to complete."
          }
        ]
      };
    }

    try {
      console.error('🚀 Manual component discovery triggered...');
      
      const beforeCount = this.componentsList.length;
      await this.performDynamicDiscovery();
      const afterCount = this.componentsList.length;
      const newComponents = afterCount - beforeCount;

      return {
        content: [
          {
            type: "text",
            text: `✅ Component discovery completed!\n\n**Before**: ${beforeCount} components\n**After**: ${afterCount} components\n**New components discovered**: ${newComponents}\n\nYou can now search for more OriginUI components including tabs, modals, forms, and many others!`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Component discovery failed: ${error}\n\nFalling back to static component registry.`
          }
        ]
      };
    }
  }
}