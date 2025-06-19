# OriginUI MCP Server - Example Usage

This document shows how to use the OriginUI MCP server with Claude Code agents.

## Setup

1. Install the MCP server:
```bash
cd origin-ui-mcp
npm install
npm run build
```

2. Add to your Claude Code MCP configuration (`~/.claude-code/mcp.json`):
```json
{
  "mcpServers": {
    "origin-ui": {
      "command": "node",
      "args": ["/path/to/origin-ui-mcp/dist/index.js"]
    }
  }
}
```

## Example Claude Code Conversations

### 1. Search for Button Components

**User:** "I need to find button components for my React app"

**Claude Code with MCP:**
```typescript
// Claude would use the search_components tool
search_components({
  query: "button",
  category: "button",
  limit: 5
})
```

**Response:**
```
Found 3 component(s):

**Button** (button)
Category: button
Tags: button, interactive, radix, cva
Description: A flexible button component with multiple variants (default, destructive, outline, secondary, ghost, link) and sizes
Styling: Tailwind CSS • Dark Mode • Responsive
Install: `pnpm dlx shadcn@latest add https://originui.com/r/button.json`

---

**Button with Icon** (comp-78)
Category: button
Tags: button, icon, loading, interactive
Description: Button component with icon support and loading states
Styling: Tailwind CSS • Dark Mode • Responsive
Install: `pnpm dlx shadcn@latest add https://originui.com/r/comp-78.json`

---

**Destructive Button** (comp-79)
Category: button
Tags: button, destructive, danger, delete
Description: Button with destructive styling for dangerous actions
Styling: Tailwind CSS • Dark Mode • Responsive
Install: `pnpm dlx shadcn@latest add https://originui.com/r/comp-79.json`
```

### 2. Get Component Details

**User:** "Tell me more about the payment component comp-163"

**Claude Code:**
```typescript
get_component_details({
  componentId: "comp-163"
})
```

**Response:**
```markdown
# Payment Method Selection

**Type:** registry:component
**Category:** form
**Tags:** radio, label, card, checkout, payment, radix

## Styling Information
**Framework:** Tailwind CSS
**Dark Mode Support:** ✅
**Responsive Design:** ✅
**Customizable:** ✅

## Dependencies
**External:** @remixicon/react
**Registry:** https://originui.com/r/radio-group.json

## Installation
```bash
pnpm dlx shadcn@latest add https://originui.com/r/comp-163.json
```

## Description
Payment method selection component with radio buttons and card styling

## Files
- **comp-163.tsx** (registry:ui)

## Code Preview
```tsx
[Component code would be shown here]
```
```

### 3. Get Installation Command

**User:** "How do I install the button component?"

**Claude Code:**
```typescript
get_install_command({
  componentId: "button"
})
```

**Response:**
```
Installation command for **Button**:

```bash
pnpm dlx shadcn@latest add https://originui.com/r/button.json
```

This will install the component and its dependencies into your project.
```

### 4. Browse by Category

**User:** "Show me all form components"

**Claude Code:**
```typescript
list_components({
  category: "form",
  limit: 10
})
```

**Response:**
```
Available Components in "form":

1. **Payment Method Selection** (comp-163) - form
2. **Radio Group** (radio-group) - form
3. **Checkbox** (checkbox) - form

Total: 3 components
```

### 5. Component Preview with Styling

**User:** "I want to see the styling details for the card component"

**Claude Code:**
```typescript
get_component_preview({
  componentId: "card"
})
```

**Response:**
```markdown
# Card Preview

## Styling
- Built with **Tailwind CSS**
- Uses **Radix UI** primitives for accessibility
- Supports **dark/light mode**
- Responsive design

## Default Styling Classes
rounded-lg border bg-card text-card-foreground shadow-sm

## Usage Example
```tsx
import { Card } from "@/components/ui/card";

export default function Example() {
  return (
    <Card />
  );
}
```

## Installation
```bash
pnpm dlx shadcn@latest add https://originui.com/r/card.json
```
```

## Complete Workflow Example

**User:** "I'm building a checkout form and need payment selection and buttons"

**Claude Code would:**

1. Search for payment-related components:
```typescript
search_components({
  query: "payment checkout",
  limit: 5
})
```

2. Get installation commands:
```typescript
get_install_command({ componentId: "comp-163" })
get_install_command({ componentId: "button" })
```

3. Provide the user with:
- Component descriptions and features
- Installation commands
- Usage examples
- Styling information

This enables Claude Code agents to seamlessly help users discover, understand, and install the right OriginUI components for their projects.