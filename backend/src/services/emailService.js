const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter using .env config
const createTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️ SMTP credentials not configured. Email functionality disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate verification token
const generateVerificationToken = () => crypto.randomBytes(32).toString('hex');

// Send verification email
const sendVerificationEmail = async (user, token) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: user.email,
      subject: 'Verify Your Ama Puja Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b45309;">Welcome to Ama Puja! 🙏</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for registering with Ama Puja. Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #b45309; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link to your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (booking, pooja, user) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: booking.email,
      subject: `Booking Confirmed - ${pooja.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #b45309; text-align: center;">🕉️ Booking Confirmed! 🕉️</h2>
          <p>Namaste ${booking.name},</p>
          <p>Your booking has been successfully confirmed. Here are your booking details:</p>
          
          <div style="background-color: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #b45309; margin-top: 0;">Puja Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Puja:</td>
                <td style="padding: 8px 0; font-weight: bold;">${pooja.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Package:</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.package}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.date}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Time:</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.time}</td>
              </tr>
              ${booking.city ? `<tr>
                <td style="padding: 8px 0; color: #666;">City:</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.city}</td>
              </tr>` : ''}
              ${booking.priestPreference ? `<tr>
                <td style="padding: 8px 0; color: #666;">Priest Preference:</td>
                <td style="padding: 8px 0; font-weight: bold;">${booking.priestPreference}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #666;">Address:</td>
                <td style="padding: 8px 0;">${booking.address}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Phone:</td>
                <td style="padding: 8px 0;">${booking.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #b45309;">₹${booking.paymentAmount}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Payment Status:</td>
                <td style="padding: 8px 0; font-weight: bold; color: ${booking.paymentStatus === 'paid' ? '#059669' : '#ca8a04'};">${booking.paymentStatus.toUpperCase()}</td>
              </tr>
            </table>
          </div>

          ${booking.specialNotes ? `<div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #666; margin-top: 0; font-size: 14px;">Special Notes:</h4>
            <p style="margin: 5px 0; color: #333;">${booking.specialNotes}</p>
          </div>` : ''}

          <p style="margin-top: 30px;">Our team will contact you soon to confirm the arrangements.</p>
          <p>For any queries, please contact us at <a href="mailto:support@amapuja.com" style="color: #b45309;">support@amapuja.com</a></p>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #999; font-size: 12px;">Thank you for choosing Ama Puja</p>
            <p style="color: #999; font-size: 12px; margin-top: 5px;">🙏 May the divine blessings be with you 🙏</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return false;
  }
};

const sendPoojaCompletionReviewEmail = async (booking, pooja, reviewUrl) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const poojaTitle = pooja?.title || 'your pooja';

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: booking.email,
      subject: `Pooja Completed - Please Share Your Review`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
          <h2 style="color: #b45309; text-align: center;">🙏 Thank You for Booking with Ama Puja</h2>
          <p>Namaste ${booking.name},</p>
          <p>Your <strong>${poojaTitle}</strong> booking has been marked as completed.</p>
          <p>We would love to hear your feedback about your experience.</p>

          <div style="background-color: #fff7ed; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Date:</strong> ${booking.date}</p>
            <p style="margin: 4px 0;"><strong>Time:</strong> ${booking.time}</p>
            <p style="margin: 4px 0;"><strong>Package:</strong> ${booking.package}</p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${reviewUrl}" style="background-color: #b45309; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Leave a Review
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">If the button does not work, copy this link:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${reviewUrl}</p>

          <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
            <p style="color: #999; font-size: 12px;">Thank you for your trust in Ama Puja</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending pooja completion review email:', error);
    return false;
  }
};

