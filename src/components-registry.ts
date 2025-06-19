export interface ComponentMetadata {
  id: string;
  name: string;
  category: string;
  tags: string[];
  description: string;
  installUrl: string;
  previewUrl?: string;
  dependencies?: string[];
  styling: {
    framework: string;
    darkMode: boolean;
    responsive: boolean;
    customizable: boolean;
  };
}

export const COMPONENTS_REGISTRY: ComponentMetadata[] = [
  // Button Components
  {
    id: 'button',
    name: 'Button',
    category: 'button',
    tags: ['button', 'interactive', 'radix', 'cva'],
    description: 'A flexible button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes',
    installUrl: 'https://originui.com/r/button.json',
    dependencies: ['@radix-ui/react-slot', 'class-variance-authority'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-78',
    name: 'Button with Icon',
    category: 'button',
    tags: ['button', 'icon', 'loading', 'interactive'],
    description: 'Button component with icon support and loading states',
    installUrl: 'https://originui.com/r/comp-78.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-79',
    name: 'Destructive Button',
    category: 'button',
    tags: ['button', 'destructive', 'danger', 'delete'],
    description: 'Button with destructive styling for dangerous actions',
    installUrl: 'https://originui.com/r/comp-79.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  
  // Input Components
  {
    id: 'input',
    name: 'Input',
    category: 'input',
    tags: ['input', 'form', 'text', 'field'],
    description: 'Basic input field component with various states and styling',
    installUrl: 'https://originui.com/r/input.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-120',
    name: 'Input with Label',
    category: 'input',
    tags: ['input', 'label', 'form', 'field'],
    description: 'Input field with associated label for better accessibility',
    installUrl: 'https://originui.com/r/comp-120.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-121',
    name: 'Search Input',
    category: 'input',
    tags: ['input', 'search', 'icon', 'form'],
    description: 'Search input with search icon and clear functionality',
    installUrl: 'https://originui.com/r/comp-121.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Select Components
  {
    id: 'select',
    name: 'Select',
    category: 'select',
    tags: ['select', 'dropdown', 'form', 'radix'],
    description: 'Accessible select dropdown component built with Radix UI',
    installUrl: 'https://originui.com/r/select.json',
    dependencies: ['@radix-ui/react-select'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-140',
    name: 'Multi Select',
    category: 'select',
    tags: ['select', 'multi', 'tags', 'form'],
    description: 'Multi-select component with tag-based selection',
    installUrl: 'https://originui.com/r/comp-140.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Form Components
  {
    id: 'comp-163',
    name: 'Payment Method Selection',
    category: 'form',
    tags: ['radio', 'label', 'card', 'checkout', 'payment', 'radix'],
    description: 'Payment method selection component with radio buttons and card styling',
    installUrl: 'https://originui.com/r/comp-163.json',
    dependencies: ['@remixicon/react', '@radix-ui/react-radio-group'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'radio-group',
    name: 'Radio Group',
    category: 'form',
    tags: ['radio', 'form', 'selection', 'radix'],
    description: 'Accessible radio group component for single selection',
    installUrl: 'https://originui.com/r/radio-group.json',
    dependencies: ['@radix-ui/react-radio-group'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'form',
    tags: ['checkbox', 'form', 'selection', 'radix'],
    description: 'Accessible checkbox component with indeterminate state support',
    installUrl: 'https://originui.com/r/checkbox.json',
    dependencies: ['@radix-ui/react-checkbox'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Navigation Components
  {
    id: 'comp-200',
    name: 'Navbar',
    category: 'navigation',
    tags: ['navbar', 'navigation', 'header', 'menu'],
    description: 'Responsive navigation bar with menu items and mobile support',
    installUrl: 'https://originui.com/r/comp-200.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-201',
    name: 'Sidebar Navigation',
    category: 'navigation',
    tags: ['sidebar', 'navigation', 'menu', 'collapsible'],
    description: 'Collapsible sidebar navigation with nested menu support',
    installUrl: 'https://originui.com/r/comp-201.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Card Components
  {
    id: 'card',
    name: 'Card',
    category: 'card',
    tags: ['card', 'container', 'content'],
    description: 'Flexible card component for content containers',
    installUrl: 'https://originui.com/r/card.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-250',
    name: 'Product Card',
    category: 'card',
    tags: ['card', 'product', 'ecommerce', 'image'],
    description: 'Product card with image, title, price, and action buttons',
    installUrl: 'https://originui.com/r/comp-250.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Data Display Components
  {
    id: 'table',
    name: 'Table',
    category: 'data-display',
    tags: ['table', 'data', 'rows', 'columns'],
    description: 'Responsive table component with sorting and styling',
    installUrl: 'https://originui.com/r/table.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'comp-300',
    name: 'Data Table',
    category: 'data-display',
    tags: ['table', 'data', 'sorting', 'pagination'],
    description: 'Advanced data table with sorting, filtering, and pagination',
    installUrl: 'https://originui.com/r/comp-300.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Overlay Components
  {
    id: 'dialog',
    name: 'Dialog',
    category: 'overlay',
    tags: ['dialog', 'modal', 'overlay', 'radix'],
    description: 'Accessible dialog/modal component with backdrop',
    installUrl: 'https://originui.com/r/dialog.json',
    dependencies: ['@radix-ui/react-dialog'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'overlay',
    tags: ['popover', 'tooltip', 'overlay', 'radix'],
    description: 'Popover component for contextual content',
    installUrl: 'https://originui.com/r/popover.json',
    dependencies: ['@radix-ui/react-popover'],
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },

  // Feedback Components
  {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    tags: ['alert', 'notification', 'message', 'status'],
    description: 'Alert component for displaying important messages',
    installUrl: 'https://originui.com/r/alert.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'feedback',
    tags: ['badge', 'label', 'status', 'indicator'],
    description: 'Small badge component for status indicators',
    installUrl: 'https://originui.com/r/badge.json',
    styling: {
      framework: 'Tailwind CSS',
      darkMode: true,
      responsive: true,
      customizable: true
    }
  }
];

export const CATEGORIES = [
  'button',
  'input', 
  'select',
  'form',
  'navigation',
  'card',
  'data-display',
  'overlay',
  'feedback',
  'layout',
  'typography',
  'media'
] as const;

export type ComponentCategory = typeof CATEGORIES[number];