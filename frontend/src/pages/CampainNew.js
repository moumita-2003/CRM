import React, { useState } from 'react';
import { getMessageSuggestions, createCampaign } from '../api';

export default function CampaignNew() {
  const [segmentId, setSegmentId] = useState('');
  const [objective, setObjective] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [template, setTemplate] = useState('');

  async function handleSuggest() {
    const res = await getMessageSuggestions({ objective, tone: 'friendly', offer: '10% off' });
    setSuggestions(res.suggestions || []);
  }

  async function handleCreate() {
    const res = await createCampaign({ name: 'Campaign ' + Date.now(), segmentId: Number(segmentId), messageTemplate: template });
    alert(`Campaign created: ${res.campaignId}, audience ${res.audienceSize}`);
  }

  return (
    <div>
      <h2>New Campaign</h2>
      <div>
        <label>Segment ID <input value={segmentId} onChange={e=>setSegmentId(e.target.value)} /></label>
      </div>
      <div>
        <label>Objective <input value={objective} onChange={e=>setObjective(e.target.value)} /></label>
        <button onClick={handleSuggest}>Get message suggestions</button>
      </div>
      <div>
        <h4>Suggestions</h4>
        <ul>
          {suggestions.map((s,i)=>(
            <li key={i}>
              <div>{s}</div>
              <button onClick={()=>setTemplate(s)}>Use</button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h4>Template</h4>
        <textarea value={template} onChange={e=>setTemplate(e.target.value)} style={{ width:500, height:80 }} />
      </div>
      <div>
        <button onClick={handleCreate}>Create & Send Campaign</button>
      </div>
    </div>
  );
}