const sendAdminBookingAlertEmail = async (booking, pooja) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return false;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: adminEmail,
      subject: `New Booking Alert: ${pooja?.title || booking?.package || 'Service'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b45309;">New Booking Received</h2>
          <p><strong>Customer:</strong> ${booking?.name || '-'}</p>
          <p><strong>Phone:</strong> ${booking?.phone || '-'}</p>
          <p><strong>Email:</strong> ${booking?.email || '-'}</p>
          <p><strong>Puja:</strong> ${pooja?.title || '-'}</p>
          <p><strong>Date/Time:</strong> ${booking?.date || '-'} ${booking?.time || ''}</p>
          <p><strong>Package:</strong> ${booking?.package || '-'}</p>
          <p><strong>Payable:</strong> ₹${booking?.paymentAmount || 0}</p>
          <p><strong>Address:</strong> ${booking?.address || '-'}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending admin booking alert email:', error);
    return false;
  }
};

const sendAdminEnquiryAlertEmail = async (enquiry) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return false;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: adminEmail,
      subject: `New Enquiry Alert: ${enquiry?.service || 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b45309;">New Enquiry Received</h2>
          <p><strong>Name:</strong> ${enquiry?.name || '-'}</p>
          <p><strong>Phone:</strong> ${enquiry?.phone || '-'}</p>
          <p><strong>Email:</strong> ${enquiry?.email || '-'}</p>
          <p><strong>Service:</strong> ${enquiry?.service || '-'}</p>
          <p><strong>Message:</strong><br/>${String(enquiry?.message || '-').replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending admin enquiry alert email:', error);
    return false;
  }
};

const sendOpsAlertEmail = async ({ title, message, metadata = {} }) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return false;

  const safeMetadata = Object.entries(metadata || {})
    .map(([key, value]) => `<li><strong>${key}:</strong> ${String(value ?? '-')}</li>`)
    .join('');

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: adminEmail,
      subject: `[CRITICAL] ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b91c1c; margin-bottom: 8px;">Critical Platform Alert</h2>
          <p style="color: #374151;"><strong>${title}</strong></p>
          <p style="color: #111827; white-space: pre-wrap;">${String(message || '').trim()}</p>
          <ul style="color: #374151;">${safeMetadata}</ul>
          <p style="color: #6b7280; font-size: 12px;">Time: ${new Date().toISOString()}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending ops alert email:', error);
    return false;
  }
};

const sendDailyOpsSummaryEmail = async (summary) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const adminEmail = process.env.ADMIN_ALERT_EMAIL || process.env.SMTP_USER;
  if (!adminEmail) return false;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: adminEmail,
      subject: `Daily Business Summary - ${summary?.dateLabel || 'Ama Puja'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b45309; margin-bottom: 12px;">Daily Business Summary</h2>
          <p style="margin: 6px 0;"><strong>Window:</strong> ${summary?.windowStart || '-'} to ${summary?.windowEnd || '-'}</p>
          <p style="margin: 6px 0;"><strong>Total Bookings:</strong> ${summary?.totalBookings ?? 0}</p>
          <p style="margin: 6px 0;"><strong>Successful Payments:</strong> ${summary?.paymentPaid ?? 0}</p>
          <p style="margin: 6px 0;"><strong>Payment Failures:</strong> ${summary?.paymentFailed ?? 0}</p>
          <p style="margin: 6px 0;"><strong>Failed Attempts (Ops):</strong> ${summary?.failedAttempts ?? 0}</p>
          <h3 style="margin-top: 18px; color: #374151;">Failure Breakdown</h3>
          <ul style="color: #374151;">
            <li><strong>Booking Create Failed:</strong> ${summary?.breakdown?.bookingCreateFailed ?? 0}</li>
            <li><strong>Payment Verification Failed:</strong> ${summary?.breakdown?.paymentVerificationFailed ?? 0}</li>
            <li><strong>Email Send Failed:</strong> ${summary?.breakdown?.emailSendFailed ?? 0}</li>
          </ul>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending daily ops summary email:', error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, token) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Ama Puja <no-reply@amapuja.com>',
      to: user.email,
      subject: 'Reset Your Ama Puja Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #b45309;">Password Reset Request 🔐</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password for your Ama Puja account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #b45309; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link to your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">This link will expire in 1 hour.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
  sendPoojaCompletionReviewEmail,
  sendPasswordResetEmail,
  sendAdminBookingAlertEmail,
  sendAdminEnquiryAlertEmail,
  sendOpsAlertEmail,
  sendDailyOpsSummaryEmail,
};
