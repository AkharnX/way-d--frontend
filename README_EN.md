# Way-d Frontend 💜

A modern dating application built with React and npm run stop:backend         # Stop backend services
```

## 🤖 MCP Integration (Model Context Protocol)

Way-d includes a dedicated MCP server for enhanced AI assistance:

```bash
# Setup MCP server
npm run mcp:setup           # Configure MCP for Claude Desktop
npm run mcp:build           # Build MCP server
npm run mcp:dev             # Start MCP in development
npm run mcp:test            # Test all MCP tools
```

### Available MCP Tools
- **analyze_project_structure**: Complete project architecture analysis
- **get_api_endpoints**: Extract all API endpoints
- **check_git_status**: Git status and recent commits
- **analyze_typescript_errors**: TypeScript error analysis
- **get_component_usage**: React component usage search
- **check_api_health**: Backend services health check
- **generate_deployment_report**: Comprehensive deployment report

See [MCP Integration Guide](docs/mcp-integration.md) for details.

## 🚀 DeploymentypeScript, designed to create meaningful connections in Côte d'Ivoire and French-speaking Africa.

![Way-d Logo](public/logo_blue.svg)

## 🚀 Features

- **Smart Matching Algorithm**: Find compatible partners based on preferences and interests
- **Real-time Messaging**: Chat with matches instantly
- **Profile Verification**: Secure and authentic user profiles
- **Event Discovery**: Find and join local community events
- **Multi-language Support**: French and English localization
- **Premium Features**: Enhanced experience with subscriptions
- **Mobile-first Design**: Responsive UI optimized for all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: PM2 + Nginx
- **Development**: ESLint, Prettier

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/AkharnX/way-d--frontend.git
cd way-d--frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Available Scripts

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run preview               # Preview production build
npm run lint                  # Run ESLint
npm run type-check            # TypeScript type checking

# Testing
npm run test                  # Run test suite
npm run test:auth            # Test authentication
npm run test:endpoints       # Test API endpoints

# Deployment
npm run deploy:pm2           # Deploy with PM2
npm run clean                # Clean project files

# Backend services
npm run start:backend        # Start backend services
npm run stop:backend         # Stop backend services
```

## 🏗️ Project Structure

```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # Base UI components (buttons, inputs, etc.)
│   ├── layout/             # Layout components (header, sidebar, etc.)
│   └── features/           # Feature-specific components
├── pages/                  # Route components
├── services/              # API services and integrations
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── types/                 # TypeScript type definitions
└── assets/               # Static assets (images, icons, etc.)
```

## 🔗 API Integration

The frontend communicates with multiple microservices:

- **Auth Service** (Port 8080): Authentication and user management
- **Profile Service** (Port 8081): User profiles and preferences
- **Interactions Service** (Port 8082): Likes, matches, and messaging
- **Events Service** (Port 8083): Community events
- **Payments Service** (Port 8084): Premium subscriptions

API calls are centralized in `src/services/api.ts` with proper error handling and type safety.

## 🌍 Internationalization

The app supports multiple languages:
- 🇫🇷 French (Primary)
- 🇬🇧 English
- Additional African languages (planned)

All text is externalized using the i18n system for easy translation.

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production with PM2
```bash
# Quick deployment
npm run deploy:pm2

# Manual deployment
npm run build
pm2 start tools/deployment/ecosystem.config.cjs --env production
```

The application will be deployed on port 5173 with PM2 managing the process.

### Nginx Configuration
Nginx acts as a reverse proxy:
```nginx
location / {
    proxy_pass http://localhost:5173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
}
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Test specific features
npm run test:auth           # Authentication flow
npm run test:endpoints      # API endpoints
```

## 🔒 Security

- JWT-based authentication
- HTTPS enforcement
- CSRF protection
- Input validation and sanitization
- GDPR compliance
- Content moderation

## 📱 Mobile Support

The application is mobile-first and responsive:
- Progressive Web App (PWA) capabilities
- Touch-optimized interface
- Offline functionality for core features
- Native app versions planned

## 🎨 Design System

Way-d uses a consistent design system:
- **Colors**: Purple (#8B5CF6) primary, Blue (#3B82F6) secondary
- **Typography**: Inter for body text, Poppins for headings
- **Components**: Reusable UI components with Tailwind CSS
- **Icons**: Lucide React icon library

See [Design System Documentation](docs/design-system.md) for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
1. Follow TypeScript best practices
2. Write tests for new features
3. Use conventional commit messages
4. Ensure responsive design
5. Maintain accessibility standards

## 📖 Documentation

- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Design System](docs/design-system.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🐛 Reporting Issues

Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- React and TypeScript communities
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- All contributors and supporters

## 📞 Contact

- **Developer**: AkharnX
- **Project**: Way-d Dating App
- **Location**: Côte d'Ivoire

---

Made with 💜 in Côte d'Ivoire
