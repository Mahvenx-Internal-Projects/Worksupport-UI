import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, User, Settings, ChevronDown, Home, X, Menu, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import SupportChatWidget from '../SupportChatWidget';

interface NavItem { label: string; path: string; emoji: string }

const adminNav: NavItem[] = [
  { label: 'Dashboard',   path: '/admin',              emoji: '📊' },
  { label: 'Requests',    path: '/admin/requests',     emoji: '📥' },
  { label: 'Meetings',    path: '/admin/meetings',     emoji: '📅' },
  { label: 'Projects',    path: '/admin/projects',     emoji: '📁' },
  { label: 'Timesheets',  path: '/admin/timesheets',   emoji: '⏱️' },
  { label: 'Invoices',    path: '/admin/invoices',     emoji: '🧾' },
  { label: 'Payments',    path: '/admin/payments',     emoji: '💳' },
  { label: 'Freelancers', path: '/admin/freelancers',  emoji: '👥' },
  { label: 'Clients',     path: '/admin/clients',      emoji: '🏢' },
  { label: 'Support',     path: '/admin/support',      emoji: '🎧' },
  { label: 'Reports',     path: '/admin/reports',      emoji: '📈' },
];

const freelancerNav: NavItem[] = [
  { label: 'Dashboard',   path: '/freelancer',              emoji: '📊' },
  { label: 'Profile',     path: '/freelancer/profile',      emoji: '👤' },
  { label: 'Assignments', path: '/freelancer/assignments',  emoji: '📁' },
  { label: 'Meetings',    path: '/freelancer/meetings',     emoji: '📅' },
  { label: 'Timesheets',  path: '/freelancer/timesheets',   emoji: '⏱️' },
  { label: 'Earnings',    path: '/freelancer/earnings',     emoji: '💰' },
  { label: 'Standups',    path: '/freelancer/standups',     emoji: '📢' },
];

const clientNav: NavItem[] = [
  { label: 'Dashboard',    path: '/client',                   emoji: '📊' },
  { label: 'Post Req.',    path: '/client/post-requirement',  emoji: '📋' },
  { label: 'Browse',       path: '/client/browse',            emoji: '🔍' },
  { label: 'Projects',     path: '/client/projects',          emoji: '📁' },
  { label: 'Invoices',     path: '/client/invoices',          emoji: '🧾' },
  { label: 'Timesheets',   path: '/client/timesheets',        emoji: '⏱️' },
  { label: 'Feedback',     path: '/client/feedback',          emoji: '⭐' },
];

