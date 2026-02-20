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

module.exports = {
  generateVerificationToken,
  sendVerificationEmail,
  sendBookingConfirmationEmail,
};
