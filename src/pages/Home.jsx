import { useState, useRef, useEffect } from 'react';
import { useGetLocationsQuery, useGetRouteQuery } from '../services/apiSlice';
import RouteMap from '../components/RouteMap';
import TransportSegmentCard from '../components/TransportSegmentCard';
import { buildRouteOptions } from '../utils/transportSegmenter';
import { getTnvsOptions, getSurgeStatusColor } from '../utils/rideHailingEngine';
import {
  MapPin, Navigation, Route, ArrowRight, Loader2, Info,
  Car, Bike, Plus, X, ChevronDown, ChevronUp, CheckCircle,
} from 'lucide-react';

// ── Quick-select locations ────────────────────
const QK = [
  { label:'Calamba',    full:'Calamba, Laguna, Philippines',      lat:14.2116, lon:121.1653 },
  { label:'Sta. Rosa',  full:'Sta. Rosa, Laguna, Philippines',    lat:14.3122, lon:121.0114 },
  { label:'Cabuyao',    full:'Cabuyao, Laguna, Philippines',      lat:14.2756, lon:121.1253 },
  { label:'Biñan',      full:'Biñan, Laguna, Philippines',        lat:14.3416, lon:121.0798 },
  { label:'Batangas',   full:'Batangas City, Philippines',        lat:13.7565, lon:121.0583 },
  { label:'Tagaytay',   full:'Tagaytay, Cavite, Philippines',     lat:14.1153, lon:120.9621 },
  { label:'Antipolo',   full:'Antipolo, Rizal, Philippines',      lat:14.5243, lon:121.1763 },
  { label:'Lucena',     full:'Lucena, Quezon, Philippines',       lat:13.9322, lon:121.6175 },
  { label:'Lipa',       full:'Lipa, Batangas, Philippines',       lat:13.9411, lon:121.1633 },
  { label:'Dasmariñas', full:'Dasmariñas, Cavite, Philippines',   lat:14.3294, lon:120.9367 },
  { label:'Lemery',     full:'Lemery, Batangas, Philippines',     lat:13.8567, lon:120.9069 },
  { label:'Calaca',     full:'Calaca, Batangas, Philippines',     lat:13.9335, lon:120.8135 },
];



