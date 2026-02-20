# Email Configuration Setup Guide

## Overview
Your Ama Puja application now includes email functionality for:
- **Email Verification**: Sent when users register a new account
- **Booking Confirmation**: Sent when a user books a pooja

## SMTP Configuration Required

To enable emails, you need to configure SMTP credentials in `backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=Ama Puja <no-reply@amapuja.com>
```

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/security
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "Ama Puja"
4. Copy the 16-character password
5. Use this in `SMTP_PASS` (without spaces)

### Step 3: Update backend/.env
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=youremail@gmail.com
SMTP_PASS=abcd efgh ijkl mnop   # Your 16-char app password
SMTP_FROM=Ama Puja <youremail@gmail.com>
```

## Other Email Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=YOUR_MAILGUN_PASSWORD
```

### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=YOUR_SES_SMTP_USERNAME
SMTP_PASS=YOUR_SES_SMTP_PASSWORD
```

## Testing Emails

### 1. Test Registration Email
```bash
# Register a new user via the frontend signup form
# Check the server logs for:
✅ Verification email sent to user@example.com
```

### 2. Test Booking Confirmation
```bash
# Book a pooja via the frontend
# Check the server logs for:
✅ Booking confirmation email sent to user@example.com
```

### 3. Check Logs
If emails aren't sending, check backend console for:
```
⚠️ SMTP credentials not configured. Email functionality disabled.
```

## Email Features

### Email Verification Flow
1. User registers → Receives verification email
2. User clicks link → Token validated
3. Account marked as verified → User can login

### Booking Confirmation Flow
1. User books a pooja → Receives confirmation email
2. Email includes: Puja details, date/time, city, priest preference, amount
3. Admin confirms booking → User receives status update email

## Important Notes

- **Emails run asynchronously**: Booking/registration will succeed even if email fails
- **Token expiry**: Email verification tokens expire after 24 hours
- **Console warnings**: If SMTP is not configured, you'll see warnings but the app will still work
- **Security**: Never commit your SMTP credentials to Git

## Troubleshooting

### "Less secure app access" error (Gmail)
✅ Use App Password instead of regular password

### "Connection refused" error
- Check `SMTP_HOST` and `SMTP_PORT` are correct
- Verify firewall allows outbound SMTP connections

### Emails go to spam
- Configure SPF/DKIM records for your domain
- Use a verified "From" email address
- Consider using a dedicated transactional email service

## New Features Added

### 1. City Selection Dropdown
- Options: Bangalore, Bhubaneswar
- Required field in booking form

### 2. Priest Preference Dropdown
- Options: Odia, Hindi, Kannada
- Required field in booking form

### 3. Database Schema Updates
- **User Model**: Added `emailVerified`, `verificationToken`, `verificationTokenExpiry`
- **Booking Model**: Added `city` and `priestPreference` fields

## Next Steps

1. Configure SMTP credentials in `backend/.env`
2. Restart backend server: `npm run dev` (in backend folder)
3. Test registration and booking flows
4. Monitor email delivery in server logs

For production deployment, consider using a dedicated email service like SendGrid or AWS SES for better deliverability.
