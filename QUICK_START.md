# AceArena Full-Stack Quick Start Guide

## 🎉 Project Successfully Built & Integrated!

AceArena is now a fully integrated full-stack application with a modern Next.js frontend and Node.js/Express backend. Both frontend and backend are connected and ready for development and deployment.

## 🚀 Start Local Development (3 Terminal Windows)

### Terminal 1 - Backend Server (Port 5000)
```bash
cd backend
npm install     # First time only
npm run dev     # Starts development server
```

**Expected Output:**
```
✔ Backend running on http://localhost:5000
✔ MongoDB connected
✔ Ready for API requests
```

---

### Terminal 2 - Frontend Server (Port 3000)
```bash
cd frontend
npm install     # First time only
npm run dev     # Starts development server
```

**Expected Output:**
```
✔ Frontend running on http://localhost:3000
✔ Ready in browser
```

---

### Terminal 3 - Testing/Monitoring
```bash
# Test API health
curl http://localhost:5000/api/health

# Should return:
# {"success":true,"data":{"message":"Backend is running"},"status":200}
```

---

## 🌐 Access Points

| Service | URL | Auth Needed | Purpose |
|---------|-----|-------------|---------|
| Home | http://localhost:3000 | ❌ | Browse games |
| Login | http://localhost:3000/login | ❌ | Sign in |
| Register | http://localhost:3000/register | ❌ | Create account |
| Dashboard | http://localhost:3000/dashboard | ✅ | User dashboard |
| Profile | http://localhost:3000/profile | ✅ | Edit profile |
| Games API | http://localhost:5000/api/games | ❌ | List games |
| Profile API | http://localhost:5000/api/profile | ✅ | User profile |

---

## 🧪 Quick Test Scenarios

### 1️⃣ Test Registration
```bash
# POST http://localhost:5000/api/auth/register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testdev",
    "email": "test@example.com",
    "password": "password123",
    "role": "developer"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "username": "testdev",
      "email": "test@example.com",
      "role": "developer"
    }
  }
}
```

---

### 2️⃣ Test Login
```bash
# POST http://localhost:5000/api/auth/login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

### 3️⃣ Test Frontend Registration
1. Go to http://localhost:3000/register
2. Fill in: Username, Email, Password (min 6 chars)
3. Click Register
4. You should be redirected to Dashboard
5. Check DevTools → Application → localStorage → "token" (should have JWT)

---

### 4️⃣ Test Frontend Login
1. Go to http://localhost:3000/login
2. Use credentials from test above
3. Click Login
4. Should show dashboard with "Welcome back, testdev"

---

### 5️⃣ Test Games Page
1. Go to http://localhost:3000/games
2. Should see list of games from API
3. No auth required
4. Click game to see details

---

### 6️⃣ Test API Protected Route
1. Copy token from localStorage (DevTools → Application)
2. Use it in your request:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/profile
```

---

## 📊 Browser DevTools Debugging

### Check Authentication Status
```javascript
// Press F12 → Console → Type:
localStorage.getItem('token')          // View JWT token
localStorage.getItem('user')           // View user data
// Clear everything if needed:
localStorage.clear()                   // Clears all local storage
```

### Check Network Requests
1. Press F12 → Network tab
2. Perform login/action
3. Look for requests to http://localhost:5000/api/*
4. Check Status codes (200 = success, 401 = auth error, 500 = server error)
5. Click request → Response tab to see JSON response

### Check Browser Console
1. Press F12 → Console tab
2. Should have no red errors
3. Look for Sonner toast notifications for user feedback

---

## ✅ User Journey Test Flow

**Following this sequence validates full integration:**

1. **Start both servers** (Terminal 1 & 2 running)

2. **Test registration**
   - Go to http://localhost:3000/register
   - Create new account: `testuser@example.com` / `password123`
   - Should redirect to `/dashboard` with user data loaded

3. **Check token**
   - DevTools Console: `localStorage.getItem('token')`
   - Should return a long JWT string

4. **View profile**
   - Go to http://localhost:3000/profile
   - Should show your username and email
   - User data fetched from `/api/profile`

5. **Browse games**
   - Go to http://localhost:3000/games
   - Should show games from `/api/games`
   - Click a game → should show game details from API

6. **Logout**
   - Click profile dropdown → Logout
   - Should clear token from localStorage
   - Should redirect to `/login`

7. **Login again**
   - Use same credentials
   - Should restore session
   - Token should be in localStorage again

---

## 🔧 Debugging Common Issues

### ❌ Frontend won't load
```bash
# Make sure frontend server is running
# Terminal: npm run dev
# Check for errors in Terminal 2
# Try: clearing .next folder
rm -rf frontend/.next
npm run dev  # Restart
```

