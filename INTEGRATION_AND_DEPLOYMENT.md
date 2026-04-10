# Full-Stack Integration & Deployment Guide

## 🚀 Phase 1: Local Integration Testing

### Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

Expected output:
```
✅ MongoDB Connected Successfully
✅ Server running on port 5000
📍 Environment: development
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Expected output:
```
  ▲ Next.js 16.2.2
  - Local:        http://localhost:3000
```

---

## ✅ Integration Checklist (Local Testing)

### 1. **Verify API Connection**
```bash
# In Terminal 3
curl http://localhost:5000/api/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### 2. **Test User Registration**

**URL:** http://localhost:3000/register

**Test Data:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "role": "developer"
}
```

**Expected:**
- ✅ Success message
- ✅ Redirect to dashboard
- ✅ Token stored in localStorage
- ✅ User created in MongoDB

**Verify in MongoDB Atlas:**
```
Users collection > Find test@example.com
```

### 3. **Test User Login**

**URL:** http://localhost:3000/login

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Expected:**
- ✅ Successful login
- ✅ Redirect to dashboard
- ✅ User data displayed
- ✅ Token in localStorage

### 4. **Test Profile Page**

**URL:** http://localhost:3000/profile

**Expected:**
- ✅ User info loads
- ✅ Can update bio
- ✅ Can upload avatar (to Cloudinary)
- ✅ Social links work

### 5. **Test Games Listing**

**URL:** http://localhost:3000/games

**Expected:**
- ✅ Games load from API
- ✅ No games message if empty
- ✅ Click game → Game detail page
- ✅ Game info displays

### 6. **Test Game Upload** (if implemented)

**URL:** http://localhost:3000/upload

**Expected:**
- ✅ Create game form works
- ✅ File upload to Cloudinary
- ✅ Game saved in MongoDB
- ✅ Appears in games list

### 7. **Test Authentication Token**

**Browser DevTools:**
```javascript
// Check localStorage
localStorage.getItem('token');  // Should return JWT token

// Verify token format (3 parts separated by dots)
// Header.Payload.Signature
```

### 8. **Test Protected Routes**

**Open DevTools > Application > Local Storage**
1. Remove token: `localStorage.removeItem('token')`
2. Refresh page
3. Should redirect to /login

---

## 🔧 Common Integration Issues & Fixes

### Issue: CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```

**Fix:**
1. Backend: Check `CORS_ORIGIN=http://localhost:3000` in `.env`
2. Restart backend server
3. Clear browser cache (DevTools > Network > Disable cache)

### Issue: 401 Unauthorized
```
Invalid or expired token
```

**Fix:**
1. LocalStorage token is invalid/expired
2. localStorage.clear() in DevTools
3. Re-login to get new token

### Issue: API Not Responding

**Check:**
```bash
# Terminal - verify backend is running
curl http://localhost:5000/api/health

# Check frontend .env.local
cat frontend/.env.local
# Should have: NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Issue: MongoDB Connection Failed

**Verify:**
```bash
# Check MongoDB URI in backend/.env
echo $MONGO_URI  # Should show full connection string