// Role colors
const ROLE_THEME: Record<string, { accent: string; grad: string; light: string }> = {
  admin:      { accent: '#6366f1', grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eff6ff' },
  freelancer: { accent: '#0891b2', grad: 'linear-gradient(135deg,#0891b2,#0e7490)', light: '#ecfeff' },
  client:     { accent: '#059669', grad: 'linear-gradient(135deg,#059669,#047857)', light: '#ecfdf5' },
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotifStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  const role  = user?.role as string || 'client';
  const theme = ROLE_THEME[role] || ROLE_THEME.client;

  const nav = role === 'admin' ? adminNav
            : role === 'freelancer' ? freelancerNav
            : clientNav;

  useEffect(() => { fetchNotifications(); }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isActive = (path: string) => {
    if (path === '/admin' || path === '/freelancer' || path === '/client') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const initial = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:none } }
        @keyframes fadeIn    { from { opacity:0 } to { opacity:1 } }
        .nav-pill { transition: all .15s; cursor: pointer; user-select: none; }
        .nav-pill:hover { background: rgba(255,255,255,0.18) !important; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      {/* ── TOP NAVIGATION BAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 58, background: theme.grad,
        boxShadow: '0 2px 20px rgba(0,0,0,0.15)',
        display: 'flex', alignItems: 'center', padding: '0 16px',
      }}>
        <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', gap: 6 }}>

          {/* Logo */}
          <button onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', marginRight: 8, padding: 0, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 10, color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>WS</div>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              WorkSupport<span style={{ opacity: .6, fontWeight: 400 }}>360</span>
            </span>
          </button>

          {/* Desktop nav items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, overflow: 'hidden' }}>
            {/* Home button */}
            <button onClick={() => navigate('/')} className="nav-pill"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 9, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', flexShrink: 0 }}>
              <Home size={13}/> <span style={{ display: 'none' }}>Home</span>
            </button>
            {nav.map(item => (
              <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }} className="nav-pill"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: isActive(item.path) ? 700 : 500, whiteSpace: 'nowrap',
                  background: isActive(item.path) ? 'rgba(255,255,255,0.22)' : 'transparent',
                  color: '#fff', transition: 'all .15s',
                  boxShadow: isActive(item.path) ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                }}>
                <span style={{ fontSize: 13 }}>{item.emoji}</span>
                <span style={{ display: window.innerWidth < 1100 ? 'none' : undefined }}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); if (!notifOpen) fetchNotifications(); }}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', position: 'relative', transition: 'background .15s' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <Bell size={15}/>
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notif dropdown */}
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 340, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideDown .2s ease', zIndex: 999, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f8fafc' }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && <button onClick={() => markAllRead()} style={{ fontSize: 11, fontWeight: 600, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                        <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>No notifications yet
                      </div>
                    ) : notifications.slice(0, 8).map((n: any) => (
                      <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: n.isRead ? '#fff' : `${theme.light}`, cursor: 'pointer', transition: 'background .1s' }}
                        onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = '#f8fafc'}
                        onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = n.isRead ? '#fff' : theme.light}>
                        <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: 13, color: '#1e293b', marginBottom: 3 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile button */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 12, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', color: '#fff', transition: 'background .15s' }}
                onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                {/* Avatar */}
                <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                  {initial}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name?.split(' ')[0]}</span>
                <ChevronDown size={12} style={{ opacity: .7, transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}/>
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <div style={{ position: 'absolute', right: 0, top: 48, width: 260, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideDown .2s ease', zIndex: 999, overflow: 'hidden' }}>
                  {/* User info header */}
                  <div style={{ padding: '16px', background: `linear-gradient(135deg,${theme.accent}15,${theme.accent}08)`, borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: theme.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', boxShadow: `0 4px 14px ${theme.accent}40` }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{user?.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{user?.email}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3, background: `${theme.accent}15`, display: 'inline-block', padding: '1px 7px', borderRadius: 5 }}>{role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon: '🏠', label: 'Home', action: () => navigate('/') },
                    { icon: '📊', label: 'Dashboard', action: () => navigate(role === 'admin' ? '/admin' : role === 'freelancer' ? '/freelancer' : '/client') },
                    ...(role === 'freelancer' ? [{ icon: '👤', label: 'Edit Profile', action: () => navigate('/freelancer/profile') }] : []),
                    ...(role === 'client' ? [{ icon: '📋', label: 'Post Requirement', action: () => navigate('/client/post-requirement') }] : []),
                    { icon: '⚙️', label: 'Settings', action: () => {} },
                  ].map(item => (
                    <button key={item.label} onClick={() => { item.action(); setProfileOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#374151', textAlign: 'left', transition: 'background .1s' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = '#f8fafc'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = '#fff'}>
                      <span style={{ fontSize: 15 }}>{item.icon}</span>{item.label}
                    </button>
                  ))}

                  <div style={{ borderTop: '1px solid #f8fafc' }}>
                    <button onClick={async () => { await logout(); navigate('/'); setProfileOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#ef4444', transition: 'background .1s' }}
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = '#fef2f2'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = '#fff'}>
                      <LogOut size={14}/> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              style={{ display: 'none', width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
              className="mobile-menu-btn">
              {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn .2s ease' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 58, left: 0, right: 0, background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[{ emoji: '🏠', label: 'Home', path: '/' }, ...nav].map(item => (
              <button key={item.path} onClick={() => { navigate(item.path); setMobileOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: 'none', background: isActive(item.path) ? theme.light : '#fff', cursor: 'pointer', fontSize: 14, fontWeight: isActive(item.path) ? 700 : 500, color: isActive(item.path) ? theme.accent : '#374151', textAlign: 'left' }}>
                <span>{item.emoji}</span>{item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── PAGE CONTENT ── */}
      <main style={{ paddingTop: 58 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px', minHeight: 'calc(100vh - 58px)' }}>
          {children}
        </div>
      </main>

      {role !== 'agent' && <SupportChatWidget/>}
    </div>
  );
};

export default AppLayout;
