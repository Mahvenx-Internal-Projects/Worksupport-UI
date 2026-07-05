import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronRight, Menu, X, Home, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import SupportChatWidget from '../SupportChatWidget';

interface NavItem { label: string; path: string; emoji: string; badge?: number }

const adminNav: NavItem[] = [
  { label: 'Home',        path: '/',                  emoji: '🏠' },
  { label: 'Dashboard',   path: '/admin',              emoji: '📊' },
  { label: 'Requirements',  path: '/admin/requirements', emoji: '📋' },
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
  { label: 'Attendance',  path: '/admin/attendance',   emoji: '📋' },
];

const freelancerNav: NavItem[] = [
  { label: 'Home',         path: '/',                        emoji: '🏠' },
  { label: 'Dashboard',    path: '/freelancer',              emoji: '📊' },
  { label: 'My Profile',   path: '/freelancer/profile',      emoji: '👤' },
  { label: 'Assignments',  path: '/freelancer/assignments',  emoji: '📁' },
  { label: 'Timesheets',   path: '/freelancer/timesheets',   emoji: '⏱️' },
  { label: 'Standups',     path: '/freelancer/standups',     emoji: '🎯' },
  { label: 'Earnings',     path: '/freelancer/earnings',     emoji: '💰' },
  { label: 'Meetings',     path: '/freelancer/meetings',     emoji: '📅' },
  { label: 'My Applications', path: '/freelancer/applications', emoji: '📋' },
  { label: 'Support',      path: '/support',                  emoji: '🎧' },
];

const clientNav: NavItem[] = [
  { label: 'Home',           path: '/',                    emoji: '🏠' },
  { label: 'Dashboard',      path: '/client',              emoji: '📊' },
  { label: 'My Requirements', path: '/client/requirements', emoji: '📋' },
  { label: 'Browse Experts', path: '/client/browse',       emoji: '🔍' },
  { label: 'My Projects',    path: '/client/projects',     emoji: '📁' },
  { label: 'Timesheets',     path: '/client/timesheets',   emoji: '⏱️' },
  { label: 'Invoices',       path: '/client/invoices',     emoji: '🧾' },
  { label: 'Feedback',       path: '/client/feedback',     emoji: '⭐' },
  { label: 'Support',        path: '/support',             emoji: '🎧' },
];

const ROLE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  admin:      { color: '#a855f7', bg: '#faf5ff', label: 'Admin Portal' },
  freelancer: { color: '#3b82f6', bg: '#eff6ff', label: 'Expert Portal' },
  client:     { color: '#10b981', bg: '#ecfdf5', label: 'Client Portal' },
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotifStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  useEffect(() => { const t = setInterval(fetchNotifications, 60000); return () => clearInterval(t); }, [fetchNotifications]);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nav  = user?.role === 'admin' ? adminNav : user?.role === 'freelancer' ? freelancerNav : clientNav;
  const rc   = ROLE_CONFIG[user?.role || 'client'];
  const W    = collapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Inter', system-ui, sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px } ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 3px }
        @keyframes slideIn { from { opacity:0; transform:translateX(-8px) } to { opacity:1; transform:none } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
        .nav-item:hover { background: rgba(255,255,255,0.12) !important; transform: translateX(2px) }
        .nav-item.active { background: rgba(255,255,255,0.15) !important; }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <div style={{
        width: W, flexShrink: 0, transition: 'width .25s cubic-bezier(.16,1,.3,1)',
        display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20,
        background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 100%)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Logo area */}
        <div style={{ padding: collapsed ? '18px 16px' : '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64, overflow: 'hidden' }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(249,115,22,0.4)' }}>WS</div>
          {!collapsed && (
            <div style={{ animation: 'slideIn .2s ease', overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Work<span style={{ color: '#f97316' }}>Support</span><span style={{ opacity: .35, fontWeight: 300 }}>360</span>
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: rc.color, marginTop: 1 }}>{rc.label}</div>
            </div>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{ margin: '10px 14px', padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideIn .2s ease' }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: rc.color + '33', border: `1.5px solid ${rc.color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: rc.color }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '6px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {nav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <div key={item.path} style={{ position: 'relative', marginBottom: 2 }}>
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: 10, padding: collapsed ? '10px 0' : '10px 12px',
                    borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                    transition: 'all .15s', textAlign: 'left',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    borderLeft: isActive ? `3px solid ${rc.color}` : '3px solid transparent',
                  }}>
                  <span style={{ fontSize: 17, flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
                  {!collapsed && (
                    <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap', animation: 'slideIn .2s ease' }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && isActive && <ChevronRight size={13} style={{ marginLeft: 'auto', color: rc.color, flexShrink: 0 }}/>}
                </button>
                {/* Tooltip when collapsed */}
                {collapsed && hovered === item.path && (
                  <div style={{ position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)', background: '#1e293b', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 100, pointerEvents: 'none', animation: 'fadeIn .15s ease' }}>
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div style={{ padding: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => setCollapsed(!collapsed)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, transition: 'all .15s' }}>
            <Menu size={16}/>
            {!collapsed && <span style={{ animation: 'slideIn .2s ease' }}>Collapse sidebar</span>}
          </button>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ height: 56, background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', zIndex: 10 }}>
          {/* Breadcrumb */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              {nav.find(n => n.path !== '/' && location.pathname.startsWith(n.path))?.label ||
               nav.find(n => n.path === location.pathname)?.label || 'Dashboard'}
            </div>
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) fetchNotifications(); }}
              style={{ width: 38, height: 38, borderRadius: 11, background: '#f8fafc', border: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', position: 'relative', transition: 'all .15s' }}>
              <Bell size={16}/>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div style={{ position: 'absolute', top: '110%', right: 0, width: 320, background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', zIndex: 999, overflow: 'hidden', animation: 'fadeIn .2s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f8fafc' }}>
                  <span style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>Notifications</span>
                  {unreadCount > 0 && <button onClick={() => { markAllRead(); setNotifOpen(false); }} style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>}
                </div>
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No notifications</div>
                  ) : notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8fafc', background: n.isRead ? '#fff' : '#fefce8', transition: 'background .15s' }}>
                      <div style={{ fontSize: 13, fontWeight: n.isRead ? 500 : 700, color: '#0f172a', marginBottom: 3 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: '#d1d5db', marginTop: 4 }}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${rc.color},${rc.color}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{user?.name}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
              </div>
            </div>
            <button onClick={async () => { await logout(); navigate('/'); }}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all .15s' }}
              title="Logout">
              <LogOut size={15}/>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>

      {/* Support chat — NOT for agent */}
      {(user?.role as string) !== 'agent' && <SupportChatWidget/>}
    </div>
  );
};

export default AppLayout;
