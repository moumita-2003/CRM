const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

router.post('/send', async (req, res) => {
  try {
    const { campaignId, commLogId, customerId, message } = req.body;
    // simulate async delivery
    setTimeout(async () => {
      const success = Math.random() < 0.9 ? 'SENT' : 'FAILED';
      const vendorMessageId = uuidv4();
      // Post back to backend delivery receipt
      try {
        const backendReceipt = (process.env.BACKEND_URL || `http://localhost:${process.env.APP_PORT || 4000}`) + '/api/campaigns/delivery_receipt';
        await axios.post(backendReceipt, {
          commLogId,
          vendorMessageId,
          status: success
        });
      } catch (err) {
        console.error('failed to post delivery receipt', err.message);
      }
    }, Math.random() * 1500); // jitter

    res.json({ ok: true, queued: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
