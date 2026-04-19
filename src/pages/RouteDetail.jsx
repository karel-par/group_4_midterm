import { useParams, useNavigate } from 'react-router-dom';
import { useGetRouteByIdQuery } from '../services/apiSlice';
import RouteMap from '../components/RouteMap';
import TransportSegmentCard from '../components/TransportSegmentCard';
import { segmentRoute } from '../utils/transportSegmenter';
import { ArrowLeft } from 'lucide-react';

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: route, isLoading } = useGetRouteByIdQuery(id);

  if (isLoading) return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading route details...</div>;
  if (!route) return <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>Route not found.</div>;

  const segments = segmentRoute(route.distance, route.origin, route.destination);
  const totalFare = segments.reduce((sum, s) => sum + s.fare, 0);
  const coords = route.geometry?.coordinates || [];
  const originCoords = coords.length ? [coords[0][1], coords[0][0]] : [14.2116, 121.1653];
  const destCoords = coords.length ? [coords[coords.length - 1][1], coords[coords.length - 1][0]] : [14.4791, 121.0251];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontWeight: 600, marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>{route.origin} → {route.destination}</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Route ID: {route.id}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Distance', value: `${route.distance} km` },
          { label: 'Duration', value: `${route.duration} min` },
          { label: 'Total Fare', value: `₱${totalFare}` },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#2563eb' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Route Map</h3>
        <RouteMap originCoords={originCoords} destCoords={destCoords} geometry={route.geometry} originName={route.origin} destName={route.destination} />
      </div>

      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Transport Segments</h3>
        {segments.map((seg, i) => <TransportSegmentCard key={i} segment={seg} index={i} />)}
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1.5px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 700 }}>Total Fare</span>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#2563eb' }}>₱{totalFare}</span>
        </div>
      </div>
    </div>
  );
}