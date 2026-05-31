import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle, User, Clock, Check, X, Loader2,
  ChevronRight, Send, Headphones, AlertCircle, RefreshCw,
  CheckCircle, Circle, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

interface Ticket {
  id: string; subject: string; category: string; status: string;
  priority: string; userType?: string; contactEmail?: string;
  contactPhone?: string; botSummary?: string; userName?: string;
  userEmail?: string; assignedAgentName?: string; isRead: boolean;
  createdAt: string; lastMessageAt: string; messageCount: number;
}
interface Message {
  id: string; senderRole: string; content: string; isAi: boolean; sentAt: string;
}

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 border-red-200',
  high:   'bg-orange-100 text-orange-700 border-orange-200',
  normal: 'bg-blue-100 text-blue-700 border-blue-200',
  low:    'bg-gray-100 text-gray-600 border-gray-200',
};
const statusColor: Record<string, string> = {
  open:     'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  closed:   'bg-gray-100 text-gray-500',
};

const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);

  const loadTickets = async () => {
    try {
      const res = await api.get('/support/admin/tickets' + (filterStatus !== 'all' ? `?status=${filterStatus}` : ''));
      setTickets(res.data);
    } catch { toast.error('Failed to load tickets'); }
    finally { setLoading(false); }
  };

  const loadUnread = async () => {
    try {
      const res = await api.get('/support/admin/tickets/unread-count');
      setUnreadCount(res.data.count);
    } catch {}
  };

  const loadMessages = async (ticketId: string) => {
    try {
      const res = await api.get(`/support/tickets/${ticketId}/messages`);
      setMessages(res.data);
      setTimeout(() => msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch {}
  };

  useEffect(() => { loadTickets(); loadUnread(); }, [filterStatus]);

  // Poll for new messages when ticket selected
  useEffect(() => {
    if (selected) {
      loadMessages(selected.id);
      pollRef.current = setInterval(() => { loadMessages(selected.id); loadTickets(); }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [selected?.id]);

  const handleSelect = async (ticket: Ticket) => {
    setSelected(ticket);
    await loadMessages(ticket.id);
  };

  const handleAssign = async () => {
    if (!selected) return;
    try {
      await api.patch(`/support/admin/tickets/${selected.id}/assign`);
      toast.success('Ticket assigned to you!');
      await loadTickets();
      setSelected(t => t ? { ...t, status: 'assigned', assignedAgentName: 'Me' } : t);
    } catch { toast.error('Failed to assign'); }
  };

  const handleReply = async (resolve = false) => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/admin/tickets/${selected.id}/reply`, { message: reply.trim(), resolve });
      toast.success(resolve ? 'Ticket resolved!' : 'Reply sent!');
      setReply('');
      await loadMessages(selected.id);
      await loadTickets();
      if (resolve) setSelected(t => t ? { ...t, status: 'resolved' } : t);
    } catch { toast.error('Failed to send reply'); }
    finally { setSending(false); }
  };

  const handleStatus = async (status: string) => {
    if (!selected) return;
    try {
      await api.patch(`/support/admin/tickets/${selected.id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
      toast.success(`Status updated to ${status}`);
      setSelected(t => t ? { ...t, status } : t);
      await loadTickets();
    } catch {}
  };

  const filteredTickets = tickets.filter(t => filterStatus === 'all' || t.status === filterStatus);

  const quickReplies = [
    "Thank you for reaching out! I'm looking into your issue now and will update you shortly.",
    "I've reviewed your ticket. Could you please provide your project ID or invoice number?",
    "Your payment has been processed. Please allow 1-2 business days for the funds to reflect.",
    "I've escalated this to our technical team. You'll hear back within 4 business hours.",
    "Your issue has been resolved. Please let us know if you need anything else!",
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex bg-white rounded-2xl border border-gray-100 overflow-hidden">

      {/* ── Left: Ticket List ──────────────────────────────── */}
      <div className="w-80 border-r border-gray-100 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Headphones size={18} className="text-gray-700"/>
              <span className="font-black text-gray-900">Support Inbox</span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">{unreadCount}</span>
              )}
            </div>
            <button onClick={() => { loadTickets(); loadUnread(); }} className="text-gray-400 hover:text-gray-600 transition-colors"><RefreshCw size={15}/></button>
          </div>

          {/* Filter */}
          <div className="flex gap-1 flex-wrap">
            {['all','open','assigned','resolved'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === s ? 'text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}
                style={filterStatus === s ? { background: '#0f172a' } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400" size={24}/></div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageCircle size={32} className="mx-auto mb-2 opacity-30"/>
              <div className="text-sm">No tickets</div>
            </div>
          ) : filteredTickets.map(t => (
            <button key={t.id} onClick={() => handleSelect(t)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-all ${selected?.id === t.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} ${!t.isRead ? 'bg-amber-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className={`text-sm font-bold truncate flex-1 ${!t.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{t.subject}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold ${statusColor[t.status] || 'bg-gray-100 text-gray-500'}`}>{t.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColor[t.priority] || priorityColor.normal}`}>{t.priority}</span>
                {t.userType && <span className="text-xs text-gray-400 capitalize">· {t.userType}</span>}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="truncate">{t.userName || t.contactEmail || 'Guest'}</span>
                <span>{new Date(t.lastMessageAt).toLocaleDateString()}</span>
              </div>
              {t.assignedAgentName && (
                <div className="text-xs text-blue-600 mt-1 font-medium">👤 {t.assignedAgentName}</div>
              )}
              {!t.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"/>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: Conversation ────────────────────────────── */}
      {!selected ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <Headphones size={48} className="mx-auto mb-3 opacity-20"/>
            <div className="font-semibold">Select a ticket to view conversation</div>
            <div className="text-sm mt-1">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} in inbox</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Ticket header */}
          <div className="shrink-0 px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-black text-gray-900 text-sm">{selected.subject}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${statusColor[selected.status] || ''}`}>{selected.status}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${priorityColor[selected.priority] || ''}`}>{selected.priority}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                <span>From: <strong>{selected.userName || 'Guest'}</strong></span>
                {selected.contactEmail && <span>Email: {selected.contactEmail}</span>}
                {selected.contactPhone && <span>📞 {selected.contactPhone}</span>}
                {selected.userType && <span className="capitalize">Type: {selected.userType}</span>}
              </div>
              {selected.botSummary && (
                <div className="mt-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5">
                  🤖 Bot summary: {selected.botSummary}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {selected.status === 'open' && (
                <button onClick={handleAssign} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                  <User size={12}/> Assign to me
                </button>
              )}
              {selected.status !== 'resolved' && selected.status !== 'closed' && (
                <button onClick={() => handleStatus('resolved')} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">
                  <Check size={12}/> Resolve
                </button>
              )}
              {selected.status === 'resolved' && (
                <button onClick={() => handleStatus('open')} className="flex items-center gap-1.5 text-xs px-3 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50">
                  <RefreshCw size={12}/> Re-open
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 bg-gray-50/30 space-y-3">
            {messages.map(m => {
              const isUser = m.senderRole === 'user';
              const isAgent = m.senderRole === 'agent';
              const isAi = m.isAi;

              return (
                <div key={m.id} className={`flex gap-3 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 mt-0.5 text-white ${
                    isAgent ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                    isAi ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                    'bg-gradient-to-br from-gray-400 to-gray-600'
                  }`}>
                    {isAgent ? '👤' : isAi ? 'AI' : '🙋'}
                  </div>
                  <div className={`flex-1 max-w-lg ${isUser ? '' : 'flex flex-col items-end'}`}>
                    <div className={`text-xs font-semibold mb-1 ${isAgent ? 'text-green-700' : isAi ? 'text-purple-600' : 'text-gray-500'}`}>
                      {isAgent ? (selected.assignedAgentName || 'Agent') : isAi ? 'AI Bot' : (selected.userName || 'User')}
                      <span className="text-gray-300 ml-2 font-normal">{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`text-sm px-4 py-2.5 rounded-2xl leading-relaxed ${
                      isAgent ? 'bg-green-50 border border-green-100 text-gray-800 rounded-tr-sm' :
                      isAi ? 'bg-purple-50 border border-purple-100 text-gray-800 rounded-tr-sm' :
                      'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">No messages yet</div>
            )}
            <div ref={msgEndRef}/>
          </div>

          {/* Reply box */}
          {selected.status !== 'closed' && (
            <div className="shrink-0 border-t border-gray-100 p-4 bg-white">
              {/* Quick replies */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {quickReplies.map((q, i) => (
                  <button key={i} onClick={() => setReply(q)}
                    className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all text-left truncate max-w-[180px]">
                    {q.slice(0, 40)}…
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-end">
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); handleReply(false); } }}
                  placeholder="Type your reply… (Enter to send, Shift+Enter for new line)"
                  rows={3}
                  className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none bg-gray-50 focus:bg-white transition-all"/>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleReply(false)} disabled={!reply.trim() || sending}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all"
                    style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
                    {sending ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Send
                  </button>
                  <button onClick={() => handleReply(true)} disabled={!reply.trim() || sending}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 disabled:opacity-40 transition-all">
                    <Check size={14}/> Resolve
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
