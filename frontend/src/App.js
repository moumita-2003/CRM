import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import SegmentBuilder from './pages/SegmentBuilder';
import Campaigns from './pages/Campaigns';
import CampaignNew from './pages/CampaignNew';
import { getMe } from './api';

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    getMe().then(r => setUser(r.user)).catch(() => setUser(null));
  }, []);
  return (
    <BrowserRouter>
      <div style={{ padding: 16 }}>
        <header style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Link to="/">Home</Link>
          <Link to="/segments/new">New Segment</Link>
          <Link to="/campaigns">Campaigns</Link>
          {user ? <span>Hi, {user.name}</span> : <Link to="/login">Login</Link>}
        </header>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/segments/new" element={<SegmentBuilder />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/new" element={<CampaignNew />} />
          <Route path="/" element={<div><h2>Welcome</h2><p>Use the nav to get started.</p></div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
