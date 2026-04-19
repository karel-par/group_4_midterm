import { useState } from 'react';
import { useGetReportsQuery, useCreateReportMutation, useGetStrikesQuery } from '../services/apiSlice';
import { AlertTriangle, Plus, X } from 'lucide-react';
import Pagination from '../components/Pagination';

const CATEGORIES = ['overcharging', 'rude driver', 'unsafe driving', 'route disruption', 'strike'];
const PAGE_SIZE = 3;

export default function Reports() {
  const { data: reports = [] } = useGetReportsQuery();
  const { data: strikes = [] } = useGetStrikesQuery();
  const [createReport] = useCreateReportMutation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'overcharging', description: '', location: '' });
  const [submitted, setSubmitted] = useState(false);

  const filtered = reports.filter(r =>
    r.category.toLowerCase().includes(search.toLowerCase()) ||
    r.location.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSubmit = async () => {
    if (!form.description || !form.location) return;
    await createReport(form);
    setSubmitted(true);
    setShowForm(false);
    setForm({ category: 'overcharging', description: '', location: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  const badgeColor = { active: '#ef4444', resolved: '#10b981', open: '#f59e0b' };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>Transport Reports</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Community reports on transport issues across CALABARZON</p>

      {submitted && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 14, marginBottom: 16, color: '#166534', fontWeight: 600 }}>
          Report submitted successfully!
        </div>
      )}

      {/* STRIKES */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#1e293b', display: 'flex', gap: 8, alignItems: 'center' }}>
          <AlertTriangle size={18} color="#ef4444" /> Active Transport Strikes
        </h2>
        {strikes.map(s => (
          <div key={s.id} style={{ background: s.status === 'active' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${s.status === 'active' ? '#fecaca' : '#86efac'}`, borderRadius: 10, padding: 16, marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>{s.reason}</span>
              <span style={{ background: badgeColor[s.status], color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{s.status.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Provinces: {s.affectedProvinces.join(', ')}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Routes: {s.affectedRoutes.join(' | ')}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.date}</div>
          </div>
        ))}
      </div>

      {/* REPORTS LIST */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <input placeholder="Search by category or location..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 13, width: 280, outline: 'none' }}
        />
        <button onClick={() => setShowForm(true)}
          style={{ display: 'flex', gap: 6, alignItems: 'center', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <Plus size={16} /> Submit Report
        </button>
      </div>

      {paginated.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No reports found.</div>
      )}

      {paginated.map(r => (
        <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,.06)', border: '1.5px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, textTransform: 'capitalize' }}>{r.category}</span>
            <span style={{ background: badgeColor[r.status] || '#94a3b8', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>{r.status.toUpperCase()}</span>
          </div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 4 }}>{r.description}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{r.location} · {r.date}</div>
        </div>
      ))}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}

      {/* MODAL FORM */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 420, position: 'relative' }}>
            <button onClick={() => setShowForm(false)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 18 }}>Submit a Report</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Category</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 12, marginTop: 4, fontSize: 13 }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Calamba, Laguna"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 12, marginTop: 4, fontSize: 13, boxSizing: 'border-box' }} />
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the incident..."
              rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', marginBottom: 16, marginTop: 4, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
            <button onClick={handleSubmit}
              style={{ width: '100%', padding: 12, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}