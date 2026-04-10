# Frontend-Backend Integration Guide

## 🔗 Connection Overview

The AceArena frontend and backend are now ready to work together. This guide explains how to integrate them.

---

## 📍 Step 1: Update Frontend Configuration

### Update API Base URL

In `frontend/lib/utils.ts` or create `frontend/config/api.ts`:

```typescript
// frontend/config/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default API_BASE_URL;
```

### Update .env.local

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔓 Step 2: Update Authentication

### Store JWT Token

Replace the mock authentication in the frontend store:

```typescript
// frontend/store/appStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
}

const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        
        const data = await response.json();
        if (data.success) {
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
          });
          // Store token in localStorage
          localStorage.setItem('token', data.data.token);
        }
      },

      register: async (username: string, email: string, password: string, role: string) => {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role }),
        });
        
        const data = await response.json();
        if (data.success) {
          set({
            user: data.data.user,
            token: data.data.token,
            isAuthenticated: true,
          });
          localStorage.setItem('token', data.data.token);
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token, isAuthenticated: !!token }),
    }),
    {
      name: 'app-store',
      storage: typeof window !== 'undefined' ? localStorage : undefined,
    }
  )
);

export default useAppStore;
```

---

## 🪝 Step 3: Create API Hooks

Create reusable hooks for API calls:

```typescript
// frontend/hooks/useApi.ts
import { useState, useCallback } from 'react';
import useAppStore from '@/store/appStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useAppStore((state) => state.token);

  const request = useCallback(
    async (
      endpoint: string,
      options: RequestInit = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...options.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'API Error');
        }

        return data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return { request, loading, error };
};
```

---

## 🎮 Step 4: Update Game Page

Replace mock data with API calls:

```typescript
// frontend/app/games/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import GameCard from '@/components/shared/GameCard';

export default function GamesPage() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await request('/games');
        setGames(response.data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [request]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="grid gap-4">
      {games.map((game) => (
        <GameCard key={game._id} game={game} />
      ))}
    </div>
  );
}
```

---

## 👤 Step 5: Update Login/Register Pages

Replace mock authentication:

```typescript
// frontend/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/appStore';
import { useApi } from '@/hooks/useApi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppStore();
  const router = useRouter();
  const { loading } = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

---

## 📤 Step 6: Update File Upload

Implement game/asset file uploads:

```typescript
// frontend/hooks/useFileUpload.ts
import { useApi } from './useApi';

export const useFileUpload = () => {
  const { request, loading, error } = useApi();

  const uploadGameFile = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `/api/games/${gameId}/file`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }
    );

    return response.json();
  };

  const uploadGameThumbnail = async (gameId: string, file: File) => {
    const formData = new FormData();
    formData.append('thumbnail', file);

    const response = await fetch(
      `/api/games/${gameId}/thumbnail`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      }
    );

    return response.json();
  };

  return { uploadGameFile, uploadGameThumbnail, loading, error };
};
```

---

## 🔄 Step 7: Update Store with Real Data

Update Zustand store to fetch from API:

```typescript
// frontend/store/appStore.ts - Add these methods
interface AppStore {
  // ... existing props
  games: any[];
  assets: any[];
  jams: any[];
  fetchGames: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchJams: () => Promise<void>;
}

// In the create() function:
fetchGames: async () => {
  try {
    const response = await fetch('/api/games');
    const data = await response.json();
    set({ games: data.data });
  } catch (error) {
    console.error('Failed to fetch games:', error);
  }
},

fetchAssets: async () => {
  try {
    const response = await fetch('/api/assets');
    const data = await response.json();
    set({ assets: data.data });
  } catch (error) {
    console.error('Failed to fetch assets:', error);
  }
},

fetchJams: async () => {
  try {
    const response = await fetch('/api/jams');
    const data = await response.json();
    set({ jams: data.data });
  } catch (error) {
    console.error('Failed to fetch jams:', error);
  }
},
```

---

## 🧪 Step 8: Testing Integration

### Start Both Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Test Registration
1. Go to http://localhost:3000/register
2. Create a new account
3. Check backend logs for the request
4. Verify user created in MongoDB Atlas

### Test Login
1. Go to http://localhost:3000/login
2. Login with your credentials
3. Check that token is stored in localStorage
4. Verify redirect to dashboard

### Test Game Operations
1. Navigate to games page
2. Verify games are loaded from backend
3. Try uploading a game
4. Check Cloudinary for uploads

---

## 🔌 CORS Configuration

If you get CORS errors:

1. Update backend `.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

2. Restart backend server

---

## 📊 API Integration Checklist

- [ ] Update API base URL in frontend
- [ ] Implement token storage (localStorage)
- [ ] Create useApi hook
- [ ] Update useAppStore with real API calls
- [ ] Replace mock data with API responses
- [ ] Test login/register flow
- [ ] Test game CRUD operations
- [ ] Test file uploads
- [ ] Test profile updates
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Test all 34 API endpoints

---

## 🚨 Common Issues

### CORS Error
**Solution:** Update CORS_ORIGIN in backend .env and restart

### Token not being sent
**Solution:** Ensure Authorization header includes "Bearer " prefix

### File upload fails
**Solution:** Verify Cloudinary credentials and file size

### 404 errors
**Solution:** Verify API endpoint URLs match backend routes

---

## 📚 Useful Resources

- **API Docs:** [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
- **Setup Guide:** [SETUP_GUIDE.md](./backend/SETUP_GUIDE.md)
- **Build Summary:** [BUILD_SUMMARY.md](./backend/BUILD_SUMMARY.md)

---

## 🎯 Next Integration Steps

1. **Error Handling UI**
   - Add toast notifications
   - Show validation errors
   - Handle network errors

2. **Loading States**
   - Skeleton screens
   - Loading spinners
   - Disabled buttons

3. **Data Persistence**
   - Cache API responses
   - Implement optimistic updates
   - Handle offline mode

4. **Advanced Features**
   - Search and filtering
   - Pagination
   - Sorting
   - Real-time updates (WebSocket)

---

## 🔐 Security Tips

1. **Never store sensitive data in localStorage**
2. **Always validate input on frontend**
3. **Use HTTPS in production**
4. **Refresh token implementation** (optional)
5. **Add request timeout** (optional)

---

**Your AceArena platform is now fully integrated and ready for users!** 🚀
