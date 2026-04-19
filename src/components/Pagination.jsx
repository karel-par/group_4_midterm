import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const btnStyle = (active, disabled) => ({
    padding: '7px 13px', borderRadius: 7, border: '1.5px solid #e2e8f0',
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : disabled ? '#cbd5e1' : '#1e293b',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, fontSize: 14,
  });

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
      <button style={btnStyle(false, currentPage === 1)} disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft size={16} />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} style={btnStyle(p === currentPage, false)} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      <button style={btnStyle(false, currentPage === totalPages)} disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}