// ── LocationInput ─────────────────────────────
function LocationInput({ label, color, placeholder, value, onSelect, onClear, reverseGeocode })
 {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: sugg = [] } = useGetLocationsQuery(q, { skip: q.length < 2 });

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  

  return (


    
    <div ref={ref} style={{ flex:1, minWidth:0, position:'relative', zIndex:10000 }}>
      <label style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, fontWeight:700, color:'#64748b', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>
        <MapPin size={10} color={color} style={{flexShrink:0}}/>{label}
      </label>
      <div onClick={() => setOpen(true)}
        style={{ display:'flex', alignItems:'center', gap:8, background: open ? '#fefeff' : '#f8fafc', border: open ? `2px solid ${color}` : '1.5px solid #e2e8f0', borderRadius:12, padding:'0 12px', cursor:'text', transition:'all 0.18s', boxShadow: open ? `0 0 0 4px ${color}18` : 'none' }}>
        <MapPin size={14} color={value ? color : '#c8d3e0'} style={{flexShrink:0}}/>
        {value ? (
          <>
            <div style={{ flex:1, padding:'11px 0', fontSize:14, fontWeight:600, color:'#0f172a', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {value.display_name.split(',').slice(0,2).join(',')}
            </div>
            <button onClick={e=>{e.stopPropagation();onClear();setQ('');}} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',display:'flex',padding:'0 0 0 4px',flexShrink:0}}>
              <X size={13}/>
            </button>
          </>
        ) : (
          <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}} placeholder={placeholder}
            style={{ flex:1, border:'none', background:'transparent', fontSize:14, fontWeight:500, color:'#0f172a', outline:'none', padding:'11px 0' }}
            onFocus={()=>setOpen(true)}/>
        )}
      </div>
      {open && (
  <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, boxShadow:'0 12px 40px rgba(0,0,0,0.13)', zIndex:99999, overflow:'hidden' }}>

    {/* ── Current Location ── */}
    <div style={{ padding:'10px 12px', borderBottom:'1px solid #f1f5f9' }}>
      <button
        onMouseDown={e => {
          e.preventDefault();
          if (!navigator.geolocation) return;

navigator.geolocation.getCurrentPosition(async pos => {
  const { latitude, longitude } = pos.coords;

  const name = await reverseGeocode(latitude, longitude);

  onSelect({
    display_name: name,
    lat: String(latitude),
    lon: String(longitude)
  });

  setQ('');
  setOpen(false);
});
        }}
        style={{
          width:'100%',
          padding:'8px 10px',
          borderRadius:10,
          border:'1.5px solid #e2e8f0',
          background:'#f8fafc',
          fontSize:12,
          fontWeight:600,
          cursor:'pointer'
        }}
      >
        📍 Use My Current Location
      </button>
    </div>

    {/* ── Pin Location ── */}
    <div style={{ padding:'8px 12px', borderBottom:'1px solid #f1f5f9' }}>
      <button
        onMouseDown={e => {
          e.preventDefault();

          if (label === 'Origin') {
  window.dispatchEvent(new CustomEvent('pick-origin'));
} else {
  window.dispatchEvent(new CustomEvent('pick-destination'));
}

// ✅ ADD THIS LINE
window.scrollTo({ top: 400, behavior: 'smooth' });

setOpen(false);
        }}
        style={{
          width:'100%',
          padding:'8px 10px',
          borderRadius:10,
          border:'1.5px solid #e2e8f0',
          background:'#f8fafc',
          fontSize:12,
          fontWeight:600,
          cursor:'pointer'
        }}
      >
        📌 Pin Location on Map
      </button>
    </div>

    {/* ── Quick picks (UNCHANGED) ── */}
    <div style={{ padding:'10px 12px 8px', borderBottom:'1px solid #f1f5f9' }}>
      <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:7 }}>
        Quick Select
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
        {QK.map(l=>(
          <button key={l.label}
            onMouseDown={e=>{
              e.preventDefault();
              onSelect({display_name:l.full,lat:String(l.lat),lon:String(l.lon)});
              setQ('');
              setOpen(false);
            }}
            style={{
              padding:'4px 10px',
              fontSize:11,
              fontWeight:600,
              borderRadius:20,
              border:'1.5px solid #e2e8f0',
              background:'#f8fafc',
              color:'#475569',
              cursor:'pointer',
              transition:'all 0.13s'
            }}
            onMouseEnter={e=>{
              e.currentTarget.style.background=color+'18';
              e.currentTarget.style.borderColor=color;
              e.currentTarget.style.color=color;
            }}
            onMouseLeave={e=>{
              e.currentTarget.style.background='#f8fafc';
              e.currentTarget.style.borderColor='#e2e8f0';
              e.currentTarget.style.color='#475569';
            }}>
            {l.label}
          </button>
        ))}
      </div>
    </div>

    {/* ── Search results (UNCHANGED) ── */}
    {q.length >= 2 && sugg.map((s,i)=>(
      <div key={s.place_id||i}
        onMouseDown={e=>{
          e.preventDefault();
          onSelect(s);
          setQ('');
          setOpen(false);
        }}
        style={{
          padding:'10px 14px',
          cursor:'pointer',
          fontSize:13,
          fontWeight:500,
          color:'#1e293b',
          display:'flex',
          alignItems:'center',
          gap:8,
          borderTop:'1px solid #f8fafc',
          transition:'background 0.1s'
        }}
        onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'}
        onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
        <MapPin size={11} color="#94a3b8"/>
        {s.display_name}
      </div>
    ))}

    {q.length >= 2 && sugg.length===0 && (
      <div style={{ padding:'14px', fontSize:13, color:'#94a3b8', textAlign:'center' }}>
        No results — try a different spelling
      </div>
    )}

  </div>
)}
    </div>
  );
}

