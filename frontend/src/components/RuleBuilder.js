import React, { useState } from 'react';

const fields = [
  { value: 'total_spend', label: 'Total Spend' },
  { value: 'visits', label: 'Visits' },
  { value: 'last_visit', label: 'Last Visit (YYYY-MM-DD)' }
];
const ops = ['>', '<', '>=', '<=', '='];

export default function RuleBuilder({ onChange }) {
  const [rows, setRows] = useState([{ field: 'total_spend', operator: '>', value: '10000' }]);
  const [opJoin, setOpJoin] = useState('AND');

  function updateRow(i, partial) {
    const copy = rows.slice();
    copy[i] = { ...copy[i], ...partial };
    setRows(copy);
    emit(copy, opJoin);
  }
  function emit(r, join) {
    const ast = { op: join, children: r.map(x => ({ field: x.field, operator: x.operator, value: x.value })) };
    onChange && onChange(ast);
  }
  function addRow() {
    const copy = rows.concat([{ field: 'total_spend', operator: '>', value: '' }]);
    setRows(copy);
    emit(copy, opJoin);
  }
  function removeRow(i) {
    const copy = rows.slice();
    copy.splice(i,1);
    setRows(copy);
    emit(copy, opJoin);
  }
  return (
    <div>
      <label>Join conditions with:
        <select value={opJoin} onChange={e => { setOpJoin(e.target.value); emit(rows, e.target.value); }}>
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>
      </label>
      {rows.map((r, i) => (
        <div key={i} style={{ display:'flex', gap:8, marginTop:8 }}>
          <select value={r.field} onChange={e => updateRow(i, { field: e.target.value })}>
            {fields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select value={r.operator} onChange={e => updateRow(i, { operator: e.target.value })}>
            {ops.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <input value={r.value} onChange={e => updateRow(i, { value: e.target.value })} placeholder="value"/>
          <button onClick={() => removeRow(i)}>Remove</button>
        </div>
      ))}
      <div style={{ marginTop:8 }}>
        <button onClick={addRow}>Add condition</button>
      </div>
    </div>
  );
}
