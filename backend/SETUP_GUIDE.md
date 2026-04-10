# Backend Setup Guide

## Quick Start

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Get your connection string
6. Copy `.env.example` to `.env`
7. Add your MongoDB URI:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/acearedb?retryWrites=true&w=majority
```

### Step 3: Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Go to Dashboard
4. Copy your credentials:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Update JWT Secret

Generate a secure random string and add to `.env`:
```env
JWT_SECRET=your_super_secret_key_here_at_least_32_chars
JWT_EXPIRY=15m
```

### Step 5: Configure CORS

Set the frontend URL in `.env`:
```env
CORS_ORIGIN=http://localhost:3000
```

### Step 6: Run the Server

```bash
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
✅ Server running on port 5000
📍 Environment: development
```

## Project Structure Overview

```
backend/
├── src/
│   ├── controllers/      # Business logic for each feature
│   ├── routes/           # API route definitions
│   ├── models/           # MongoDB schemas
│   ├── middleware/       # Auth & error handling
│   ├── services/         # Reusable business logic
│   ├── utils/            # Helpers, validators, JWT
│   ├── config/           # Database & Cloudinary setup
│   ├── types/            # TypeScript interfaces
│   └── index.ts          # Main app entry point
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env                  # Environment variables (create this)
├── .env.example          # Example environment variables
├── README.md             # Detailed documentation
├── API_DOCUMENTATION.md  # API endpoint reference
└── SETUP_GUIDE.md        # This file
```

## File-by-File Breakdown

### Configuration Files
- **config/database.ts** - MongoDB connection setup
- **config/cloudinary.ts** - Cloudinary client setup

### Models (Database Schemas)
- **models/User.ts** - User account schema
- **models/Game.ts** - Game project schema
- **models/Asset.ts** - Game asset schema
- **models/GameJam.ts** - Game jam event schema

### Middleware
- **middleware/auth.ts** - JWT token verification
- **middleware/errorHandler.ts** - Global error handling

### Services
- **services/authService.ts** - Register/login logic
- **services/uploadService.ts** - Cloudinary file uploads

### Controllers
- **controllers/authController.ts** - Auth endpoints (register, login)
- **controllers/profileController.ts** - Profile & avatar endpoints
- **controllers/gameController.ts** - Game CRUD & uploads
- **controllers/assetController.ts** - Asset CRUD & uploads
- **controllers/gameJamController.ts** - Game jam CRUD

### Routes
- **routes/authRoutes.ts** - `/api/auth/*`
- **routes/profileRoutes.ts** - `/api/profile/*`
- **routes/gameRoutes.ts** - `/api/games/*`
- **routes/assetRoutes.ts** - `/api/assets/*`
- **routes/gameJamRoutes.ts** - `/api/jams/*`

### Utilities
- **utils/validators.ts** - Input validation schemas (Zod)
- **utils/jwt.ts** - JWT token functions
- **utils/helpers.ts** - Password hashing, email validation, etc.

### Type Definitions
- **types/index.ts** - TypeScript interfaces for all models

### Main Entry Point
- **index.ts** - Express app setup, routes, middleware registration

## API Testing

### Using Thunder Client (VS Code Extension)
1. Install Thunder Client extension
2. Create requests following API_DOCUMENTATION.md
3. Use the Bearer token from login response

### Using Postman
1. Import APIs from API_DOCUMENTATION.md
2. Create environment variables for tokens
3. Test all endpoints

### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "role": "developer"
  }'
```

## Common Issues & Solutions

### MongoDB Connection Error
**Problem:** Can't connect to MongoDB Atlas
**Solution:**
1. Check connection string is correct
2. Whitelist your IP address in MongoDB Atlas
3. Ensure database user credentials are correct

### Cloudinary Upload Failed
**Problem:** Files not uploading
**Solution:**
1. Verify Cloudinary API credentials
2. Check file size (keep under 100MB)
3. Ensure file format is supported

### JWT Token Invalid
**Problem:** Getting 401 errors on protected routes
**Solution:**
1. Verify token is being sent in Authorization header
2. Check JWT_SECRET matches between login and verification
3. Ensure token hasn't expired

### CORS Errors
**Problem:** Frontend can't reach backend
**Solution:**
1. Update CORS_ORIGIN in .env to match frontend URL
2. Restart server after changing .env

## Development Tips

### Code Organization
- Keep controllers thin (2-3 lines)
- Move complex logic to services
- Use validators for all inputs
- Write reusable utilities

### Error Handling
- Always use AppError for consistency
- Validate input early with Zod
- Return meaningful error messages

### Authentication
- Always check req.user in protected routes
- Verify user ownership before modifications
- Use authenticateToken middleware

### Database
- Always populate references
- Use TypeScript for type safety
- Create indexes for frequently queried fields

## Next Steps

1. **Connect Frontend**
   - Update API base URL in frontend
   - Update CORS_ORIGIN in .env

2. **Add More Features**
   - Comments on games
   - Favorites/wishlist
   - Game reviews
   - Payment integration

3. **Deployment**
   - Set up production environment variables
   - Deploy to Heroku, Railway, or Vercel
   - Set up CI/CD pipeline

4. **Testing**
   - Add unit tests with Jest
   - Add integration tests
   - Set up test database

## Database Backup

### MongoDB Atlas
- Automated backups are included in free tier
- Go to Clusters > Backup to view/restore

### Local Development
```bash
# Export database
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/acearedb"

# Import database
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/acearedb" ./dump
```

## Performance Optimization

### Implemented
- ✅ JWT authentication (stateless)
- ✅ Cloudinary offloading (file handling)
- ✅ Mongoose indexing

### Future
- Add caching layer (Redis)
- Implement rate limiting
- Add pagination for large lists
- Compress responses

## Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT for stateless auth
- ✅ Helmet for HTTP headers
- ✅ CORS configured
- ✅ Input validation with Zod
- ✅ Error messages sanitized

### Before Production
- [ ] Change JWT_SECRET to strong random value
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Enable request logging
- [ ] Configure backup strategy

## Monitoring & Logging

Currently using Morgan for request logging. For production, consider:
- Winston for structured logging
- Sentry for error tracking
- DataDog for monitoring
- ELK Stack for log aggregation

## Support

For detailed endpoint documentation, see `API_DOCUMENTATION.md`
For common patterns, see `README.md`
