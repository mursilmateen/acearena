# AceArena Frontend - API Integration Guide

## Overview

This document outlines how to integrate the AceArena frontend with a backend API. Currently, the frontend uses mock data for demonstration purposes. Follow these steps to connect to real API endpoints.

## Current API Structure

All API calls are managed through custom hooks in `/hooks/useApi.ts`. The hooks use Axios for HTTP requests.

### API Base URL
Set in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Integration Steps

### 1. Games API

#### Current Mock Implementation
```typescript
const fetchGames = useCallback(async (filters?: any) => {
  // TODO: Replace with actual API call
  setGames([]);
}, []);
```

#### Replace With
```typescript
const fetchGames = useCallback(async (filters?: any) => {
  setLoading(true);
  setError(null);
  try {
    const response = await apiClient.get('/games', { params: filters });
    setGames(response.data);
  } catch (err) {
    const axiosError = err as AxiosError;
    setError(axiosError.message);
  } finally {
    setLoading(false);
  }
}, []);
```

#### Expected API Response Format
```json
{
  "data": [
    {
      "id": "1",
      "title": "Game Name",
      "description": "Game description",
      "tags": ["tag1", "tag2"],
      "price": 9.99,
      "isFree": false,
      "thumbnail": "url-to-image",
      "author": "Developer Name",
      "authorId": "dev-id",
      "createdAt": "2024-01-15T00:00:00Z",
      "updatedAt": "2024-03-10T00:00:00Z",
      "downloads": 5420,
      "rating": 4.5,
      "reviews": 234,
      "fileType": "zip"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 2. Authentication API

#### Login Implementation
```typescript
const login = useCallback(async (email: string, password: string) => {
  setLoading(true);
  setError(null);
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, token } = response.data;
    
    // Set auth token
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
    
    // Update store
    setUser(user);
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    setError(axiosError.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);
```

#### Register Implementation
```typescript
const register = useCallback(
  async (email: string, username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        username,
        password,
      });
      const { user, token } = response.data;
      
      // Set auth token
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
      
      // Update store
      setUser(user);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message);
      throw err;
    } finally {
      setLoading(false);
    }
  },
  []
);
```

#### Update App Initialization
In `app/layout.tsx`, add auth token initialization:
```typescript
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}, []);
```

### 3. Game Upload API

#### Implementation
```typescript
const uploadGame = useCallback(async (formData: FormData) => {
  setLoading(true);
  setError(null);
  setSuccess(false);
  try {
    const response = await apiClient.post('/games/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    setSuccess(true);
    return response.data;
  } catch (err) {
    const axiosError = err as AxiosError;
    setError(axiosError.message);
    throw err;
  } finally {
    setLoading(false);
  }
}, []);
```

#### Expected Response
```json
{
  "id": "new-game-id",
  "title": "Game Title",
  "message": "Game uploaded successfully"
}
```

### 4. Search & Filtering

#### Search Endpoint
```
GET /api/games/search?q=query&tags=tag1,tag2&minPrice=0&maxPrice=100&sort=newest
```

#### Query Parameters
- `q` - Search query
- `tags` - Comma-separated tags
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort option (newest, popular, trending, rating)
- `page` - Page number (for pagination)
- `limit` - Items per page

#### Implementation in Components
Update `/data/games.ts` mock filtering in `HomePage` to use:
```typescript
useEffect(() => {
  const search = searchParams.get('search');
  const tags = searchParams.get('tags')?.split(',') || [];
  const sort = searchParams.get('sort') || 'newest';
  
  fetchGames({
    q: search,
    tags: tags.join(','),
    sort,
  });
}, [searchParams, fetchGames]);
```

## Database Schema Reference

### Games Table
```sql
CREATE TABLE games (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  longDescription TEXT,
  tags JSON,
  price DECIMAL(10, 2) DEFAULT 0,
  isFree BOOLEAN DEFAULT true,
  thumbnail VARCHAR(500),
  galleryImages JSON,
  fileType VARCHAR(10),
  author VARCHAR(255),
  authorId VARCHAR(36),
  downloads INT DEFAULT 0,
  rating DECIMAL(3, 1),
  reviews INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (authorId) REFERENCES users(id)
);
```

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) UNIQUE,
  passwordHash VARCHAR(255),
  avatar VARCHAR(500),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## Error Handling

### Implement Global Error Handler
```typescript
// In app/layout.tsx or a separate hook
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

## Security Headers

### Configure CORS
Backend should set:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### HTTPS
Always use HTTPS in production:
```env
NEXT_PUBLIC_API_URL=https://api.acearena.com/api
```

## Testing API Integration

### 1. Test with Mock Data First
Keep mock data enabled during development:
```typescript
if (process.env.NODE_ENV === 'development') {
  // Use mock data for testing
  setGames(MOCK_GAMES);
}
```

### 2. Use API Testing Tools
- Postman - Test API endpoints
- Thunder Client - VS Code extension
- curl - Command line testing

### 3. Example API Test
```bash
# Test games endpoint
curl -X GET http://localhost:3001/api/games \
  -H "Authorization: Bearer your-token"

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## Pagination Implementation

### Update Hook
```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

const fetchGames = useCallback(async (filters?: any, pagination?: PaginationParams) => {
  const params = {
    ...filters,
    ...pagination,
  };
  const response = await apiClient.get('/games', { params });
  return response.data;
}, []);
```

### Use in Component
```typescript
const [page, setPage] = useState(1);

useEffect(() => {
  fetchGames(filters, { page, limit: 20 });
}, [page, filters]);
```

## Rate Limiting

### Handle Rate Limits
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      // Too many requests
      alert('Too many requests. Please wait a moment.');
    }
    return Promise.reject(error);
  }
);
```

## Caching Strategy

### Implement Request Caching
Consider using React Query:
```bash
npm install @tanstack/react-query
```

### Example with React Query
```typescript
import { useQuery } from '@tanstack/react-query';

export const useGamesQuery = (filters?: any) => {
  return useQuery({
    queryKey: ['games', filters],
    queryFn: () => apiClient.get('/games', { params: filters }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Environment Variables

### Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_NAME=AceArena Dev
```

### Staging
```env
NEXT_PUBLIC_API_URL=https://staging-api.acearena.com/api
NEXT_PUBLIC_APP_NAME=AceArena Staging
```

### Production
```env
NEXT_PUBLIC_API_URL=https://api.acearena.com/api
NEXT_PUBLIC_APP_NAME=AceArena
```

## Migration Checklist

- [ ] Update `/hooks/useApi.ts` with real API calls
- [ ] Update `/app/layout.tsx` with auth token initialization
- [ ] Create API client configuration module
- [ ] Implement error handling globally
- [ ] Add request/response interceptors
- [ ] Setup CORS on backend
- [ ] Test all endpoints
- [ ] Implement loading states
- [ ] Add retry logic for failed requests
- [ ] Setup monitoring and logging
- [ ] Test authentication flow
- [ ] Test game upload flow
- [ ] Test search and filtering
- [ ] Test pagination
- [ ] Deploy to staging environment
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to production

## Support Resources

- API Documentation: (Will be provided by backend team)
- Axios Documentation: https://axios-http.com/
- React Query: https://tanstack.com/query/latest
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

**Next Step:** Once backend API is ready, replace mock data implementations following this guide.