// ── RouteOptionCard ───────────────────────────
function RouteOptionCard({ option, index, isSelected, onClick }) {
  const [exp, setExp] = useState(isSelected);
  useEffect(()=>setExp(isSelected),[isSelected]);
  const accent = isSelected ? '#4f46e5' : '#e2e8f0';
  return (
    <div style={{ border:`${isSelected?'2px':'1.5px'} solid ${accent}`, borderRadius:14, background:'#fff', overflow:'hidden', marginBottom:10, transition:'all 0.2s', boxShadow:isSelected?'0 6px 24px rgba(79,70,229,0.13)':'0 1px 6px rgba(0,0,0,0.05)' }}>
      <div onClick={()=>{onClick();setExp(true);}} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:28, height:28, borderRadius:8, background:isSelected?'#4f46e5':'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
          <span style={{ fontSize:12, fontWeight:800, color:isSelected?'#fff':'#64748b' }}>{index+1}</span>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap', marginBottom:2 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{option.label}</span>
            {index===0 && <span style={{ fontSize:9, fontWeight:800, background:'#f0fdf4', color:'#16a34a', padding:'2px 7px', borderRadius:20, letterSpacing:'0.05em' }}>CHEAPEST</span>}
          </div>
          {option.note && <div style={{ fontSize:11, color:'#64748b', marginBottom:2 }}>{option.note}</div>}
          <div style={{ fontSize:11, color:'#94a3b8' }}>{option.segments.length} segment{option.segments.length!==1?'s':''} · {option.segments.map(s=>s.vehicle).join(' → ')}</div>
        </div>
        <div style={{ textAlign:'right', flexShrink:0, marginRight:6 }}>
          <div style={{ fontSize:19, fontWeight:800, color:isSelected?'#4f46e5':'#0f172a' }}>₱{option.totalFare}</div>
          <div style={{ fontSize:10, color:'#94a3b8' }}>est. fare</div>
        </div>
        <button onClick={e=>{e.stopPropagation();setExp(v=>!v);}} style={{ background:'none', border:'none', cursor:'pointer', color:'#94a3b8', display:'flex', padding:0 }}>
          {exp?<ChevronUp size={15}/>:<ChevronDown size={15}/>}
        </button>
      </div>
      {exp && (
        <div style={{ padding:'2px 15px 15px', borderTop:'1px solid #f1f5f9' }}>
          {option.segments.map((seg,i)=><TransportSegmentCard key={i} segment={seg} index={i} isLast={i===option.segments.length-1}/>)}
        </div>
      )}
    </div>
  );
}



