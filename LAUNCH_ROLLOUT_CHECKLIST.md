# AceArena Launch Rollout Checklist

Use this checklist when running launch mode with only selected live games and game uploads paused.

## 1) Backend Production Readiness

- [ ] Backend service is deployed and healthy at `/api/health`.
- [ ] Backend env includes:
  - `NODE_ENV=production`
  - `MONGO_URI=...`
  - `JWT_SECRET=...` (strong random secret)
  - `JWT_EXPIRY=15m`
  - `CLOUDINARY_CLOUD_NAME=...`
  - `CLOUDINARY_API_KEY=...`
  - `CLOUDINARY_API_SECRET=...`
  - `FRONTEND_URLS=https://acearena.com,https://www.acearena.com,https://acearena-frontend.vercel.app`
- [ ] CORS allows every active frontend domain.

## 2) Frontend Launch Mode Variables

- [ ] Frontend env (Vercel/Railway) includes:
  - `NEXT_PUBLIC_API_URL=https://api.acearena.com`
  - `NEXT_PUBLIC_LAUNCH_MODE_ENABLED=true`
  - `NEXT_PUBLIC_GAME_UPLOAD_COMING_SOON=true`
  - `NEXT_PUBLIC_LIVE_GAME_TITLES=Falling Crown,Space Run`
- [ ] Frontend has been rebuilt/redeployed after env changes.

## 3) Launch Verification

- [ ] Home page shows only Falling Crown and Space Run in game listings.
- [ ] `/games` shows only Falling Crown and Space Run.
- [ ] Accessing non-launch game detail page shows Coming Soon state.
- [ ] Developer `/upload` shows Coming Soon for game uploads.
- [ ] `/upload-asset` remains accessible and working.
- [ ] Asset listing/detail pages still function.

## 4) Smoke Tests

- [ ] Register/login works for player and developer roles.
- [ ] Asset upload completes and file is retrievable.
- [ ] Existing live games can still be viewed and played/downloaded.
- [ ] No CORS errors in browser console on production domain.

## 5) Rollback Plan

- [ ] Set `NEXT_PUBLIC_LAUNCH_MODE_ENABLED=false`.
- [ ] Set `NEXT_PUBLIC_GAME_UPLOAD_COMING_SOON=false`.
- [ ] (Optional) Clear `NEXT_PUBLIC_LIVE_GAME_TITLES`.
- [ ] Redeploy frontend.
- [ ] Recheck `/games`, `/upload`, and game detail pages.

## 6) Post-Launch Maintenance

- [ ] Keep release notes with date/time for every env toggle change.
- [ ] Track top user errors for 24h after each change.
- [ ] Reconfirm CORS list when adding new frontend domains.
