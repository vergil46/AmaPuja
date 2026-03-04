# Ama Puja (MERN)

Professional, trust-focused Pooja booking platform built with MongoDB, Express, React, and Node.

## Features

- User authentication with JWT (user/admin roles)
- Home, Services, About, Contact, Dashboard, Admin panel
- Pooja listing and detail pages with package-based booking form
- Payment modes: full, advance (30%), pay-after-pooja
- Razorpay order creation + signature verification
- Booking/enquiry/payment persistence in MongoDB
- Admin dashboard with bookings, revenue, pooja and enquiry management
- WhatsApp chat button, testimonials, trust badges
- SEO meta tags + Refund/Privacy/Terms pages
- Booking confirmation email support via SMTP

## Project Structure

- `backend` - Express API + MongoDB models
- `frontend` - React + Vite + Tailwind UI

## Prerequisites

- Node.js 20+ and npm
- MongoDB instance (local or cloud)
- Razorpay account (for online payment flow)
- SMTP credentials (for booking/verification emails)

## Environment Setup

### Backend (`backend/.env`)

Copy from `backend/.env.example` and set:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `CLIENT_URLS` (optional, comma-separated allowed origins)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Example:

`CLIENT_URLS=https://amapuja-frontend.onrender.com,https://amapuja-frontend-pr-12.onrender.com`

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example` and set:

- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_GOOGLE_MAPS_API_KEY` (optional; used for Google reverse geocoding)

## Run Locally

Important: `node_modules` is intentionally ignored in Git. After cloning/pulling, run `npm install` inside both `backend` and `frontend`.

### 1) Start backend

```bash
cd backend
npm install
npm run dev
```

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend API: `http://localhost:5000/api`

## Notes

- Default pooja services are auto-seeded on first backend run when DB is empty.
- Create one admin user manually in MongoDB by setting `role: "admin"` for that user document.
- Razorpay checkout opens only when `VITE_RAZORPAY_KEY_ID` is set.
- Current location address autofill works with fallback provider even if `VITE_GOOGLE_MAPS_API_KEY` is not set.
- Optimize new frontend images before commit:
	- `cd frontend && npm run optimize:images`
	- Example: `npm run optimize:images -- --dir src/assets/poojas --quality 78`
- Never commit real `.env` files or payment/email secrets.
- For production, set strict CORS origins and secure cookie/JWT settings.

## Deployment (Vercel + Render)

- Frontend deployment guide: `DEPLOY_VERCEL.md`
- Frontend (Vercel): `https://<your-vercel-project>.vercel.app`
- Backend (Render API): `https://amapuja-backend-lokanath.onrender.com/api`

### Production Env Checklist

- Vercel project root is `frontend`
- Vercel env `VITE_API_URL` points to Render `/api`
- Render env `CLIENT_URL` or `CLIENT_URLS` includes Vercel domain
- `frontend/vercel.json` rewrite is present for SPA routes
- Payment keys set:
	- Backend: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
	- Frontend: `VITE_RAZORPAY_KEY_ID`
- Email alert/notification env is configured:
	- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
	- Optional: `ADMIN_ALERT_EMAIL`

### Monitoring & Alerts Checklist

- Backend monitoring env configured:
	- `SENTRY_DSN`, `SENTRY_TRACES_SAMPLE_RATE`
	- `ADMIN_ALERT_EMAIL`
	- `DAILY_SUMMARY_HOUR_UTC`, `DAILY_SUMMARY_MINUTE_UTC`, `DAILY_SUMMARY_CHECK_MS`
- Frontend monitoring env configured:
	- `VITE_SENTRY_DSN`, `VITE_SENTRY_TRACES_SAMPLE_RATE`
- Health endpoints available:
	- Backend: `https://amapuja-backend-lokanath.onrender.com/api/health`
	- Frontend: `https://<your-vercel-project>.vercel.app/health`