// ── RideHailingPanel ─────────────────────────
function RideHailingPanel({ opts }) {
  const [exp, setExp] = useState(false);
  const avail = opts.filter(o=>o.available).length;
  return (
    <div style={{ background:'#fff', border:'1.5px solid #e2e8f0', borderRadius:14, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.05)', marginTop:8 }}>
      <div onClick={()=>setExp(v=>!v)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 15px', cursor:'pointer' }}
        onMouseEnter={e=>e.currentTarget.style.background='#fafbff'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <div style={{ width:28, height:28, borderRadius:8, background:'#f3f0ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Car size={14} color="#7c3aed"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>Grab / Angkas Estimates</span>
            {avail>0 && <span style={{ fontSize:9, fontWeight:800, background:'#f0fdf4', color:'#16a34a', padding:'2px 7px', borderRadius:20, letterSpacing:'0.05em' }}>{avail} AVAILABLE</span>}
          </div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:1 }}>LTFRB fare formula · real-time surge calculation</div>
        </div>
        {exp?<ChevronUp size={15} color="#94a3b8"/>:<ChevronDown size={15} color="#94a3b8"/>}
      </div>
      {exp && (
        <div style={{ padding:'4px 15px 15px', borderTop:'1px solid #f1f5f9' }}>
          {opts.map((o,i)=>(
            <div key={i} style={{ background:o.available?'#fff':'#fafafa', border:`1.5px solid ${o.available?'#e2e8f0':'#f1f5f9'}`, borderRadius:11, padding:'12px 13px', marginBottom:8, opacity:o.available?1:0.6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                    {o.icon==='Bike'?<Bike size={14} color="#d97706"/>:<Car size={14} color="#7c3aed"/>}
                    <span style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{o.service}</span>
                    {o.available
                      ? <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, letterSpacing:'0.05em', background:getSurgeStatusColor(o.surgeLevel)+'18', color:getSurgeStatusColor(o.surgeLevel) }}>
                          {o.surgeLevel==='NONE'?'NO SURGE':o.surgeLevel==='LOW_SURGE'?'LOW SURGE':'HIGH SURGE'}
                        </span>
                      : <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:20, background:'#f1f5f9', color:'#94a3b8', letterSpacing:'0.05em' }}>UNAVAILABLE</span>
                    }
                  </div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{o.available?o.note:o.reason}</div>
                  {o.available&&o.formula&&<div style={{ fontSize:10, color:'#94a3b8', marginTop:3, fontFamily:'monospace' }}>{o.formula}</div>}
                </div>
                {o.available&&(
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:800, fontSize:16, color:'#0f172a' }}>₱{o.fareMin}{o.fareMax!==o.fareMin?`–₱${o.fareMax}`:''}</div>
                    <div style={{ fontSize:10, color:'#94a3b8' }}>est. range</div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div style={{ fontSize:10, color:'#94a3b8', display:'flex', gap:5, alignItems:'flex-start', marginTop:2 }}>
            <Info size={10} style={{flexShrink:0,marginTop:1}}/>
            LTFRB formula: ₱45 base + ₱15/km + ₱2/min. Surge up to 2× during rush hours &amp; weekends. Angkas: fixed rate, no surge.
          </div>
        </div>
      )}
    </div>
  );
}

// ── AddRouteModal ────────────────────────────
function AddRouteModal({ onAdd, onClose }) {
  const [f, setF] = useState({ from:'', to:'', vehicle:'Jeepney', operator:'', fare:'', note:'' });
  const inp = { width:'100%', padding:'9px 11px', borderRadius:9, border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#0f172a', outline:'none', boxSizing:'border-box', fontFamily:'inherit', transition:'border 0.15s' };
  const label = txt => <label style={{ fontSize:10, fontWeight:800, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:5 }}>{txt}</label>;
  const canSubmit = f.from && f.to && f.fare;
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{ background:'#fff', borderRadius:20, padding:28, width:'100%', maxWidth:420, boxShadow:'0 32px 64px rgba(0,0,0,0.22)', position:'relative' }}
        className="anim-fade-up">
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'#f1f5f9', border:'none', borderRadius:8, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>
          <X size={14}/>
        </button>
        <h3 style={{ fontWeight:800, fontSize:17, color:'#0f172a', marginBottom:4 }}>Add a Route Segment</h3>
        <p style={{ fontSize:12, color:'#64748b', marginBottom:20 }}>Know a better route? Add it and help fellow commuters.</p>
        <div style={{ marginBottom:12 }}>{label('From')}
          <input value={f.from} onChange={e=>setF({...f,from:e.target.value})} placeholder="e.g. Calamba Crossing" style={inp}
            onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
        </div>
        <div style={{ marginBottom:12 }}>{label('To')}
          <input value={f.to} onChange={e=>setF({...f,to:e.target.value})} placeholder="e.g. Lemery Terminal" style={inp}
            onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          <div>{label('Vehicle')}
            <select value={f.vehicle} onChange={e=>setF({...f,vehicle:e.target.value})} style={{...inp,cursor:'pointer'}}>
              {['Walk','Tricycle','Jeepney','E-Jeep','Bus','TNVS'].map(v=><option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>{label('Fare (₱)')}
            <input type="number" value={f.fare} onChange={e=>setF({...f,fare:e.target.value})} placeholder="e.g. 75" style={inp}
              onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>
        </div>
        <div style={{ marginBottom:12 }}>{label('Bus Operator (optional)')}
          <input value={f.operator} onChange={e=>setF({...f,operator:e.target.value})} placeholder="e.g. DLTB, JAC Liner" style={inp}
            onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
        </div>
        <div style={{ marginBottom:20 }}>{label('Notes (optional)')}
          <input value={f.note} onChange={e=>setF({...f,note:e.target.value})} placeholder="e.g. Departs hourly at Turbina" style={inp}
            onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
        </div>
        <button disabled={!canSubmit}
          onClick={()=>{if(!canSubmit)return;onAdd({from:f.from,to:f.to,vehicle:f.vehicle,operator:f.operator,distance:0,fare:parseInt(f.fare)||0,note:f.note});onClose();}}
          style={{ width:'100%', padding:'12px', background:canSubmit?'linear-gradient(135deg,#4f46e5,#4338ca)':'#e2e8f0', color:canSubmit?'#fff':'#94a3b8', border:'none', borderRadius:11, fontWeight:700, fontSize:14, cursor:canSubmit?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:8, fontFamily:'inherit', transition:'all 0.2s', boxShadow:canSubmit?'0 4px 16px rgba(79,70,229,0.3)':'none' }}
          onMouseEnter={e=>{if(canSubmit){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(79,70,229,0.4)';}}}
          onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=canSubmit?'0 4px 16px rgba(79,70,229,0.3)':'none';}}>
          <Plus size={16}/> Add Segment
        </button>
      </div>
    </div>
  );
}

// ── Stat badge ───────────────────────────────
function StatBadge({ label, value, accent }) {
  return (
    <div style={{ textAlign:'center', padding:'0 16px' }}>
      <div style={{ fontSize:20, fontWeight:900, color: accent || '#fff', letterSpacing:'-0.02em', lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:3 }}>{label}</div>
    </div>
  );
}

// ── Main Home ────────────────────────────────
export default function Home() {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest]     = useState(null);
  const [picking, setPicking] = useState(null);
  const [triggered, setTriggered] = useState(false);
  const [selOpt, setSelOpt] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [customSegs, setCustomSegs] = useState([]);

  const oCoords = origin ? [parseFloat(origin.lat), parseFloat(origin.lon)] : null;
  const dCoords = dest   ? [parseFloat(dest.lat),   parseFloat(dest.lon)]   : null;

  const { data: rd, isLoading, isFetching } = useGetRouteQuery(
    { originCoords: oCoords, destCoords: dCoords },
    { skip: !triggered || !oCoords || !dCoords }
  );

  const oLabel = origin?.display_name?.split(',').slice(0,2).join(',').trim() || '';
  const dLabel = dest?.display_name?.split(',').slice(0,2).join(',').trim()   || '';

  const routeOpts  = rd ? buildRouteOptions(rd.distance, oLabel, dLabel) : [];
  const tnvsOpts   = rd ? getTnvsOptions(rd.distance, rd.duration, oLabel, dLabel) : [];
  const allOpts    = customSegs.length
    ? [...routeOpts, { label:'My Custom Route', note:'Added by you', segments:customSegs, totalFare:customSegs.reduce((s,c)=>s+c.fare,0) }]
    : routeOpts;

  const loading = isLoading || isFetching;
  const bestFare = allOpts.length ? Math.min(...allOpts.map(o=>o.totalFare)) : 0;

  const handleFind = () => { if (!oCoords||!dCoords) return; setTriggered(true); setSelOpt(0); setCustomSegs([]); };
  const swap = () => { setOrigin(dest); setDest(origin); setTriggered(false); };
  
    async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    );
    const data = await res.json();
    return data.display_name || 'Unknown location';
  } catch (err) {
    console.error(err);
    return 'Unknown location';
  }
}
  
  useEffect(() => {
  const pickOrigin = () => setPicking('origin');
  const pickDestination = () => setPicking('destination');


  window.addEventListener('pick-origin', pickOrigin);
  window.addEventListener('pick-destination', pickDestination);

  return () => {
    window.removeEventListener('pick-origin', pickOrigin);
    window.removeEventListener('pick-destination', pickDestination);
  };
}, []);


  return (
    <div style={{ maxWidth:980, margin:'0 auto', padding:'32px 20px 60px' }}>

      {/* ── Hero ── */}
      <div className="anim-fade-down" style={{ marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(79,70,229,0.35)' }}>
            <Route size={20} color="#fff"/>
          </div>
          <div>
            <h1 style={{ fontSize:26, fontWeight:900, color:'#0f172a', margin:0, letterSpacing:'-0.03em', lineHeight:1 }}>Route Planner</h1>
            <p style={{ fontSize:12, color:'#64748b', margin:0, marginTop:2 }}>CALABARZON Smart Commute Intelligence · SDG 11</p>
          </div>
        </div>
      </div>

      {/* ── Planner card ── */}
      <div className="anim-fade-up" style={{ background:'#fff', borderRadius:20, padding:'24px 24px 20px', marginBottom:20, boxShadow:'0 2px 24px rgba(0,0,0,0.07)', border:'1.5px solid #f0f2f7' }}>
        <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:16 }}>
          <LocationInput label="Origin" color="#10b981" placeholder="Where are you starting?"
            value={origin} onSelect={v=>{setOrigin(v);setTriggered(false);}} onClear={()=>{setOrigin(null);setTriggered(false);}}
            reverseGeocode={reverseGeocode}  
            />
          {/* Swap */}
          <button onClick={swap} title="Swap origin and destination"
            style={{ width:38, height:38, borderRadius:10, border:'1.5px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b', flexShrink:0, marginBottom:1, transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#eef2ff';e.currentTarget.style.borderColor='#4f46e5';e.currentTarget.style.color='#4f46e5';e.currentTarget.style.transform='rotate(180deg)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#f8fafc';e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#64748b';e.currentTarget.style.transform='rotate(0)';}}>
            <ArrowRight size={15}/>
          </button>
          <LocationInput label="Destination" color="#ef4444" placeholder="Where are you going?"
            value={dest} onSelect={v=>{setDest(v);setTriggered(false);}} onClear={()=>{setDest(null);setTriggered(false);}}
            reverseGeocode={reverseGeocode} 
            />
        </div>

        <button onClick={handleFind} disabled={!origin||!dest||loading}
          style={{ width:'100%', padding:'13px', border:'none', borderRadius:12, fontWeight:800, fontSize:14, letterSpacing:'-0.01em', fontFamily:'inherit', background:origin&&dest&&!loading?'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)':'#e2e8f0', color:origin&&dest&&!loading?'#fff':'#94a3b8', cursor:origin&&dest&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.2s', boxShadow:origin&&dest&&!loading?'0 4px 18px rgba(79,70,229,0.32)':'none' }}
          onMouseEnter={e=>{if(origin&&dest&&!loading){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(79,70,229,0.4)';}}}
          onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=origin&&dest&&!loading?'0 4px 18px rgba(79,70,229,0.32)':'none';}}>
          {loading
            ? <><Loader2 size={17} className="anim-spin"/> Computing all routes…</>
            : <><Navigation size={17}/> Find Best Routes</>
          }
        </button>
      </div>

      {/* ── Mock notice ── */}
      {rd?.isMock && (
        <div style={{ display:'flex', gap:9, alignItems:'center', background:'#fefce8', border:'1.5px solid #fde68a', borderRadius:12, padding:'11px 15px', marginBottom:18 }}>
          <Info size={14} color="#ca8a04"/>
          <span style={{ fontSize:12, fontWeight:500, color:'#854d0e' }}>
            Estimated route (ORS API key not set). Get a free key at{' '}
            <a href="https://openrouteservice.org" target="_blank" rel="noreferrer" style={{ color:'#ca8a04', fontWeight:700 }}>openrouteservice.org</a>
            {' '}then replace the key in <code style={{fontSize:11}}>src/services/apiSlice.js</code>.
          </span>
        </div>
      )}

{/* Map Picking Here */}

{!rd && (
  <div style={{ marginBottom: 20 }}>
    <RouteMap
      originCoords={oCoords}
      destCoords={dCoords}
      geometry={null}
      originName={oLabel}
      destName={dLabel}
      onMapClick={async (lat, lng) => {
        if (!picking) return;

        const name = await reverseGeocode(lat, lng);

        if (picking === 'origin') {
          setOrigin({
            display_name: name,
            lat: String(lat),
            lon: String(lng)
          });
        } else if (picking === 'destination') {
          setDest({
            display_name: name,
            lat: String(lat),
            lon: String(lng)
          });
        }

        setPicking(null);
        setTriggered(false); 
      }}
    />
  </div>
)}

      {/* ── Results ── */}
      {rd && (
        <div>
          {/* Summary banner */}
          <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%)', borderRadius:18, padding:'20px 24px', marginBottom:22, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:14, boxShadow:'0 8px 32px rgba(15,23,42,0.20)' }}>
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:700, marginBottom:5 }}>Route</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:15, fontWeight:700 }}>
                <span style={{ color:'#34d399' }}>{oLabel.split(',')[0]}</span>
                <ArrowRight size={13} color="rgba(255,255,255,0.3)"/>
                <span style={{ color:'#f87171' }}>{dLabel.split(',')[0]}</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'stretch', gap:0 }}>
              <StatBadge label="Road Distance" value={`${rd.distance} km`}/>
              <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'0 4px' }}/>
              <StatBadge label="Travel Time" value={`${rd.duration} min`}/>
              <div style={{ width:1, background:'rgba(255,255,255,0.08)', margin:'0 4px' }}/>
              <StatBadge label="Best Fare" value={`₱${bestFare}`} accent="#fbbf24"/>
            </div>
          </div>

          {/* Two-column */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

            {/* LEFT: options */}
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.01em' }}>
                  {allOpts.length} Route Option{allOpts.length!==1?'s':''}
                </h2>
                <button onClick={()=>setShowAdd(true)}
                  style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, fontWeight:700, color:'#4f46e5', background:'#eef2ff', border:'1.5px solid #c7d2fe', borderRadius:8, padding:'5px 10px', cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='#e0e7ff';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#eef2ff';}}>
                  <Plus size={12}/> Add Route
                </button>
              </div>

              {allOpts.map((opt,i)=>(
                <RouteOptionCard key={i} option={opt} index={i} isSelected={selOpt===i} onClick={()=>setSelOpt(i)}/>
              ))}

              <RideHailingPanel opts={tnvsOpts}/>
            </div>

            {/* RIGHT: map */}
            <div style={{ position:'sticky', top:80 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                <h2 style={{ fontSize:14, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.01em' }}>Live Route Map</h2>
                <span style={{ fontSize:9, fontWeight:800, background:'#eef2ff', color:'#4f46e5', padding:'2px 8px', borderRadius:20, letterSpacing:'0.06em' }}>OPENSTREETMAP</span>
              </div>
<RouteMap
  originCoords={oCoords}
  destCoords={dCoords}
  geometry={rd.geometry}
  originName={oLabel}
  destName={dLabel}
onMapClick={async (lat, lng) => {
if (!picking) return;
  const name = await reverseGeocode(lat, lng);

  if (picking === 'origin') {
    setOrigin({
      display_name: name,
      lat: String(lat),
      lon: String(lng)
    });
  } else if (picking === 'destination') {
    setDest({
      display_name: name,
      lat: String(lat),
      lon: String(lng)
    });
  }

  setPicking(null);
  setTriggered(false);
}}
/>


              {/* Mini summary of selected option */}
              {allOpts[selOpt] && (
                <div style={{ background:'#fff', borderRadius:12, padding:'13px 15px', marginTop:12, border:'1.5px solid #f0f2f7', boxShadow:'0 1px 6px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize:9, fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>
                    Selected · {allOpts[selOpt].label}
                  </div>
                  {allOpts[selOpt].segments.map((seg,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:500, color:'#475569', marginBottom:4 }}>
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'#4f46e5', flexShrink:0 }}/>
                      <span style={{ fontWeight:600, color:'#1e293b' }}>{seg.from}</span>
                      <ArrowRight size={9} color="#94a3b8"/>
                      <span>{seg.to}</span>
                      <span style={{ marginLeft:'auto', fontWeight:700, color:'#0f172a', fontSize:13 }}>₱{seg.fare}</span>
                    </div>
                  ))}
                  <div style={{ borderTop:'1.5px dashed #e2e8f0', marginTop:8, paddingTop:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>Total Estimated Fare</span>
                    <span style={{ fontSize:16, fontWeight:900, color:'#4f46e5' }}>₱{allOpts[selOpt].totalFare}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!triggered && !loading && (
        <div style={{ background:'#fff', borderRadius:20, padding:'56px 24px', textAlign:'center', border:'2px dashed #e2e8f0' }}>
          <div style={{ width:68, height:68, borderRadius:20, background:'linear-gradient(135deg,#eef2ff,#e0e7ff)', margin:'0 auto 18px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(79,70,229,0.12)' }}>
            <Navigation size={30} color="#4f46e5"/>
          </div>
          <h3 style={{ fontSize:19, fontWeight:800, color:'#0f172a', margin:'0 0 8px', letterSpacing:'-0.02em' }}>Smart CALABARZON Route Planner</h3>
          <p style={{ fontSize:13, color:'#64748b', margin:0, maxWidth:400, marginInline:'auto', lineHeight:1.7 }}>
            Search any origin and destination. Get multiple public transport options with real bus operators, pass-through detection, Grab and Angkas estimates, and the option to add your own community routes.
          </p>
        </div>
      )}

      {showAdd && <AddRouteModal onAdd={seg=>setCustomSegs(p=>[...p,seg])} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}