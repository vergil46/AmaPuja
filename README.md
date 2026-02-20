# Ama Puja (MERN)

Professional, trust-focused Pooja booking platform built with MongoDB, Express, React, and Node.

## Features

- User authentication with JWT (user/admin roles)
- Home, Services, About, Contact, Dashboard, Admin panel
- Pooja listing and detail pages with package-based booking form
- Payment modes: full, advance 20%, advance 30%, pay-after-pooja
- Razorpay order creation + signature verification
- Booking/enquiry/payment persistence in MongoDB
- Admin dashboard with bookings, revenue, pooja and enquiry management
- WhatsApp chat button, testimonials, trust badges
- SEO meta tags + Refund/Privacy/Terms pages
- Booking confirmation email support via SMTP

## Project Structure

- `backend` - Express API + MongoDB models
- `frontend` - React + Vite + Tailwind UI

## Environment Setup

### Backend (`backend/.env`)

Copy from `backend/.env.example` and set:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example` and set:

- `VITE_API_URL`
- `VITE_RAZORPAY_KEY_ID`

## Run Locally

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
