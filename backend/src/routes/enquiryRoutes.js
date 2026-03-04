const express = require('express');
const Enquiry = require('../models/Enquiry');
const { protect, adminOnly } = require('../middleware/auth');
const { sendAdminEnquiryAlertEmail } = require('../services/emailService');
const { sendEnquiryCreatedNotifications } = require('../services/notificationService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, phone, service, message } = req.body;
  const enquiry = await Enquiry.create({ name, email, phone, service, message });

  sendAdminEnquiryAlertEmail(enquiry).catch((error) => {
    console.error('Admin enquiry alert failed:', error);
  });

  sendEnquiryCreatedNotifications(enquiry)
    .then((result) => {
      console.log('Enquiry lead notification result:', result);
      if (!result?.ownerLeadWhatsAppSent) {
        console.warn('Owner WhatsApp enquiry alert not delivered. Check Twilio/WhatsApp config and sandbox status.');
      }
    })
    .catch((error) => {
      console.error('Owner WhatsApp enquiry alert failed:', error);
    });

  return res.status(201).json(enquiry);
});

router.get('/', protect, adminOnly, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ createdAt: -1 });
  return res.json(enquiries);
});

module.exports = router;
