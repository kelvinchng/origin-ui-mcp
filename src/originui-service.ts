import fetch from 'node-fetch';
import { COMPONENTS_REGISTRY, ComponentMetadata, CATEGORIES } from './components-registry.js';

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

  constructor() {
    this.initializeComponentsList();
  }

  private initializeComponentsList() {
    this.componentsList = COMPONENTS_REGISTRY.map(comp => ({
      id: comp.id,
      name: comp.name,
      category: comp.category,
      tags: comp.tags,
      description: comp.description,
      installUrl: comp.installUrl,
      styling: comp.styling
    }));
  }

  async searchComponents(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<{ content: Array<{ type: string; text: string }> }> {
    const filteredComponents = this.componentsList.filter(component => {
      const matchesQuery = 
        component.name.toLowerCase().includes(query.toLowerCase()) ||
        component.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        (component.description && component.description.toLowerCase().includes(query.toLowerCase()));
      
      const matchesCategory = !category || component.category === category;
      
      return matchesQuery && matchesCategory;
    });

    const results = filteredComponents.slice(0, limit);
    
    const resultText = results.length > 0 
      ? results.map(comp => 
          `**${comp.name}** (${comp.id})\\n` +
          `Category: ${comp.category}\\n` +
          `Tags: ${comp.tags.join(', ')}\\n` +
          `Description: ${comp.description || 'N/A'}\\n` +
          `Styling: ${comp.styling?.framework || 'Tailwind CSS'}${comp.styling?.darkMode ? ' • Dark Mode' : ''}${comp.styling?.responsive ? ' • Responsive' : ''}\\n` +
          `Install: \`pnpm dlx shadcn@latest add ${comp.installUrl}\`\\n`
        ).join('\\n---\\n')
      : `No components found matching "${query}"${category ? ` in category "${category}"` : ''}`;

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} component(s):\\n\\n${resultText}`
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
}