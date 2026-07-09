import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Star, Clock, Check, X, Loader2,
  AlertCircle, DollarSign, FolderOpen, FileText, Plus,
  ChevronRight, ChevronLeft, Zap, Shield, Award, CheckCircle,
  TrendingUp, Calendar, Bell, RefreshCw, Eye, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useFreelancers, useProjects, useTimesheets, useApproveTimesheet,
  useInvoices, useMarkInvoicePaid, useSendPaymentInstructions,
  useSendInvoiceReminder, useCreateRequest, useMeetings,
  useNotifications, useSubmitReview, useRequests
} from '../../hooks/useApi';
import { publicApi, requirementsApi } from '../../services/endpoints';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const fmt = (amt: number, c = 'INR') => (c === 'INR' ? '₹' : '$') + (amt ?? 0).toLocaleString();
const cur = fmt; // alias used by lower sections
const badge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_payment: 'bg-red-50 text-red-700 border-red-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    paused: 'bg-orange-50 text-orange-700 border-orange-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    submitted: 'bg-purple-50 text-purple-700 border-purple-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    paid: 'bg-green-50 text-green-700 border-green-200',
    overdue: 'bg-red-50 text-red-700 border-red-200',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{status.replace('_', ' ')}</span>;
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Status config ────────────────────────────────────────────
const STATUS_CFG: Record<string, { color: string; bg: string; border: string; label: string; icon: string; step: number }> = {
  pending:     { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'Submitted',        icon:'📝', step:1 },
  reviewed:    { color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', label:'Under Review',     icon:'👁️', step:2 },
  matched:     { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', label:'Expert Matched',   icon:'✅', step:3 },
  confirmed:   { color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', label:'Session Confirmed', icon:'📅', step:4 },
  in_progress: { color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc', label:'In Progress',      icon:'⚡', step:5 },
  completed:   { color:'#16a34a', bg:'#f0fdf4', border:'#86efac', label:'Completed',        icon:'🎉', step:6 },
  cancelled:   { color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', label:'Cancelled',        icon:'❌', step:0 },
};
const STATUS_STEPS = ['Submitted','Under Review','Expert Matched','Session Confirmed','In Progress','Completed'];

// ── Request timeline card ────────────────────────────────────
const ReqCard: React.FC<{ req: any; onViewExpert: (id: string) => void }> = ({ req, onViewExpert }) => {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
  const elapsed = req.createdAt ? Math.round((Date.now() - new Date(req.createdAt).getTime()) / 3600000) : 0;
  const progress = Math.min(100, (elapsed / 4) * 100);

  return (
    <div style={{ background:'#fff', border:`1.5px solid ${open ? cfg.border : '#f1f5f9'}`, borderRadius:18, overflow:'hidden', transition:'all .25s', boxShadow: open ? `0 8px 24px ${cfg.color}18` : '0 2px 6px rgba(0,0,0,0.04)', marginBottom:10 }}>
      <div onClick={()=>setOpen(!open)} style={{ padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:42, height:42, borderRadius:13, background:cfg.bg, border:`1.5px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{cfg.icon}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>{req.freelancerName||req.freelancerAlias||'Expert'}</span>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:100, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize:12, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {req.sessionType||'Consultation'} · {req.durationMinutes ? `${req.durationMinutes/60}hr` : '—'} · {req.createdAt ? timeAgo(req.createdAt) : '—'}
          </div>
        </div>
        {req.status==='pending' && (
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:11, color:'#d97706', fontWeight:700, marginBottom:4 }}>⏱ Admin responding…</div>
            <div style={{ width:80, height:5, borderRadius:3, background:'#f3f4f6', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#d97706,#f59e0b)', width:`${progress}%` }}/>
            </div>
            <div style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>{Math.max(0,4-elapsed)}hr remaining</div>
          </div>
        )}
        {req.status==='completed' && req.budgetMin && (
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontWeight:900, fontSize:18, color:'#0f172a' }}>{fmt(req.budgetMin, req.currency)}</div>
            <div style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>Completed</div>
          </div>
        )}
        <ChevronRight size={16} color="#94a3b8" style={{ transform:open?'rotate(90deg)':'none', transition:'transform .2s', flexShrink:0 }}/>
      </div>

      {open && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'20px' }}>
          {/* Progress timeline */}
          {req.status!=='cancelled' && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#374151', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.04em' }}>Request progress</div>
              <div style={{ display:'flex', alignItems:'center' }}>
                {STATUS_STEPS.map((s,i)=>{
                  const done = cfg.step > i+1, active = cfg.step === i+1;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, flexShrink:0 }}>
                        <div style={{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800,
                          background: done?'#22c55e':active?cfg.color:'#f1f5f9',
                          color: done||active?'#fff':'#94a3b8',
                          boxShadow: active?`0 0 0 3px ${cfg.color}30`:'none',
                        }}>{done?'✓':i+1}</div>
                        <div style={{ fontSize:8, color:active?cfg.color:done?'#22c55e':'#94a3b8', fontWeight:active||done?700:400, whiteSpace:'nowrap', maxWidth:55, textAlign:'center', lineHeight:1.3 }}>{s}</div>
                      </div>
                      {i < STATUS_STEPS.length-1 && <div style={{ flex:1, height:2, background:done?'#22c55e':'#f1f5f9', margin:'0 3px 18px', transition:'background .3s' }}/>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
          {/* Details grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              {l:'Session type', v:req.sessionType||'Consultation'},
              {l:'Duration', v:req.durationMinutes?`${req.durationMinutes/60} hours`:'—'},
              {l:'Your bid rate', v:req.budgetMin?fmt(req.budgetMin,req.currency)+'/hr':'Not specified'},
              {l:'Preferred date', v:req.preferredDateTime?new Date(req.preferredDateTime).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'—'},
              {l:'Submitted', v:req.createdAt?new Date(req.createdAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'—'},
              {l:'Last updated', v:req.updatedAt?timeAgo(req.updatedAt):'—'},
            ].map(item=>(
              <div key={item.l} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{item.l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{item.v}</div>
              </div>
            ))}
          </div>
          {req.description && (
            <div style={{ background:'#f8fafc', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:5, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your requirement</div>
              <p style={{ fontSize:13, color:'#374151', lineHeight:1.7, margin:0 }}>{req.description.slice(0,300)}{req.description.length>300?'…':''}</p>
            </div>
          )}
          {req.adminNotes && (
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 14px', marginBottom:12 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#1d4ed8', marginBottom:5 }}>📩 Message from WorkSupport 360 Admin</div>
              <p style={{ fontSize:13, color:'#1e40af', lineHeight:1.7, margin:0 }}>{req.adminNotes}</p>
            </div>
          )}
          <div style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:12, padding:'11px 14px', marginBottom:14, fontSize:13, color:cfg.color, fontWeight:600 }}>
            {cfg.icon} {req.status==='pending'?'Your request is in the queue. Admin will contact you within 4 hours.':req.status==='reviewed'?'Admin is reviewing and identifying the best expert for you.':req.status==='matched'?'An expert has been matched! Admin is confirming their availability.':req.status==='confirmed'?'Session confirmed! Check your email for the calendar invite.':req.status==='in_progress'?'Session is in progress. You\'ll receive invoice and summary after.':req.status==='completed'?'Session completed! Please leave a review if you haven\'t.':'This request was cancelled. Contact support for help.'}
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {req.freelancerId && (
              <button onClick={()=>onViewExpert(req.freelancerId)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                <Eye size={13}/> View Expert Profile
              </button>
            )}
            {req.status==='completed' && (
              <button style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'#f8fafc', border:'1.5px solid #e2e8f0', color:'#374151', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                <Star size={13}/> Leave Review
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CLIENT DASHBOARD ─────────────────────────────────────────
export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: projects = [] } = useProjects();
  const { data: invoices = [] } = useInvoices();
  const { data: meetings = [] } = useMeetings();
  const { data: requests = [], isLoading: reqLoading, refetch } = useRequests();
  const [reqFilter, setReqFilter] = useState('all');
  const [reqSearch, setReqSearch] = useState('');

  const reqArr = Array.isArray(requests) ? requests : [];
  const activeProjects = (projects as any[]).filter((p:any) => p.status === 'active');
  const pendingInvoices = (invoices as any[]).filter((i:any) => i.status === 'pending' || i.status === 'overdue');
  const overdueInvoices = (invoices as any[]).filter((i:any) => i.status === 'overdue');
  const upcomingMeetings = (meetings as any[]).filter((m:any) => m.status === 'upcoming').slice(0,3);
  const totalPending = pendingInvoices.reduce((s:number,i:any) => s+(i.total??0), 0);
  const pendingReqs = reqArr.filter((r:any) => ['pending','reviewed','matched'].includes(r.status));
  const confirmedReqs = reqArr.filter((r:any) => ['confirmed','in_progress'].includes(r.status));
  const completedReqs = reqArr.filter((r:any) => r.status === 'completed');

  const filteredReqs = reqArr.filter((r:any) => {
    const mf = reqFilter==='all' || r.status===reqFilter || (reqFilter==='active' && ['pending','reviewed','matched','confirmed','in_progress'].includes(r.status));
    const ms = !reqSearch || (r.freelancerName||'').toLowerCase().includes(reqSearch.toLowerCase()) || (r.description||'').toLowerCase().includes(reqSearch.toLowerCase());
    return mf && ms;
  });

  // Demo data when empty
  const demoReqs = [
    {id:'d1',status:'pending',freelancerName:'Rahul S.',sessionType:'Consultation',durationMinutes:120,createdAt:new Date(Date.now()-7200000).toISOString()},
    {id:'d2',status:'confirmed',freelancerName:'Deepa N.',sessionType:'Demo',durationMinutes:240,createdAt:new Date(Date.now()-86400000).toISOString(),adminNotes:'Session confirmed for tomorrow 7 PM IST. Zoom link sent to your email.'},
    {id:'d3',status:'completed',freelancerName:'Arjun M.',sessionType:'Development',durationMinutes:480,createdAt:new Date(Date.now()-604800000).toISOString(),budgetMin:2800,currency:'INR'},
  ];

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", padding:'0 0 40px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}.fu{animation:fadeUp .4s ease both}`}</style>

      {/* Header */}
      <div className="fu" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:22 }}>
        <div>
          <h1 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 3px', letterSpacing:'-0.03em' }}>Welcome back{user?.name?`, ${user.name.split(' ')[0]}`:''} 👋</h1>
          <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Track your hire requests and project status</p>
        </div>
        <button onClick={()=>window.open('/','_self')} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(59,130,246,0.3)' }}>
          <Zap size={14}/> Hire an Expert
        </button>
      </div>

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:14, padding:'13px 18px', marginBottom:18, display:'flex', alignItems:'center', gap:12 }}>
          <AlertCircle size={17} color="#dc2626"/>
          <div style={{ flex:1, fontSize:13 }}><span style={{ fontWeight:800, color:'#dc2626' }}>{overdueInvoices.length} overdue invoice{overdueInvoices.length>1?'s':''} · </span><span style={{ color:'#b91c1c' }}>Total: {fmt(overdueInvoices.reduce((s:number,i:any)=>s+i.total,0))} — pay to avoid disruption</span></div>
          <button onClick={()=>navigate('/client/invoices')} style={{ padding:'7px 14px', borderRadius:9, background:'#dc2626', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>Pay now →</button>
        </div>
      )}

      {/* Stats */}
      <div className="fu" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
        {[
          {l:'Active requests',v:pendingReqs.length+confirmedReqs.length,icon:<Clock size={15}/>,col:'#3b82f6',bg:'#eff6ff',sub:'awaiting or in progress'},
          {l:'Active projects',v:activeProjects.length,icon:<FolderOpen size={15}/>,col:'#059669',bg:'#ecfdf5',sub:'currently running'},
          {l:'Sessions done',v:completedReqs.length,icon:<CheckCircle size={15}/>,col:'#7c3aed',bg:'#f5f3ff',sub:'all time'},
          {l:'Pending payment',v:fmt(totalPending),icon:<FileText size={15}/>,col:'#d97706',bg:'#fffbeb',sub:`${pendingInvoices.length} invoice${pendingInvoices.length!==1?'s':''}`},
        ].map(s=>(
          <div key={s.l} style={{ background:'#fff', borderRadius:16, border:'1.5px solid #f1f5f9', padding:'16px', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ width:34, height:34, borderRadius:10, background:s.bg, color:s.col, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontWeight:900, fontSize:22, color:'#0f172a', letterSpacing:'-0.03em', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginTop:4 }}>{s.l}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:18, alignItems:'flex-start' }}>

        {/* Requests panel */}
        <div style={{ background:'#fff', borderRadius:20, border:'1.5px solid #f1f5f9', overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.05)' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div>
              <h3 style={{ fontWeight:800, fontSize:15, color:'#0f172a', margin:'0 0 2px' }}>My Hire Requests</h3>
              <p style={{ fontSize:12, color:'#64748b', margin:0 }}>Click any request to expand full details</p>
            </div>
            <button onClick={()=>refetch()} style={{ width:32, height:32, borderRadius:9, background:'#f8fafc', border:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b' }}>
              <RefreshCw size={13}/>
            </button>
          </div>

          <div style={{ padding:'12px 16px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <div style={{ position:'relative', flex:1, minWidth:160 }}>
              <Search size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
              <input value={reqSearch} onChange={e=>setReqSearch(e.target.value)} placeholder="Search requests…"
                style={{ width:'100%', paddingLeft:30, paddingRight:10, paddingTop:7, paddingBottom:7, border:'1.5px solid #f1f5f9', borderRadius:9, fontSize:12, outline:'none', fontFamily:'inherit', background:'#f8fafc', color:'#0f172a' }}/>
            </div>
            {[{v:'all',l:'All'},{v:'active',l:'Active'},{v:'pending',l:'Pending'},{v:'completed',l:'Done'}].map(f=>(
              <button key={f.v} onClick={()=>setReqFilter(f.v)}
                style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${reqFilter===f.v?'#3b82f6':'#f1f5f9'}`, background:reqFilter===f.v?'#eff6ff':'#fff', color:reqFilter===f.v?'#1d4ed8':'#64748b', fontSize:12, fontWeight:600, cursor:'pointer' }}>{f.l}</button>
            ))}
          </div>

          <div style={{ padding:'14px 14px' }}>
            {reqLoading ? (
              <div style={{ textAlign:'center', padding:'36px', color:'#94a3b8', fontSize:13 }}>Loading your requests…</div>
            ) : filteredReqs.length > 0 ? (
              filteredReqs.map((req:any) => <ReqCard key={req.id} req={req} onViewExpert={id=>window.open(`/expert/${id}`,'_blank')}/>)
            ) : reqArr.length === 0 ? (<>
              <div style={{ textAlign:'center', padding:'36px 20px' }}>
                <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
                <h4 style={{ fontWeight:800, fontSize:14, color:'#374151', margin:'0 0 6px' }}>No hire requests yet</h4>
                <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 16px' }}>Browse experts and submit your first hire request.</p>
                <button onClick={()=>window.open('/','_self')} style={{ padding:'10px 20px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>Browse Experts →</button>
              </div>
              <div style={{ padding:'10px', background:'#f8fafc', borderRadius:12, border:'1px dashed #e2e8f0', marginTop:8 }}>
                <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center', marginBottom:8 }}>Preview — how your requests will appear:</div>
                {demoReqs.map((req:any) => <ReqCard key={req.id} req={req} onViewExpert={()=>{}}/>)}
              </div>
            </>) : (
              <div style={{ textAlign:'center', padding:'28px', color:'#94a3b8', fontSize:13 }}>No requests match your filter</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* Admin SLA */}
          <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:18, padding:'18px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Admin Response SLA</div>
            {[
              {l:'First response',v:'≤ 1 hr',col:'#60a5fa'},
              {l:'Expert match',v:'≤ 4 hrs',col:'#34d399'},
              {l:'Session confirm',v:'≤ 6 hrs',col:'#a78bfa'},
              {l:'Post-session',v:'Same day',col:'#fbbf24'},
            ].map(s=>(
              <div key={s.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{s.l}</span>
                <span style={{ fontSize:12, fontWeight:800, color:s.col }}>{s.v}</span>
              </div>
            ))}
            <div style={{ marginTop:10, padding:'9px 11px', background:'rgba(255,255,255,0.05)', borderRadius:9, fontSize:11, color:'rgba(255,255,255,0.35)', lineHeight:1.6 }}>
              Email sent at every status change. Check spam if not received.
            </div>
          </div>

          {/* Upcoming sessions */}
          <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #f1f5f9', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <h4 style={{ fontWeight:800, fontSize:13, color:'#0f172a', margin:0 }}>Upcoming sessions</h4>
              <Calendar size={14} color="#64748b"/>
            </div>
            {upcomingMeetings.length === 0
              ? <div style={{ textAlign:'center', padding:'16px 0', color:'#94a3b8', fontSize:12 }}>No upcoming sessions</div>
              : upcomingMeetings.map((m:any) => (
                <div key={m.id} style={{ padding:'9px 11px', background:'#f8fafc', borderRadius:10, marginBottom:7 }}>
                  <div style={{ fontWeight:700, fontSize:12, color:'#0f172a', marginBottom:2 }}>{m.freelancerName||'Expert'}</div>
                  <div style={{ fontSize:11, color:'#64748b' }}>{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</div>
                  {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize:11, color:'#3b82f6', fontWeight:600, display:'block', marginTop:4 }}>Join →</a>}
                </div>
              ))
            }
          </div>

          {/* Active projects */}
          {activeProjects.length > 0 && (
            <div style={{ background:'#fff', borderRadius:16, border:'1.5px solid #f1f5f9', padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <h4 style={{ fontWeight:800, fontSize:13, color:'#0f172a', margin:0 }}>Active projects</h4>
                <button onClick={()=>navigate('/client/projects')} style={{ fontSize:11, color:'#3b82f6', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all</button>
              </div>
              {activeProjects.slice(0,3).map((p:any) => (
                <div key={p.id} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <div style={{ fontWeight:700, fontSize:12, color:'#0f172a' }}>{p.name}</div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{fmt(p.totalBudget,p.currency)}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:5, borderRadius:3, background:'#f1f5f9' }}>
                      <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#3b82f6,#6366f1)', width:`${p.progress||0}%` }}/>
                    </div>
                    <span style={{ fontSize:10, color:'#64748b', fontWeight:600 }}>{p.progress||0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help links */}
          <div style={{ background:'#f8fafc', borderRadius:14, padding:'14px', border:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:9 }}>Need help?</div>
            {[
              {l:'WhatsApp support',href:'https://wa.me/919441363687',icon:'💬'},
              {l:'Email admin',href:'mailto:help@worksupport360.com',icon:'📧'},
              {l:'Browse more experts',href:'/',icon:'🔍'},
            ].map(l=>(
              <a key={l.l} href={l.href} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 11px', borderRadius:9, background:'#fff', border:'1px solid #f1f5f9', fontSize:12, color:'#374151', fontWeight:500, textDecoration:'none', marginBottom:7, transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.color='#1d4ed8';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.color='#374151';}}>
                <span>{l.icon}</span>{l.l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// ── CLIENT: My Posted Requirements ───────────────────────────
export const ClientRequirements: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string|null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['client-requirements'],
    queryFn: () => requirementsApi.getMine().then((r: any) => r.data?.items ?? r.data ?? []),
  });

  const reqs = Array.isArray(data) ? data : [];

  const STATUS_CFG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    pending:   { label:'Under Review',  color:'#d97706', bg:'#fffbeb', icon:'⏳' },
    open:      { label:'Live on Board', color:'#059669', bg:'#ecfdf5', icon:'🟢' },
    allocated: { label:'Expert Assigned',color:'#7c3aed', bg:'#f5f3ff', icon:'✅' },
    rejected:  { label:'Rejected',      color:'#dc2626', bg:'#fef2f2', icon:'❌' },
    closed:    { label:'Closed',        color:'#64748b', bg:'#f8fafc', icon:'🔒' },
  };

  const handleEdit = (req: any) => {
    setEditId(req.id);
    setEditForm({
      title: req.title || '',
      skillsRequired: req.skillsRequired || '',
      hoursPerEngagement: req.hoursPerEngagement || '',
      budgetMin: req.budgetMin || '',
      budgetMax: req.budgetMax || '',
      currency: req.currency || 'INR',
      workMode: req.workMode || 'remote',
      description: req.description || '',
      urgency: req.urgency || 'normal',
    });
  };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await requirementsApi.update(editId, editForm);
      toast.success('Requirement updated!');
      setEditId(null);
      refetch();
    } catch { toast.error('Failed to update'); }
    setSaving(false);
  };

  const handleDelete = async (id: string, status: string) => {
    if (status === 'allocated') { toast.error('Cannot delete — expert already assigned'); return; }
    if (!window.confirm('Delete this requirement? This cannot be undone.')) return;
    try {
      await requirementsApi.remove(id);
      toast.success('Requirement deleted');
      refetch();
    } catch { toast.error('Failed to delete'); }
  };

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Requirements</h1>
          <p className="text-sm text-gray-500">Track, edit, and manage your posted requirements</p>
        </div>
        <button onClick={() => navigate('/post-requirement')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold"
          style={{ background:'linear-gradient(135deg,#059669,#10b981)', boxShadow:'0 3px 12px rgba(5,150,105,0.35)' }}>
          + Post New Requirement
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading your requirements…</div>
      ) : reqs.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-black text-gray-900 text-lg mb-2">No requirements posted yet</h3>
          <p className="text-gray-500 text-sm mb-6">Post your first IT requirement — admin will review and match you with a verified expert.</p>
          <button onClick={() => navigate('/post-requirement')}
            className="px-6 py-3 rounded-xl text-white font-bold text-sm"
            style={{ background:'linear-gradient(135deg,#059669,#10b981)' }}>
            Post a Requirement →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reqs.map((req: any) => {
            const cfg = STATUS_CFG[req.status] || STATUS_CFG.pending;
            const isEditing = editId === req.id;
            const canEdit = ['pending', 'open'].includes(req.status);
            const canDelete = !['allocated'].includes(req.status);

            return (
              <div key={req.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: cfg.bg }}>{cfg.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-black text-gray-900">{req.title}</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                          </span>
                          {req.urgency === 'urgent' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">🔥 Urgent</span>}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span>🛠 {req.skillsRequired}</span>
                          <span>⏱ {req.hoursPerEngagement} hrs</span>
                          <span>💰 {req.currency}{req.budgetMin}–{req.currency}{req.budgetMax}/hr</span>
                          <span>🌐 {req.workMode}</span>
                          <span>📅 Posted {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canEdit && (
                        <button onClick={() => isEditing ? setEditId(null) : handleEdit(req)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isEditing ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                          {isEditing ? '✕ Cancel' : '✏️ Edit'}
                        </button>
                      )}
                      {canDelete && (
                        <button onClick={() => handleDelete(req.id, req.status)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                          🗑 Delete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status message */}
                  <div className="mt-3 text-xs rounded-xl px-3 py-2" style={{ background: cfg.bg, color: cfg.color }}>
                    {req.status === 'pending' && "⏳ Your requirement is under admin review. You'll be notified by email once approved and live."}
                    {req.status === 'open' && '🟢 Live on the freelancer job board. Freelancers are reviewing and applying.'}
                    {req.status === 'allocated' && '✅ An expert has been assigned! Admin will contact you to schedule the session.'}
                    {req.status === 'rejected' && '❌ This requirement was rejected by admin.' + (req.adminNotes ? ` Reason: ${req.adminNotes}` : ' Contact support for details.')}
                    {req.status === 'closed' && '🔒 This requirement has been closed.'}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    <h4 className="font-bold text-gray-900 text-sm">Edit Requirement</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Title</label>
                        <input value={editForm.title} onChange={e=>setEditForm({...editForm,title:e.target.value})} className={inp}/>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Skills Required</label>
                        <input value={editForm.skillsRequired} onChange={e=>setEditForm({...editForm,skillsRequired:e.target.value})} className={inp} placeholder="React.js, Node.js, AWS"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Hours</label>
                        <input value={editForm.hoursPerEngagement} onChange={e=>setEditForm({...editForm,hoursPerEngagement:e.target.value})} className={inp} placeholder="e.g. 4"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Urgency</label>
                        <select value={editForm.urgency} onChange={e=>setEditForm({...editForm,urgency:e.target.value})} className={inp}>
                          <option value="normal">Normal</option>
                          <option value="urgent">Urgent</option>
                          <option value="planned">Planned</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Budget Min/hr</label>
                        <input type="number" value={editForm.budgetMin} onChange={e=>setEditForm({...editForm,budgetMin:e.target.value})} className={inp}/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Budget Max/hr</label>
                        <input type="number" value={editForm.budgetMax} onChange={e=>setEditForm({...editForm,budgetMax:e.target.value})} className={inp}/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Work Mode</label>
                        <select value={editForm.workMode} onChange={e=>setEditForm({...editForm,workMode:e.target.value})} className={inp}>
                          <option value="remote">Remote</option>
                          <option value="hybrid">Hybrid</option>
                          <option value="onsite">On-site</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Currency</label>
                        <select value={editForm.currency} onChange={e=>setEditForm({...editForm,currency:e.target.value})} className={inp}>
                          <option>INR</option><option>USD</option><option>EUR</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description / JD</label>
                        <textarea value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})} rows={3} className={inp + " resize-none"}/>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSave} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-50"
                        style={{ background:'linear-gradient(135deg,#1e3a5f,#3b82f6)' }}>
                        {saving ? 'Saving…' : '💾 Save Changes'}
                      </button>
                      <button onClick={() => setEditId(null)}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      ⚠️ Editing will re-submit for admin review if the requirement is already live.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── BROWSE EXPERTS (with filters + request form) ──────────────
export const ClientBrowse: React.FC = () => {
  const [search, setSearch] = useState('');
  const [skill, setSkill] = useState('');
  const [minRate, setMinRate] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [minExp, setMinExp] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [requestTarget, setRequestTarget] = useState<any>(null);
  const [quickTarget, setQuickTarget] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({ sessionType: 'demo', budgetMin: '', budgetMax: '', budgetType: 'hourly', currency: 'USD', description: '', preferredDateTime: '' });

  const { data: flData, isLoading } = useFreelancers({ keyword: search || undefined, skill: skill || undefined, minRate: minRate ? parseFloat(minRate) : undefined, maxRate: maxRate ? parseFloat(maxRate) : undefined, minExp: minExp ? parseInt(minExp) : undefined, isAvailable: availableOnly || undefined, page, pageSize: 12 });
  const createRequest = useCreateRequest();

  const freelancers = flData?.items ?? [];
  const total = flData?.total ?? 0;
  const totalPages = flData?.totalPages ?? 1;
  const skillOpts = ['All','React','Python','Node.js','DevOps','AWS','ML','.NET','Docker','SQL'];

  const handleRequest = async () => {
    if (!requestForm.description || !requestForm.preferredDateTime) { toast.error('Fill all required fields'); return; }
    await createRequest.mutateAsync({ freelancerId: requestTarget.id, sessionType: requestForm.sessionType, preferredDateTime: new Date(requestForm.preferredDateTime).toISOString(), durationMinutes: 45, budgetMin: parseFloat(requestForm.budgetMin || '0'), budgetMax: parseFloat(requestForm.budgetMax || '0'), budgetType: requestForm.budgetType, currency: requestForm.currency, description: requestForm.description });
    setRequestTarget(null);
    setRequestForm({ sessionType: 'demo', budgetMin: '', budgetMax: '', budgetType: 'hourly', currency: 'USD', description: '', preferredDateTime: '' });
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Browse Experts</h1><p className="text-sm text-gray-500">{total} verified professionals · company always private</p></div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-3">
          <div className="lg:col-span-2 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search skills, role, bio..." className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none w-full"/>
          </div>
          <input value={minRate} onChange={e => { setMinRate(e.target.value); setPage(1); }} type="number" placeholder="Min rate ($/hr)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          <input value={maxRate} onChange={e => { setMaxRate(e.target.value); setPage(1); }} type="number" placeholder="Max rate ($/hr)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          <input value={minExp} onChange={e => { setMinExp(e.target.value); setPage(1); }} type="number" placeholder="Min exp (yrs)" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {skillOpts.map(s => (
            <button key={s} onClick={() => { setSkill(s === 'All' ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${skill === (s === 'All' ? '' : s) ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>{s}</button>
          ))}
          <label className="flex items-center gap-2 ml-auto cursor-pointer">
            <input type="checkbox" checked={availableOnly} onChange={e => { setAvailableOnly(e.target.checked); setPage(1); }} className="rounded"/>
            <span className="text-xs font-medium text-gray-700">Available now only</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_,i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-56"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {freelancers.map((fl: any) => (
            <div key={fl.id} className="bg-white rounded-2xl border border-gray-100 hover:border-gray-300 hover:shadow-lg transition-all flex flex-col group">
              <div className="p-5 flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${fl.trustScore >= 90 ? 'bg-green-100 text-green-700 ring-2 ring-green-400 ring-offset-1' : 'bg-gray-100 text-gray-700'}`}>
                    {fl.aliasName?.split(' ').map((w: string) => w[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{fl.aliasName}</div>
                    <div className="text-xs text-gray-500 truncate">{fl.currentRole}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${fl.isAvailable ? 'bg-green-500' : 'bg-amber-400'}`}/>
                      <span className={`text-xs font-medium ${fl.isAvailable ? 'text-green-600' : 'text-amber-600'}`}>{fl.isAvailable ? 'Available' : 'Limited'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-sm">{fl.currency === 'INR' ? '₹' : '$'}{fl.hourlyRate}</div>
                    <div className="text-xs text-gray-400">/hr</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">{[1,2,3,4,5].map(i => <span key={i} className={`text-sm ${i <= Math.round(fl.rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}</div>
                  <span className="text-xs text-gray-500">{fl.rating?.toFixed(1)} ({fl.reviewCount})</span>
                  <span className="text-xs text-gray-400">· {fl.totalExp}yr</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {fl.skills?.slice(0,4).map((s: string) => <span key={s} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg border border-gray-100">{s}</span>)}
                  {fl.skills?.length > 4 && <span className="text-xs text-blue-500">+{fl.skills.length-4}</span>}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10}/>~{fl.responseTimeMinutes}min · {fl.completedProjects} projects</div>
              </div>
              <div className="px-5 pb-5 flex gap-2">
                <button onClick={() => setQuickTarget(fl)}
                  className="flex-1 flex items-center justify-center gap-1 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-all"
                  style={{background:'linear-gradient(135deg,#f97316,#dc2626)'}}>
                  <Zap size={12}/> Quick
                </button>
                <button onClick={() => setRequestTarget(fl)}
                  className="flex-1 flex items-center justify-center gap-1 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-all"
                  style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
                  Request <ChevronRight size={12}/>
                </button>
              </div>
            </div>
          ))}
          {freelancers.length === 0 && (
            <div className="col-span-4 text-center py-16 bg-white rounded-2xl border border-gray-100">
              <Search size={32} className="mx-auto mb-2 text-gray-300"/>
              <div className="text-gray-500 font-semibold">No experts found</div>
              <button onClick={() => { setSearch(''); setSkill(''); setMinRate(''); setMaxRate(''); setMinExp(''); setAvailableOnly(false); }} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 bg-white">
            <ChevronLeft size={15}/> Prev
          </button>
          {[...Array(Math.min(totalPages, 7))].map((_,i) => (
            <button key={i+1} onClick={() => setPage(i+1)} className={`w-10 h-10 rounded-xl text-sm font-bold ${page === i+1 ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`} style={page===i+1?{background:'#1a1a2e'}:{}}>
              {i+1}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages} className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 bg-white">
            Next <ChevronRight size={15}/>
          </button>
        </div>
      )}
      <div className="text-center text-xs text-gray-400">Showing {Math.min((page-1)*12+1, total)}–{Math.min(page*12, total)} of {total} experts</div>

      {/* Request Demo Modal */}
      {requestTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60" onClick={() => setRequestTarget(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div><div className="font-black text-gray-900">Request demo with {requestTarget.aliasName}</div><div className="text-xs text-gray-500">Admin schedules within 4 hours</div></div>
              <button onClick={() => setRequestTarget(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Session type</label>
                  <select value={requestForm.sessionType} onChange={e => setRequestForm({...requestForm, sessionType: e.target.value})} className={inp + " bg-white"}>
                    <option value="demo">Demo / intro call</option>
                    <option value="interview">Technical interview</option>
                    <option value="consultation">Consultation</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Preferred date & time *</label>
                  <input type="datetime-local" value={requestForm.preferredDateTime} onChange={e => setRequestForm({...requestForm, preferredDateTime: e.target.value})} className={inp}/>
                </div>
              </div>
              {/* Budget type */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Budget type</label>
                <div className="flex gap-2">
                  {[['hourly','Hourly rate'],['fixed','Fixed project']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => setRequestForm({...requestForm, budgetType: v})}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${requestForm.budgetType === v ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Currency</label>
                  <select value={requestForm.currency} onChange={e => setRequestForm({...requestForm, currency: e.target.value})} className={inp + " bg-white"}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Budget min</label>
                  <input type="number" value={requestForm.budgetMin} onChange={e => setRequestForm({...requestForm, budgetMin: e.target.value})} placeholder="2000" className={inp}/>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Budget max</label>
                  <input type="number" value={requestForm.budgetMax} onChange={e => setRequestForm({...requestForm, budgetMax: e.target.value})} placeholder="5000" className={inp}/>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Project description *</label>
                <textarea rows={3} value={requestForm.description} onChange={e => setRequestForm({...requestForm, description: e.target.value})} placeholder="Describe your project, tech stack, timeline, and what you need help with..." className={inp + " resize-none"}/>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800">
                ℹ️ Freelancer's current rate: <strong>{requestTarget.currency === 'INR' ? '₹' : '$'}{requestTarget.hourlyRate}/hr</strong> ({requestTarget.budgetType || 'hourly'}). Admin will confirm final budget after the demo call.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setRequestTarget(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={handleRequest} disabled={createRequest.isPending} className="flex-1 text-white py-3 rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
                  {createRequest.isPending ? 'Submitting...' : 'Submit request →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CLIENT PROJECTS ──────────────────────────────────────────
export const ClientProjects: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">My Projects</h1><p className="text-sm text-gray-500">{projects.length} projects total</p></div>
      {projects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FolderOpen size={40} className="mx-auto mb-3 text-gray-300"/>
          <div className="font-semibold text-gray-500">No projects yet</div>
          <div className="text-sm text-gray-400 mt-1">Admin creates projects after you approve a demo meeting</div>
        </div>
      )}
      <div className="space-y-4">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-gray-900 text-lg">{p.name}</span>
                  {badge(p.status)}
                  {p.applyGst && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">GST 18%</span>}
                </div>
                <div className="text-sm text-gray-500">Expert: <strong>{p.freelancerAlias}</strong></div>
              </div>
              <div className="text-right">
                <div className="font-black text-xl text-gray-900">{cur(p.totalBudget, p.currency)}</div>
                <div className="text-xs text-gray-400">{p.budgetType}</div>
              </div>
            </div>
            {/* Dates & amounts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-xl text-sm">
              <div><div className="text-xs text-gray-500 mb-0.5">Start date</div><div className="font-semibold">{new Date(p.startDate).toLocaleDateString()}</div></div>
              <div><div className="text-xs text-gray-500 mb-0.5">End date</div><div className="font-semibold">{new Date(p.endDate).toLocaleDateString()}</div></div>
              <div><div className="text-xs text-gray-500 mb-0.5">Total paid</div><div className="font-bold text-green-700">{cur(p.totalPaid, p.currency)}</div></div>
              <div><div className="text-xs text-gray-500 mb-0.5">Pending amount</div><div className={`font-bold ${p.pendingAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>{p.pendingAmount > 0 ? cur(p.pendingAmount, p.currency) : 'Nil'}</div></div>
            </div>
            {/* GST breakdown */}
            {p.applyGst && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs text-amber-800">
                💡 GST breakdown: Subtotal {cur(p.totalBudget, p.currency)} + GST 18% {cur(p.totalBudget * 0.18, p.currency)} = <strong>Total {cur(p.totalBudget * 1.18, p.currency)}</strong>
              </div>
            )}
            {/* Pending payment alert */}
            {p.status === 'pending_payment' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                <div><strong>Payment required to start project.</strong> Amount: {cur(p.totalBudget, p.currency)}{p.applyGst ? ` + GST = ${cur(p.totalBudget * 1.18, p.currency)}` : ''}. Please check your invoices to complete payment.</div>
              </div>
            )}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-bold text-gray-700">{p.progress}% · {p.loggedHours}h/{p.estimatedHours}h</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{width:`${p.progress}%`, background: p.status==='completed'?'#16a34a':'#3b5bdb'}}/>
              </div>
            </div>
            {p.milestones?.length > 0 && (
              <div className="pt-3 border-t border-gray-50">
                <div className="text-xs font-bold text-gray-600 mb-2">Milestones</div>
                <div className="space-y-1.5">
                  {p.milestones.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${m.status==='completed'?'bg-green-500 text-white':'border-2 border-gray-200'}`}>{m.status==='completed'&&<Check size={10}/>}</div>
                      <span className={m.status==='completed'?'text-gray-400 line-through':'text-gray-700'}>{m.title}</span>
                      <span className="text-gray-400 ml-auto">{cur(m.amount, p.currency)} · {new Date(m.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── CLIENT TIMESHEETS ────────────────────────────────────────
export const ClientTimesheets: React.FC = () => {
  const { data: timesheets = [], isLoading } = useTimesheets();
  const approve = useApproveTimesheet();
  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Timesheets</h1><p className="text-sm text-gray-500">Review and approve expert timesheets</p></div>
      {timesheets.map((ts: any) => (
        <div key={ts.id} className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div><div className="font-bold text-gray-900">{ts.projectName}</div><div className="text-xs text-gray-500">Week: {new Date(ts.weekStart).toLocaleDateString()} — {new Date(ts.weekEnd).toLocaleDateString()}</div><div className="text-xs text-gray-500 mt-0.5">{ts.freelancerName}</div></div>
            <div className="flex items-center gap-2">{badge(ts.status)}<span className="font-black text-gray-900">${ts.totalAmount?.toLocaleString()}</span></div>
          </div>
          <div className="text-xs text-gray-500 mb-3">{ts.totalHours}h total</div>
          {ts.entries?.length > 0 && (
            <div className="border border-gray-50 rounded-xl overflow-hidden mb-4">
              {ts.entries.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <span className="w-20 shrink-0 text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
                  <span className="w-10 shrink-0 font-bold">{e.hours}h</span>
                  <span className="flex-1 text-gray-700">{e.description}</span>
                  <span className="text-gray-400 shrink-0 capitalize">{e.taskType}</span>
                </div>
              ))}
            </div>
          )}
          {ts.status === 'submitted' && (
            <div className="flex gap-3">
              <button onClick={() => approve.mutate({ id: ts.id, data: { approve: false, reason: 'Please review and resubmit' } })} disabled={approve.isPending}
                className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50">
                <X size={14}/> Reject
              </button>
              <button onClick={() => approve.mutate({ id: ts.id, data: { approve: true } })} disabled={approve.isPending}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90" style={{background:'linear-gradient(135deg,#16a34a,#15803d)'}}>
                <Check size={14}/> Approve & generate invoice
              </button>
            </div>
          )}
        </div>
      ))}
      {timesheets.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No timesheets to review</div>}
    </div>
  );
};

// ── CLIENT INVOICES ──────────────────────────────────────────
export const ClientInvoices: React.FC = () => {
  const { data: invoices = [], isLoading } = useInvoices();
  const [payModal, setPayModal] = useState<any>(null);
  const [method, setMethod] = useState('Bank Transfer');
  const [txnId, setTxnId] = useState('');
  const markPaid = useMarkInvoicePaid();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Invoices</h1><p className="text-sm text-gray-500">All project invoices and payment history</p></div>
      {(invoices as any[]).map((inv: any) => (
        <div key={inv.id} className={`bg-white border rounded-2xl p-5 ${inv.status === 'overdue' ? 'border-red-200' : 'border-gray-100'}`}>
          <div className="flex items-start justify-between mb-4">
            <div><div className="font-bold text-gray-900 text-base">{inv.invoiceNumber}</div><div className="text-xs text-gray-500 mt-0.5">{inv.projectName} · {inv.freelancerName}</div></div>
            <div className="flex items-center gap-2">{badge(inv.status)}</div>
          </div>
          {/* Amount breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
            {inv.lineItems?.map((li: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                <span>{li.description}</span>
                <span>{li.hours}h × ${li.rate} = <strong>${li.amount?.toLocaleString()}</strong></span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-xs text-gray-600"><span>Subtotal</span><span>${inv.subtotal?.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs text-gray-600"><span>Platform commission ({inv.commissionRate}%)</span><span>-${inv.commission?.toLocaleString()}</span></div>
              {inv.applyGst && (
                <div className="flex justify-between text-xs text-amber-700 font-medium"><span>GST {inv.gstRate}% (India)</span><span>+${inv.gstAmount?.toLocaleString()}</span></div>
              )}
              <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200"><span>Total due</span><span>{inv.currency === 'INR' ? '₹' : '$'}{inv.total?.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <span>Issued: {new Date(inv.issuedAt).toLocaleDateString()}</span>
            <span className={inv.status === 'overdue' ? 'text-red-600 font-bold' : ''}>Due: {new Date(inv.dueAt).toLocaleDateString()}</span>
            {inv.paidAt && <span className="text-green-600 font-medium">Paid: {new Date(inv.paidAt).toLocaleDateString()}</span>}
          </div>
          {inv.paymentInstructions && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-800">
              <div className="font-bold mb-1">💳 Payment instructions:</div>
              <pre className="whitespace-pre-wrap font-sans">{inv.paymentInstructions}</pre>
            </div>
          )}
          {inv.status !== 'paid' && (
            <div className="flex gap-3">
              {inv.paymentInstructions && (
                <button onClick={() => setPayModal(inv)} className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-bold hover:opacity-90" style={{background:'linear-gradient(135deg,#16a34a,#15803d)'}}>
                  <Check size={14}/> Confirm payment made
                </button>
              )}
              {!inv.paymentInstructions && (
                <div className="text-xs text-gray-400 py-2.5">Waiting for admin to send payment instructions via email</div>
              )}
            </div>
          )}
        </div>
      ))}
      {invoices.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No invoices yet</div>}

      {/* Pay modal */}
      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60" onClick={() => setPayModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="font-black text-gray-900">Confirm payment</div>
              <button onClick={() => setPayModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-800">
                <div>Invoice: <strong>{payModal.invoiceNumber}</strong></div>
                <div>Amount: <strong>{payModal.currency === 'INR' ? '₹' : '$'}{payModal.total?.toLocaleString()}</strong></div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Payment method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                  <option>Bank Transfer</option><option>Wire Transfer</option><option>PayPal</option><option>Stripe</option><option>Razorpay</option><option>UPI</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Transaction ID / Reference</label>
                <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="UTR number, PayPal ID, etc." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
              </div>
              <div className="text-xs text-gray-400">Admin will verify and confirm within 24 hours. Project activates after confirmation.</div>
              <div className="flex gap-3">
                <button onClick={() => setPayModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl text-sm">Cancel</button>
                <button onClick={() => { markPaid.mutate({ id: payModal.id, data: { invoiceId: payModal.id, method, transactionId: txnId } }); setPayModal(null); }} disabled={markPaid.isPending}
                  className="flex-1 text-white py-3 rounded-xl font-black text-sm hover:opacity-90" style={{background:'linear-gradient(135deg,#16a34a,#15803d)'}}>
                  {markPaid.isPending ? 'Processing...' : 'Confirm payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── CLIENT FEEDBACK ──────────────────────────────────────────
export const ClientFeedback: React.FC = () => {
  const { data: projects = [] } = useProjects();
  const submitReview = useSubmitReview();
  const [form, setForm] = useState({ projectId: '', freelancerId: '', rating: 0, comment: '' });

  const completedProjects = projects.filter((p: any) => p.status === 'completed');

  const handleSubmit = async () => {
    if (!form.projectId || !form.rating || !form.comment) { toast.error('Select project, rating, and write a comment'); return; }
    const p = projects.find((x: any) => x.id === form.projectId) as any;
    await submitReview.mutateAsync({ projectId: form.projectId, freelancerId: form.freelancerId || p?.freelancerId, rating: form.rating, comment: form.comment });
    setForm({ projectId: '', freelancerId: '', rating: 0, comment: '' });
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Leave Feedback</h1><p className="text-sm text-gray-500">Rate your experts for completed projects</p></div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Completed project</label>
          <select value={form.projectId} onChange={e => { const p = projects.find((x: any) => x.id === e.target.value) as any; setForm({...form, projectId: e.target.value, freelancerId: p?.freelancerId || ''}); }} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
            <option value="">Select project...</option>
            {completedProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.freelancerAlias}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Rating *</label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(r => (
              <button key={r} onClick={() => setForm({...form, rating: r})} className={`text-3xl transition-all hover:scale-110 ${r <= form.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</button>
            ))}
            {form.rating > 0 && <span className="text-sm text-gray-500 self-center ml-2">{['','Poor','Fair','Good','Very good','Excellent'][form.rating]}</span>}
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Your review *</label>
          <textarea rows={4} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} placeholder="Share your experience with this expert — quality of work, communication, timelines..." className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"/>
        </div>
        <button onClick={handleSubmit} disabled={submitReview.isPending || !form.projectId || !form.rating || !form.comment}
          className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-black text-sm hover:opacity-90 disabled:opacity-50" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
          <Star size={15}/> Submit review
        </button>
        {completedProjects.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No completed projects to review yet</div>}
      </div>
    </div>
  );
};

// ── CLIENT PROFILE EDIT ───────────────────────────────────────────────
export const ClientProfile: React.FC = () => {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', mobile: '', companyName: '', contactName: '', gstNumber: '', industry: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['client-profile-me'],
    queryFn: () => api.get('/clients/me').then(r => r.data),
    staleTime: 0 as number,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name:        profile.user?.name        || profile.userName  || user?.name || '',
      mobile:      profile.user?.mobileNumber|| profile.mobile    || '',
      companyName: profile.companyName       || profile.CompanyName || '',
      contactName: profile.contactName       || profile.ContactName || '',
      gstNumber:   profile.gstNumber         || profile.GstNumber   || '',
      industry:    profile.industry          || '',
    });
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/clients/me', form);
      qc.invalidateQueries({ queryKey: ['client-profile-me'] });
      toast.success('Profile updated! ✅');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white";
  // inline fields below

  if (isLoading) return <div className="text-center py-16 text-gray-400">Loading profile…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your account and company details</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl">
            {form.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div>
            <div className="font-black text-gray-900 text-lg">{form.name || 'Client'}</div>
            <div className="text-sm text-gray-500">{form.companyName}</div>
            <div className="text-xs text-blue-600 mt-1">Client Account</div>
          </div>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Personal Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Full Name</label>
        <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Your full name" className={inp}/>
      </div>
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Mobile / WhatsApp</label>
        <input value={form.mobile} onChange={e=>setForm(f=>({...f,mobile:e.target.value}))} placeholder="+91-9876543210" className={inp}/>
      </div>
        </div>
      </div>

      {/* Company info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Company Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Company Name</label>
        <input value={form.companyName} onChange={e=>setForm(f=>({...f,companyName:e.target.value}))} placeholder="Your company" className={inp}/>
      </div>
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Contact Name</label>
        <input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} placeholder="Primary contact" className={inp}/>
      </div>
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">GST Number</label>
        <input value={form.gstNumber} onChange={e=>setForm(f=>({...f,gstNumber:e.target.value}))} placeholder="GSTIN (optional)" className={inp}/>
      </div>
          <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Industry</label>
        <input value={form.industry} onChange={e=>setForm(f=>({...f,industry:e.target.value}))} placeholder="e.g. FinTech, E-commerce" className={inp}/>
      </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', boxShadow:'0 6px 24px rgba(30,58,95,0.3)' }}>
        {saving ? '⏳ Saving…' : '💾 Save Changes'}
      </button>
    </div>
  );
};
