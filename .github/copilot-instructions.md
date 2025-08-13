# GitHub Copilot Instructions for Way-d

## Project Overview
Way-d is a modern dating application built with React/TypeScript frontend and Go microservices backend. The app focuses on meaningful connections in Côte d'Ivoire and other French-speaking African countries.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Go microservices (Auth, Profile, Interactions, Events, etc.)
- **Database**: PostgreSQL
- **Deployment**: PM2 + Nginx reverse proxy
- **Containerization**: Docker

## Code Style & Standards

### TypeScript/React
- Use functional components with TypeScript
- Prefer `const` over `let`, avoid `var`
- Use explicit typing, avoid `any`
- Follow React hooks best practices
- Use descriptive variable and function names in English
- Comments in French for business logic explanations

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── services/      # API services and external integrations
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── assets/        # Static assets
```

### API Integration
- All API calls go through `src/services/api.ts`
- Use axios for HTTP requests
- Implement proper error handling with try-catch
- Add loading states for async operations
- Use consistent response format: `{ data, error, loading }`

## Backend Services (Ports)
- Auth Service: 8080
- Profile Service: 8081  
- Interactions Service: 8082
- Events Service: 8083
- Payments Service: 8084
- Notifications Service: 8085
- Moderation Service: 8086
- Analytics Service: 8087
- Admin Service: 8088

## Development Guidelines

### Component Creation
When creating new components:
- Use TypeScript interfaces for props
- Include proper JSDoc comments
- Implement error boundaries where needed
- Follow atomic design principles
- Make components responsive by default

### API Service Pattern
```typescript
export const serviceNameService = {
  methodName: async (params): Promise<ReturnType> => {
    try {
      const response = await api.get/post/put/delete(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('Service error:', error);
      throw error;
    }
  }
};
```

### Error Handling
- Always handle API errors gracefully
- Show user-friendly error messages
- Log errors for debugging
- Implement fallback UI states
- Use error boundaries for component errors

### Internationalization
- Use the i18n system for all user-facing text
- Keys should be descriptive: `profile.edit.title`
- Fallback to English if French translation missing
- Date/time formatting should respect locale

## Business Context

### Target Audience
- Young professionals in Côte d'Ivoire
- French-speaking African diaspora
- Age range: 20-35 years
- Urban, educated, tech-savvy users

### Key Features
- Profile creation with photo verification
- Smart matching algorithm
- Real-time messaging
- Event discovery and participation
- Premium subscriptions
- Community features

### Localization Notes
- Primary language: French
- Currency: West African CFA franc (XOF)
- Date format: DD/MM/YYYY
- Cultural considerations for Ivorian context

## Performance Requirements
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Lighthouse scores > 90
- Mobile-first responsive design
- Offline capabilities for core features

## Security Guidelines
- Validate all inputs on both client and server
- Use HTTPS everywhere
- Implement CSRF protection
- Sanitize user-generated content
- Follow GDPR compliance requirements
- Regular security audits

## Testing Strategy
- Unit tests for utility functions
- Integration tests for API services
- E2E tests for critical user flows
- Visual regression tests for UI components
- Performance testing for matching algorithm

## Deployment
- Development: `npm run dev` (Port 5173)
- Production: PM2 with Nginx reverse proxy
- Environment variables in `.env` files
- Docker containers for backend services

## Common Patterns

### Authentication
```typescript
// Check if user is authenticated
const { user, isAuthenticated } = useAuth();

// Protect routes
if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

### API Calls with Loading States
```typescript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await apiService.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
```

### Form Validation
```typescript
// Use react-hook-form with validation
const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
  resolver: zodResolver(validationSchema)
});
```

## Debugging & Troubleshooting

### Common Issues
- **CORS errors**: Check backend service configuration
- **401 Unauthorized**: Verify JWT token in localStorage
- **TypeScript errors**: Use proper typing, avoid `any`
- **Performance issues**: Check for unnecessary re-renders

### Useful Commands
```bash
# Start development
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Type checking
npm run type-check

# Deploy with PM2
npm run deploy:pm2
```

## Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Loading states are shown to users
- [ ] Responsive design is maintained
- [ ] Accessibility standards are met
- [ ] Performance impact is considered
- [ ] Security best practices are followed
- [ ] Code is properly commented
- [ ] Tests are written/updated

## Getting Started for New Contributors
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start backend services: `docker-compose up`
5. Start frontend: `npm run dev`
6. Review this document and project structure
7. Check existing issues and PRs for context

## Resources
- [Design System Documentation](docs/design-system.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Contributing Guidelines](CONTRIBUTING.md)

---

**Note**: This is a dating application that promotes respectful relationships and prioritizes user safety and privacy. All code should reflect these values.
