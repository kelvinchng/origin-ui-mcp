import fetch from 'node-fetch';
import { ComponentMetadata } from './components-registry.js';

interface DiscoveredComponent {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  installUrl: string;
  dependencies?: string[];
}

export class DynamicComponentDiscovery {
  private readonly baseUrl = 'https://originui.com';
  private readonly knownCategories = [
    'buttons', 'inputs', 'selects', 'tabs', 'forms', 'cards', 
    'navbars', 'tables', 'modals', 'alerts', 'badges', 'tooltips',
    'dropdowns', 'toggles', 'sliders', 'checkboxes', 'radios',
    'layouts', 'typography', 'avatars', 'breadcrumbs', 'pagination',
    'accordions', 'calendars', 'carousels', 'charts', 'dialogs',
    'dropzones', 'galleries', 'grids', 'loaders', 'menus',
    'notifications', 'progress', 'ratings', 'scrollbars', 'sidebars',
    'steppers', 'timelines', 'uploads', 'wizards'
  ];

  async discoverAllCategories(): Promise<string[]> {
    console.error('🔍 Discovering all OriginUI categories...');
    
    try {
      // First, scrape the main page to find all category links
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      // Extract category links from the main page
      const categoryMatches = html.match(/href="\/([a-z-]+)"/g) || [];
      const discoveredCategories = new Set<string>();
      
      categoryMatches.forEach(match => {
        const category = match.replace(/href="\/([a-z-]+)"/, '$1');
        // Filter out non-component pages
        if (this.isComponentCategory(category)) {
          discoveredCategories.add(category);
        }
      });
      
      // Combine with known categories
      this.knownCategories.forEach(cat => discoveredCategories.add(cat));
      
      const allCategories = Array.from(discoveredCategories);
      console.error(`✅ Discovered ${allCategories.length} total categories:`, allCategories);
      
      return allCategories;
    } catch (error) {
      console.error('❌ Category discovery failed, using known categories');
      return this.knownCategories;
    }
  }

  private isComponentCategory(category: string): boolean {
    // Filter out non-component pages
    const excludedPages = [
      'search', 'layouts', 'easings', 'about', 'pricing', 'contact',
      'docs', 'blog', 'api', 'auth', 'login', 'signup', 'dashboard',
      'profile', 'settings', 'terms', 'privacy', 'support'
    ];
    
    return !excludedPages.includes(category) && 
           category.length > 2 && 
           /^[a-z-]+$/.test(category);
  }

  async discoverAllComponents(): Promise<ComponentMetadata[]> {
    const discoveredComponents: ComponentMetadata[] = [];
    
    console.error('🔍 Starting comprehensive component discovery...');
    
    // Strategy 1: Discover numbered components (comp-001 to comp-596)
    const numberedComponents = await this.discoverNumberedComponents();
    discoveredComponents.push(...numberedComponents);
    console.error(`✅ Found ${numberedComponents.length} numbered components`);
    
    // Strategy 2: Discover named components from registry
    const namedComponents = await this.discoverNamedComponents();
    discoveredComponents.push(...namedComponents);
    console.error(`✅ Found ${namedComponents.length} named components`);
    
    // Strategy 3: Discover from categories (as fallback)
    const categoryComponents = await this.discoverCategoryComponents();
    const newCategoryComponents = categoryComponents.filter(comp => 
      !discoveredComponents.some(existing => existing.id === comp.id)
    );
    discoveredComponents.push(...newCategoryComponents);
    console.error(`✅ Found ${newCategoryComponents.length} additional category components`);
    
    console.error(`🎉 Total discovered: ${discoveredComponents.length} components`);
    return discoveredComponents;
  }

  async discoverNumberedComponents(): Promise<ComponentMetadata[]> {
    console.error('🔢 Discovering numbered components (comp-001 to comp-596)...');
    const components: ComponentMetadata[] = [];
    const batchSize = 50;
    
    // Check components in batches to avoid overwhelming the server
    for (let start = 1; start <= 596; start += batchSize) {
      const batch: Promise<ComponentMetadata | null>[] = [];
      
      for (let i = start; i < start + batchSize && i <= 596; i++) {
        const paddedNum = i.toString().padStart(3, '0');
        const componentId = `comp-${paddedNum}`;
        
        batch.push(
          this.checkComponentExists(componentId)
            .then(exists => exists ? this.createNumberedComponent(componentId, i) : null)
            .catch(() => null)
        );
      }
      
      const results = await Promise.allSettled(batch);
      const validComponents = results
        .map(result => result.status === 'fulfilled' ? result.value : null)
        .filter((comp): comp is ComponentMetadata => comp !== null);
      
      components.push(...validComponents);
      
      if (start % 100 === 1) {
        console.error(`📊 Progress: Checked ${Math.min(start + batchSize - 1, 596)}/596 numbered components`);
      }
    }
    
    return components;
  }

