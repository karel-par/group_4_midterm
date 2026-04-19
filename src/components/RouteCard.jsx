import { useNavigate } from 'react-router-dom';
import { Clock, MapPin, PhilippinePeso } from 'lucide-react';

export default function RouteCard({ route }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/item/${route.id}`)}
      style={{
        background: '#fff', borderRadius: 12, padding: 18,
        boxShadow: '0 2px 8px rgba(0,0,0,.07)', cursor: 'pointer',
        border: '1.5px solid #e2e8f0', transition: 'box-shadow .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.07)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>{route.origin} → {route.destination}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', gap: 12 }}>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={12} />{route.distance} km</span>
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Clock size={12} />{route.duration} min</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: '#2563eb', fontSize: 16 }}>₱{route.totalFare}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>est. total</div>
        </div>
      </div>
    </div>
  );
}