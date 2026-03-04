const {
  sendBookingConfirmationEmail,
  sendPoojaCompletionReviewEmail,
  sendAdminBookingAlertEmail,
} = require('./emailService');
const { alertCriticalIssue } = require('./monitoringService');

const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
};

const sendTwilioMessage = async ({ from, to, body }) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken || !from || !to || !body) {
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const payload = new URLSearchParams({
      From: from,
      To: to,
      Body: body,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`Twilio message failed (${response.status}): ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Twilio message error:', error);
    return false;
  }
};

const sendBookingCreatedNotifications = async ({ booking, pooja }) => {
  const phone = normalizePhone(booking.phone);
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  const smsBody = `Ama Puja: Booking received for ${pooja.title} on ${booking.date} at ${booking.time}. Amount: Rs ${booking.paymentAmount}.`; 
  const whatsappBody = `Namaste ${booking.name}, your booking for ${pooja.title} is received on Ama Puja. Date: ${booking.date}, Time: ${booking.time}. Track details in your dashboard.`;

  const [emailSent, adminAlertSent, smsSent, whatsappSent] = await Promise.all([
    sendBookingConfirmationEmail(booking, pooja),
    sendAdminBookingAlertEmail(booking, pooja),
    sendTwilioMessage({
      from: process.env.TWILIO_SMS_FROM,
      to: phone,
      body: smsBody,
    }),
    sendTwilioMessage({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: whatsappBody,
    }),
  ]);

  if (!emailSent) {
    await alertCriticalIssue({
      type: 'email_send_failed',
      title: 'Booking confirmation email failed',
      message: 'Customer booking confirmation email could not be sent',
      metadata: {
        bookingId: booking?._id,
        bookingEmail: booking?.email,
        poojaTitle: pooja?.title,
      },
    });
  }

  return { emailSent, adminAlertSent, smsSent, whatsappSent, reviewUrl };
};

const sendCompletionReviewNotifications = async ({ booking, pooja }) => {
  const phone = normalizePhone(booking.phone);
  const poojaTitle = pooja?.title || 'your pooja';
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?reviewBooking=${booking._id}#feedback`;

  const smsBody = `Ama Puja: Your ${poojaTitle} booking is marked completed. Please share your review: ${reviewUrl}`;
  const whatsappBody = `Namaste ${booking.name}, we hope your ${poojaTitle} went well. Please share your review here: ${reviewUrl}`;

  const [emailSent, smsSent, whatsappSent] = await Promise.all([
    sendPoojaCompletionReviewEmail(booking, pooja, reviewUrl),
    sendTwilioMessage({
      from: process.env.TWILIO_SMS_FROM,
      to: phone,
      body: smsBody,
    }),
    sendTwilioMessage({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${phone}`,
      body: whatsappBody,
    }),
  ]);

  if (!emailSent) {
    await alertCriticalIssue({
      type: 'email_send_failed',
      title: 'Completion review email failed',
      message: 'Review request email could not be sent after pooja completion',
      metadata: {
        bookingId: booking?._id,
        bookingEmail: booking?.email,
        poojaTitle,
      },
    });
  }

  return { emailSent, smsSent, whatsappSent };
};

module.exports = {
  sendBookingCreatedNotifications,
  sendCompletionReviewNotifications,
};
