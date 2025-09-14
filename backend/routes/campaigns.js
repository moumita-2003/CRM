const express = require('express');
const axios = require('axios');
const { Campaign, Segment, Customer, CommunicationLog } = require('../models/index');
const { applyTemplate } = require('../utils/templater');

const router = express.Router();

function ensureAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'unauthenticated' });
}

// POST /api/campaigns -> create campaign, create comm log rows and enqueue sends
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, segmentId, messageTemplate } = req.body;
    const segment = await Segment.findByPk(segmentId);
    if (!segment) return res.status(400).json({ error: 'segment not found' });

    const campaign = await Campaign.create({
      name,
      segmentId,
      ownerId: req.user.id,
      messageTemplate,
      status: 'PENDING'
    });

    // find audience
    const { astToWhere } = require('../utils/ruleEvaluator');
    const where = require('../utils/ruleEvaluator').astToWhere(segment.ruleJson);
    const customers = await Customer.findAll({ where });

    // create communication_log rows and trigger sends (demo: immediate)
    for (const c of customers) {
      const comm = await CommunicationLog.create({
        campaignId: campaign.id,
        customerId: c.id,
        status: 'PENDING',
        payload: {}
      });
      // build personalized message
      const msg = applyTemplate(messageTemplate, { name: c.name, totalSpend: c.totalSpend, visits: c.visits, email: c.email });
      // call vendor simulator
      try {
        const vendorUrl = process.env.BACKEND_URL ? process.env.BACKEND_URL + '/vendor/send' : `http://localhost:${process.env.APP_PORT || 4000}/vendor/send`;
        // call vendor — vendor will callback /api/campaigns/delivery_receipt
        await axios.post(vendorUrl, {
          campaignId: campaign.id,
          commLogId: comm.id,
          customerId: c.id,
          message: msg
        }, { timeout: 5000 });
      } catch (err) {
        console.warn('vendor call failed', err.message);
      }
    }

    // update campaign status to SENT for demo
    await campaign.update({ status: 'SENT' });

    res.json({ campaignId: campaign.id, audienceSize: customers.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/campaigns/delivery_receipt (vendor uses)
router.post('/delivery_receipt', async (req, res) => {
  try {
    const { commLogId, vendorMessageId, status } = req.body;
    if (!commLogId) return res.status(400).json({ error: 'commLogId required' });

    const log = await CommunicationLog.findByPk(commLogId);
    if (!log) return res.status(404).json({ error: 'log not found' });
    await log.update({ vendorMessageId: vendorMessageId || null, status });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/campaigns -> list (with simple stats)
router.get('/', ensureAuth, async (req, res) => {
  try {
    const campaigns = await Campaign.findAll({ where: { ownerId: req.user.id }, order: [['createdAt', 'DESC']] });
    const payload = [];
    for (const c of campaigns) {
      const total = await CommunicationLog.count({ where: { campaignId: c.id } });
      const sent = await CommunicationLog.count({ where: { campaignId: c.id, status: 'SENT' } });
      const failed = await CommunicationLog.count({ where: { campaignId: c.id, status: 'FAILED' } });
      payload.push({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        audienceSize: total,
        sent, failed,
        status: c.status
      });
    }
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
