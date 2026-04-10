# Rate Limiting Implementation

## Overview

This document describes the rate limiting configuration for AceArena Studios backend API. Rate limiting is implemented using `express-rate-limit` middleware to protect the API from abuse, DDoS attacks, and excessive load.

## Installation

The `express-rate-limit` package is already included in `package.json`. Install dependencies with:

```bash
npm install
```

## Implementation Details

### Middleware File

**Location:** [src/middleware/rateLimiter.ts](src/middleware/rateLimiter.ts)

The rate limiting middleware is configured with two separate limiters:

#### 1. Authentication Limiter (`authLimiter`)

**Purpose:** Protects authentication endpoints from brute-force attacks

**Configuration:**
- **Window:** 15 minutes (900 seconds)
- **Max Requests:** 5 per window
- **Status Code:** 429 (Too Many Requests)

**Applied to:**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Error Message:** "Too many login attempts. Please try again after 15 minutes."

#### 2. API Limiter (`apiLimiter`)

**Purpose:** Protects general API endpoints from excessive usage

**Configuration:**
- **Window:** 15 minutes (900 seconds)
- **Max Requests:** 100 per window
- **Status Code:** 429 (Too Many Requests)

**Applied to:**
- All game routes
- All asset routes
- All game jam routes
- All profile routes
- Comment, rating, and save state routes

**Error Message:** "API rate limit exceeded. Please try again later."

### Memory Store

The current implementation uses the default in-memory store for rate limiting. This is suitable for single-instance deployments but has the following considerations:

**Pros:**
- Simple implementation
- No external dependencies beyond `express-rate-limit`
- Good performance for single-server deployments

**Cons:**
- Rate limits are not shared across multiple server instances
- Limits reset when the server restarts
- Not suitable for distributed/horizontal scaling

### Redis Integration (Optional for Production)

For distributed deployments, configure Redis-based store:

```typescript
import RedisStore from "rate-limit-redis";
import redis from "redis";

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

const authLimiter = rateLimit({
  store: new RedisStore({
    client: client,
    prefix: "auth-limiter:",
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: "Too many login attempts. Please try again after 15 minutes.",
});
```

## Route Integration

Rate limiters are integrated into route files by importing and applying them as middleware:

### Authentication Routes
```typescript
import { authLimiter } from "../middleware/rateLimiter";

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
```

### API Routes
```typescript
import { apiLimiter } from "../middleware/rateLimiter";

router.get("/", apiLimiter, optionalAuth, getAllGames);
router.post("/", apiLimiter, authenticateToken, createGame);
```

## Environment Variables

Add these optional variables to `.env` for production configuration:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000          # Default: 15 minutes (900000 ms)
RATE_LIMIT_MAX_REQUESTS=100           # Default: 100 requests per window
RATE_LIMIT_AUTH_MAX=5                 # Default: 5 attempts for auth endpoints
REDIS_HOST=localhost                  # For Redis-based limiting
REDIS_PORT=6379                       # For Redis-based limiting
RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS=false  # Count only failed requests
RATE_LIMIT_SKIP_FAILED_REQUESTS=false      # Count all requests
```

## Testing Rate Limits

### Using curl

Test authentication rate limit with rapid login attempts:

```bash
# First 5 requests will succeed (assuming valid credentials)
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' \
    -w "Status: %{http_code}\n"
  sleep 1
done
```

Test API rate limit with rapid requests:

```bash
# First 100 requests will succeed
for i in {1..150}; do
  curl http://localhost:5000/api/games \
    -w "Status: %{http_code}\n"
  sleep 0.1
done
```

### Using a HTTP Client

In Postman or Thunder Client, create a folder with requests and configure:
1. Create 10+ GET requests to `/api/games`
2. Run collection in sequence
3. Observe 429 responses after 100th request

## Response Format

When rate limit is exceeded, the API returns:

**Status Code:** 429

**Response Body:**
```json
{
  "error": "Too many requests",
  "message": "API rate limit exceeded. Please try again later."
}
```

For authentication endpoints:
```json
{
  "error": "Too many requests",
  "message": "Too many login attempts. Please try again after 15 minutes."
}
```

## Best Practices

### For Development

1. **Increase Limits:** Consider higher limits during development
   ```typescript
   max: 1000, // Higher for dev
   windowMs: 60 * 60 * 1000, // 1 hour window
   ```

2. **Skip Local Traffic:** Whitelist localhost for development
   ```typescript
   skip: (req) => {
     return req.ip === '127.0.0.1' || req.ip === '::1';
   }
   ```

### For Production

1. **Use Redis:** Implement Redis-based store for distributed systems
2. **Monitor:** Set up alerts for high rate limit hit rates
3. **Adjust Limits:** Base limits on actual usage patterns
4. **Document:** Inform API consumers about rate limits in documentation
5. **Gradual Rollout:** Start with higher limits and gradually reduce

## Monitoring

### Log Rate Limit Hits

Add request logging middleware before rate limiters:

```typescript
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode === 429) {
      console.warn(`Rate limit hit - IP: ${req.ip}, Path: ${req.path}`);
    }
  });
  next();
});
```

### Track Metrics

Monitor these metrics:
- Number of 429 responses
- IP addresses hitting limits
- Endpoint patterns causing limits
- Rate limit performance impact

## Troubleshooting

### Users Getting 429 Errors Too Frequently

**Solution:** 
- Increase `max` value in limiter configuration
- Increase `windowMs` duration
- Check for bot traffic causing false positives

### Rate Limits Not Working on Multiple Servers

**Solution:**
- Implement Redis-based store for distributed rate limiting
- Ensure all servers have identical configuration
- Verify Redis connection parameters

### Legitimate Traffic Blocked

**Solution:**
- Whitelist specific IP addresses or user agents
- Implement user-based rate limiting instead of IP-based
- Multiple rate limit tiers based on user subscription level

## Useful Links

- [express-rate-limit Documentation](https://github.com/nfriedly/express-rate-limit)
- [rate-limit-redis](https://github.com/wyattjoh/rate-limit-redis)
- [Redis Documentation](https://redis.io/docs/)

## Future Enhancements

1. **User-Based Rate Limiting:** Different limits for different user tiers
2. **Adaptive Rate Limiting:** Adjust limits based on server load
3. **Geographic Rate Limiting:** Different limits by region
4. **API Key Rate Limiting:** Separate limits for API key authentication
5. **Advanced Analytics:** Track and visualize rate limit patterns
