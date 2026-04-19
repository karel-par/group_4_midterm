import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Home from './pages/Home';
import RouteDetail from './pages/RouteDetail';
import Reports from './pages/Reports';
import { Map, FileWarning, Home as HomeIcon } from 'lucide-react';

const navStyle = ({ isActive }) => ({
  display: 'flex', gap: 6, alignItems: 'center',
  padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
  fontWeight: 600, fontSize: 14,
  color: isActive ? '#2563eb' : '#475569',
  background: isActive ? '#eff6ff' : 'transparent',
});

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>
      <nav style={{ background: '#fff', borderBottom: '1.5px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 8, height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 24 }}>
          <Map size={22} color="#2563eb" />
          <span style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>CalabarzONE</span>
          <span style={{ fontSize: 10, background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>SDG 11</span>
        </div>
        <NavLink to="/" style={navStyle}><HomeIcon size={15} /> Planner</NavLink>
        <NavLink to="/reports" style={navStyle}><FileWarning size={15} /> Reports</NavLink>
      </nav>
      <main style={{ padding: '0 0 40px' }}>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/item/:id" element={<RouteDetail />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </Provider>
  );
}