import fetch from 'node-fetch';
import { ComponentMetadata } from './components-registry.js';

export class SimpleOriginUIDiscovery {
  private readonly baseUrl = 'https://originui.com';
  
  // All available tags extracted from OriginUI search interface
  private readonly allTags = [
    // Core components
    'accordion', 'alert', 'avatar', 'badge', 'banner', 'breadcrumb', 'button', 'calendar', 
    'checkbox', 'collapsible', 'combobox', 'command', 'crop', 'dialog', 'dropdown', 'input', 
    'label', 'notification', 'otp', 'pagination', 'popover', 'radio', 'select', 'slider', 
    'sonner', 'stepper', 'table', 'tabs', 'textarea', 'timeline', 'switch', 'tooltip',
    
    // Compound components
    'alert dialog', 'authentication', 'autocomplete', 'avatar group', 'back', 'card', 'chart', 
    'checkout', 'chip', 'color', 'controls', 'cookies', 'countdown', 'counter', 'copy', 
    'credit card', 'darkmode', 'date', 'delete', 'disabled', 'drag and drop', 'emblor', 
    'equalizer', 'error', 'feedback', 'file', 'filter', 'flag', 'form', 'gdpr', 'hamburger', 
    'helper', 'hint', 'hover card', 'image', 'info', 'kbd', 'like', 'loading', 'login', 
    'mask', 'menu', 'modal', 'multiselect', 'native select', 'newsletter', 'next', 'number', 
    'onboarding', 'password', 'payment', 'phone', 'picker', 'previous', 'pricing', 'privacy', 
    'profile', 'radix', 'range', 'range calendar', 'range slider', 'rating', 'react aria', 
    'react daypicker', 'read-only', 'required', 'reset', 'resize', 'sale', 'search', 'share', 
    'signup', 'social', 'sort', 'status', 'sticky', 'subscribe', 'success', 'tag', 'tanstack', 
    'team', 'text editor', 'time', 'timezone', 'toast', 'toggle', 'toggle group', 'tour', 
    'tree', 'upload', 'user', 'vertical slider', 'vertical stepper', 'vertical table', 
    'vertical tabs', 'vertical timeline', 'volume', 'vote', 'warning', 'week', 'zoom'
  ];

  findBestMatchingTag(query: string): string | null {
    const lowerQuery = query.toLowerCase();
    
    // Exact match first
    const exactMatch = this.allTags.find(tag => tag.toLowerCase() === lowerQuery);
    if (exactMatch) return exactMatch;
    
    // Partial match - tag contains query
    const partialMatch = this.allTags.find(tag => tag.toLowerCase().includes(lowerQuery));
    if (partialMatch) return partialMatch;
    
    // Query contains tag (for plurals like "checkboxes" -> "checkbox")
    const reverseMatch = this.allTags.find(tag => lowerQuery.includes(tag.toLowerCase()));
    if (reverseMatch) return reverseMatch;
    
    return null;
  }

  async searchComponentsByTag(tag: string): Promise<ComponentMetadata[]> {
    // Use direct category pages instead of search API
    const categoryUrl = `${this.baseUrl}/${tag}`;
    
    try {
      const response = await fetch(categoryUrl);
      if (!response.ok) {
        console.error(`Category page failed for tag ${tag}: ${response.status}`);
        return [];
      }
      
      const html = await response.text();
      return this.parseSearchResults(html, tag);
    } catch (error) {
      console.error(`Error searching for tag ${tag}:`, error);
      return [];
    }
  }

  private parseSearchResults(html: string, tag: string): ComponentMetadata[] {
    const components: ComponentMetadata[] = [];
    
    // Extract component registry URLs from search results
    const registryMatches = html.match(/https:\/\/originui\.com\/r\/([^"]+)\.json/g) || [];
    const uniqueComponentIds = new Set<string>();
    
    registryMatches.forEach((match) => {
      const componentId = match.match(/\/r\/([^"]+)\.json$/)?.[1];
      if (componentId && !uniqueComponentIds.has(componentId)) {
        uniqueComponentIds.add(componentId);
        
        components.push({
          id: componentId,
          name: this.generateNameFromId(componentId, tag),
          category: this.inferCategoryFromTag(tag),
          tags: [tag, 'ui', 'component'],
          description: `${this.capitalizeFirst(tag)} component from OriginUI`,
          installUrl: match,
          dependencies: [],
          styling: {
            framework: 'Tailwind CSS',
            darkMode: true,
            responsive: true,
            customizable: true
          },
          screenshots: {
            preview: `${this.baseUrl}/search?tags=${encodeURIComponent(tag)}`
          }
        });
      }
    });
    
    console.error(`✅ Found ${components.length} components for tag "${tag}"`);
    return components;
  }

  private generateNameFromId(componentId: string, tag: string): string {
    // If it's a numbered component like comp-132, try to make it more descriptive
    if (componentId.startsWith('comp-')) {
      const number = componentId.replace('comp-', '');
      return `${this.capitalizeFirst(tag)} Component ${number}`;
    }
    
    // If it's a named component, use a nice name
    return this.capitalizeFirst(componentId.replace(/-/g, ' '));
  }

  private inferCategoryFromTag(tag: string): string {
    const categoryMap: { [key: string]: string } = {
      'accordion': 'layout',
      'alert': 'feedback',
      'avatar': 'media',
      'badge': 'feedback',
      'banner': 'feedback',
      'breadcrumb': 'navigation',
      'button': 'button',
      'calendar': 'input',
      'checkbox': 'input',
      'dialog': 'overlay',
      'dropdown': 'overlay',
      'input': 'input',
      'label': 'typography',
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
      'tooltip': 'overlay'
    };
    
    return categoryMap[tag] || 'component';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getAllTags(): string[] {
    return [...this.allTags];
  }
}