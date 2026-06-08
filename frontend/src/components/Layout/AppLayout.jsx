import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, LayoutDashboard, BookOpen, FlaskConical, Bookmark, Settings, LogOut, Menu, X, ChevronRight, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'nav-dashboard', to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'nav-learn', to: '/learn', icon: BookOpen, label: 'Learn Hub' },
  { id: 'nav-test', to: '/test', icon: FlaskConical, label: 'Test Center' },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = ({ mobile = false }) => (
    <aside className="sidebar" style={{ width: mobile ? '100%' : 260, padding:'24px 0', display:'flex', flexDirection:'column' }}>
      {/* Logo */}
      <div style={{ padding:'0 20px 24px', borderBottom:'1px solid rgba(99,102,241,0.15)' }}>
        <Link to="/dashboard" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'#e2e8f0', fontSize:'1rem' }}>NirnayPath</div>
            <div style={{ fontSize:10, color:'#4f46e5', fontWeight:600 }}>3.0</div>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div style={{ padding:'20px', borderBottom:'1px solid rgba(99,102,241,0.1)', marginBottom:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:38, height:38, background:'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', fontSize:15, fontFamily:'Outfit,sans-serif', flexShrink:0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ color:'#e2e8f0', fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
            <div style={{ color:'#4f46e5', fontSize:11, fontWeight:500, textTransform:'capitalize' }}>{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'0 12px' }}>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} id={item.id} to={item.to}
              onClick={() => mobile && setSidebarOpen(false)}
              style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:10, marginBottom:4,
                background: active ? 'rgba(79,70,229,0.2)' : 'transparent',
                color: active ? '#a5b4fc' : '#64748b',
                fontWeight: active ? 600 : 400,
                fontSize:14,
                transition:'all 0.2s',
                borderLeft: active ? '2px solid #4f46e5' : '2px solid transparent',
              }}>
              <Icon size={18} />
              {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft:'auto' }} />}
            </Link>
          );
        })}

        {user?.role === 'admin' && (
          <Link id="nav-admin" to="/admin"
            onClick={() => mobile && setSidebarOpen(false)}
            style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:10, marginBottom:4,
              background: location.pathname.startsWith('/admin') ? 'rgba(234,88,12,0.2)' : 'transparent',
              color: location.pathname.startsWith('/admin') ? '#fb923c' : '#64748b',
              fontSize:14, transition:'all 0.2s',
            }}>
            <Shield size={18} />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding:'12px' }}>
        <button id="btn-logout" onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:10, width:'100%', background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:14, transition:'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background='none'}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0f0a1e' }}>
      {/* Desktop Sidebar */}
      <div style={{ display:'none' }} className="desktop-sidebar" id="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(4px)' }} onClick={() => setSidebarOpen(false)} />
          <div style={{ position:'relative', zIndex:1, width:260 }}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Top bar */}
        <header className="navbar" style={{ padding:'0 20px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button id="btn-menu" onClick={() => setSidebarOpen(true)}
            style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer', display:'flex', padding:4 }}>
            <Menu size={22} />
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <GraduationCap size={18} color="#4f46e5" />
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:700, color:'#e2e8f0', fontSize:'0.95rem' }}>NirnayPath</span>
          </div>
          <div style={{ width:32 }} />
        </header>

        <main style={{ flex:1, overflow:'auto' }}>
          {children}
        </main>
      </div>

      {/* Inject desktop sidebar via CSS */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: block !important; width: 260px; flex-shrink: 0; }
          #btn-menu { display: none !important; }
        }
      `}</style>
    </div>
  );
}
