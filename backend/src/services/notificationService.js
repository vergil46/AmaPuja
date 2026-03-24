const {
  sendBookingConfirmationEmail,
  sendPoojaCompletionReviewEmail,
  sendAdminBookingAlertEmail,
} = require('./emailService');
const { alertCriticalIssue } = require('./monitoringService');
const https = require('https');

const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
};

const normalizeWhatsAppAddress = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  if (raw.startsWith('whatsapp:')) {
    const normalized = normalizePhone(raw.slice('whatsapp:'.length));
    return normalized ? `whatsapp:${normalized}` : '';
  }

  const normalized = normalizePhone(raw);
  return normalized ? `whatsapp:${normalized}` : '';
};

const maskPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length <= 4) return value;
  return `${digits.slice(0, 2)}******${digits.slice(-2)}`;
};

const sendWithHttpsFallback = (url, authHeader, payload) => {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = '';
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            status: response.statusCode || 500,
            text: async () => body,
          });
        });
      }
    );

    request.on('error', reject);
    request.write(payload);
    request.end();
  });
};

const sendTwilioMessage = async ({ from, to, body }) => {
  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || '').trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || '').trim();
  const resolvedFrom = String(from || '').trim();
  const resolvedTo = String(to || '').trim();
  const resolvedBody = String(body || '').trim();

  if (!accountSid || !authToken || !resolvedFrom || !resolvedTo || !resolvedBody) {
    console.warn('Twilio message skipped due to missing config/params', {
      hasAccountSid: Boolean(accountSid),
      hasAuthToken: Boolean(authToken),
      hasFrom: Boolean(resolvedFrom),
      hasTo: Boolean(resolvedTo),
      hasBody: Boolean(resolvedBody),
    });
    return false;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  try {
    const payload = new URLSearchParams({
      From: resolvedFrom,
      To: resolvedTo,
      Body: resolvedBody,
    });

    const response =
      typeof fetch === 'function'
        ? await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${authHeader}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: payload,
          })
        : await sendWithHttpsFallback(url, authHeader, payload.toString());

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = null;

      try {
        parsedError = JSON.parse(errorText);
      } catch {
        parsedError = null;
      }

      console.warn('Twilio message failed', {
        status: response.status,
        code: parsedError?.code,
        message: parsedError?.message || errorText,
        moreInfo: parsedError?.more_info,
        from: maskPhone(resolvedFrom),
        to: maskPhone(resolvedTo),
      });
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
  return normalizeWhatsAppAddress(configured);
};

const sendOwnerLeadWhatsAppAlert = async ({ type, name, phone, email, service, details }) => {
  const from = normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM);
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
  const whatsappTo = normalizeWhatsAppAddress(phone);
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  const smsBody = `Puja Samriddhi: Booking received for ${pooja.title} on ${booking.date} at ${booking.time}. Amount: Rs ${booking.paymentAmount}.`; 
  const whatsappBody = `Namaste ${booking.name}, your booking for ${pooja.title} is received on Puja Samriddhi. Date: ${booking.date}, Time: ${booking.time}. Track details in your dashboard.`;

  const [emailSent, adminAlertSent, smsSent, whatsappSent, ownerLeadWhatsAppSent] = await Promise.all([
    sendBookingConfirmationEmail(booking, pooja),
    sendAdminBookingAlertEmail(booking, pooja),
    sendTwilioMessage({
      from: String(process.env.TWILIO_SMS_FROM || '').trim(),
      to: phone,
      body: smsBody,
    }),
    sendTwilioMessage({
      from: normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM),
      to: whatsappTo,
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
  const whatsappTo = normalizeWhatsAppAddress(phone);
  const poojaTitle = pooja?.title || 'your pooja';
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard?reviewBooking=${booking._id}#feedback`;

  const smsBody = `Puja Samriddhi: Your ${poojaTitle} booking is marked completed. Please share your review: ${reviewUrl}`;
  const whatsappBody = `Namaste ${booking.name}, we hope your ${poojaTitle} went well. Please share your review here: ${reviewUrl}`;

  const [emailSent, smsSent, whatsappSent] = await Promise.all([
    sendPoojaCompletionReviewEmail(booking, pooja, reviewUrl),
    sendTwilioMessage({
      from: String(process.env.TWILIO_SMS_FROM || '').trim(),
      to: phone,
      body: smsBody,
    }),
    sendTwilioMessage({
      from: normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM),
      to: whatsappTo,
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
  const smsTo = normalizePhone(to);
  const whatsappTo = normalizeWhatsAppAddress(to);
  const smsFrom = String(process.env.TWILIO_SMS_FROM || '').trim();
  const whatsappFrom = normalizeWhatsAppAddress(process.env.TWILIO_WHATSAPP_FROM);

  const message = String(body || '').trim() || `Puja Samriddhi Twilio test at ${new Date().toISOString()}`;

  const [smsSent, whatsappSent] = await Promise.all([
    sendTwilioMessage({
      from: smsFrom,
      to: smsTo,
      body: message,
    }),
    sendTwilioMessage({
      from: whatsappFrom,
      to: whatsappTo,
      body: message,
    }),
  ]);

  return {
    smsSent,
    whatsappSent,
    smsTo,
    whatsappTo,
    smsFromConfigured: Boolean(smsFrom),
    whatsappFromConfigured: Boolean(whatsappFrom),
  };
};

module.exports = {
  sendBookingCreatedNotifications,
  sendCompletionReviewNotifications,
  sendEnquiryCreatedNotifications,
  sendTestTwilioNotifications,
};

