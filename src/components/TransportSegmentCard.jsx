import { Bus, Navigation, Zap, Bike, Car } from 'lucide-react';

const icons = {
  Jeepney: <Bus size={18} />,
  Bus: <Bus size={18} />,
  'E-Jeep': <Zap size={18} />,
  Tricycle: <Bike size={18} />,
  TNVS: <Car size={18} />,
};

const colors = {
  Jeepney: '#f59e0b',
  Bus: '#3b82f6',
  'E-Jeep': '#10b981',
  Tricycle: '#8b5cf6',
  TNVS: '#ef4444',
};

export default function TransportSegmentCard({ segment, index }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: '#f8fafc', borderRadius: 10,
      padding: '12px 16px', marginBottom: 8,
      borderLeft: `4px solid ${colors[segment.vehicle] || '#64748b'}`,
    }}>
      <div style={{ color: colors[segment.vehicle], fontWeight: 700, fontSize: 13 }}>
        {String(index + 1).padStart(2, '0')}
      </div>
      <div style={{ color: colors[segment.vehicle] }}>{icons[segment.vehicle]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{segment.from} → {segment.to}</div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{segment.vehicle} · {parseFloat(segment.distance).toFixed(1)} km</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 15 }}>₱{segment.fare}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>est. fare</div>
      </div>
    </div>
  );
}