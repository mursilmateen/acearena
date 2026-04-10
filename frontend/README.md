# AceArena Frontend

A modern, production-ready frontend for the AceArena platform - an indie game distribution platform inspired by itch.io.

## 🚀 Features

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS** for styling with dark mode support
- **shadcn/ui** components for consistent UI
- **Zustand** for state management
- **Axios** for API calls
- **Responsive Design** - Mobile, tablet, and desktop support
- **Game Browsing** - Browse and search games with filters
- **Game Upload** - Submit your indie games to the platform
- **Authentication** - Login and registration pages (frontend only)
- **Dark/Light Mode** - Theme toggle with persistence
- **Responsive Grid Layout** - Beautiful game showcase

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (auth)/              # Auth routes (login/register)
│   ├── (main)/              # Main routes with sidebar
│   ├── game/[id]/           # Game detail pages
│   ├── upload/              # Game upload page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── layout/              # Navbar, Sidebar, Footer
│   ├── shared/              # GameCard, SearchBar, Skeleton
│   ├── forms/               # Form components
│   ├── ui/                  # shadcn/ui components
│   └── providers/           # ThemeProvider
├── hooks/                   # Custom hooks (useApi, etc.)
├── store/                   # Zustand store (appStore)
├── types/                   # TypeScript types
├── lib/                     # Utility functions
├── data/                    # Mock data
└── public/                  # Static assets
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.2
- **Language**: TypeScript 5
- **UI Framework**: React 19.2.4
- **Styling**: Tailwind CSS 4
- **Components**: shadcn/ui
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Package Manager**: npm

## 📦 Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file (already provided with defaults):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🚀 Running the Project

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the app.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📄 Pages & Routes

### Main Routes
- **`/`** - Home page with game browsing and featured games
- **`/game/[id]`** - Game detail page with reviews and downloads
- **`/upload`** - Game upload form (frontend only)

### Auth Routes
- **`/auth/login`** - User login page
- **`/auth/register`** - User registration page

### Demo Credentials
- Email: `dev@example.com`
- Password: `password123`

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Modern purple and pink gradient theme
- **Dark Mode**: Full dark mode support with toggle
- **Responsive**: Mobile-first design
- **Animations**: Smooth hover effects and transitions
- **Components**: Reusable shadcn/ui components

### Key Components
1. **Navbar** - Sticky navigation with search and user menu
2. **Sidebar** - Filter games by tags and categories
3. **GameCard** - Showcase game with thumbnail, tags, and stats
4. **SearchBar** - Search games by title and description
5. **Footer** - Links to help, about, and social media

## 🔗 API Integration

The project uses Axios for API calls with hooks in `/hooks/useApi.ts`:
- `useGames()` - Fetch games list
- `useAuth()` - Authentication methods
- `useUploadGame()` - Upload game files

Currently using mock data. Replace API calls in hooks with real endpoints when backend is ready.

## 🎮 Mock Data

The project includes 7 sample games in `/data/games.ts`:
- Crimson Echoes (Paid Horror)
- Pixel Quest Adventures (Paid RPG)
- Mindscape (Free Puzzle)
- Multiplayer Mage Wars (Free Action)
- Whispers of the Past (Paid VN)
- Prototype: Neural Network (Free Experimental)
- Neon Survivors (Paid Action)

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1280px

## 🔐 State Management

Uses Zustand for global state:
- **Auth State**: User login status and info
- **Search Filters**: Game filters (tags, price, sort)
- **Theme State**: Dark/light mode toggle

Access store: `const store = useAppStore()`

## 🎯 Next Steps / Future Enhancements

1. **Connect to Backend**
   - Replace mock data with real API calls
   - Implement authentication with JWT
   - Setup payment processing

2. **Additional Features**
   - User profiles and game management
   - Game reviews and ratings
   - Community features
   - Game mod support
   - Wishlist functionality

3. **Performance**
   - Image optimization
   - Lazy loading
   - Code splitting
   - SEO optimization

4. **Testing**
   - Unit tests with Jest
   - E2E tests with Cypress
   - Component testing

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [Axios](https://axios-http.com)

## 📄 License

This project is part of the AceArena platform. All rights reserved.

## 🤝 Contributing

Instructions for contributing will be added soon.

---

**Ready to deploy!** This frontend is production-ready and can be deployed to Vercel, Netlify, or any Node.js hosting platform.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