  async discoverNamedComponents(): Promise<ComponentMetadata[]> {
    console.error('📝 Discovering named components...');
    const knownNamedComponents = [
      'accordion', 'alert', 'avatar', 'badge', 'banner', 'breadcrumb',
      'button', 'calendar-date-picker', 'checkbox', 'dialog', 'dropdown',
      'file-upload', 'event-calendar', 'input', 'label', 'navbar',
      'notification', 'pagination', 'popover', 'radio', 'select',
      'slider', 'stepper', 'switch', 'table', 'tabs', 'textarea',
      'timeline', 'tooltip', 'tree',
      // Hook components
      'use-character-limit', 'use-file-upload', 'use-pagination',
      'use-local-storage', 'use-debounce', 'use-copy-to-clipboard'
    ];
    
    const components: ComponentMetadata[] = [];
    const batch: Promise<ComponentMetadata | null>[] = knownNamedComponents.map(componentId =>
      this.checkComponentExists(componentId)
        .then(exists => exists ? this.createNamedComponent(componentId) : null)
        .catch(() => null)
    );
    
    const results = await Promise.allSettled(batch);
    const validComponents = results
      .map(result => result.status === 'fulfilled' ? result.value : null)
      .filter((comp): comp is ComponentMetadata => comp !== null);
    
    components.push(...validComponents);
    return components;
  }

