import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, GraduationCap, LayoutDashboard, BookOpen, FlaskConical,
  LogOut, Menu, ChevronRight, Shield, Heart, Sun, Moon, User, X
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'nav-dashboard', to: '/dashboard', icon: LayoutDashboard, labelEn: 'Dashboard',    labelHi: 'डैशबोर्ड' },
  { id: 'nav-learn',     to: '/learn',     icon: BookOpen,        labelEn: 'Learn Hub',    labelHi: 'सीखें' },
  { id: 'nav-test',      to: '/test',      icon: FlaskConical,    labelEn: 'Test Center',  labelHi: 'परीक्षा केंद्र' },
];

function NavLink({ to, icon: Icon, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      style={{
        textDecoration: 'none',
        display: 'flex', alignItems: 'center', gap: 11,
        padding: '11px 14px', borderRadius: 12, marginBottom: 4,
        background: active ? 'rgba(255,107,0,0.10)' : 'transparent',
        color: active ? 'var(--np-orange)' : 'var(--color-text-base)',
        fontWeight: active ? 700 : 500,
        fontSize: 14, fontFamily: 'Outfit, sans-serif',
        transition: 'all 0.2s ease',
        borderLeft: `3px solid ${active ? 'var(--np-orange)' : 'transparent'}`,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,107,0,0.05)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Icon size={17} color={active ? 'var(--np-orange)' : 'var(--color-text-muted-base)'} />
      <span style={{ flex: 1 }}>{label}</span>
      {active && <ChevronRight size={13} color="var(--np-orange)" />}
    </Link>
  );
}

function Sidebar({ mobile = false, user, location, setSidebarOpen, handleLogout, t }) {
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <aside style={{
      width: mobile ? '100%' : 256,
      height: '100%',
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-card-bg)',
      backdropFilter: 'blur(24px)',
      borderRight: '1.5px solid var(--color-border-base)',
      overflowY: 'auto', overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1.5px solid var(--color-border-base)', flexShrink: 0 }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}
          onClick={() => mobile && setSidebarOpen(false)}>
          <div style={{ width: 38, height: 38, background: 'var(--gradient-primary)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(108,99,255,0.35)', flexShrink: 0 }}>
            <GraduationCap size={19} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, color: 'var(--color-text-title-base)', fontSize: '1.1rem', letterSpacing: '-0.025em', lineHeight: 1 }}>NirnayPath</div>
            <div style={{ fontSize: 9, color: 'var(--np-orange)', fontWeight: 800, letterSpacing: '0.07em', marginTop: 2 }}>PREMIUM 4.0</div>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <Link to="/profile" onClick={() => mobile && setSidebarOpen(false)}
        style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--color-border-base)', display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', transition: 'background 0.2s', flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.05)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 38, height: 38, background: 'var(--gradient-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 13, flexShrink: 0, boxShadow: '0 4px 12px rgba(108,99,255,0.25)' }}>
          {userInitials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: 'var(--color-text-title-base)', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
          <div style={{ color: 'var(--np-orange)', fontSize: 11, fontWeight: 600, marginTop: 1 }}>{user?.role === 'admin' ? t('Administrator', 'प्रशासक') : t('Aspirant', 'उम्मीदवार')}</div>
        </div>
        <User size={13} color="var(--color-text-muted-base)" />
      </Link>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px' }}>
        {NAV_ITEMS.map(item => (
          <NavLink key={item.to} to={item.to} icon={item.icon}
            label={t(item.labelEn, item.labelHi)}
            active={location.pathname.startsWith(item.to)}
            onClick={() => mobile && setSidebarOpen(false)} />
        ))}

        <NavLink to="/profile" icon={User}
          label={t('My Profile', 'मेरी प्रोफ़ाइल')}
          active={location.pathname === '/profile'}
          onClick={() => mobile && setSidebarOpen(false)} />

        <NavLink to="/about" icon={Heart}
          label={t('About NirnayPath', 'निर्णयपथ के बारे में')}
          active={location.pathname === '/about'}
          onClick={() => mobile && setSidebarOpen(false)} />

        {user?.role === 'admin' && (
          <NavLink to="/admin" icon={Shield}
            label={t('Admin Panel', 'एडमिन पैनल')}
            active={location.pathname.startsWith('/admin')}
            onClick={() => mobile && setSidebarOpen(false)} />
        )}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1.5px solid var(--color-border-base)', flexShrink: 0 }}>
        <button id="btn-logout" onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 12, width: '100%', background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: 14, fontFamily: 'Outfit, sans-serif', fontWeight: 600, transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          <LogOut size={16} /> {t('Sign Out', 'लॉग आउट')}
        </button>
      </div>
    </aside>
  );
}

