# Deploy Frontend on Vercel (Backend on Render)

This guide is for this project structure:
- Frontend: `frontend/` (Vite + React)
- Backend: Render URL (Node/Express)

---

## 1) Pre-check in Repo

- Ensure this file exists: `frontend/vercel.json`
- Ensure frontend API client uses env var:
  - `frontend/src/services/api.js` reads `VITE_API_URL`

---

## 2) Deploy on Vercel

1. Go to Vercel Dashboard → **Add New Project**
2. Import your GitHub repo
3. In project settings, set:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://amapuja-backend-lokanath.onrender.com/api`

5. Click **Deploy**

---

## 3) Update Backend CORS on Render

In Render backend Environment variables, set one of:

- `CLIENT_URL=https://pujasmarddhi.vercel.app`

or (recommended for multiple domains):

- `CLIENT_URLS=https://pujasmarddhi.vercel.app,https://www.<your-domain>.com`

Then redeploy backend on Render.

---

## 4) Verify After Deploy

Open these in browser:

- Home: `https://<vercel-domain>/`
- Services list: `https://<vercel-domain>/services`
- Service detail direct URL: `https://<vercel-domain>/services/<id>?city=Bangalore&language=Odia`
- Refresh service detail page (must not show 404)

If API fails, check browser network tab and confirm requests go to Render backend URL.
Also verify backend health endpoint directly:

- `https://amapuja-backend-lokanath.onrender.com/api/health`

Then verify auth from your Vercel frontend:

- Open `https://pujasmarddhi.vercel.app/login`
- Login and confirm dashboard loads without CORS errors
- In browser network tab, confirm requests go to `https://amapuja-backend-lokanath.onrender.com/api`

---

## 5) Custom Domain (Optional)

In Vercel:
- Project → **Settings** → **Domains** → Add your domain

Then include that domain in Render `CLIENT_URLS`.

---

## 6) Common Issues

### A) White page after deploy
- Check Vercel function logs / browser console
- Rebuild from latest commit
- Confirm environment variable `VITE_API_URL` is set for **Production**

### B) 404 on refresh for `/services/...`
- Ensure `frontend/vercel.json` is present with rewrite to `index.html`

### C) CORS blocked
- Add Vercel domain in Render backend `CLIENT_URL` or `CLIENT_URLS`

### D) API timeout
- Render free tier may sleep; first request can be slow

### E) Backend URL wrong / backend not found
- Use: `https://amapuja-backend-lokanath.onrender.com/api`
- Do not use: `https://amapuja-backend.onrender.com` (wrong/inactive service)
- Verify health: `https://amapuja-backend-lokanath.onrender.com/api/health`

---

## 7) Monitoring & Alerts Env Vars

Set these before go-live to enable Sentry + instant ops alerts + daily business summary.

### Render (Backend)

- `ADMIN_ALERT_EMAIL=ops@your-domain.com`
- `SENTRY_DSN=<backend sentry dsn>`
- `SENTRY_TRACES_SAMPLE_RATE=0.2`
- `DAILY_SUMMARY_HOUR_UTC=18`
- `DAILY_SUMMARY_MINUTE_UTC=0`
- `DAILY_SUMMARY_CHECK_MS=900000`

Also ensure SMTP is configured (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`) so alert and summary emails can be delivered.

### Vercel (Frontend)

- `VITE_SENTRY_DSN=<frontend sentry dsn>`
- `VITE_SENTRY_TRACES_SAMPLE_RATE=0.2`

### Health URLs to monitor

- Backend: `https://amapuja-backend-lokanath.onrender.com/api/health`
- Frontend: `https://<vercel-domain>/health`

---

## 8) Redeploy Flow (Fast)

1. Push code to GitHub
2. Vercel auto-deploys frontend
3. If backend changed, redeploy Render service

---

## 9) Production Checklist

- [ ] `VITE_API_URL` set on Vercel
- [ ] Render CORS includes Vercel domain
- [ ] Login works on `https://pujasmarddhi.vercel.app/login`
- [ ] Direct route refresh works (`/services/:id`)
- [ ] Booking create works
- [ ] Payment flow works
- [ ] Admin dashboard loads
