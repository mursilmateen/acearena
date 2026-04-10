# AceArena Backend

A production-ready backend for the AceArena game distribution platform built with Node.js, Express, TypeScript, MongoDB, and Cloudinary.

## Features

- ✅ User authentication with JWT
- ✅ User profiles with avatar upload
- ✅ Game CRUD operations with Cloudinary file uploads
- ✅ Asset management system
- ✅ Game Jam system with participant management
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ MongoDB Atlas integration
- ✅ Helmet for security
- ✅ CORS support
- ✅ Request logging with Morgan
- ✅ Rate limiting protection on all endpoints

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Cloudinary
- **Validation:** Zod
- **Security:** Helmet, CORS
- **Logging:** Morgan

## Project Structure

```
src/
├── controllers/         # Request handlers
├── routes/             # API routes
├── models/             # MongoDB schemas
├── middleware/         # Auth, error handling
├── services/           # Business logic
├── utils/              # Helpers, validators, JWT
├── config/             # Database, Cloudinary config
├── types/              # TypeScript interfaces
└── index.ts            # Main app file
```

## Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. **Configure MongoDB Atlas:**
- Create a MongoDB Atlas account
- Create a cluster
- Get your connection string
- Add it to `.env` as `MONGO_URI`

4. **Set up Cloudinary:**
- Create a Cloudinary account
- Get your credentials
- Add them to `.env`:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

5. **Set JWT secret:**
```env
JWT_SECRET=your_very_secret_key_change_in_production
```

## Running the Server

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Profile
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/avatar` - Upload avatar

### Games
- `POST /api/games` - Create game
- `GET /api/games` - Get all games (with filters)
- `GET /api/games/:id` - Get game by ID
- `POST /api/games/:gameId/file` - Upload game file
- `POST /api/games/:gameId/thumbnail` - Upload thumbnail
- `PUT /api/games/:id` - Update game
- `DELETE /api/games/:id` - Delete game

### Assets
- `POST /api/assets` - Create asset
- `GET /api/assets` - Get all assets (with filters)
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets/:assetId/file` - Upload asset file
- `POST /api/assets/:assetId/thumbnail` - Upload thumbnail
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset

### Game Jams
- `POST /api/jams` - Create game jam
- `GET /api/jams` - Get all jams (with filters)
- `GET /api/jams/:id` - Get jam by ID
- `POST /api/jams/:id/join` - Join jam
- `POST /api/jams/:id/leave` - Leave jam
- `PUT /api/jams/:id` - Update jam
- `DELETE /api/jams/:id` - Delete jam

## Authentication

The API uses Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

All responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message"
}
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT | `your_secret_key` |
| `JWT_EXPIRY` | Token expiration time | `15m` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `secret_key` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Frontend URL | `http://localhost:3000` |

## Security Features

- **Helmet:** Sets various HTTP headers for security
- **CORS:** Configured to allow requests from frontend
- **Password Hashing:** Bcrypt for secure password storage
- **JWT:** Secure token-based authentication
- **Input Validation:** Zod for schema validation
- **Rate Limiting:** Protection against brute-force and DDoS attacks
  - Authentication endpoints: 5 attempts per 15 minutes
  - API endpoints: 100 requests per 15 minutes
- **Error Handling:** Sanitized error messages

For detailed rate limiting configuration, see [RATE_LIMITING.md](./RATE_LIMITING.md)

## Development

### Linting
```bash
npm run lint
```

### TypeScript Compilation
```bash
npm run build
```

## Database Models

### User
```typescript
{
  username: string (unique)
  email: string (unique)
  password: string (hashed)
  role: "player" | "developer"
  avatar?: string (Cloudinary URL)
  bio?: string
  socialLinks?: { twitter?, github?, website? }
  createdAt: Date
  updatedAt: Date
}
```

### Game
```typescript
{
  title: string
  description: string
  tags: string[]
  price: number
  thumbnail?: string (Cloudinary URL)
  fileUrl?: string (Cloudinary URL)
  createdBy: ObjectId (User ID)
  createdAt: Date
  updatedAt: Date
}
```

### Asset
```typescript
{
  title: string
  description: string
  type: "2D" | "3D" | "audio" | "music" | "plugin" | "other"
  tags: string[]
  price: number
  fileUrl?: string (Cloudinary URL)
  thumbnail?: string (Cloudinary URL)
  createdBy: ObjectId (User ID)
  createdAt: Date
  updatedAt: Date
}
```

### GameJam
```typescript
{
  title: string
  description?: string
  theme: string
  deadline: Date
  createdBy: ObjectId (User ID)
  participants: ObjectId[] (User IDs)
  createdAt: Date
  updatedAt: Date
}
```

## Validation Rules

### Register
- username: 3-30 characters
- email: valid email format
- password: minimum 6 characters

### Login
- email: valid email format
- password: minimum 6 characters

### Create Game
- title: 3-100 characters
- description: minimum 10 characters
- price: minimum 0

### Create Asset
- title: 3-100 characters
- description: minimum 10 characters
- type: one of the defined types
- price: minimum 0

[Continue with other validation rules...]

## Troubleshooting

### MongoDB Connection Failed
- Verify MongoDB Atlas credentials
- Check firewall rules
- Ensure IP is whitelisted

### Cloudinary Upload Failed
- Verify API credentials
- Check file size limits
- Ensure proper file format

### CORS Errors
- Update `CORS_ORIGIN` in `.env`
- Verify frontend URL is correct

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
