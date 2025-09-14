const express = require('express');
const { Customer, Order } = require('../models/index');
const router = express.Router();

// POST /api/ingest/customers
router.post('/customers', async (req, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers)) return res.status(400).json({ error: 'customers array required' });

    const results = { accepted: 0, rejected: [] };
    for (const c of customers) {
      try {
        const [cust, created] = await Customer.findOrCreate({
          where: { customerId: c.customer_id || c.customerId },
          defaults: {
            customerId: c.customer_id || c.customerId,
            name: c.name,
            email: c.email,
            phone: c.phone,
            lastVisit: c.last_visit || c.lastVisit,
            totalSpend: c.total_spend || c.totalSpend || 0,
            visits: c.visits || 0,
            metadata: c.metadata || {}
          }
        });
        if (!created) {
          // update some fields
          await cust.update({
            name: c.name || cust.name,
            email: c.email || cust.email,
            phone: c.phone || cust.phone,
            lastVisit: c.last_visit || cust.lastVisit,
            totalSpend: c.total_spend || cust.totalSpend,
            visits: c.visits || cust.visits
          });
        }
        results.accepted++;
      } catch (err) {
        results.rejected.push({ customer: c, error: err.message });
      }
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ingest/orders
router.post('/orders', async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) return res.status(400).json({ error: 'orders array required' });

    const results = { accepted: 0, rejected: [] };
    for (const o of orders) {
      try {
        // find customer
        const cust = await Customer.findOne({ where: { customerId: o.customer_id || o.customerId } });
        const createdOrder = await Order.create({
          orderId: o.order_id || o.orderId,
          customerId: cust ? cust.id : null,
          amount: o.amount,
          items: o.items,
          createdAtCustom: o.created_at || new Date()
        });
        // update customer aggregates
        if (cust) {
          const newTotal = parseFloat(cust.totalSpend || 0) + parseFloat(o.amount || 0);
          await cust.update({ totalSpend: newTotal, visits: (cust.visits || 0) + 1, lastVisit: o.created_at || new Date() });
        }
        results.accepted++;
      } catch (err) {
        results.rejected.push({ order: o, error: err.message });
      }
    }
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
