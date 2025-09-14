const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

let openai = null;
if (process.env.OPENAI_API_KEY) {
  const conf = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  openai = new OpenAIApi(conf);
}

router.post('/parse_segment', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  // If no API key, return a naive mock (for local demos)
  if (!openai) {
    // Very naive mapping: looks for numbers and 'months'/'days'
    let months = (text.match(/(\d+)\s*months?/) || [])[1];
    months = months ? Number(months) : 6;
    let amount = (text.match(/(\d+)[, ]*₹?/) || [])[1];
    amount = amount ? Number(amount) : 5000;
    // Build AST: last_visit < (now - months)
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    const ast = {
      op: 'AND',
      children: [
        { field: 'last_visit', operator: '<', value: date.toISOString().slice(0,10) },
        { field: 'total_spend', operator: '>', value: amount }
      ]
    };
    return res.json({ ast });
  }

  // Real call to OpenAI: we craft a prompt that returns strict JSON.
  try {
    const system = `You are a strict translator: convert plain English into a JSON AST with keys: op (AND/OR), children (list). Leaf nodes must be { "field": "total_spend"|"visits"|"last_visit", "operator": ">"|"<"|">="|"<="|"=", "value": number|string }. Respond WITH ONLY JSON. Example: "users not active 90 days and >10000" -> {"op":"AND","children":[{"field":"last_visit","operator":"<","value":"2025-06-01"},{"field":"total_spend","operator":">","value":10000}]}`;
    const user = `Text: "${text}"\nNow output JSON AST only.`;
    const resp = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_tokens: 300,
      temperature: 0
    });
    const raw = resp.data.choices[0].message.content;
    const ast = JSON.parse(raw);
    return res.json({ ast });
  } catch (err) {
    console.error('openai error', err.message);
    res.status(500).json({ error: 'AI parse error', details: err.message });
  }
});

router.post('/message_suggestions', async (req, res) => {
  const { objective, tone, offer } = req.body;
  if (!openai) {
    return res.json({
      suggestions: [
        `Hi {{name}}, ${offer || '10% off'} — come back and enjoy shopping with us!`,
        `Hey {{name}} — we miss you! Take ${offer || '10% off'} on your next order.`
      ]
    });
  }
  try {
    const prompt = `Generate 3 short message variants for a campaign. Objective: ${objective}. Tone: ${tone || 'friendly'}. Offer: ${offer || '10% off'}. Use personalization token {{name}}. Output a JSON array of strings.`;
    const resp = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.8
    });
    const out = resp.data.choices[0].message.content;
    const suggestions = JSON.parse(out);
    res.json({ suggestions });
  } catch (err) {
    console.error('ai suggestions error', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
