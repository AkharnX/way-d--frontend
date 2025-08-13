# Way-d Design System

## Overview
The Way-d design system provides consistent UI components and design patterns for the application.

## Color Palette

### Primary Colors
- **Brand Purple**: `#8B5CF6` - Main brand color for CTAs and highlights
- **Brand Blue**: `#3B82F6` - Secondary brand color for links and accents
- **Brand Pink**: `#EC4899` - Accent color for likes and romantic actions

### Neutral Colors
- **Gray 50**: `#F9FAFB` - Light backgrounds
- **Gray 100**: `#F3F4F6` - Card backgrounds
- **Gray 200**: `#E5E7EB` - Borders
- **Gray 500**: `#6B7280` - Placeholder text
- **Gray 900**: `#111827` - Primary text

### Status Colors
- **Success**: `#10B981` - Success messages and confirmations
- **Warning**: `#F59E0B` - Warnings and cautions
- **Error**: `#EF4444` - Errors and destructive actions
- **Info**: `#3B82F6` - Information and tips

## Typography

### Font Family
- Primary: `Inter, sans-serif`
- Headings: `Poppins, sans-serif`

### Font Sizes
- **xs**: 12px - Small labels and captions
- **sm**: 14px - Body text secondary
- **base**: 16px - Body text primary
- **lg**: 18px - Large body text
- **xl**: 20px - Small headings
- **2xl**: 24px - Medium headings
- **3xl**: 30px - Large headings
- **4xl**: 36px - Hero headings

### Font Weights
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

## Spacing
Based on 4px grid system:
- **1**: 4px
- **2**: 8px
- **3**: 12px
- **4**: 16px
- **5**: 20px
- **6**: 24px
- **8**: 32px
- **10**: 40px
- **12**: 48px
- **16**: 64px
- **20**: 80px
- **24**: 96px

## Components

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: #8B5CF6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #8B5CF6;
  border: 1px solid #8B5CF6;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
}
```

### Cards
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}
```

### Form Inputs
```css
.input {
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  width: 100%;
}

.input:focus {
  border-color: #8B5CF6;
  outline: none;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}
```

## Icons
Using Lucide React for consistent iconography:
- Size: 20px default, 16px for small, 24px for large
- Stroke width: 2px
- Color: Inherits from parent or gray-500 default

## Responsive Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

## Animations
- **Duration**: 200ms for micro-interactions, 300ms for transitions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for most transitions
- **Hover effects**: Subtle scale (1.05) and opacity changes

## Accessibility
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 3px outline with brand color
- Touch targets: Minimum 44px for interactive elements
- Screen reader support: Proper ARIA labels and semantic HTML
