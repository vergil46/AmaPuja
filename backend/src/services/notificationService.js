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
    console.warn('Twilio message skipped due to missing config/params', {
      hasAccountSid: Boolean(accountSid),
      hasAuthToken: Boolean(authToken),
      hasFrom: Boolean(from),
      hasTo: Boolean(to),
      hasBody: Boolean(body),
    });
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

const getAdminWhatsAppTo = () => {
  const configured = String(process.env.ADMIN_WHATSAPP_TO || '').trim();
  if (!configured) return '';

  if (configured.startsWith('whatsapp:')) {
    return configured;
  }

  const normalized = normalizePhone(configured);
  if (!normalized) return '';

  return `whatsapp:${normalized}`;
};

const sendOwnerLeadWhatsAppAlert = async ({ type, name, phone, email, service, details }) => {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  const to = getAdminWhatsAppTo();

  if (!from || !to) {
    console.warn('Owner WhatsApp alert skipped due to missing WhatsApp route config', {
      hasTwilioWhatsAppFrom: Boolean(from),
      hasAdminWhatsAppTo: Boolean(to),
    });
    return false;
  }

  const lines = [
    '🔔 New Lead Alert - Puja Samriddhi',
    `Type: ${String(type || 'Lead')}`,
    `Name: ${String(name || '-').trim() || '-'}`,
    `Phone: ${String(phone || '-').trim() || '-'}`,
    `Email: ${String(email || '-').trim() || '-'}`,
    `Service: ${String(service || '-').trim() || '-'}`,
    details ? `Details: ${String(details).trim()}` : '',
    `Time: ${new Date().toLocaleString('en-IN')}`,
  ].filter(Boolean);

  return sendTwilioMessage({
    from,
    to,
    body: lines.join('\n'),
  });
};

const sendBookingCreatedNotifications = async ({ booking, pooja }) => {
  const phone = normalizePhone(booking.phone);
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  const smsBody = `Puja Samriddhi: Booking received for ${pooja.title} on ${booking.date} at ${booking.time}. Amount: Rs ${booking.paymentAmount}.`; 
  const whatsappBody = `Namaste ${booking.name}, your booking for ${pooja.title} is received on Puja Samriddhi. Date: ${booking.date}, Time: ${booking.time}. Track details in your dashboard.`;

  const [emailSent, adminAlertSent, smsSent, whatsappSent, ownerLeadWhatsAppSent] = await Promise.all([
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
    sendOwnerLeadWhatsAppAlert({
      type: 'Booking',
      name: booking?.name,
      phone: booking?.phone,
      email: booking?.email,
      service: pooja?.title || booking?.package,
      details: `${booking?.date || '-'} ${booking?.time || ''} | ${booking?.city || '-'}`.trim(),
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

  return { emailSent, adminAlertSent, smsSent, whatsappSent, ownerLeadWhatsAppSent, reviewUrl };
};

const sendEnquiryCreatedNotifications = async (enquiry) => {
  const ownerLeadWhatsAppSent = await sendOwnerLeadWhatsAppAlert({
    type: 'Enquiry',
    name: enquiry?.name,
    phone: enquiry?.phone,
    email: enquiry?.email,
    service: enquiry?.service,
    details: enquiry?.message,
  });

  return {
    ownerLeadWhatsAppSent,
  };
};

const sendCompletionReviewNotifications = async ({ booking, pooja }) => {
  const phone = normalizePhone(booking.phone);
  const poojaTitle = pooja?.title || 'your pooja';
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?reviewBooking=${booking._id}#feedback`;

  const smsBody = `Puja Samriddhi: Your ${poojaTitle} booking is marked completed. Please share your review: ${reviewUrl}`;
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

const sendTestTwilioNotifications = async ({ to, body }) => {
  const normalizedTo = String(to || '').trim();
  const messageBody = String(body || '').trim() || 'Twilio test message from Puja Samriddhi';

  if (!normalizedTo) {
    return {
      ok: false,
      message: 'Missing destination number',
      smsSent: false,
      whatsappSent: false,
    };
  }

  const isWhatsApp = normalizedTo.toLowerCase().startsWith('whatsapp:');
  const destination = isWhatsApp ? normalizedTo : normalizePhone(normalizedTo);

  const smsFrom = String(process.env.TWILIO_SMS_FROM || '').trim();
  const whatsappFrom = String(process.env.TWILIO_WHATSAPP_FROM || '').trim();
  const smsTo = isWhatsApp ? '' : destination;
  const whatsappTo = isWhatsApp ? destination : `whatsapp:${destination}`;

  const smsSent = isWhatsApp
    ? false
    : await sendTwilioMessage({
        from: smsFrom,
        to: smsTo,
        body: messageBody,
      });

  const whatsappSent = await sendTwilioMessage({
    from: whatsappFrom,
    to: whatsappTo,
    body: messageBody,
  });

  return {
    ok: smsSent || whatsappSent,
    smsSent,
    whatsappSent,
    destination,
    smsTo,
    whatsappTo,
    isWhatsAppDestination: isWhatsApp,
    hasSmsFrom: Boolean(smsFrom),
    hasWhatsAppFrom: Boolean(whatsappFrom),
  };
};

module.exports = {
  sendBookingCreatedNotifications,
  sendCompletionReviewNotifications,
  sendEnquiryCreatedNotifications,
  sendTestTwilioNotifications,
};

