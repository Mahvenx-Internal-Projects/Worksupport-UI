import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle, X, Send, Loader2, Check, RefreshCw,
  Headphones, Clock, User, LogOut, Bell, AlertCircle,
  Search, Zap, Mail, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

// ── Types ─────────────────────────────────────────────────────
interface Ticket {
  id: string; subject: string; category: string;
  status: string; priority: string;
  userType?: string; contactEmail?: string; contactPhone?: string;
  botSummary?: string; userName?: string; userEmail?: string;
  assignedAgentName?: string; isRead: boolean;
  createdAt: string; lastMessageAt: string; messageCount: number;
}
interface Message {
  id: string; senderRole: string; content: string; isAi: boolean; sentAt: string;
}

const P_BG: Record<string,string>   = { urgent:'#fee2e2', high:'#fff7ed', normal:'#eff6ff', low:'#f8fafc' };
const P_TXT: Record<string,string>  = { urgent:'#dc2626', high:'#ea580c', normal:'#2563eb', low:'#64748b' };
const P_DOT: Record<string,string>  = { urgent:'#dc2626', high:'#f97316', normal:'#3b82f6', low:'#94a3b8' };
const S_BG: Record<string,string>   = { open:'#fff7ed', assigned:'#eff6ff', resolved:'#f0fdf4', closed:'#f8fafc', bot:'#faf5ff' };
const S_TXT: Record<string,string>  = { open:'#c2410c', assigned:'#1d4ed8', resolved:'#16a34a', closed:'#64748b', bot:'#7c3aed' };

const QUICK_REPLIES = [
  { label: 'Checking now',    text: "Thanks for reaching out! I'm looking into your issue right now and will update you in a few minutes." },
  { label: 'Need project ID', text: "To help you faster, could you please share your project ID or invoice number? You can find it in your dashboard." },
  { label: 'Payment done',    text: "Your payment has been processed. Please allow 1–2 business days for the funds to reflect in your account." },
  { label: 'Escalated',       text: "I've escalated this to our technical team. You'll receive an update within 4 business hours. Sorry for the inconvenience." },
  { label: 'Resolved ✅',     text: "Your issue has been resolved! Please check your dashboard and let me know if everything looks good." },
  { label: 'Payout 3 days',   text: "Payouts are processed within 3 business days of client payment confirmation. If it's been longer, please share your bank details so I can investigate." },
  { label: 'WhatsApp',        text: "For faster help, WhatsApp us: +91-9441363687. Available Mon–Sat, 9am–7pm IST." },
];

const AgentPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tickets, setTickets]       = useState<Ticket[]>([]);
  const [selected, setSelected]     = useState<Ticket | null>(null);
  const [messages, setMessages]     = useState<Message[]>([]);
  const [reply, setReply]           = useState('');
  const [loading, setLoading]       = useState(true);
  const [sending, setSending]       = useState(false);
  const [filterStatus, setFilter]   = useState('open');
  const [searchQ, setSearchQ]       = useState('');
  const [unread, setUnread]         = useState(0);
  const [showQuick, setShowQuick]   = useState(false);
  const [myOnly, setMyOnly]         = useState(false);
  const msgEnd = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scroll = () => setTimeout(() => msgEnd.current?.scrollIntoView({ behavior: 'smooth' }), 80);

  const loadTickets = useCallback(async () => {
    try {
      const r = await api.get(`/support/admin/tickets${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`);
      setTickets(r.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  const loadUnread = useCallback(async () => {
    try { const r = await api.get('/support/admin/tickets/unread-count'); setUnread(r.data.count); } catch {}
  }, []);

  const loadMsgs = useCallback(async (tid: string) => {
    try { const r = await api.get(`/support/tickets/${tid}/messages`); setMessages(r.data); scroll(); } catch {}
  }, []);

  useEffect(() => { loadTickets(); loadUnread(); }, [filterStatus]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (selected) { pollRef.current = setInterval(() => { loadMsgs(selected.id); loadUnread(); }, 4000); }
    return () => clearInterval(pollRef.current);
  }, [selected?.id]);

  const pick = async (t: Ticket) => { setSelected(t); setShowQuick(false); setReply(''); await loadMsgs(t.id); inputRef.current?.focus(); };

  const assign = async () => {
    if (!selected) return;
    try {
      await api.patch(`/support/admin/tickets/${selected.id}/assign`);
      toast.success('Ticket assigned to you!');
      setSelected(t => t ? { ...t, status: 'assigned', assignedAgentName: user?.name || 'Me' } : t);
      loadTickets();
    } catch { toast.error('Assign failed'); }
  };

  const sendReply = async (resolve = false) => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/support/admin/tickets/${selected.id}/reply`, { message: reply.trim(), resolve });
      setReply('');
      toast.success(resolve ? 'Ticket resolved!' : 'Sent!');
      if (resolve) setSelected(t => t ? { ...t, status: 'resolved' } : t);
      await loadMsgs(selected.id); loadTickets();
    } catch { toast.error('Failed'); }
    finally { setSending(false); }
  };

  const setStatus = async (status: string) => {
    if (!selected) return;
    await api.patch(`/support/admin/tickets/${selected.id}/status`, JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } });
    setSelected(t => t ? { ...t, status } : t); loadTickets(); toast.success(`Marked ${status}`);
  };

  const visible = tickets.filter(t => {
    if (myOnly && t.assignedAgentName !== user?.name) return false;
    if (searchQ) {
      const q = searchQ.toLowerCase();
      return t.subject.toLowerCase().includes(q) || (t.userName||'').toLowerCase().includes(q) || (t.contactEmail||'').toLowerCase().includes(q);
    }
    return true;
  });

  const urgentN = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length;

  return (
    <div className="h-screen flex flex-col bg-gray-50" style={{ fontFamily: "'Outfit',sans-serif" }}>

      {/* ── NAV ──────────────────────────────────────────── */}
      <div className="shrink-0 h-14 flex items-center justify-between px-5 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl font-black text-white text-xs flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#f97316,#dc2626)' }}>WS</div>
          <div>
            <div className="font-black text-gray-900 text-sm leading-none">WorkSupport<span className="text-orange-500">360</span></div>
            <div className="text-xs text-gray-400 leading-none">Support Agent Portal</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-5 text-sm">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-400 rounded-full"/><strong className="text-gray-800">{tickets.filter(t=>t.status==='open').length}</strong><span className="text-gray-400 ml-1">open</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full"/><strong className="text-gray-800">{tickets.filter(t=>t.status==='assigned').length}</strong><span className="text-gray-400 ml-1">assigned</span></div>
          {urgentN > 0 && <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-xl"><AlertCircle size={12} className="animate-pulse"/>{urgentN} urgent</div>}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => { loadTickets(); loadUnread(); }} className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
              <Bell size={16} className="text-gray-600"/>
            </button>
            {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-black flex items-center justify-center border-2 border-white">{unread}</span>}
          </div>

          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-1.5">
            <div className="w-7 h-7 rounded-lg bg-green-600 text-white font-black text-xs flex items-center justify-center">{user?.name?.[0]||'A'}</div>
            <div className="hidden sm:block">
              <div className="text-xs font-black text-green-900 leading-none">{user?.name}</div>
              <div className="text-xs text-green-600 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>Online</div>
            </div>
          </div>

          <button onClick={async () => { await logout(); navigate('/login'); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 transition-all">
            <LogOut size={13}/><span className="hidden sm:inline ml-1">Logout</span>
          </button>
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Ticket list */}
        <div className="w-80 shrink-0 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-3 border-b border-gray-100 space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search tickets…" className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none bg-gray-50 focus:bg-white focus:border-gray-400"/>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {['open','assigned','resolved','all'].map(s => (
                <button key={s} onClick={() => setFilter(s)} className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus===s?'text-white':'bg-gray-50 text-gray-400 hover:text-gray-600'}`} style={filterStatus===s?{background:'#0f172a'}:{}}>{s}</button>
              ))}
              <label className="flex items-center gap-1 ml-auto cursor-pointer">
                <input type="checkbox" checked={myOnly} onChange={e => setMyOnly(e.target.checked)} className="w-3 h-3 rounded"/>
                <span className="text-xs text-gray-500">Mine</span>
              </label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex justify-center py-10"><Loader2 size={20} className="animate-spin text-gray-300"/></div> :
             visible.length === 0 ? <div className="text-center py-12 text-gray-300 text-xs"><Headphones size={28} className="mx-auto mb-2 opacity-30"/>No tickets</div> :
             visible.map(t => (
              <button key={t.id} onClick={() => pick(t)} className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-all ${selected?.id===t.id?'bg-blue-50 border-l-4 border-l-blue-500':''} ${!t.isRead&&t.status!=='resolved'?'bg-amber-50/30':''}`}>
                <div className="flex items-start gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{background:P_DOT[t.priority]||P_DOT.normal}}/>
                  <span className={`text-xs font-bold flex-1 truncate ${!t.isRead?'text-gray-900':'text-gray-600'}`}>{t.subject}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{background:S_BG[t.status]||'#f8fafc',color:S_TXT[t.status]||'#64748b'}}>{t.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 ml-4">
                  <span className="truncate">{t.userName||t.contactEmail||'Guest'}</span>
                  <span className="shrink-0 ml-2">{new Date(t.lastMessageAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center gap-1.5 ml-4 mt-1 flex-wrap">
                  <span className="text-xs px-1.5 py-0.5 rounded-md font-medium" style={{background:P_BG[t.priority]||P_BG.normal,color:P_TXT[t.priority]||P_TXT.normal}}>{t.priority}</span>
                  {t.userType && <span className="text-xs text-gray-400 capitalize">{t.userType}</span>}
                  {t.assignedAgentName && <span className="text-xs text-blue-600 font-medium">👤 {t.assignedAgentName}</span>}
                  {!t.isRead && t.status!=='resolved' && <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold ml-auto">New</span>}
                </div>
              </button>
             ))}
          </div>

          <div className="shrink-0 p-3 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-around text-center">
              <div><div className="text-base font-black text-gray-900">{tickets.filter(t=>t.status==='open').length}</div><div className="text-xs text-gray-400">Open</div></div>
              <div><div className="text-base font-black text-blue-700">{tickets.filter(t=>t.status==='assigned'&&t.assignedAgentName===user?.name).length}</div><div className="text-xs text-gray-400">My cases</div></div>
              <div><div className="text-base font-black text-green-700">{tickets.filter(t=>t.status==='resolved').length}</div><div className="text-xs text-gray-400">Resolved</div></div>
            </div>
          </div>
        </div>

        {/* Conversation */}
        {!selected ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-white border-2 border-gray-100 flex items-center justify-center mx-auto mb-5 shadow-sm"><Headphones size={36} className="text-gray-300"/></div>
              <div className="text-lg font-black text-gray-700 mb-1">Select a ticket</div>
              <div className="text-sm text-gray-400 mb-5">Pick a conversation from the left to start helping</div>
              {urgentN > 0 && <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-2.5 rounded-xl"><AlertCircle size={15}/>{urgentN} urgent ticket{urgentN>1?'s':''} need attention!</div>}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Info bar */}
            <div className="shrink-0 px-5 py-3 border-b border-gray-200 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-black text-gray-900">{selected.subject}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{background:S_BG[selected.status],color:S_TXT[selected.status]}}>{selected.status}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full border font-bold" style={{background:P_BG[selected.priority],color:P_TXT[selected.priority]}}>{selected.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><User size={11}/>{selected.userName||'Guest'}</span>
                    {selected.contactEmail&&<span className="flex items-center gap-1"><Mail size={11}/>{selected.contactEmail}</span>}
                    {selected.contactPhone&&<span className="flex items-center gap-1"><Phone size={11}/>{selected.contactPhone}</span>}
                    {selected.userType&&<span className="capitalize bg-gray-100 px-2 py-0.5 rounded-md">{selected.userType}</span>}
                    <span className="text-gray-300 font-mono">#{selected.id.slice(0,8).toUpperCase()}</span>
                  </div>
                  {selected.botSummary&&<div className="mt-1.5 text-xs text-violet-700 bg-violet-50 border border-violet-100 rounded-lg px-3 py-1.5 max-w-xl">🤖 <strong>Bot summary:</strong> {selected.botSummary}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selected.status==='open'&&<button onClick={assign} className="text-xs px-4 py-2 text-white rounded-xl font-bold hover:opacity-90" style={{background:'linear-gradient(135deg,#1d4ed8,#1e40af)'}}><User size={12} className="inline mr-1"/>Pick up</button>}
                  {selected.status!=='resolved'&&selected.status!=='closed'&&<button onClick={()=>setStatus('resolved')} className="text-xs px-4 py-2 bg-green-600 text-white rounded-xl font-bold hover:opacity-90"><Check size={12} className="inline mr-1"/>Resolve</button>}
                  {selected.status==='resolved'&&<button onClick={()=>setStatus('open')} className="text-xs px-4 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50"><RefreshCw size={12} className="inline mr-1"/>Re-open</button>}
                  <button onClick={()=>setStatus('closed')} className="text-xs px-3 py-2 border border-gray-200 text-gray-400 rounded-xl font-bold hover:text-gray-600">Close</button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 bg-gray-50">
              {messages.length===0 ? <div className="text-center py-12 text-gray-400 text-sm"><MessageCircle size={28} className="mx-auto mb-2 opacity-30"/>No messages yet</div> :
               messages.map(m => {
                const isAgent = m.senderRole==='agent';
                const isAi = m.isAi;
                return (
                  <div key={m.id} className={`flex gap-3 mb-4 ${isAgent?'flex-row-reverse':'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 mt-0.5 ${isAgent?'bg-gradient-to-br from-green-500 to-emerald-600':isAi?'bg-gradient-to-br from-violet-500 to-purple-700':'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                      {isAgent?(selected.assignedAgentName||user?.name||'A')[0]:isAi?'🤖':(selected.userName||'U')[0]}
                    </div>
                    <div className={`flex flex-col max-w-[75%] ${isAgent?'items-end':'items-start'}`}>
                      <div className={`text-xs font-bold mb-1 ${isAgent?'text-green-700':isAi?'text-violet-600':'text-gray-500'}`}>
                        {isAgent?(selected.assignedAgentName||user?.name||'Agent'):isAi?'AI Bot':(selected.userName||'User')}
                        <span className="text-gray-300 ml-2 font-normal">{new Date(m.sentAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isAgent?'bg-green-600 text-white rounded-tr-sm shadow-md':isAi?'bg-violet-50 border border-violet-100 text-gray-800 rounded-tl-sm':'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
               })}
              <div ref={msgEnd}/>
            </div>

            {/* Reply */}
            {selected.status!=='closed'&&(
              <div className="shrink-0 border-t border-gray-200 bg-white">
                {selected.assignedAgentName&&<div className="flex items-center gap-2 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs"><div className="w-5 h-5 rounded-md bg-green-600 text-white flex items-center justify-center font-black">{selected.assignedAgentName[0]}</div><span className="text-gray-500">Assigned to <strong className="text-gray-800">{selected.assignedAgentName}</strong></span></div>}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <button onClick={()=>setShowQuick(!showQuick)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${showQuick?'bg-gray-900 text-white border-gray-900':'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'}`}>
                      <Zap size={11}/> Quick replies {showQuick?'▲':'▼'}
                    </button>
                    <span className="text-xs text-gray-300">Click to insert</span>
                  </div>
                  {showQuick&&(
                    <div className="grid grid-cols-2 gap-1.5 mb-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      {QUICK_REPLIES.map((q,i)=>(
                        <button key={i} onClick={()=>{setReply(q.text);setShowQuick(false);inputRef.current?.focus();}} className="text-left text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all font-medium">
                          <span className="text-blue-500 mr-1">→</span>{q.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 items-end">
                    <textarea ref={inputRef} value={reply} onChange={e=>setReply(e.target.value)}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.ctrlKey){e.preventDefault();sendReply(false);}if(e.key==='Enter'&&e.ctrlKey){e.preventDefault();sendReply(true);}}}
                      placeholder="Type reply… (Enter = Send · Ctrl+Enter = Resolve)" rows={3}
                      className="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-gray-400 resize-none bg-white transition-all"/>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={()=>sendReply(false)} disabled={!reply.trim()||sending} className="flex items-center gap-2 px-5 py-3 text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-40 shadow-md" style={{background:'linear-gradient(135deg,#0f172a,#1e3a5f)'}}>
                        {sending?<Loader2 size={15} className="animate-spin"/>:<Send size={15}/>} Send
                      </button>
                      <button onClick={()=>sendReply(true)} disabled={!reply.trim()||sending} className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-40">
                        <Check size={15}/> Resolve
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 px-1 text-xs text-gray-300">
                    <span>Reply sent via in-app + email</span><span>Ctrl+Enter to resolve</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPortal;
