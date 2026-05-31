import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, LogOut, ChevronDown, Menu, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { Avatar } from '../common';
import SupportChatWidget from '../SupportChatWidget';

interface NavItem { label: string; path: string; icon: string }

const adminNav: NavItem[] = [
  { label: '🏠 Home', path: '/', icon: '🏠' },
  { label: 'Dashboard', path: '/admin', icon: '⊞' },
  { label: 'Requests', path: '/admin/requests', icon: '📥' },
  { label: 'Meetings', path: '/admin/meetings', icon: '📅' },
  { label: 'Projects', path: '/admin/projects', icon: '📁' },
  { label: 'Timesheets', path: '/admin/timesheets', icon: '⏱' },
  { label: 'Invoices', path: '/admin/invoices', icon: '🧾' },
  { label: 'Payments', path: '/admin/payments', icon: '💳' },
  { label: 'Freelancers', path: '/admin/freelancers', icon: '👤' },
  { label: 'Clients', path: '/admin/clients', icon: '🏢' },
  { label: 'Leaderboard', path: '/admin/leaderboard', icon: '🏆' },
  { label: 'Reports', path: '/admin/reports', icon: '📊' },
];
const freelancerNav: NavItem[] = [
  { label: '🏠 Home', path: '/', icon: '🏠' },
  { label: 'Dashboard', path: '/freelancer', icon: '⊞' },
  { label: 'My Profile', path: '/freelancer/profile', icon: '👤' },
  { label: 'Assignments', path: '/freelancer/assignments', icon: '📁' },
  { label: 'Timesheets', path: '/freelancer/timesheets', icon: '⏱' },
  { label: 'Standups', path: '/freelancer/standups', icon: '📋' },
  { label: 'Earnings', path: '/freelancer/earnings', icon: '💰' },
  { label: 'Meetings', path: '/freelancer/meetings', icon: '📅' },
  { label: 'Certifications', path: '/freelancer/certifications', icon: '🏅' },
];
const clientNav: NavItem[] = [
  { label: '🏠 Home', path: '/', icon: '🏠' },
  { label: 'Dashboard', path: '/client', icon: '⊞' },
  { label: 'Browse Experts', path: '/client/browse', icon: '🔍' },
  { label: 'My Projects', path: '/client/projects', icon: '📁' },
  { label: 'Timesheets', path: '/client/timesheets', icon: '⏱' },
  { label: 'Invoices', path: '/client/invoices', icon: '🧾' },
  { label: 'Feedback', path: '/client/feedback', icon: '⭐' },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { unreadCount, notifications, fetchNotifications, markAllRead } = useNotifStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  // Fetch real notifications on mount
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
  // Refresh every 60s
  useEffect(() => {
    const t = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  const nav = user?.role === 'admin' ? adminNav : user?.role === 'freelancer' ? freelancerNav : clientNav;
  const roleColors: Record<string, string> = { admin: 'bg-purple-100 text-purple-700', freelancer: 'bg-blue-100 text-blue-700', client: 'bg-green-100 text-green-700' };

  return (
    <>
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'} transition-all duration-300 flex flex-col shrink-0`} style={{ background: '#0D1240' }}>
        <div className="px-5 py-5 border-b border-white border-opacity-10">
          <div className="text-white font-bold text-lg">Work<span className="text-orange-400">Support</span></div>
          <div className="text-white text-opacity-40 text-xs mt-0.5">360°</div>
        </div>
        <div className="px-4 py-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[user?.role || 'client']}`}>{user?.role} portal</span>
        </div>
        <nav className="flex-1 px-3 pb-4 overflow-y-auto">
          {nav.map(item => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 text-left
                ${location.pathname === item.path && item.path !== '/' ? 'bg-blue-600 text-white' : item.path === '/' ? 'text-orange-400 hover:bg-white hover:bg-opacity-10 hover:text-orange-300' : 'text-gray-400 hover:bg-white hover:bg-opacity-10 hover:text-white'}`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white border-opacity-10">
          <div className="flex items-center gap-2.5">
            {user?.picture ? (
              <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover shrink-0"/>
            ) : (
              <Avatar name={user?.name || 'U'} size="sm" color="bg-blue-600 text-white"/>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
            </div>
            <button onClick={() => logout().then(() => navigate('/login'))} title="Logout"
              className="text-gray-400 hover:text-white transition-colors p-1"><LogOut size={15}/></button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-gray-800 transition-colors p-1">
              {sidebarOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
            <div className="text-sm text-gray-400 hidden sm:block">
              {location.pathname.split('/').filter(Boolean).map((seg, i) => (
                <span key={i} className="capitalize">{i > 0 && ' / '}{seg}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                <Bell size={19}/>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none font-medium">{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Notifications</span>
                    {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">Mark all read</button>}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
                    ) : notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50' : ''}`}>
                        <div className="flex items-start gap-2.5">
                          <div className="text-base mt-0.5 shrink-0">
                            {n.type === 'payment' ? '💳' : n.type === 'request' ? '📥' : n.type === 'timesheet' ? '⏱' : n.type === 'meeting' ? '📅' : '🔔'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"/>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* User */}
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
              ) : (
                <Avatar name={user?.name || 'U'} size="sm"/>
              )}
              <div className="hidden sm:block text-sm font-medium text-gray-900">{user?.name}</div>
              <ChevronDown size={14} className="text-gray-400"/>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">{children}</main>
      </div>
    </div>
    <SupportChatWidget/>
    </>
  );
};

export default AppLayout;
