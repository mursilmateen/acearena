# 🎯 AceArena Production Deployment Checklist

Complete checklist for deploying AceArena to production. Use this to ensure nothing is missed.

---

## ✅ PRE-DEPLOYMENT PHASE

### Code Quality
- [ ] All code committed to Git (`main` branch)
- [ ] No hardcoded API endpoints (localhost:5000)
- [ ] No hardcoded database URLs
- [ ] No console.log() left in production code (or wrapped in dev check)
- [ ] No test data in production database
- [ ] ESLint passes: `npm run lint` in both frontend and backend

### Build & Testing
- [ ] Backend builds successfully: `npm run build`
- [ ] Frontend builds successfully: `npm run build`
- [ ] No TypeScript errors
- [ ] All dependencies are listed in package.json (no global installs)

### Environment Configuration
- [ ] `.env.example` files created in both backend and frontend
- [ ] Backend has all required env vars documented
- [ ] Frontend has `NEXT_PUBLIC_API_URL` configured
- [ ] JWT_SECRET generated and saved securely
- [ ] Cloudinary credentials verified
- [ ] MongoDB Atlas connection string ready

### Security
- [ ] CORS configured for production domain only (not *)
- [ ] Helmet security headers enabled
- [ ] Rate limiting configured
- [ ] Password hashing implemented (bcryptjs)
- [ ] JWT token verification working
- [ ] No sensitive data in git history
- [ ] Database user has least-required permissions
- [ ] API keys are environment variables (not hardcoded)

---

## ✅ MONGODB ATLAS SETUP

### Cluster Configuration
- [ ] MongoDB Atlas account created
- [ ] M0 or paid cluster created (M0 is free tier)
- [ ] Region selected (US East recommended for DigitalOcean proximity)
- [ ] Cluster is ready and accessible

### Database User
- [ ] Database user created (`acearena`)
- [ ] Strong password generated and saved
- [ ] User has read/write permissions
- [ ] Connection string obtained and verified

### Network Access
- [ ] IP whitelist configured
- [ ] DigitalOcean App Platform IP added (or 0.0.0.0/0 for development)
- [ ] Connection test successful from local machine

### Database
- [ ] Database named `acearena` created
- [ ] Collections created or auto-created on first insert
- [ ] Indexes are set up (if using custom ones)

---

## ✅ DIGITALOCEAN APP PLATFORM SETUP

### App Creation
- [ ] DigitalOcean account created
- [ ] GitHub connected to DigitalOcean
- [ ] Repository selected and authorized
- [ ] App Platform app created

### Build Configuration
- [ ] Source branch set to `main`
- [ ] Build command: `npm run build` ✓
- [ ] Output directory: `dist` ✓
- [ ] Run command: `npm start` ✓

### Environment Variables
- [ ] `PORT` set to `8080` ✓
- [ ] `NODE_ENV` set to `production` ✓
- [ ] `MONGO_URI` set with valid connection string
- [ ] `JWT_SECRET` set with generated secret
- [ ] `FRONTEND_URL` set to `https://acearena.com`
- [ ] `CLOUDINARY_CLOUD_NAME` set
- [ ] `CLOUDINARY_API_KEY` set
- [ ] `CLOUDINARY_API_SECRET` set
- [ ] All secrets are marked as sensitive

### Deployment
- [ ] App builds successfully
- [ ] Build logs show no errors
- [ ] App starts successfully
- [ ] Health endpoint responds: `GET /api/health`
- [ ] Database connection logs show success
- [ ] No error stack traces in logs

### Domain
- [ ] Custom domain `api.acearena.com` added to App Platform
- [ ] SSL certificate provisioned
- [ ] CNAME record created in domain registrar
- [ ] Domain resolves correctly

---

## ✅ VERCEL SETUP

### Project Creation
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Frontend folder `/frontend` selected as root
- [ ] Project name set to `acearena-frontend`

### Build Settings
- [ ] Framework: Next.js (auto-detected) ✓
- [ ] Build command: `npm run build` ✓
- [ ] Output directory: `.next` ✓
- [ ] Install command: `npm install` ✓

### Environment Variables
- [ ] `NEXT_PUBLIC_API_URL` set to `https://api.acearena.com`
- [ ] All variables are correctly prefixed with `NEXT_PUBLIC_`

### Deployment
- [ ] Project deploys successfully
- [ ] Build logs show no errors
- [ ] Preview URL works
- [ ] All pages load correctly
- [ ] API calls hit the correct backend URL

### Domain
- [ ] Custom domain `acearena.com` added to Vercel
- [ ] SSL certificate provisioned
- [ ] Nameservers or A record configured
- [ ] Domain resolves correctly

---

## ✅ DOMAIN & DNS CONFIGURATION

### Domain Registrar
- [ ] Domain `acearena.com` registered
- [ ] Domain auto-renewal disabled or set to auto-renew
- [ ] Registrar account secure (2FA enabled)

### Vercel Domain
- [ ] `acearena.com` pointing to Vercel
- [ ] A record: `76.76.19.132` OR
- [ ] Nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
- [ ] DNS propagation complete (verify with `nslookup acearena.com`)
- [ ] SSL certificate active and valid

### DigitalOcean Domain
- [ ] `api.acearena.com` pointing to DigitalOcean
- [ ] CNAME record: `api-your-app.ondigitalocean.app`
- [ ] DNS propagation complete
- [ ] SSL certificate active and valid