### ❌ API 404 Errors
```bash
# Make sure backend server is running on port 5000
curl http://localhost:5000/api/health
# If fails, restart backend (Terminal 1)
```

### ❌ 401 Unauthorized Errors
```javascript
// Check token in localStorage
localStorage.getItem('token')
// If empty or "undefined", need to login again
// Clear localStorage and re-login
localStorage.clear()
```

### ❌ CORS Errors in Console
```bash
# Check backend .env file has correct CORS_ORIGIN
# backend/.env should contain:
# CORS_ORIGIN=http://localhost:3000

# Restart backend if changed
npm run dev  # Terminal 1
```

### ❌ MongoDB Connection Error
```bash
# Check backend .env has valid MONGO_URI
# Should be: mongodb+srv://user:password@cluster.mongodb.net/database

# Check credentials are correct in MongoDB Atlas
# Test in Terminal:
node -e "const uri = process.env.MONGO_URI; console.log(uri)"
```

---

## 📁 Important Files

### Backend
- **`backend/.env`** - Database & API keys (must have MONGO_URI, JWT_SECRET, etc.)
- **`backend/src/routes/`** - API endpoints
- **`backend/src/models/`** - MongoDB schemas

### Frontend
- **`frontend/.env.local`** - API URL configuration
- **`frontend/hooks/useBackendApi.ts`** - All API calls
- **`frontend/lib/api.ts`** - Axios instance with interceptors

---

## 🔑 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/database
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=doeqpr9as
CLOUDINARY_API_KEY=811818376793358
CLOUDINARY_API_SECRET=your_secret

# Email (if implemented)
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASS=
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 📚 Documentation Reference

| Document | Purpose |
|----------|---------|
| `INTEGRATION_AND_DEPLOYMENT.md` | Full deployment guide |
| `API_INTEGRATION.md` | API endpoint reference |
| `ARCHITECTURE.md` | System architecture overview |
| `backend/API_DOCUMENTATION.md` | Detailed API docs |
| `backend/README.md` | Backend setup guide |
| `FULLSTACK_INTEGRATION_SUMMARY.md` | Integration status |

---

## ✨ What's Integrated

✅ UserAuthentication (JWT, localStorage, auto-login with token)
✅ User Profiles (fetch, update with backend)
✅ Games CRUD (Create, Read, Update, Delete)
✅ Games List with real data from API
✅ Game Details page with dynamic loading
✅ Assets CRUD (Create, Read, Update, Delete)
✅ Game Jams (Create, join, leave)
✅ File Uploads (Cloudinary integration)
✅ Error handling (401 redirects to login, etc.)
✅ Loading states (Skeleton screens while fetching)
✅ Toast notifications (User feedback for actions)

---

## 📦 Production Build

### Build Backend
```bash
cd backend
npm run build       # Creates dist/ folder
npm start          # Run production build
```

### Build Frontend
```bash
cd frontend
npm run build       # Creates optimized .next/ folder
npm start          # Run production build
```

---

## 🚀 Deploy to Production

### Option 1: Railway (Backend)
```bash
# 1. Create Railway.app account
# 2. Connect GitHub repo
# 3. Add environment variables
# 4. Deploy
# 5. Get production URL
```

### Option 2: Vercel (Frontend)
```bash
# 1. Deploy to Vercel
# 2. Set NEXT_PUBLIC_API_URL to Railway URL
# 3. Update backend CORS_ORIGIN for Vercel domain
# 4. Test all flows in production
```

---

## ✅ Ready to Deploy Checklist

- [ ] Both servers run without errors locally
- [ ] Can register and login
- [ ] JWT token appears in localStorage after login
- [ ] Games list loads from API
- [ ] Game details page shows data
- [ ] No 401 errors on protected endpoints
- [ ] No CORS errors in console  
- [ ] No console errors in DevTools
- [ ] .env files configured with correct credentials
- [ ] Database credentials are valid
- [ ] Cloudinary API keys are correct

---

## 💡 Pro Tips

1. **Keep terminals open** - Both servers must run simultaneously
2. **Watch logs** - Look at terminal output for API errors
3. **Hard refresh** - Ctrl+Shift+R in browser (clears cache)
4. **Test with curl** - Don't always test through browser
5. **Check token first** - Before debugging, check `localStorage.getItem('token')`
6. **Read error messages** - They tell you exactly what's wrong
7. **Use DevTools** - Network tab shows API calls and responses

---

## 🎯 Next Step

**Run the Quick Test Scenarios above** to validate everything is working, then proceed with deployment using `INTEGRATION_AND_DEPLOYMENT.md`

---

**Everything is ready for development and deployment!** 🎉
