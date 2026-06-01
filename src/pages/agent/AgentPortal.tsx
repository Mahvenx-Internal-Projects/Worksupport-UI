import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, X, Send, Loader2, Check, RefreshCw, CheckCircle,
  Headphones, Clock, User, LogOut, Bell, AlertCircle, Search,
  Mail, Phone, ChevronDown, Zap, Filter, Circle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

interface Ticket {
  id: string; subject: string; category: string; status: string; priority: string;
  userType?: string; contactEmail?: string; contactPhone?: string;
  botSummary?: string; userName?: string; userEmail?: string;
  assignedAgentName?: string; isRead: boolean;
  createdAt: string; lastMessageAt: string; messageCount: number;
}
interface Msg { id: string; senderRole: string; content: string; isAi: boolean; sentAt: string; }

const PC: Record<string,{bg:string;txt:string;dot:string}> = {
  urgent:{bg:'#fee2e2',txt:'#dc2626',dot:'#dc2626'},
  high:{bg:'#fff7ed',txt:'#ea580c',dot:'#f97316'},
  normal:{bg:'#eff6ff',txt:'#2563eb',dot:'#3b82f6'},
  low:{bg:'#f8fafc',txt:'#64748b',dot:'#94a3b8'},
};
const SC: Record<string,{bg:string;txt:string}> = {
  open:{bg:'#fff7ed',txt:'#c2410c'},
  assigned:{bg:'#eff6ff',txt:'#1d4ed8'},
  resolved:{bg:'#f0fdf4',txt:'#16a34a'},
  closed:{bg:'#f8fafc',txt:'#64748b'},
  bot:{bg:'#faf5ff',txt:'#7c3aed'},
};

const QUICK = [
  "Thanks for reaching out! I'm looking into your issue right now.",
  "Could you share your project ID or invoice number so I can check faster?",
  "I've confirmed your payment has been processed. Allow 1-2 business days to reflect.",
  "I've escalated this to our technical team — you'll hear back within 4 hours.",
  "Your issue is now resolved. Let me know if anything else comes up!",
  "Payouts are processed within 3 business days after client payment. I'll investigate.",
  "For faster help: WhatsApp +91-9441363687 (Mon-Sat 9am-7pm IST).",
];

const AgentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sel, setSel]     = useState<Ticket | null>(null);
  const [msgs, setMsgs]   = useState<Msg[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter]   = useState('open');
  const [search, setSearch]   = useState('');
  const [unread, setUnread]   = useState(0);
  const [showQuick, setShowQuick] = useState(false);
  const [myOnly, setMyOnly] = useState(false);
  const [actionMenu, setActionMenu] = useState(false);
  const msgEnd = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scroll = () => setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 80);

  const loadTickets = useCallback(async () => {
    try {
      const r = await api.get(`/support/admin/tickets${filter !== 'all' ? `?status=${filter}` : ''}`);
      setTickets(r.data);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  }, [filter]);

  const loadUnread = useCallback(async () => {
    try { const r = await api.get('/support/admin/tickets/unread-count'); setUnread(r.data.count); } catch {}
  }, []);

  const loadMsgs = useCallback(async (tid: string) => {
    try { const r = await api.get(`/support/tickets/${tid}/messages`); setMsgs(r.data); scroll(); } catch {}
  }, []);

  useEffect(() => { loadTickets(); loadUnread(); }, [filter]);

  // Poll messages every 4s when ticket selected
  useEffect(() => {
    clearInterval(pollRef.current);
    if (sel) {
      loadMsgs(sel.id);
      pollRef.current = setInterval(async () => {
        await loadMsgs(sel.id);
        await loadUnread();
        // Refresh ticket info for status changes
        try {
          const r = await api.get(`/support/admin/tickets${filter !== 'all' ? `?status=${filter}` : ''}`);
          setTickets(r.data);
        } catch {}
      }, 4000);
    }
    return () => clearInterval(pollRef.current);
  }, [sel?.id]);

  const pick = async (t: Ticket) => {
    setSel(t); setShowQuick(false); setReply('');
    await loadMsgs(t.id);
    inputRef.current?.focus();
  };

  const assign = async () => {
    if (!sel) return;
    try {
      await api.patch(`/support/admin/tickets/${sel.id}/assign`);
      toast.success('Ticket assigned to you!');
      setSel(t => t ? { ...t, status: 'assigned', assignedAgentName: user?.name || 'Me' } : t);
      loadTickets();
    } catch { toast.error('Assign failed'); }
  };

  const sendReply = async (resolve = false) => {
    if (!sel || !reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/admin/tickets/${sel.id}/reply`, { message: reply.trim(), resolve });
      setReply('');
      toast.success(resolve ? '✅ Resolved!' : 'Reply sent!');
      if (resolve) setSel(t => t ? { ...t, status: 'resolved' } : t);
      await loadMsgs(sel.id);
      loadTickets();
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  const setStatus = async (status: string) => {
    if (!sel) return;
    try {
      await api.patch(`/support/admin/tickets/${sel.id}/status`,
        JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
      setSel(t => t ? { ...t, status } : t);
      loadTickets();
      toast.success(`Marked as ${status}`);
      setActionMenu(false);
    } catch {}
  };

  // ── Create ticket manually for a customer ────────────────
  const [newTkt, setNewTkt] = useState({ email: '', subject: '', desc: '', show: false });

  const createManualTicket = async () => {
    if (!newTkt.email || !newTkt.subject) { toast.error('Email and subject required'); return; }
    try {
      await api.post('/support/tickets', {
        subject: newTkt.subject,
        category: 'general',
        priority: 'normal',
        userType: 'client',
        botSummary: `Manually created by agent ${user?.name}`,
        contactEmail: newTkt.email,
        firstMessage: newTkt.desc || newTkt.subject,
      });
      toast.success('Ticket created and assigned!');
      setNewTkt({ email: '', subject: '', desc: '', show: false });
      loadTickets();
    } catch { toast.error('Failed to create ticket'); }
  };

  const visible = tickets.filter(t => {
    if (myOnly && t.assignedAgentName !== user?.name) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.subject.toLowerCase().includes(q) ||
        (t.userName || '').toLowerCase().includes(q) ||
        (t.contactEmail || '').toLowerCase().includes(q);
    }
    return true;
  });

  const urgentN = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length;
  const openN   = tickets.filter(t => t.status === 'open' || t.status === 'assigned').length;
  const myN     = tickets.filter(t => t.assignedAgentName === user?.name && t.status !== 'resolved').length;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        *{box-sizing:border-box}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        input::placeholder,textarea::placeholder{color:#94a3b8}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
      `}</style>

      {/* ── TOP BAR ──────────────────────────────────────── */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', flexShrink: 0, zIndex: 10 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 11 }}>WS</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', lineHeight: 1.2 }}>WorkSupport<span style={{ color: '#f97316' }}>360</span></div>
            <div style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1 }}>Agent Portal</div>
          </div>
        </div>

        {/* Stats pills */}
        <div style={{ display: 'flex', gap: 8, flex: 1 }}>
          {[
            { label: 'Open', n: openN, c: '#f97316', bg: '#fff7ed' },
            { label: 'Mine', n: myN, c: '#4f46e5', bg: '#eff6ff' },
            { label: 'Urgent', n: urgentN, c: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 100, background: s.bg, fontSize: 12, fontWeight: 700, color: s.c }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.c, display: 'inline-block' }}/>
              {s.n} {s.label}
            </div>
          ))}
          {urgentN > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: '#dc2626', animation: 'fadeIn .3s ease' }}>
              <AlertCircle size={14}/> {urgentN} urgent need attention!
            </div>
          )}
        </div>

        {/* New ticket button */}
        <button onClick={() => setNewTkt(n => ({ ...n, show: true }))}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#eff6ff'; (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
          <MessageCircle size={13}/> New ticket
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => { loadTickets(); loadUnread(); }} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <Bell size={16}/>
          </button>
          {unread > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #fff' }}>{unread}</span>}
        </div>

        {/* Agent */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: 12, padding: '6px 12px' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11 }}>
            {user?.name?.[0] || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#065f46', lineHeight: 1.2 }}>{user?.name}</div>
            <div style={{ fontSize: 10, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
              Online
            </div>
          </div>
        </div>

        <button onClick={async () => { await logout(); navigate('/'); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, background: 'transparent', border: '1px solid #e2e8f0', fontSize: 12, color: '#94a3b8', cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
          <LogOut size={13}/> Logout
        </button>
      </div>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Ticket list */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column' }}>
          {/* Filters */}
          <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets, emails…"
                style={{ width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, border: '1.5px solid #f1f5f9', borderRadius: 10, fontSize: 12, outline: 'none', background: '#f8fafc', color: '#374151' }}/>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {['open', 'assigned', 'resolved', 'all'].map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: '4px 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', background: filter === s ? '#0f172a' : '#f8fafc', color: filter === s ? '#fff' : '#64748b', transition: 'all .15s' }}>
                  {s}
                </button>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto', fontSize: 11, color: '#64748b', cursor: 'pointer' }}>
                <input type="checkbox" checked={myOnly} onChange={e => setMyOnly(e.target.checked)} style={{ width: 12, height: 12 }}/>
                Mine
              </label>
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}><Loader2 size={20} style={{ color: '#d1d5db', animation: 'spin 1s linear infinite' }}/></div>
            ) : visible.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 48, color: '#d1d5db' }}>
                <Headphones size={28} style={{ margin: '0 auto 8px' }}/>
                <div style={{ fontSize: 12, fontWeight: 600 }}>No tickets</div>
              </div>
            ) : visible.map(t => {
              const pc = PC[t.priority] || PC.normal;
              const sc = SC[t.status] || SC.open;
              const isSelected = sel?.id === t.id;
              return (
                <button key={t.id} onClick={() => pick(t)} style={{
                  width: '100%', textAlign: 'left', padding: '12px 14px',
                  borderBottom: '1px solid #f8fafc', cursor: 'pointer', transition: 'all .15s',
                  background: isSelected ? '#eff6ff' : !t.isRead ? '#fefce8' : '#fff',
                  borderLeft: isSelected ? '3px solid #4f46e5' : '3px solid transparent',
                  borderRight: 'none', borderTop: 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pc.dot, flexShrink: 0, marginTop: 4 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: !t.isRead ? 800 : 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{t.subject}</div>
                      <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.contactEmail || t.userName || 'Guest'}
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: sc.bg, color: sc.txt, flexShrink: 0 }}>{t.status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 16 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: pc.bg, color: pc.txt }}>{t.priority}</span>
                    {t.userType && <span style={{ fontSize: 10, color: '#94a3b8', textTransform: 'capitalize' }}>{t.userType}</span>}
                    {t.assignedAgentName && <span style={{ fontSize: 10, color: '#4f46e5', fontWeight: 600, marginLeft: 'auto' }}>👤 {t.assignedAgentName}</span>}
                    {!t.isRead && t.status !== 'resolved' && <span style={{ fontSize: 9, fontWeight: 800, background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: 6, marginLeft: 'auto' }}>NEW</span>}
                  </div>
                  <div style={{ fontSize: 10, color: '#d1d5db', paddingLeft: 16, marginTop: 4 }}>
                    {new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {t.messageCount} msgs
                  </div>
                </button>
              );
            })}
          </div>

          {/* Stats footer */}
          <div style={{ borderTop: '1px solid #f1f5f9', padding: '10px 14px', background: '#fafafa', display: 'flex', justifyContent: 'space-around' }}>
            {[
              { label: 'Open', n: tickets.filter(t => t.status === 'open').length, c: '#f97316' },
              { label: 'Mine', n: tickets.filter(t => t.assignedAgentName === user?.name).length, c: '#4f46e5' },
              { label: 'Done', n: tickets.filter(t => t.status === 'resolved').length, c: '#059669' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: s.c }}>{s.n}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONVERSATION ─────────────────────────────── */}
        {!sel ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: 16 }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: '#fff', border: '2px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <Headphones size={32} style={{ color: '#d1d5db' }}/>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#374151', marginBottom: 6 }}>Select a ticket to start chatting</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{visible.length} ticket{visible.length !== 1 ? 's' : ''} in inbox</div>
            </div>
            {urgentN > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: '10px 18px', fontSize: 13, fontWeight: 700, color: '#dc2626' }}>
                <AlertCircle size={16}/> {urgentN} urgent ticket{urgentN > 1 ? 's' : ''} need attention!
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Ticket header */}
            <div style={{ padding: '12px 20px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{sel.subject}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, background: SC[sel.status]?.bg, color: SC[sel.status]?.txt }}>{sel.status}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 8, border: `1px solid ${PC[sel.priority]?.dot}33`, background: PC[sel.priority]?.bg, color: PC[sel.priority]?.txt }}>{sel.priority}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: '#64748b' }}>
                    {sel.contactEmail && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11}/>{sel.contactEmail}</span>}
                    {sel.contactPhone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11}/>{sel.contactPhone}</span>}
                    {sel.userType && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, textTransform: 'capitalize' }}>{sel.userType}</span>}
                    <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}>#{sel.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  {sel.botSummary && (
                    <div style={{ marginTop: 6, fontSize: 11, color: '#7c3aed', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '5px 10px', maxWidth: 600 }}>
                      🤖 {sel.botSummary}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-start' }}>
                  {sel.status === 'open' && (
                    <button onClick={assign}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: '#4f46e5', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <User size={12}/> Pick up
                    </button>
                  )}
                  {sel.status !== 'resolved' && sel.status !== 'closed' && (
                    <button onClick={() => setStatus('resolved')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      <Check size={12}/> Resolve
                    </button>
                  )}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setActionMenu(!actionMenu)}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 12px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12, color: '#64748b', cursor: 'pointer' }}>
                      More <ChevronDown size={12}/>
                    </button>
                    {actionMenu && (
                      <div style={{ position: 'absolute', top: '110%', right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, minWidth: 160, overflow: 'hidden' }}>
                        {[['open','Re-open'],['closed','Close'],['assigned','Mark assigned']].map(([s, l]) => (
                          <button key={s} onClick={() => setStatus(s)}
                            style={{ width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: 13, fontWeight: 600, color: '#374151', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'background .15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#f8fafc'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={() => { loadMsgs(sel.id); loadTickets(); }}
                    style={{ width: 34, height: 34, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
                    <RefreshCw size={13}/>
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {msgs.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 40, color: '#d1d5db' }}>
                  <MessageCircle size={28} style={{ margin: '0 auto 8px' }}/>
                  <div style={{ fontSize: 12 }}>No messages yet</div>
                </div>
              ) : msgs.map(m => {
                const isAgent = m.senderRole === 'agent';
                const isUser  = m.senderRole === 'user';
                const isAi    = m.isAi;
                return (
                  <div key={m.id} style={{ display: 'flex', gap: 10, flexDirection: isAgent ? 'row-reverse' : 'row', animation: 'fadeIn .3s ease' }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 12, color: '#fff', flexShrink: 0, marginTop: 2,
                      background: isAgent ? '#059669' : isAi ? '#7c3aed' : '#64748b'
                    }}>
                      {isAgent ? (user?.name?.[0] || 'A') : isAi ? '🤖' : (sel.userName?.[0] || sel.contactEmail?.[0] || '?')}
                    </div>
                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isAgent ? 'flex-end' : 'flex-start', gap: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isAgent ? '#059669' : isAi ? '#7c3aed' : '#64748b' }}>
                          {isAgent ? (sel.assignedAgentName || user?.name || 'Agent') : isAi ? 'AI Bot' : (sel.userName || sel.contactEmail || 'User')}
                        </span>
                        <span style={{ fontSize: 10, color: '#d1d5db' }}>
                          {new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div style={{
                        padding: '10px 14px', borderRadius: isAgent ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        fontSize: 13, lineHeight: 1.6, maxWidth: '100%',
                        background: isAgent ? '#059669' : isAi ? '#faf5ff' : '#fff',
                        color: isAgent ? '#fff' : '#374151',
                        border: isAgent ? 'none' : isAi ? '1px solid #e9d5ff' : '1px solid #f1f5f9',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        wordBreak: 'break-word',
                      }}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={msgEnd}/>
            </div>

            {/* Reply area */}
            {sel.status !== 'closed' && (
              <div style={{ background: '#fff', borderTop: '1px solid #f1f5f9', padding: '12px 16px', flexShrink: 0 }}>
                {/* Assigned banner */}
                {sel.assignedAgentName && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '6px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, fontSize: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800 }}>{sel.assignedAgentName[0]}</div>
                    <span style={{ color: '#065f46' }}>Assigned to <strong>{sel.assignedAgentName}</strong></span>
                    {sel.status === 'resolved' && <span style={{ marginLeft: 'auto', color: '#059669', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={11}/>Resolved</span>}
                  </div>
                )}

                {/* Quick replies */}
                <div style={{ marginBottom: 10 }}>
                  <button onClick={() => setShowQuick(!showQuick)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: showQuick ? '#0f172a' : '#f8fafc', color: showQuick ? '#fff' : '#64748b', border: `1.5px solid ${showQuick ? '#0f172a' : '#e2e8f0'}`, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                    <Zap size={11}/> Quick replies {showQuick ? '▲' : '▼'}
                  </button>
                  {showQuick && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 8, padding: '10px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                      {QUICK.map((q, i) => (
                        <button key={i} onClick={() => { setReply(q); setShowQuick(false); inputRef.current?.focus(); }}
                          style={{ textAlign: 'left', padding: '7px 10px', fontSize: 11, fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 9, background: '#fff', color: '#374151', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#4f46e5'; (e.currentTarget as HTMLElement).style.color = '#4338ca'; (e.currentTarget as HTMLElement).style.background = '#eef2ff'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                          → {q.slice(0, 45)}…
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <textarea ref={inputRef} value={reply} onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); sendReply(false); } if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); sendReply(true); } }}
                    placeholder="Type reply… (Enter = Send · Ctrl+Enter = Send & Resolve)"
                    rows={3}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border .15s', background: '#fafafa', color: '#374151' }}
                    onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#4f46e5'}
                    onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = '#e2e8f0'}/>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                    <button onClick={() => sendReply(false)} disabled={!reply.trim() || sending}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: (!reply.trim() || sending) ? 0.4 : 1, transition: 'all .15s' }}>
                      {sending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={14}/>} Send
                    </button>
                    <button onClick={() => sendReply(true)} disabled={!reply.trim() || sending}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 12, background: '#059669', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: (!reply.trim() || sending) ? 0.4 : 1, transition: 'all .15s' }}>
                      <Check size={14}/> Resolve
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#d1d5db', padding: '0 2px' }}>
                  <span>Reply goes to user's chat + email notification</span>
                  <span>Ctrl+Enter to send and resolve</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CREATE TICKET MODAL ──────────────────────────── */}
      {newTkt.show && (
        <div onClick={() => setNewTkt(n => ({ ...n, show: false }))}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, width: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)', animation: 'fadeIn .25s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Create ticket for customer</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Agent-initiated ticket with auto-assignment</div>
              </div>
              <button onClick={() => setNewTkt(n => ({ ...n, show: false }))} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <X size={14}/>
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>CUSTOMER EMAIL *</label>
                <input type="email" value={newTkt.email} onChange={e => setNewTkt(n => ({ ...n, email: e.target.value }))}
                  placeholder="customer@company.com"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border .15s' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>ISSUE SUBJECT *</label>
                <input value={newTkt.subject} onChange={e => setNewTkt(n => ({ ...n, subject: e.target.value }))}
                  placeholder="e.g. Payment not reflecting, Project not starting…"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border .15s' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>DESCRIPTION</label>
                <textarea rows={3} value={newTkt.desc} onChange={e => setNewTkt(n => ({ ...n, desc: e.target.value }))}
                  placeholder="Describe the issue in detail…"
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box', transition: 'border .15s' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
              </div>
              <button onClick={createManualTicket}
                style={{ padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <MessageCircle size={16}/> Create & assign ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentPortal;
