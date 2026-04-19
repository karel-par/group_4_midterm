import { useState } from 'react';
import { useGetLocationsQuery, useGetRouteQuery } from '../services/apiSlice';
import RouteMap from '../components/RouteMap';
import TransportSegmentCard from '../components/TransportSegmentCard';
import { segmentRoute } from '../utils/transportSegmenter';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';

const PROVINCES = ['Calamba, Laguna', 'Sta. Rosa, Laguna', 'Batangas City', 'Lucena City, Quezon', 'Antipolo, Rizal', 'Tagaytay, Cavite', 'Lipa, Batangas', 'Dasmariñas, Cavite'];

export default function Home() {
  const [origin, setOrigin] = useState('');
  const [dest, setDest] = useState('');
  const [searchOrigin, setSearchOrigin] = useState('');
  const [searchDest, setSearchDest] = useState('');
  const [originCoords, setOriginCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeTriggered, setRouteTriggered] = useState(false);

  const { data: originSuggestions } = useGetLocationsQuery(searchOrigin, { skip: searchOrigin.length < 2 });
  const { data: destSuggestions } = useGetLocationsQuery(searchDest, { skip: searchDest.length < 2 });
  const { data: routeData, isLoading, isError } = useGetRouteQuery(
    { originCoords, destCoords },
    { skip: !routeTriggered || !originCoords || !destCoords }
  );

  const segments = routeData ? segmentRoute(routeData.distance, origin, dest) : [];
  const totalFare = segments.reduce((sum, s) => sum + s.fare, 0);

  const inputStyle = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1.5px solid #e2e8f0', fontSize: 14,
    boxSizing: 'border-box', outline: 'none',
  };

  const selectLocation = (name, lat, lon, type) => {
    if (type === 'origin') {
      setOrigin(name); setSearchOrigin('');
      setOriginCoords([parseFloat(lat), parseFloat(lon)]);
    } else {
      setDest(name); setSearchDest('');
      setDestCoords([parseFloat(lat), parseFloat(lon)]);
    }
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
        Route Planner
      </h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Find the best commute routes across CALABARZON</p>

      {/* INPUT SECTION */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.07)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* ORIGIN */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <MapPin size={14} color="#10b981" /> Origin
            </label>
            <input value={origin || searchOrigin} placeholder="e.g. Calamba, Laguna"
              style={inputStyle}
              onChange={e => { setSearchOrigin(e.target.value); setOrigin(''); setOriginCoords(null); }}
            />
            {originSuggestions?.length > 0 && !originCoords && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
                {originSuggestions.map(s => (
                  <div key={s.place_id} onClick={() => selectLocation(s.display_name, s.lat, s.lon, 'origin')}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DESTINATION */}
          <div style={{ position: 'relative' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
              <MapPin size={14} color="#ef4444" /> Destination
            </label>
            <input value={dest || searchDest} placeholder="e.g. Tagaytay, Cavite"
              style={inputStyle}
              onChange={e => { setSearchDest(e.target.value); setDest(''); setDestCoords(null); }}
            />
            {destSuggestions?.length > 0 && !destCoords && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,.1)' }}>
                {destSuggestions.map(s => (
                  <div key={s.place_id} onClick={() => selectLocation(s.display_name, s.lat, s.lon, 'dest')}
                    style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f1f5f9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                  >
                    {s.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* QUICK SELECT */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>Quick select locations:</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {PROVINCES.map(p => (
              <button key={p} onClick={() => { setSearchOrigin(p); setOrigin(''); setOriginCoords(null); }}
                style={{ padding: '5px 10px', fontSize: 11, borderRadius: 20, border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', color: '#475569' }}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => setRouteTriggered(true)} disabled={!originCoords || !destCoords}
          style={{
            width: '100%', padding: '12px', background: originCoords && destCoords ? '#2563eb' : '#94a3b8',
            color: '#fff', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 15,
            cursor: originCoords && destCoords ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
          <Navigation size={18} /> Find Route
        </button>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          Computing route via OpenRouteService...
        </div>
      )}

      {/* ERROR */}
      {isError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <span style={{ color: '#b91c1c', fontSize: 14 }}>Route computation failed. Showing mock data instead.</span>
        </div>
      )}

      {/* RESULTS */}
      {routeData && (
        <>
          {/* SUMMARY */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Distance', value: `${routeData.distance} km`, color: '#3b82f6' },
              { label: 'Travel Time', value: `${routeData.duration} min`, color: '#10b981' },
              { label: 'Est. Total Fare', value: `₱${totalFare}`, color: '#f59e0b' },
            ].map(stat => (
              <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,.06)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* MAP */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Route Map</h3>
            <RouteMap
              originCoords={originCoords}
              destCoords={destCoords}
              geometry={routeData.geometry}
              originName={origin}
              destName={dest}
            />
          </div>

          {/* SEGMENTS */}
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Transport Segments</h3>
            {segments.map((seg, i) => <TransportSegmentCard key={i} segment={seg} index={i} />)}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1.5px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: '#1e293b' }}>Total Estimated Fare</span>
              <span style={{ fontWeight: 800, fontSize: 20, color: '#2563eb' }}>₱{totalFare}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}