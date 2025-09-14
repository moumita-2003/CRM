import React, { useState } from 'react';
import RuleBuilder from '../components/RuleBuilder';
import { parseSegment, createSegment, previewSegment } from '../api';

export default function SegmentBuilder() {
  const [ast, setAst] = useState(null);
  const [name, setName] = useState('');
  const [preview, setPreview] = useState(null);
  const [nl, setNl] = useState('');

  async function handleNLParse() {
    if (!nl) return;
    const resp = await parseSegment(nl);
    setAst(resp.ast);
  }
  async function handleCreate() {
    const res = await createSegment({ name, ruleJson: ast });
    setPreview({ message: `Segment created (id ${res.id}). Audience ${res.audienceCount}`});
  }
  async function handlePreview() {
    if (!ast) return alert('no AST');
    // For demo: create a temp segment and preview isn't available unless saved,
    // but we can call a backend preview via creating segment or send ast to a preview endpoint (not implemented).
    alert('Preview available after saving; or use saved segment preview.');
  }

  return (
    <div>
      <h2>Create segment</h2>
      <div>
        <label>Segment name<input value={name} onChange={e=>setName(e.target.value)} /></label>
      </div>
      <div style={{ marginTop:12 }}>
        <h4>Rule builder</h4>
        <RuleBuilder onChange={setAst} />
      </div>
      <div style={{ marginTop:12 }}>
        <h4>Or type natural language</h4>
        <input value={nl} onChange={e=>setNl(e.target.value)} placeholder="e.g. users inactive 6 months and spent > ₹5k" style={{ width:400 }} />
        <button onClick={handleNLParse}>Convert</button>
      </div>
      <div style={{ marginTop:12 }}>
        <pre>{JSON.stringify(ast, null, 2)}</pre>
      </div>
      <div style={{ marginTop:12 }}>
        <button onClick={handleCreate}>Save segment</button>
      </div>
      <div style={{ marginTop:12 }}>{preview && <div>{preview.message}</div>}</div>
    </div>
  );
}
