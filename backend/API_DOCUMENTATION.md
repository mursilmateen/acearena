# AceArena API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "player" | "developer"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  },
  "message": "User registered successfully"
}
```

---

### Login
**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "token": "string"
  },
  "message": "Login successful"
}
```

---

### Logout
**POST** `/auth/logout`

Logout user (client-side token removal on frontend).

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Profile Endpoints

### Get Profile
**GET** `/profile`

Get current user's profile. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "avatar": "string",
    "bio": "string",
    "socialLinks": {
      "twitter": "string",
      "github": "string",
      "website": "string"
    },
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

---

### Update Profile
**PUT** `/profile`

Update user profile. Requires authentication.

**Request Body (all optional):**
```json
{
  "username": "string",
  "bio": "string",
  "socialLinks": {
    "twitter": "string",
    "github": "string",
    "website": "string"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Profile updated successfully"
}
```

---

### Upload Avatar
**POST** `/profile/avatar`

Upload user avatar image. Requires authentication.

**Request:**
- Content-Type: multipart/form-data
- Field name: `avatar`
- Accepted formats: jpg, jpeg, png, gif, webp

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Avatar uploaded successfully"
}
```

---

## Game Endpoints

### Create Game
**POST** `/games`

Create a new game. Requires authentication.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "price": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "tags": ["string"],
    "price": 0,
    "thumbnail": null,
    "fileUrl": null,
    "createdBy": "string",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  },
  "message": "Game created successfully"
}
```

---

### Get All Games
**GET** `/games`

Get list of all games with optional filters.

**Query Parameters:**
- `tags`: comma-separated tag list
- `minPrice`: minimum price
- `maxPrice`: maximum price
- `search`: search in title/description

**Example:**
```
GET /games?tags=action,adventure&minPrice=0&maxPrice=50&search=puzzle
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "tags": ["string"],
      "price": 0,
      "thumbnail": "string",
      "fileUrl": "string",
      "createdBy": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### Get Game by ID
**GET** `/games/:id`

Get detailed information about a specific game.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "tags": ["string"],
    "price": 0,
    "thumbnail": "string",
    "fileUrl": "string",
    "createdBy": {
      "_id": "string",
      "username": "string",
      "avatar": "string",
      "bio": "string"
    },
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  }
}
```

---

### Upload Game File
**POST** `/games/:gameId/file`

Upload game executable/archive. Requires authentication and ownership.

**Request:**
- Content-Type: multipart/form-data
- Field name: `file`

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Game file uploaded successfully"
}
```

---

### Upload Game Thumbnail
**POST** `/games/:gameId/thumbnail`

Upload game thumbnail image. Requires authentication and ownership.

**Request:**
- Content-Type: multipart/form-data
- Field name: `thumbnail`
- Accepted formats: jpg, jpeg, png, gif, webp

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thumbnail uploaded successfully"
}
```

---

### Update Game
**PUT** `/games/:id`

Update game details. Requires authentication and ownership.

**Request Body (all optional):**
```json
{
  "title": "string",
  "description": "string",
  "tags": ["string"],
  "price": 0
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Game updated successfully"
}
```

---

### Delete Game
**DELETE** `/games/:id`

Delete a game. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "message": "Game deleted successfully"
}
```

---

## Asset Endpoints

### Create Asset
**POST** `/assets`

Create a new asset. Requires authentication.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "type": "2D" | "3D" | "audio" | "music" | "plugin" | "other",
  "tags": ["string"],
  "price": 0
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Asset created successfully"
}
```

---

### Get All Assets
**GET** `/assets`

Get list of all assets with optional filters.

**Query Parameters:**
- `type`: asset type
- `tags`: comma-separated tag list
- `minPrice`: minimum price
- `maxPrice`: maximum price
- `search`: search in title/description

**Example:**
```
GET /assets?type=3D&tags=character&minPrice=0&maxPrice=30
```

**Response (200):**
```json
{
  "success": true,
  "data": [{ ... }]
}
```

---

### Get Asset by ID
**GET** `/assets/:id`

Get detailed information about a specific asset.

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Upload Asset File
**POST** `/assets/:assetId/file`

Upload asset file. Requires authentication and ownership.

**Request:**
- Content-Type: multipart/form-data
- Field name: `file`

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Asset file uploaded successfully"
}
```

---

### Upload Asset Thumbnail
**POST** `/assets/:assetId/thumbnail`

Upload asset thumbnail image. Requires authentication and ownership.

**Request:**
- Content-Type: multipart/form-data
- Field name: `thumbnail`

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thumbnail uploaded successfully"
}
```

---

### Update Asset
**PUT** `/assets/:id`

Update asset details. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Asset updated successfully"
}
```

---

### Delete Asset
**DELETE** `/assets/:id`

Delete an asset. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

---

## Game Jam Endpoints

### Create Game Jam
**POST** `/jams`

Create a new game jam. Requires authentication.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "theme": "string",
  "deadline": "ISO 8601 datetime"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "theme": "string",
    "deadline": "ISO 8601",
    "createdBy": "string",
    "participants": ["string"],
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  },
  "message": "Game jam created successfully"
}
```

---

### Get All Game Jams
**GET** `/jams`

Get list of all game jams with optional filters.

**Query Parameters:**
- `search`: search in title/theme
- `ongoing`: "true" to show only ongoing jams

**Example:**
```
GET /jams?search=space&ongoing=true
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "theme": "string",
      "deadline": "ISO 8601",
      "createdBy": {
        "_id": "string",
        "username": "string",
        "avatar": "string"
      },
      "participants": [
        {
          "_id": "string",
          "username": "string",
          "avatar": "string"
        }
      ],
      "createdAt": "ISO 8601",
      "updatedAt": "ISO 8601"
    }
  ]
}
```

---

### Get Game Jam by ID
**GET** `/jams/:id`

Get detailed information about a specific game jam.

**Response (200):**
```json
{
  "success": true,
  "data": { ... }
}
```

---

### Join Game Jam
**POST** `/jams/:id/join`

Join a game jam. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Joined game jam successfully"
}
```

---

### Leave Game Jam
**POST** `/jams/:id/leave`

Leave a game jam. Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Left game jam successfully"
}
```

---

### Update Game Jam
**PUT** `/jams/:id`

Update game jam details. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Game jam updated successfully"
}
```

---

### Delete Game Jam
**DELETE** `/jams/:id`

Delete a game jam. Requires authentication and ownership.

**Response (200):**
```json
{
  "success": true,
  "message": "Game jam deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "User already exists with that email or username"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

Currently not implemented but can be added using `express-rate-limit`.

## WebSocket Support

Not implemented in this version.

## Pagination

Pagination support can be added by extending query parameters with `limit` and `skip`.

## Sorting

Sorting can be implemented by extending `getAllGames` and `getAllAssets`.