# Test connection manually in MongoDB Atlas
```

### Issue: Cloudinary Upload Fails

**Check:**
```bash
# Verify credentials in backend/.env
CLOUDINARY_CLOUD_NAME=doeqpr9as
CLOUDINARY_API_KEY=811818376793358
CLOUDINARY_API_SECRET=UR2mfj64whfDACMfmyT3SxHzWjU
```

---

## 📊 API Testing Scenarios

### Scenario 1: Full User Journey

```
1. Register → 2. Verify Email in DB → 3. Login → 
4. View Profile → 5. Upload Avatar → 6. View Games → 
7. View Game Detail → 8. Logout
```

### Scenario 2: Content Management

```
1. Create Game → 2. Upload Game File → 3. Edit Game → 
4. View Game List → 5. Delete Game
```

### Scenario 3: Game Jams

```
1. Create Jam → 2. View All Jams → 3. Join Jam → 
4. View Participants → 5. Leave Jam
```

---

## 🔍 Debugging Tools

### Browser DevTools

**Network Tab:**
- Check API requests/responses
- Verify status codes (200, 401, 404, 500)
- Monitor request/response headers

**Console Tab:**
- Check for JavaScript errors
- Verify API calls are being made

**Storage Tab:**
- Check localStorage has token
- Verify token format

### Backend Logging

```bash
# Monitor backend logs
# Terminal should show:
# GET /api/games 200 - 45ms
# POST /api/auth/login 200 - 120ms
```

### MongoDB Atlas

```
Collections > Users > Find One
Collections > Games > Find One
Collections > Assets > Find One
Collections > GameJams > Find One
```

---

## 🚀 Phase 2: Deployment Setup

### Choose Deployment Platforms

**Backend Options:**
- Railway.app (recommended)
- Render.com
- Heroku (paid plans)
- AWS

**Frontend Options:**
- Vercel (recommended)
- Netlify
- AWS Amplify

---

## 📦 Pre-Deployment Checklist

### Backend
- [ ] All environment variables documented in `.env.example`
- [ ] Error handling working correctly
- [ ] Database backups configured
- [ ] Security headers enabled (Helmet)
- [ ] CORS configured for production domain
- [ ] All 34 endpoints tested
- [ ] Cloudinary credentials validated
- [ ] MongoDB Atlas backup active

### Frontend
- [ ] .env.local production URL configured
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] Token refresh logic implemented (optional but recommended)
- [ ] Error pages created (404, 500)
- [ ] Analytics configured (optional)
- [ ] SEO metadata added
- [ ] Performance optimized

---

## 🚀 Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create new project

### Step 2: Connect Repository

```bash
# In your GitHub repo settings
# Add Railway integration
```

### Step 3: Configure Environment Variables

In Railway Dashboard:
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
CLOUDINARY_CLOUD_NAME=doeqpr9as
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Step 4: Deploy

```bash
# Railway automatically deploys on  push to main
```

**Get Production URL:**
- Railway Dashboard → Settings → Domain
- Your API: `https://your-app.railway.app/api`

---

## 🚀 Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your project

### Step 2: Configure Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-api.railway.app/api
```

### Step 3: Deploy

```bash
# Vercel automatically deploys on push to main
```

**Your Frontend:** `https://your-project.vercel.app`

---

## 🔒 Post-Deployment

### 1. Test Production Endpoints
```bash
# Test API
curl https://your-api.railway.app/api/health

# Test Frontend
open https://your-project.vercel.app
```

### 2. Run Integration Tests
- [ ] Register new account
- [ ] Login
- [ ] Upload avatar
- [ ] Create game
- [ ] View gamelist
- [ ] Delete game
- [ ] Logout

### 3. Monitor Errors
- Set up error tracking (Sentry, LogRocket)
- Monitor API response times
- Set up database backups

### 4. Enable HTTPS
- Both Railway and Vercel use HTTPS by default
- Verify SSL certificate in browser

---

## 📊 Production Monitoring

### Recommended Tools

1. **Error Tracking:** Sentry.io
2. **Analytics:** Vercel Analytics, Posthog
3. **Status Page:** StatusPage.io
4. **Database Monitoring:** MongoDB Atlas Alerts
5. **Uptime Monitoring:** UptimeRobot

---

## 🔄 Continuous Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: railway-app/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📝 Rollback Procedure

### If Deployment Fails

**Backend (Railway):**
1. Go to Deployments
2. Click "Rollback"
3. Select previous stable version

**Frontend (Vercel):**
1. Go to Deployments
2. Click "Promote to Production"
3. Select previous stable version

---

## 💡 Performance Optimization

### Backend
- Enable compression
- Set up caching
- Database indexing
- Connection pooling

### Frontend
- Image optimization
- Code splitting
- Lazy loading
- Service workers

---

## 🎉 Deployment Complete!

Your AceArena platform is now:
- ✅ Running locally with full integration
- ✅ Deployed to production
- ✅ Connected to MongoDB Atlas
- ✅ Cloudinary files handling
- ✅ JWT authentication working
- ✅ Fully functional platform

**Next Steps:**
1. Monitor production errors
2. Gather user feedback
3. Plan feature releases
4. Scale infrastructure as needed

---

## 📞 Troubleshooting Deployment

### Backend won't start
```bash
# Check logs
# Railway Dashboard > Logs

# Common issues:
# 1. Port 8000 already in use
# 2. Missing environment variables
# 3. Database connection timeout
```

### Frontend build fails
```bash
# Check build logs
# Vercel > Deployments > Logs

# Common issues:
# 1. TypeScript errors
# 2. Missing environment variables
# 3. API endpoint incorrect
```

### API calls returning 404
```bash
# Verify routes are correct
# Backend: GET /api/games (not /api/v1/games)
# Check CORS_ORIGIN matches domain
```

---

**Your full-stack AceArena platform is ready for the world!** 🌍
