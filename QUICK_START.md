# 🚀 Quick Start Guide - New Features

## What's New?

Your Ama Puja application now has **4 new features**:

1. ✉️ **Email Verification** - Users receive a verification email when they register
2. 📧 **Booking Confirmation Emails** - Automatic emails when bookings are made
3. 🏙️ **City Selection** - Dropdown with Bangalore and Bhubaneswar options
4. 🙏 **Priest Preference** - Dropdown with Odia, Hindi, and Kannada options

---

## ⚡ Quick Setup (5 minutes)

### Step 1: Start the Backend
```bash
cd backend
npm run dev
```

**You'll see**:
```
⚠️ SMTP credentials not configured. Email functionality disabled.
Server running on http://localhost:5000
MongoDB connected
```

> **Note**: The warning is normal! The app works fine without email. Follow Step 3 to enable emails (optional).

---

### Step 2: Start the Frontend
```bash
cd frontend
npm run dev
```

**You'll see**:
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

---

### Step 3: Enable Emails (Optional)

#### For Gmail Users (Easiest):

1. **Enable 2-Factor Authentication** on your Google Account
2. **Create App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other"
   - Name it "Ama Puja"
   - Copy the 16-character password

3. **Update `backend/.env`**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop   # Your 16-char App Password
SMTP_FROM=Ama Puja <youremail@gmail.com>
```

4. **Restart Backend**:
```bash
# Stop backend (Ctrl+C) and restart
npm run dev
```

5. **Test It**:
   - Register a new account
   - Check your email inbox
   - You should see: "✅ Verification email sent to user@example.com" in backend logs

---

## 🧪 Test the New Features

### 1. Test Email Verification

1. Go to http://localhost:5173/signup
2. Register with a **real email address**
3. Check backend console for: `✅ Verification email sent to...`
4. Check your email inbox
5. Click the verification link
6. Should redirect to login with success message

**If emails aren't configured**: App still works, you just won't receive emails

---

### 2. Test City & Priest Preference Dropdowns

1. Login to your account
2. Go to **Services** page
3. Click on any Puja (e.g., "Engagement Puja")
4. Scroll to booking form
5. You'll see **two new dropdowns**:
   - **City**: Bangalore or Bhubaneswar
   - **Priest Preference**: Odia, Hindi, or Kannada

6. Both fields are **required** - you must select an option to book

---

### 3. Test Booking Confirmation Email

1. Complete a booking (after selecting city & priest preference)
2. Check backend console for: `✅ Booking confirmation email sent to...`
3. Check your email inbox
4. Email includes:
   - Puja name and package
   - Date, time, city
   - Priest preference
   - Address and special notes
   - Payment amount and status

---

## 📊 What Changed?

### Database Schema
- **Users**: Added `emailVerified`, `verificationToken`, `verificationTokenExpiry`
- **Bookings**: Added `city` and `priestPreference` (both required)

### API Endpoints
- ✨ **New**: `GET /auth/verify-email?token=xxx`
- 🔄 **Modified**: `POST /auth/register` (sends verification email)
- 🔄 **Modified**: `POST /bookings` (requires city + priest preference, sends confirmation email)

### Frontend Routes
- ✨ **New**: `/verify-email` - Email verification page

### Form Fields
- ✨ **New**: City dropdown in booking form
- ✨ **New**: Priest preference dropdown in booking form

---

## 🛠️ Troubleshooting

### Problem: "SMTP credentials not configured" warning
**Solution**: This is normal! The app works without emails. To enable emails, follow Step 3 above.

### Problem: Emails not arriving
**Checklist**:
- [ ] SMTP credentials are correct in `backend/.env`
- [ ] For Gmail: Using App Password (not regular password)
- [ ] Backend server was restarted after updating `.env`
- [ ] Check spam/junk folder
- [ ] Check backend console for error messages

### Problem: Can't submit booking form
**Solution**: Make sure you've selected both:
- City (Bangalore or Bhubaneswar)
- Priest Preference (Odia, Hindi, or Kannada)

Both fields are required!

### Problem: "Invalid or expired verification token"
**Solution**: Verification tokens expire after 24 hours. Request a new verification email by:
1. Logging out
2. Registering again with the same email (if email already exists, contact admin to reset)

---

## 📚 Documentation Files

- **EMAIL_SETUP.md** - Detailed SMTP setup guide (Gmail, SendGrid, Mailgun, AWS SES)
- **FEATURES_SUMMARY.md** - Complete technical documentation of all changes

---

## 🎯 Next Steps

1. ✅ Test registration flow
2. ✅ Test booking with new dropdowns
3. ✅ Configure SMTP for emails (optional)
4. ✅ Test email verification flow
5. ✅ Test booking confirmation emails

---

## ⚠️ Important Notes

- **Old bookings**: Existing bookings in the database won't have city/priestPreference fields. Only new bookings will include these.
- **Email verification**: Users can login without verifying their email - verification is for added security but not mandatory.
- **SMTP security**: Never commit your SMTP credentials to Git! They're in `.env` which is already in `.gitignore`.

---

## 💬 Need Help?

Check the detailed documentation:
- **Email setup issues**: See `EMAIL_SETUP.md`
- **Technical details**: See `FEATURES_SUMMARY.md`
- **Backend logs**: Check the terminal where backend is running

---

**Ready to go!** 🎊

All features are working. SMTP configuration is optional but recommended for the best user experience.
