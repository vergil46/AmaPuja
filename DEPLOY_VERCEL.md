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
   - **Value**: `https://<your-render-backend>.onrender.com/api`

5. Click **Deploy**

---

## 3) Update Backend CORS on Render

In Render backend Environment variables, set one of:

- `CLIENT_URL=https://<your-vercel-domain>.vercel.app`

or (recommended for multiple domains):

- `CLIENT_URLS=https://<your-vercel-domain>.vercel.app,https://www.<your-domain>.com`

Then redeploy backend on Render.

---

## 4) Verify After Deploy

Open these in browser:

- Home: `https://<vercel-domain>/`
- Services list: `https://<vercel-domain>/services`
- Service detail direct URL: `https://<vercel-domain>/services/<id>?city=Bangalore&language=Odia`
- Refresh service detail page (must not show 404)

If API fails, check browser network tab and confirm requests go to Render backend URL.

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

---

## 7) Redeploy Flow (Fast)

1. Push code to GitHub
2. Vercel auto-deploys frontend
3. If backend changed, redeploy Render service

---

## 8) Production Checklist

- [ ] `VITE_API_URL` set on Vercel
- [ ] Render CORS includes Vercel domain
- [ ] Direct route refresh works (`/services/:id`)
- [ ] Booking create works
- [ ] Payment flow works
- [ ] Admin dashboard loads
