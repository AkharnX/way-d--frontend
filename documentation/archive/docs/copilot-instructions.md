# Copilot Instructions for Way-d Dating App

## Project Overview
Way-d is a modern dating application built with React, TypeScript, and Vite. The app features user authentication, profile discovery, real-time messaging, and profile management.

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: TailwindCSS with custom color scheme
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Authentication**: JWT tokens with automatic refresh

## Color Scheme
Always use these specific colors:
- **Primary Dark**: #021533 (Tailwind: `primary-dark`)
- **Primary Light**: #40BDE0 (Tailwind: `primary-light`)
- **Background**: #FFFFFF (Tailwind: `white`)

## Code Style Guidelines

### File Structure
- Components in `src/components/`
- Pages in `src/pages/`
- Custom hooks in `src/hooks/`
- API services in `src/services/`
- Type definitions in `src/types/`
- Utilities in `src/utils/`

### Naming Conventions
- Use PascalCase for component names
- Use camelCase for variables and functions
- Use kebab-case for CSS classes
- Use UPPER_SNAKE_CASE for constants

### React Patterns
- Use functional components with hooks
- Use TypeScript interfaces for props
- Use React.FC type for components
- Always define prop types with interfaces

### Authentication
- Use the `useAuth` hook for authentication state
- Protect routes with `ProtectedRoute` component
- Store JWT tokens in localStorage
- Implement automatic token refresh

### API Integration
- Use Axios for HTTP requests
- Implement proper error handling
- Use TypeScript interfaces for API responses
- Handle loading states in components

### Styling
- Use TailwindCSS utility classes
- Follow mobile-first responsive design
- Use the custom color scheme defined in tailwind.config.js
- Create reusable component classes in index.css

### State Management
- Use React Context for global state (auth, theme, etc.)
- Use useState for local component state
- Use useEffect for side effects
- Implement proper cleanup in useEffect

### Error Handling
- Implement try-catch blocks for async operations
- Show user-friendly error messages
- Log errors to console in development
- Handle network errors gracefully

## Common Patterns

### Component Structure
```tsx
import React from 'react';

interface ComponentProps {
  prop1: string;
  prop2?: number;
}

const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic here
  
  return (
    <div className="custom-styles">
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

### API Service Pattern
```tsx
export const apiFunction = async (data: RequestType): Promise<ResponseType> => {
  try {
    const response = await api.post('/endpoint', data);
    return response.data;
  } catch (error) {
    throw new Error('Error message');
  }
};
```

### Hook Pattern
```tsx
import { useState, useEffect } from 'react';

export const useCustomHook = () => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effect logic
    return () => {
      // Cleanup
    };
  }, [dependencies]);
  
  return { state, setState };
};
```

## Development Guidelines

### Before Adding New Features
1. Check if similar functionality already exists
2. Follow the established file structure
3. Use existing types and interfaces where possible
4. Test on multiple screen sizes

### When Writing Components
1. Keep components focused and single-purpose
2. Use proper TypeScript typing
3. Handle loading and error states
4. Make components responsive
5. Use semantic HTML elements

### When Adding API Calls
1. Add proper TypeScript interfaces
2. Handle errors appropriately
3. Show loading states to users
4. Implement retry logic where needed

### Testing Considerations
1. Test authentication flows
2. Test responsive design
3. Test error handling
4. Test navigation between pages

## Common Issues and Solutions

### Authentication Issues
- Always check if user is logged in before API calls
- Handle token expiration gracefully
- Redirect to login on auth failures

### Styling Issues
- Use the custom color scheme consistently
- Test on different screen sizes
- Use TailwindCSS utilities instead of custom CSS

### Performance Considerations
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize API calls to avoid unnecessary requests

## Deployment Notes
- Build with `npm run build`
- Preview with `npm run preview`
- Serves on port 5173 with external access
- Environment variables should be prefixed with `VITE_`