  private async checkComponentExists(componentId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/r/${componentId}.json`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private createNumberedComponent(componentId: string, index: number): ComponentMetadata {
    return {
      id: componentId,
      name: `Component ${index}`,
      category: 'component',
      tags: ['ui', 'component', 'numbered'],
      description: `OriginUI component ${componentId}`,
      installUrl: `https://originui.com/r/${componentId}.json`,
      dependencies: [],
      styling: {
        framework: 'Tailwind CSS',
        darkMode: true,
        responsive: true,
        customizable: true
      },
      screenshots: {
        preview: `${this.baseUrl}`
      }
    };
  }

  private createNamedComponent(componentId: string): ComponentMetadata {
    const categoryMap: { [key: string]: string } = {
      'accordion': 'layout',
      'alert': 'feedback',
      'avatar': 'media',
      'badge': 'feedback',
      'banner': 'feedback',
      'breadcrumb': 'navigation',
      'button': 'button',
      'calendar-date-picker': 'input',
      'checkbox': 'input',
      'dialog': 'overlay',
      'dropdown': 'overlay',
      'file-upload': 'input',
      'event-calendar': 'data-display',
      'input': 'input',
      'label': 'typography',
      'navbar': 'navigation',
      'notification': 'feedback',
      'pagination': 'navigation',
      'popover': 'overlay',
      'radio': 'input',
      'select': 'select',
      'slider': 'input',
      'stepper': 'navigation',
      'switch': 'input',
      'table': 'data-display',
      'tabs': 'navigation',
      'textarea': 'input',
      'timeline': 'data-display',
      'tooltip': 'overlay',
      'tree': 'data-display'
    };

    return {
      id: componentId,
      name: this.capitalizeFirst(componentId.replace(/-/g, ' ')),
      category: categoryMap[componentId] || 'component',
      tags: [categoryMap[componentId] || 'component', 'ui', 'named'],
      description: `OriginUI ${componentId.replace(/-/g, ' ')} component`,
      installUrl: `https://originui.com/r/${componentId}.json`,
      dependencies: [],
      styling: {
        framework: 'Tailwind CSS',
        darkMode: true,
        responsive: true,
        customizable: true
      },
      screenshots: {
        preview: `${this.baseUrl}`
      }
    };
  }

  private async discoverCategoryComponents(): Promise<ComponentMetadata[]> {
    const discoveredComponents: ComponentMetadata[] = [];
    
    // First discover all categories
    const allCategories = await this.discoverAllCategories();
    
    for (const category of allCategories) {
      try {
        const components = await this.discoverCategoryComponentsOld(category);
        discoveredComponents.push(...components);
        console.error(`✅ Discovered ${components.length} components in ${category}`);
      } catch (error) {
        console.error(`❌ Failed to discover ${category}: ${error}`);
      }
    }
    
    return discoveredComponents;
  }

  private async discoverCategoryComponentsOld(category: string): Promise<ComponentMetadata[]> {
    const url = `${this.baseUrl}/${category}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        return [];
      }
      
      const html = await response.text();
      return this.extractComponentsFromHTML(html, category);
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      return [];
    }
  }

  private extractComponentsFromHTML(html: string, category: string): ComponentMetadata[] {
    const components: ComponentMetadata[] = [];
    
    // Method 1: Extract component IDs from registry URLs
    const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
    const uniqueComponents = new Set<string>();
    
    registryMatches.forEach((match) => {
      const componentId = match.match(/\/r\/([^"]+)\.json$/)?.[1];
      if (componentId && !uniqueComponents.has(componentId)) {
        uniqueComponents.add(componentId);
        components.push({
          id: componentId,
          name: this.generateComponentName(componentId, category),
          category: this.normalizeCategory(category),
          tags: this.generateTags(componentId, category),
          description: this.generateDescription(componentId, category),
          installUrl: match,
          dependencies: this.inferDependencies(category),
          styling: {
            framework: 'Tailwind CSS',
            darkMode: true,
            responsive: true,
            customizable: true
          },
          screenshots: {
            preview: `${this.baseUrl}/${category}`
          }
        });
      }
    });

    // Method 2: Look for component count indicators
    const countMatch = html.match(/(\d+)\s+(?:tabs|button|input|component)/i);
    if (countMatch && components.length === 0) {
      const componentCount = parseInt(countMatch[1]);
      console.error(`📊 Found ${componentCount} components indicated for ${category}`);
      
      // Generate placeholder components based on count
      for (let i = 1; i <= Math.min(componentCount, 50); i++) {
        const componentId = `${category}-${i}`;
        if (!uniqueComponents.has(componentId)) {
          uniqueComponents.add(componentId);
          components.push(this.createComponent(componentId, category, i));
        }
      }
    }

    // Method 3: If no components found, create a base component for the category
    if (components.length === 0) {
      components.push(this.createGenericComponent(category));
    }

    return components;
  }

  private createComponent(componentId: string, category: string, index: number): ComponentMetadata {
    return {
      id: componentId,
      name: `${this.capitalizeFirst(category)} ${index}`,
      category: this.normalizeCategory(category),
      tags: this.generateTags(componentId, category),
      description: `${this.generateDescription(componentId, category)} - Variant ${index}`,
      installUrl: `https://originui.com/r/${componentId}.json`,
      dependencies: this.inferDependencies(category),
      styling: {
        framework: 'Tailwind CSS',
        darkMode: true,
        responsive: true,
        customizable: true
      },
      screenshots: {
        preview: `${this.baseUrl}/${category}`
      }
    };
  }

  private generateComponentName(componentId: string, category: string): string {
    if (componentId === category) {
      return this.capitalizeFirst(category);
    }
    
    // Extract component number and create descriptive name
    const match = componentId.match(/comp-(\d+)/);
    if (match) {
      const num = match[1];
      return `${this.capitalizeFirst(category)} Component ${num}`;
    }
    
    return this.capitalizeFirst(componentId.replace(/-/g, ' '));
  }

  private generateTags(componentId: string, category: string): string[] {
    const baseTags = [this.normalizeCategory(category)];
    
    // Add specific tags based on component ID patterns
    if (componentId.includes('icon')) baseTags.push('icon');
    if (componentId.includes('badge')) baseTags.push('badge');
    if (componentId.includes('vertical')) baseTags.push('vertical');
    if (componentId.includes('horizontal')) baseTags.push('horizontal');
    
    baseTags.push('interactive', 'ui', 'component');
    
    return baseTags;
  }

  private generateDescription(componentId: string, category: string): string {
    const categoryDescriptions: { [key: string]: string } = {
      'buttons': 'Interactive button component for user actions',
      'inputs': 'Form input component for user data entry',
      'selects': 'Selection dropdown component for choosing options',
      'tabs': 'Tab navigation component for organizing content',
      'forms': 'Form component for structured data collection',
      'cards': 'Container component for displaying content',
      'navbars': 'Navigation component for site navigation',
      'tables': 'Data table component for displaying structured data',
      'modals': 'Modal dialog component for focused interactions',
      'alerts': 'Alert component for displaying important messages'
    };
    
    const baseDescription = categoryDescriptions[category] || `${this.capitalizeFirst(category)} component`;
    
    if (componentId.includes('icon')) {
      return `${baseDescription} with icon support`;
    }
    if (componentId.includes('badge')) {
      return `${baseDescription} with badge indicators`;
    }
    
    return baseDescription;
  }

  private inferDependencies(category: string): string[] {
    const categoryDeps: { [key: string]: string[] } = {
      'tabs': ['@radix-ui/react-tabs'],
      'selects': ['@radix-ui/react-select'],
      'modals': ['@radix-ui/react-dialog'],
      'forms': ['@radix-ui/react-form'],
      'buttons': ['@radix-ui/react-slot']
    };
    
    return categoryDeps[category] || [];
  }

  private normalizeCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'buttons': 'button',
      'inputs': 'input',
      'selects': 'select',
      'tabs': 'navigation',
      'navbars': 'navigation',
      'forms': 'form',
      'cards': 'card',
      'tables': 'data-display',
      'modals': 'overlay',
      'alerts': 'feedback',
      'badges': 'feedback'
    };
    
    return categoryMap[category] || 'component';
  }

  private createGenericComponent(category: string): ComponentMetadata {
    return {
      id: category,
      name: this.capitalizeFirst(category),
      category: this.normalizeCategory(category),
      tags: [this.normalizeCategory(category), 'generic'],
      description: `Generic ${category} component from OriginUI`,
      installUrl: `https://originui.com/r/${category}.json`,
      dependencies: this.inferDependencies(category),
      styling: {
        framework: 'Tailwind CSS',
        darkMode: true,
        responsive: true,
        customizable: true
      },
      screenshots: {
        preview: `${this.baseUrl}/${category}`
      }
    };
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}