---

## ✅ CLOUDINARY SETUP

### Account Configuration
- [ ] Cloudinary account created
- [ ] Cloud name noted
- [ ] API key and secret generated
- [ ] Upload settings configured

### Folder Structure
- [ ] Folder structure in Cloudinary: `acearedb/assets`, `acearedb/assets/thumbnails`
- [ ] Upload presets configured (if using client-side uploads)
- [ ] File type restrictions set (block executable files)
- [ ] Max file size limits configured

### Testing
- [ ] Test upload working in production
- [ ] File URLs are secure (https with token)
- [ ] Deletion working correctly

---

## ✅ VERIFICATION & TESTING

### Backend Testing

```bash
# Test health endpoint
curl https://api.acearena.com/api/health

# Expected:
# {
#   "success": true,
#   "message": "Server is running",
#   "environment": "production",
#   "timestamp": "..."
# }
```

- [ ] Health endpoint returns 200
- [ ] Environment shows `production`
- [ ] CORS headers are present
- [ ] No error messages in response

### Frontend Testing

- [ ] Frontend loads at `https://acearena.com`
- [ ] No console errors
- [ ] Images and assets load correctly
- [ ] Dark/light mode toggle works
- [ ] Navigation works

### API Integration Testing

- [ ] User registration works
- [ ] User login works
- [ ] API calls show correct `Authorization` header
- [ ] Token refresh works (if implemented)
- [ ] Error responses are properly formatted
- [ ] Rate limiting returns 429 on excessive requests

### Upload Testing

- [ ] Game upload works
- [ ] Asset upload works
- [ ] File appears in Cloudinary
- [ ] Thumbnail generation works (if applicable)
- [ ] Download/preview works
- [ ] Large files (50MB+) upload successfully

### Database Testing

- [ ] Data persists between deployments
- [ ] Indexes working (queries are fast)
- [ ] No N+1 query problems
- [ ] Backups are configured

### Security Testing

- [ ] HTTPS enforced everywhere
- [ ] CORS only allows acearena.com
- [ ] JWT tokens are required for protected routes
- [ ] Unauthorized access returns 401
- [ ] Invalid tokens are rejected
- [ ] Passwords are hashed (never stored in plain text)
- [ ] Sensitive data not exposed in error messages

---

## ✅ MONITORING & OBSERVABILITY

### DigitalOcean
- [ ] Monitoring alerts configured
- [ ] Email notifications for deployment failures
- [ ] CPU/Memory alerts set (threshold: 80%)
- [ ] Error rate alerts set

### Vercel
- [ ] Project analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring enabled
- [ ] Deployment notifications enabled

### Logs
- [ ] Backend logs accessible via DigitalOcean App Platform
- [ ] Frontend logs accessible via Vercel
- [ ] Database logs accessible via MongoDB Atlas
- [ ] Log retention policy set (e.g., 30 days)

---

## ✅ DOCUMENTATION & HANDOFF

### Documentation
- [ ] DEPLOYMENT_GUIDE.md created and complete
- [ ] .env.example files document all required variables
- [ ] README updated with production URLs
- [ ] API documentation up to date
- [ ] Database schema documented

### Team Access
- [ ] Team members have GitHub access
- [ ] Team members have DigitalOcean access (read-only)
- [ ] Team members have Vercel access (read-only)
- [ ] Team members have MongoDB Atlas access (read-only)

### Secrets Management
- [ ] All secrets stored securely (not in Git)
- [ ] Secrets backed up (in password manager)
- [ ] Secret rotation schedule documented
- [ ] Emergency procedure documented

---

## ✅ POST-DEPLOYMENT (FIRST WEEK)

### Monitoring
- [ ] Monitor error rates (should be < 1%)
- [ ] Monitor response times (should be < 500ms)
- [ ] Monitor database performance
- [ ] Check uptimemonitor (e.g., UptimeRobot)

### User Feedback
- [ ] Collect early user feedback
- [ ] Monitor for crash reports
- [ ] Check support channels for issues

### Performance Optimization
- [ ] Identify slow endpoints (database profiling)
- [ ] Optimize images (Vercel image optimization)
- [ ] Enable caching headers
- [ ] Minify and bundle assets

### Security Review
- [ ] Scan for security vulnerabilities
- [ ] Review access logs for suspicious activity
- [ ] Verify no data breaches
- [ ] Check SSL certificate validity

---

## ✅ ONGOING MAINTENANCE

### Weekly
- [ ] Check deployment logs for errors
- [ ] Monitor error rates and uptime
- [ ] Review database performance

### Monthly
- [ ] Review access logs
- [ ] Update dependencies (minor versions)
- [ ] Backup verification
- [ ] Performance review

### Quarterly
- [ ] Major version updates
- [ ] Security audit
- [ ] Cost review
- [ ] Capacity planning

---

## 🎉 DEPLOYMENT COMPLETE!

Once all items are checked, your AceArena platform is production-ready!

**Key URLs:**
- Frontend: https://acearena.com
- API: https://api.acearena.com
- Database: MongoDB Atlas (secured)

**Team Access:**
- GitHub: [your-repo-link]
- DigitalOcean: [app-link]
- Vercel: [project-link]

**Support:**
- Refer to DEPLOYMENT_GUIDE.md for troubleshooting
- Check individual service documentation as needed
