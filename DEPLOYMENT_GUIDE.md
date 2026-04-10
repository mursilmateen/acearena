# 🚀 AceArena Production Deployment Guide

Complete step-by-step instructions to deploy AceArena to production with DigitalOcean, Vercel, and MongoDB Atlas.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
3. [Backend Deployment (DigitalOcean App Platform)](#backend-deployment-digitalocean-app-platform)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] DigitalOcean account with API token
- [ ] Vercel account linked to GitHub
- [ ] MongoDB Atlas account
- [ ] Cloudinary account (for media uploads)
- [ ] Domain registered (acearena.com)
- [ ] All environment variables documented
- [ ] GitHub repository set up and code pushed

---

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new **M0 (Free) Cluster** or upgrade as needed
4. Choose a region close to your deployment (e.g., US East for DigitalOcean)
5. Wait for cluster to be created (5-10 minutes)

### Step 2: Create Database User

1. Navigate to **Database Access** → **Add New Database User**
2. Create username: `acearena`
3. Generate a strong password (copy it!)
4. Select **Read and write to any database**
5. Click **Add User**

### Step 3: Configure Network Access

1. Navigate to **Network Access** → **Add IP Address**
2. Click **Allow Access from Anywhere** (or add DigitalOcean IP range)
   - This allows your DigitalOcean app to connect
3. Click **Confirm**

### Step 4: Get Connection String

1. Click **Connect** on your cluster
2. Select **Connect your application**
3. Choose **Node.js** driver
4. Copy the connection string
5. Replace `<PASSWORD>` with your database user password
6. Replace `<USERNAME>` with your database user

**Example:**
```
mongodb+srv://acearena:PASSWORD@cluster0.mongodb.net/acearena?retryWrites=true&w=majority
```

Save this as your `MONGO_URI` environment variable.

---

## Backend Deployment (DigitalOcean App Platform)

### Step 1: Connect GitHub to DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **GitHub** as source
4. Authorize DigitalOcean to access your GitHub account
5. Select your repository

### Step 2: Configure the App

1. **Source Configuration:**
   - Repository: Your GitHub repo
   - Branch: `main` (or your deployment branch)
   - Source type: GitHub

2. **Build Configuration:**
   - Dockerfile: Ensure you have a Dockerfile in `/backend` or DigitalOcean auto-detects
   - Build command: `npm run build`
   - Output directory: `dist`

3. **Run Command:**
   - Command: `npm start`

4. **Environment Variables:** Click **Edit** and add:
   ```
   PORT=8080
   NODE_ENV=production
   MONGO_URI=mongodb+srv://acearena:PASSWORD@cluster.mongodb.net/acearena
   JWT_SECRET=<generate with: openssl rand -hex 32>
   FRONTEND_URL=https://acearena.com
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Step 3: Deploy

1. Click the **Create Resource** button
2. Choose **Web Service** if not pre-selected
3. Review your configuration
4. Click **Create and Deploy**
5. Wait for build to complete (5-10 minutes)

### Step 4: Verify Backend

Once deployed, you should see:
- A `.ondigitalocean.app` URL
- Green deployment status
- Test the health endpoint: `https://your-app.ondigitalocean.app/api/health`

Save your DigitalOcean App URL (without https):
```
api-your-app.ondigitalocean.app
```

---

## Frontend Deployment (Vercel)

### Step 1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **New Project**
3. Import your GitHub repository
4. Select the frontend folder: `/frontend`

### Step 2: Configure Build Settings

1. **Framework Preset:** Next.js (auto-detected)
2. **Build Command:** `npm run build`
3. **Output Directory:** `.next`
4. **Install Command:** `npm install`

### Step 3: Environment Variables

1. Under **Environment Variables**, add:
   ```
   NEXT_PUBLIC_API_URL=https://api.acearena.com
   ```

   (You'll update this after configuring the domain)

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build completion (3-5 minutes)
3. You'll get a Vercel preview URL

### Step 5: Test Frontend

Once deployed:
- Visit your Vercel URL: `https://your-app.vercel.app`
- Open browser DevTools
- Check that API calls go to `https://api.acearena.com` (will fail without domain setup)

---

## Domain Configuration

### Step 1: Domain Registrar Setup

Get your domain from any registrar (GoDaddy, Namecheap, Route53, etc.).

### Step 2: Frontend Domain (acearena.com → Vercel)

**In Vercel:**
1. Go to your project **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `acearena.com`
4. Follow Vercel's domain verification instructions

**In Your Domain Registrar:**
- Set **Nameservers** to Vercel's nameservers:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```

OR create an **A Record:**
- Name: `@`
- Type: `A`
- Value: `76.76.19.132` (Vercel's IP)

### Step 3: Backend Domain (api.acearena.com → DigitalOcean)

**In DigitalOcean App Platform:**
1. Go your app **Settings** → **Domains**
2. Click **Edit**
3. Add domain: `api.acearena.com`

**In Your Domain Registrar:**
1. Create a **CNAME Record:**
   - Name: `api`
   - Type: `CNAME`
   - Value: `api-your-app.ondigitalocean.app.`

OR use **A Record** if you have DigitalOcean's static IP.

### Step 4: SSL Certificates

Vercel and DigitalOcean automatically provision SSL certificates via Let's Encrypt. This happens automatically once domains are verified (24-48 hours).

---

## Post-Deployment Verification

### Step 1: Test Health Endpoints

```bash
# Test backend
curl https://api.acearena.com/api/health

# Expected response:
{
  "success": true,
  "message": "Server is running",
  "environment": "production",
  "timestamp": "2026-04-09T..."
}
```

### Step 2: Test Frontend

1. Visit `https://acearena.com`
2. Open browser DevTools → **Network tab**
3. Make an API call (e.g., login)
4. Verify request URL is `https://api.acearena.com/api/...`

### Step 3: Test Database Connection

1. Create a test user account
2. Verify data is saved in MongoDB Atlas
3. Log in with the test account

### Step 4: Test File Uploads

1. Upload a game or asset
2. Verify file appears in Cloudinary dashboard
3. Verify URL is accessible

### Step 5: Monitor Logs

**DigitalOcean Logs:**
1. App Platform → Your App → **Logs**
2. Check for errors in production logs

**Vercel Logs:**
1. Project → **Deployments**
2. Click latest deployment → **Logs**

---

## Troubleshooting

### Backend Won't Deploy

**Check:**
1. Ensure `npm run build` succeeds locally
2. All environment variables are set
3. MongoDB Atlas IP whitelist includes DigitalOcean
4. No hardcoded localhost references

### Frontend Can't Reach API

**Check:**
1. `NEXT_PUBLIC_API_URL` is set correctly
2. Backend CORS allows your frontend domain
3. Check browser console for CORS errors

### CORS Errors

If you see CORS errors, update backend:
```bash
FRONTEND_URL=https://acearena.com
```

### MongoDB Connection Failed

**Check:**
1. Connection string is correct
2. Database user has proper permissions
3. IP whitelist includes DigitalOcean App Platform IPs
4. Network Access is enabled

### Domain Not Resolving

**Check:**
1. DNS propagation (can take 24-48 hours)
2. Nameservers or CNAME records are correct
3. Use `nslookup acearena.com` to verify

---

## Next Steps

After deployment:

1. **Set up monitoring:**
   - DigitalOcean monitoring alerts
   - Vercel analytics
   - Database performance monitoring

2. **Configure backups:**
   - MongoDB Atlas automated backups
   - GitHub repository is your code backup

3. **Set up CI/CD:**
   - Auto-deploy on GitHub push
   - Automated testing (optional)

4. **Performance optimization:**
   - Enable Vercel Image Optimization
   - Configure CDN caching
   - Monitor database indexes

5. **Security:**
   - Enable 2FA on all accounts
   - Rotate secrets regularly
   - Monitor API logs for suspicious activity

---

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review DigitalOcean App Platform documentation
3. Review Vercel documentation
4. Check MongoDB Atlas documentation
