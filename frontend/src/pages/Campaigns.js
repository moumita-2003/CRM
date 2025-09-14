import React, { useEffect, useState } from 'react';
import { getCampaigns } from '../api';
import { Link } from 'react-router-dom';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    getCampaigns().then(setCampaigns).catch(()=>setCampaigns([]));
  }, []);
  return (
    <div>
      <h2>Campaigns</h2>
      <Link to="/campaigns/new">Create new</Link>
      <table border="1" cellPadding="6" style={{ marginTop:12 }}>
        <thead><tr><th>Name</th><th>Audience</th><th>Sent</th><th>Failed</th><th>Created</th></tr></thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.audienceSize}</td>
              <td>{c.sent}</td>
              <td>{c.failed}</td>
              <td>{new Date(c.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
