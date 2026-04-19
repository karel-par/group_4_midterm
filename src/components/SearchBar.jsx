import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ placeholder, onSearch }) {
  const [value, setValue] = useState('');

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); onSearch(e.target.value); }}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px 10px 36px',
          borderRadius: 8, border: '1.5px solid #e2e8f0',
          fontSize: 14, outline: 'none', boxSizing: 'border-box',
          transition: 'border .2s',
        }}
        onFocus={e => e.target.style.borderColor = '#2563eb'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  );
}