export default function AppLayout({ children, hideLayout = false }) {
  const { user, logout, language, setLanguage, theme, setTheme } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const t = (en, hi) => language === 'hi' ? hi : en;

  if (hideLayout) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', width: '100vw', overflow: 'hidden' }}>
        <main style={{ width: '100%', height: '100%' }}>{children}</main>
      </div>
    );
  }

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="app-layout-root" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg-base)' }}>

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <div id="desktop-sidebar" style={{ display: 'none', width: 256, flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <Sidebar user={user} location={location} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} t={t} />
      </div>

      {/* ── Mobile Drawer ───────────────────────────────────── */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }} onClick={() => setSidebarOpen(false)}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,18,41,0.65)', backdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: 256, height: '100%' }} onClick={e => e.stopPropagation()}>
            <Sidebar mobile user={user} location={location} setSidebarOpen={setSidebarOpen} handleLogout={handleLogout} t={t} />
          </div>
          {/* Close button */}
          <button onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', zIndex: 2 }}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── Main Content Area ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Top Header */}
        <header className="navbar" style={{ padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 150 }}>
          {/* Left: Hamburger (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 12 }}>
            <button id="btn-menu" onClick={() => setSidebarOpen(true)}
              style={{ background: 'rgba(255,107,0,0.08)', border: '1.5px solid rgba(255,107,0,0.2)', color: 'var(--np-orange)', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: 10, transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,0,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,0,0.08)'}>
              <Menu size={19} />
            </button>
          </div>

          {/* Center: Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, flex: 1 }}>
            <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(108,99,255,0.3)' }}>
              <GraduationCap size={17} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, color: 'var(--color-text-title-base)', fontSize: '1.15rem', letterSpacing: '-0.025em' }}>NirnayPath</span>
          </div>

          {/* Right: Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1, gap: 8 }}>
            {/* Theme toggle */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'rgba(124,58,237,0.06)', border: '1.5px solid var(--color-border-base)', borderRadius: 10, width: 36, height: 36, color: 'var(--color-text-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              {theme === 'dark' ? <Sun size={15} color="var(--np-gold)" /> : <Moon size={15} color="var(--np-purple)" />}
            </button>

            {/* Language toggle */}
            <div style={{ display: 'flex', background: 'rgba(124,58,237,0.05)', border: '1.5px solid var(--color-border-base)', borderRadius: 10, padding: 3 }}>
              {[['en', 'EN'], ['hi', 'हिं']].map(([lang, lbl]) => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  style={{ background: language === lang ? 'var(--gradient-primary)' : 'none', border: 'none', color: language === lang ? '#fff' : 'var(--color-text-muted-base)', padding: '5px 10px', borderRadius: 7, fontSize: 11, fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {lbl}
                </button>
              ))}
            </div>

            {/* User avatar (desktop) */}
            <Link to="/profile" className="hide-mobile"
              style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 12, flexShrink: 0, boxShadow: '0 4px 12px rgba(108,99,255,0.25)', textDecoration: 'none' }}>
              {userInitials}
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, width: '100%', paddingTop: 'var(--header-height)', overflow: 'auto' }}>
          {children}
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ────────────────────────── */}
      <nav className="mobile-bottom-nav">
        {[
          { to: '/dashboard', icon: Home,         labelEn: 'Home',    labelHi: 'होम',          match: p => p === '/dashboard' },
          { to: '/learn',     icon: BookOpen,      labelEn: 'Learn',   labelHi: 'सीखें',        match: p => p.startsWith('/learn') },
          { to: '/test',      icon: FlaskConical,  labelEn: 'Tests',   labelHi: 'परीक्षा',      match: p => p.startsWith('/test') },
          { to: '/profile',   icon: User,          labelEn: 'Profile', labelHi: 'प्रोफ़ाइल',   match: p => p === '/profile' },
        ].map(({ to, icon: Icon, labelEn, labelHi, match }) => {
          const active = match(location.pathname);
          return (
            <Link key={to} to={to} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: 3,
              color: active ? 'var(--np-orange)' : 'var(--color-text-muted-base)',
              background: active ? 'rgba(255,107,0,0.08)' : 'transparent',
              padding: '8px 16px', borderRadius: 24, transition: 'all 0.2s',
              minWidth: 52,
            }}>
              <Icon size={19} color={active ? 'var(--np-orange)' : 'var(--color-text-muted-base)'} />
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Outfit' }}>{t(labelEn, labelHi)}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Responsive CSS ──────────────────────────────────── */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-sidebar { display: block !important; }
          #btn-menu { display: none !important; }
          .mobile-bottom-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .app-layout-root { padding-bottom: 88px; }
        }
      `}</style>
    </div>
  );
}
