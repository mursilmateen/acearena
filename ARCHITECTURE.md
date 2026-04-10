# AceArena Frontend - Architecture & Best Practices

## Project Overview

AceArena Frontend is a modern Next.js 16 application built with TypeScript, Tailwind CSS, and shadcn/ui components. It follows clean architecture principles with separation of concerns and scalable folder structure.

## Architecture Principles

### 1. Component Organization

**Folder Structure:**
- `/components/ui/` - shadcn/ui components (Button, Card, Input, etc.)
- `/components/layout/` - Layout components (Navbar, Sidebar, Footer)
- `/components/shared/` - Shared reusable components (GameCard, SearchBar)
- `/components/forms/` - Form-specific components
- `/components/providers/` - Context providers (ThemeProvider)

**Benefits:**
- Clear separation of concerns
- Easy to locate and maintain components
- Scalable as app grows
- Encourages component reusability

### 2. State Management with Zustand

**Store Location:** `/store/appStore.ts`

**Features:**
- Global authentication state
- Search filters persistence
- Theme preference (light/dark)
- User information storage

**Usage:**
```typescript
const { user, theme, searchFilters } = useAppStore();
```

**Pro Tips:**
- Keep store actions simple and pure
- Use derived state selectively
- Subscribe to specific state slices to avoid unnecessary re-renders

### 3. Type Safety

**Types Location:** `/types/index.ts`

**Key Types:**
- `Game` - Game data structure
- `User` - User information
- `AuthState` - Authentication state
- `SearchFilters` - Filter options

**Benefits:**
- Full TypeScript support
- Type checking at compile time
- Better IDE autocomplete
- Easier refactoring

### 4. Custom Hooks

**Location:** `/hooks/useApi.ts`

**Available Hooks:**
- `useGames()` - Fetch games
- `useAuth()` - Authentication
- `useUploadGame()` - Game upload

**Pattern:**
- Encapsulate API logic
- Provide error handling
- Manage loading states
- Return consistent interface

### 5. Mock Data

**Location:** `/data/games.ts`

**Structure:**
- `MOCK_GAMES` - Array of game objects
- `FEATURED_GAMES` - Curated featured games
- `LATEST_GAMES` - Games sorted by creation date
- `POPULAR_TAGS` - Available game tags

**Usage:**
Replace with real API calls when backend is ready. All hooks already have TODO comments for integration points.

## Styling Approach

### Tailwind CSS

**Configuration:** `tailwind.config.ts`

**Dark Mode:**
- Class-based dark mode enabled
- Applied via `.dark` class on HTML
- Automatically handled by ThemeProvider

**Custom Theme:**
- Purple/Pink gradient accent color
- Slate color palette for text/backgrounds
- Responsive spacing and sizing

**Best Practices:**
- Use utility classes directly
- Apply responsive prefixes (sm:, md:, lg:, etc.)
- Use dark: prefix for dark mode styles
- Create component-specific styles with utility classes

## Page Structure

### Dynamic Routes

**Game Detail Page:** `/app/game/[id]/page.tsx`
- Uses dynamic routing with [id] parameter
- Fetches game by ID from mock data
- Shows related games based on tags
- Responsive layout with sidebar

### Route Groups

**Auth Routes:** `/(auth)/`
- Shared layout for login/register
- Centered form design
- Consistent styling

**Main Routes:** `/(main)/ ` (Future)
- Can be used for pages with sidebar
- Shared layout across multiple pages

## Responsive Design

### Breakpoints (Tailwind Default)
- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

### Mobile-First Strategy
- Start with mobile styles
- Add breakpoints for larger screens
- Uses Tailwind responsive prefixes

### Example:
```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
</div>
```

## Data Flow

### Authentication Flow
1. User enters credentials on login page
2. Form submission calls `login()` from `useAppStore`
3. Zustand updates global user state
4. User redirected to home page
5. Navbar shows user profile dropdown

### Game Discovery Flow
1. User lands on home page
2. Featured games loaded from mock data
3. Sidebar filters/search update global state
4. Games re-filtered based on search params
5. Results updated in real-time

### Upload Flow
1. User fills out game form
2. Selects files (thumbnail, game file)
3. Form submission calls `uploadGame()` hook
4. Shows loading state
5. Success/error message displayed

## Performance Considerations

### Code Splitting
- Next.js automatically code-splits at route level
- Dynamic imports for optional features
- Layout components split per route group

### Image Optimization
- Consider using Next.js `Image` component
- Automatic lazy loading
- Responsive image serving

### API Calls
- Implement caching strategy
- Use React Query or SWR for real API
- Avoid N+1 queries

### State Updates
- Zustand automatically batches updates
- Use selectors for specific state slices
- Avoid creating new objects in render

## Testing Strategy (Future)

### Unit Tests
- Test individual components
- Test hook logic
- Test utility functions

### Integration Tests
- Test component interactions
- Test form submissions
- Test state management

### E2E Tests
- Test user workflows
- Test game discovery flow
- Test authentication flow

## Security Considerations

### Current State (Mock)
- No real authentication
- No sensitive data handling
- Demo credentials used only

### For Production
- Implement JWT authentication
- Use secure HTTP-only cookies
- Validate all inputs
- Sanitize user data
- CSRF protection
- XSS prevention (Tailwind helps)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## Deployment Options

### Vercel (Recommended)
```bash
vercel deploy
```
- Automatic builds and deploys
- Built for Next.js
- Serverless functions support

### Other Platforms
- Netlify (requires config)
- AWS
- Google Cloud
- Docker container

## Development Workflow

### Setup
```bash
npm install
cp .env.local.example .env.local
npm run dev
```

### Development
- Use `npm run dev` for development server
- Use `npm run lint` to check code quality
- Test in dark/light modes
- Test on mobile devices

### Build
```bash
npm run build
npm start  # Test production build locally
```

## Common Patterns

### Creating a New Page
1. Create folder in `/app`
2. Add `page.tsx` file
3. Make it `'use client'` if using hooks
4. Use existing components
5. Add to navigation if needed

### Creating a New Component
1. Create in appropriate `/components` folder
2. Make it `'use client'` if using hooks
3. Export default function
4. Document props with TypeScript
5. Test with different data

### Adding New State
1. Add to Zustand store
2. Define types in `/types`
3. Use in components via `useAppStore()`
4. Document in comments

### Adding New Hook
1. Create in `/hooks` directory
2. Follow `use` prefix naming
3. Return consistent interface
4. Include TypeScript types
5. Add TODO for API integration

## Git Best Practices

### Commit Messages
- Use clear, descriptive messages
- Reference feature/bug number
- Use conventional commits: fix:, feat:, docs:, etc.

### Branch Strategy
- Main branch for production code
- Feature branches for new features
- PR review before merging

## Environment Setup

### Required Tools
- Node.js (v18+)
- npm (v9+)
- Git
- Code editor (VS Code recommended)

### Recommended VS Code Extensions
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Thunder Client (API testing)

## Monitoring & Analytics

### For Production
- Setup error tracking (Sentry)
- Add analytics (Google Analytics, Mixpanel)
- Monitor performance (Vercel Analytics)
- Setup alerting for errors

## Future Enhancements

1. **Backend Integration**
   - RESTful API
   - WebSocket for real-time features
   - Server-side rendering for SEO

2. **Features**
   - User profiles
   - Game reviews
   - Community forums
   - Streaming integration

3. **Performance**
   - Image CDN
   - API caching layer
   - Database optimization

4. **Scaling**
   - Microservices architecture
   - Message queues
   - Load balancing
   - Database sharding

---

**Note:** This document should be updated as the project evolves and new patterns are established.
