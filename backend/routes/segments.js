const express = require('express');
const { Segment, Customer } = require('../models/index');
const { astToWhere } = require('../utils/ruleEvaluator');

const router = express.Router();

// simple auth middleware using req.user (passport session)
function ensureAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'unauthenticated' });
}

// POST /api/segments
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { name, ruleJson } = req.body;
    if (!name || !ruleJson) return res.status(400).json({ error: 'name and ruleJson required' });

    // compute audience count
    const where = astToWhere(ruleJson);
    const audienceCount = await Customer.count({ where });

    const seg = await Segment.create({
      name,
      ownerId: req.user.id,
      ruleJson,
      audienceCount
    });

    res.json({ id: seg.id, audienceCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/segments/:id/preview
router.get('/:id/preview', ensureAuth, async (req, res) => {
  try {
    const seg = await Segment.findByPk(req.params.id);
    if (!seg) return res.status(404).json({ error: 'segment not found' });
    const where = astToWhere(seg.ruleJson);
    const customers = await Customer.findAll({ where, limit: 20 });
    res.json({ audienceCount: seg.audienceCount, sample: customers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
