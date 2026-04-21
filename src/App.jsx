import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Home from './pages/Home';
import RouteDetail from './pages/RouteDetail';
import Reports from './pages/Reports';
import { Map, FileWarning } from 'lucide-react';

function Navbar() {
  const link = ({ isActive }) => ({
    display:'flex', alignItems:'center', gap:7,
    padding:'7px 13px', borderRadius:9, textDecoration:'none',
    fontWeight:700, fontSize:13, letterSpacing:'-0.01em',
    fontFamily:'inherit', transition:'all 0.15s',
    color: isActive ? '#4f46e5' : '#64748b',
    background: isActive ? '#eef2ff' : 'transparent',
  });
  return (
    <nav style={{ position:'sticky', top:0, zIndex:200, background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid rgba(15,23,42,0.07)', padding:'0 28px', display:'flex', alignItems:'center', gap:4, height:58, boxShadow:'0 1px 12px rgba(0,0,0,0.05)' }}>
      {/* Brand */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginRight:22 }}>
        <div style={{ width:33, height:33, borderRadius:10, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 10px rgba(79,70,229,0.35)' }}>
          <Map size={16} color="#fff"/>
        </div>
        <div>
          <div style={{ fontFamily:"'Syne', sans-serif", fontWeight:800, fontSize:16, color:'#0f172a', lineHeight:1, letterSpacing:'-0.03em' }}>CalabarzONE</div>
          <div style={{ fontSize:9, color:'#94a3b8', letterSpacing:'0.06em', fontWeight:700, textTransform:'uppercase' }}>SDG 11 · Transport Intelligence</div>
        </div>
      </div>

      <NavLink to="/" end style={link}><Map size={14}/> Planner</NavLink>
      <NavLink to="/reports" style={link}><FileWarning size={14}/> Reports</NavLink>

      <div style={{ flex:1 }}/>

      {/* Live status */}
      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600, color:'#64748b' }}>
        <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block', boxShadow:'0 0 0 2px #d1fae5', animation:'pulse 2s ease-in-out infinite' }}/>
        CALABARZON Region
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div style={{ minHeight:'100vh', background:'#f0f2f7', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
          <Navbar/>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/item/:id" element={<RouteDetail/>}/>
            <Route path="/reports" element={<Reports/>}/>
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}