import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderOpen, FileText, Clock, AlertCircle, Star,
  CheckCircle, ChevronRight, Zap, Users, TrendingUp,
  Calendar, Bell, RefreshCw, Search, Filter, Eye
} from 'lucide-react';
import { useProjects, useInvoices, useMeetings, useRequests } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

// ── helpers ─────────────────────────────────────────────────
const cur = (amt: number, c = 'INR') => (c === 'INR' ? '₹' : '$') + (amt ?? 0).toLocaleString();
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

// Status config — color, label, icon for every request state
const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string; icon: string; step: number }> = {
  pending:    { color:'#d97706', bg:'#fffbeb', border:'#fde68a', label:'Submitted',       icon:'📝', step:1 },
  reviewed:   { color:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe', label:'Under Review',    icon:'👁️', step:2 },
  matched:    { color:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe', label:'Expert Matched',  icon:'✅', step:3 },
  confirmed:  { color:'#059669', bg:'#ecfdf5', border:'#a7f3d0', label:'Session Confirmed',icon:'📅', step:4 },
  in_progress:{ color:'#0891b2', bg:'#ecfeff', border:'#a5f3fc', label:'In Progress',     icon:'⚡', step:5 },
  completed:  { color:'#16a34a', bg:'#f0fdf4', border:'#86efac', label:'Completed',       icon:'🎉', step:6 },
  cancelled:  { color:'#dc2626', bg:'#fef2f2', border:'#fca5a5', label:'Cancelled',       icon:'❌', step:0 },
};

const STATUS_STEPS = ['Submitted','Under Review','Expert Matched','Session Confirmed','In Progress','Completed'];

// ── Request timeline component ──────────────────────────────
const RequestTimeline: React.FC<{ req: any; onViewExpert: (id: string) => void }> = ({ req, onViewExpert }) => {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const step = cfg.step;

  const elapsedHrs = req.createdAt
    ? Math.round((Date.now() - new Date(req.createdAt).getTime()) / 3600000)
    : 0;
  const expectedHrs = 4;
  const progress = Math.min(100, (elapsedHrs / expectedHrs) * 100);

  return (
    <div style={{ background:'#fff', border:`1.5px solid ${expanded ? cfg.border : '#f1f5f9'}`, borderRadius:18, overflow:'hidden', transition:'all .25s', boxShadow: expanded ? `0 8px 24px ${cfg.color}18` : '0 2px 6px rgba(0,0,0,0.04)' }}>
      {/* Header row */}
      <div onClick={()=>setExpanded(!expanded)} style={{ padding:'16px 20px', cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
        {/* Status badge */}
        <div style={{ width:42, height:42, borderRadius:13, background:cfg.bg, border:`1.5px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{cfg.icon}</div>

        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>{req.freelancerName || req.freelancerAlias || 'Expert'}</span>
            <span style={{ fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:100, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize:12, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {req.sessionType || 'Consultation'} · {req.durationMinutes ? `${req.durationMinutes/60}hr` : '—'} · {req.createdAt ? timeAgo(req.createdAt) : '—'}
          </div>
        </div>

        {/* Response time indicator */}
        {req.status === 'pending' && (
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontSize:11, color:'#d97706', fontWeight:700, marginBottom:4 }}>⏱ Admin responding…</div>
            <div style={{ width:80, height:5, borderRadius:3, background:'#f3f4f6', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#d97706,#f59e0b)', width:`${progress}%`, transition:'width .5s' }}/>
            </div>
            <div style={{ fontSize:10, color:'#94a3b8', marginTop:3 }}>{Math.max(0, expectedHrs - elapsedHrs)}hr remaining</div>
          </div>
        )}

        {req.status === 'completed' && req.budget && (
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div style={{ fontWeight:900, fontSize:18, color:'#0f172a' }}>{cur(req.budget, req.currency)}</div>
            <div style={{ fontSize:11, color:'#22c55e', fontWeight:600 }}>Completed</div>
          </div>
        )}

        <ChevronRight size={16} color="#94a3b8" style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition:'transform .2s', flexShrink:0 }}/>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'20px' }}>
          {/* Progress timeline */}
          {req.status !== 'cancelled' && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#374151', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.04em' }}>Request progress</div>
              <div style={{ display:'flex', alignItems:'center', gap:0 }}>
                {STATUS_STEPS.map((s, i) => {
                  const done = step > i + 1;
                  const active = step === i + 1;
                  return (
                    <React.Fragment key={s}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, flexShrink:0 }}>
                        <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, transition:'all .3s',
                          background: done ? '#22c55e' : active ? cfg.color : '#f1f5f9',
                          color: done||active ? '#fff' : '#94a3b8',
                          boxShadow: active ? `0 0 0 4px ${cfg.color}30` : 'none',
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <div style={{ fontSize:9, color: active ? cfg.color : done ? '#22c55e' : '#94a3b8', fontWeight: active||done ? 700 : 400, whiteSpace:'nowrap', maxWidth:60, textAlign:'center', lineHeight:1.3 }}>{s}</div>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{ flex:1, height:2, background: done ? '#22c55e' : '#f1f5f9', margin:'0 4px', marginBottom:20, transition:'background .3s' }}/>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Request details */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            {[
              { l:'Session type', v: req.sessionType || 'Consultation' },
              { l:'Duration', v: req.durationMinutes ? `${req.durationMinutes/60} hours` : '—' },
              { l:'Your bid rate', v: req.budgetMin ? cur(req.budgetMin, req.currency) + '/hr' : 'Not specified' },
              { l:'Preferred date', v: req.preferredDateTime ? new Date(req.preferredDateTime).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—' },
              { l:'Submitted', v: req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—' },
              { l:'Last updated', v: req.updatedAt ? timeAgo(req.updatedAt) : '—' },
            ].map(item => (
              <div key={item.l} style={{ background:'#f8fafc', borderRadius:10, padding:'10px 12px' }}>
                <div style={{ fontSize:10, color:'#94a3b8', fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>{item.l}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0f172a' }}>{item.v}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {req.description && (
            <div style={{ background:'#f8fafc', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your requirement</div>
              <p style={{ fontSize:13, color:'#374151', lineHeight:1.7, margin:0 }}>{req.description.slice(0,300)}{req.description.length>300?'…':''}</p>
            </div>
          )}

          {/* Admin message */}
          {req.adminNotes && (
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'12px 14px', marginBottom:14 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#1d4ed8', marginBottom:6 }}>📩 Message from WorkSupport 360 Admin</div>
              <p style={{ fontSize:13, color:'#1e40af', lineHeight:1.7, margin:0 }}>{req.adminNotes}</p>
            </div>
          )}

          {/* Status message */}
          <div style={{ background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:12, padding:'11px 14px', marginBottom:14, fontSize:13, color:cfg.color, fontWeight:600 }}>
            {cfg.icon} {
              req.status==='pending' ? 'Your request is in the queue. Admin will contact you and the expert within 4 hours.' :
              req.status==='reviewed' ? 'Admin is reviewing your requirement and identifying the best matching expert.' :
              req.status==='matched' ? 'An expert has been matched! Admin is confirming their availability.' :
              req.status==='confirmed' ? `Session confirmed! Check your email for the calendar invite and session link.` :
              req.status==='in_progress' ? 'Session is currently in progress. You\'ll receive a summary and invoice after.' :
              req.status==='completed' ? 'Session completed! Please review the expert if you haven\'t already.' :
              req.status==='cancelled' ? 'This request was cancelled. Contact support if you need help.' : ''
            }
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {req.freelancerId && (
              <button onClick={()=>onViewExpert(req.freelancerId)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                <Eye size={13}/> View Expert Profile
              </button>
            )}
            {req.status === 'completed' && (
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
  const activeProjects = (projects as any[]).filter((p: any) => p.status === 'active');
  const pendingInvoices = (invoices as any[]).filter((i: any) => i.status === 'pending' || i.status === 'overdue');
  const overdueInvoices = (invoices as any[]).filter((i: any) => i.status === 'overdue');
  const upcomingMeetings = (meetings as any[]).filter((m: any) => m.status === 'upcoming').slice(0, 3);
  const totalPending = pendingInvoices.reduce((s: number, i: any) => s + (i.total ?? 0), 0);

  const pendingReqs = reqArr.filter((r: any) => ['pending','reviewed','matched'].includes(r.status));
  const confirmedReqs = reqArr.filter((r: any) => ['confirmed','in_progress'].includes(r.status));
  const completedReqs = reqArr.filter((r: any) => r.status === 'completed');

  const filteredReqs = reqArr.filter((r: any) => {
    const matchFilter = reqFilter === 'all' || r.status === reqFilter || (reqFilter === 'active' && ['pending','reviewed','matched','confirmed','in_progress'].includes(r.status));
    const matchSearch = !reqSearch || (r.freelancerName||'').toLowerCase().includes(reqSearch.toLowerCase()) || (r.description||'').toLowerCase().includes(reqSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", padding:'0 0 40px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fu{animation:fadeUp .4s ease both}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      `}</style>

      {/* Welcome header */}
      <div className="fu" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ fontWeight:900, fontSize:24, color:'#0f172a', margin:'0 0 4px', letterSpacing:'-0.03em' }}>
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p style={{ fontSize:14, color:'#64748b', margin:0 }}>Here's the status of your requests and projects</p>
          </div>
          <button onClick={()=>window.open('/', '_self')} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(59,130,246,0.3)' }}>
            <Zap size={14}/> Hire an Expert
          </button>
        </div>
      </div>

      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:16, padding:'14px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:12 }}>
          <AlertCircle size={18} color="#dc2626"/>
          <div style={{ flex:1, fontSize:13 }}>
            <span style={{ fontWeight:800, color:'#dc2626' }}>{overdueInvoices.length} overdue invoice{overdueInvoices.length>1?'s':''} · </span>
            <span style={{ color:'#b91c1c' }}>Total: {cur(overdueInvoices.reduce((s:number,i:any)=>s+i.total,0))} — pay to avoid project disruption</span>
          </div>
          <button onClick={()=>navigate('/client/invoices')} style={{ padding:'7px 16px', borderRadius:9, background:'#dc2626', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>Pay now →</button>
        </div>
      )}

      {/* Stats row */}
      <div className="fu" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:28 }}>
        {[
          { l:'Active requests', v:pendingReqs.length + confirmedReqs.length, icon:<Clock size={16}/>, col:'#3b82f6', bg:'#eff6ff', sub:'awaiting or in progress' },
          { l:'Active projects', v:activeProjects.length, icon:<FolderOpen size={16}/>, col:'#059669', bg:'#ecfdf5', sub:'currently running' },
          { l:'Sessions completed', v:completedReqs.length, icon:<CheckCircle size={16}/>, col:'#7c3aed', bg:'#f5f3ff', sub:'all time' },
          { l:'Pending payment', v:cur(totalPending), icon:<FileText size={16}/>, col:'#d97706', bg:'#fffbeb', sub:`${pendingInvoices.length} invoice${pendingInvoices.length!==1?'s':''}` },
        ].map(s=>(
          <div key={s.l} style={{ background:'#fff', borderRadius:18, border:'1.5px solid #f1f5f9', padding:'18px', boxShadow:'0 2px 6px rgba(0,0,0,0.04)' }}>
            <div style={{ width:36, height:36, borderRadius:11, background:s.bg, color:s.col, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>{s.icon}</div>
            <div style={{ fontWeight:900, fontSize:24, color:'#0f172a', letterSpacing:'-0.03em', lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:12, fontWeight:600, color:'#374151', marginTop:4 }}>{s.l}</div>
            <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, alignItems:'flex-start' }}>

        {/* ── REQUESTS PANEL ── */}
        <div>
          <div style={{ background:'#fff', borderRadius:20, border:'1.5px solid #f1f5f9', overflow:'hidden', boxShadow:'0 4px 16px rgba(0,0,0,0.05)' }}>
            {/* Panel header */}
            <div style={{ padding:'18px 20px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
              <div>
                <h3 style={{ fontWeight:800, fontSize:16, color:'#0f172a', margin:'0 0 2px' }}>My Hire Requests</h3>
                <p style={{ fontSize:12, color:'#64748b', margin:0 }}>{reqArr.length} total · click any request to see full details</p>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={()=>refetch()} style={{ width:34, height:34, borderRadius:9, background:'#f8fafc', border:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#64748b' }}>
                  <RefreshCw size={14}/>
                </button>
              </div>
            </div>

            {/* Filters + search */}
            <div style={{ padding:'12px 20px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <div style={{ position:'relative', flex:1, minWidth:180 }}>
                <Search size={13} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
                <input value={reqSearch} onChange={e=>setReqSearch(e.target.value)} placeholder="Search by expert or description…"
                  style={{ width:'100%', paddingLeft:34, paddingRight:12, paddingTop:8, paddingBottom:8, border:'1.5px solid #f1f5f9', borderRadius:9, fontSize:13, outline:'none', fontFamily:'inherit', background:'#f8fafc', color:'#0f172a' }}/>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                {[{v:'all',l:'All'},{v:'active',l:'Active'},{v:'pending',l:'Pending'},{v:'completed',l:'Done'}].map(f=>(
                  <button key={f.v} onClick={()=>setReqFilter(f.v)}
                    style={{ padding:'7px 14px', borderRadius:9, border:`1.5px solid ${reqFilter===f.v?'#3b82f6':'#f1f5f9'}`, background:reqFilter===f.v?'#eff6ff':'#fff', color:reqFilter===f.v?'#1d4ed8':'#64748b', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s' }}>{f.l}</button>
                ))}
              </div>
            </div>

            {/* Requests list */}
            <div style={{ padding:'16px 16px', display:'flex', flexDirection:'column', gap:10 }}>
              {reqLoading ? (
                <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', border:'2px solid #e2e8f0', borderTopColor:'#3b82f6', animation:'spin 1s linear infinite', margin:'0 auto 12px' }}/>
                  Loading your requests…
                </div>
              ) : filteredReqs.length === 0 ? (
                <div style={{ textAlign:'center', padding:'48px 20px' }}>
                  <div style={{ fontSize:48, marginBottom:14 }}>📋</div>
                  <h4 style={{ fontWeight:800, fontSize:15, color:'#374151', margin:'0 0 8px' }}>
                    {reqArr.length === 0 ? 'No hire requests yet' : 'No requests match your filter'}
                  </h4>
                  <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 18px' }}>
                    {reqArr.length === 0 ? 'Browse experts and submit a hire request to get started.' : 'Try a different filter.'}
                  </p>
                  {reqArr.length === 0 && (
                    <button onClick={()=>window.open('/','_self')} style={{ padding:'10px 22px', borderRadius:11, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      Browse Experts →
                    </button>
                  )}
                </div>
              ) : filteredReqs.map((req: any) => (
                <RequestTimeline key={req.id} req={req} onViewExpert={(expertId)=>window.open(`/expert/${expertId}`,'_blank')}/>
              ))}

              {/* Demo requests for empty state */}
              {reqArr.length === 0 && !reqLoading && (
                <div style={{ padding:'12px', background:'#f8fafc', borderRadius:14, border:'1px dashed #e2e8f0' }}>
                  <div style={{ fontSize:12, color:'#94a3b8', textAlign:'center', marginBottom:10 }}>Preview — how your requests will look:</div>
                  {[
                    {status:'pending', freelancerName:'Rahul S.', sessionType:'Consultation', durationMinutes:120, createdAt:new Date(Date.now()-7200000).toISOString()},
                    {status:'confirmed', freelancerName:'Deepa N.', sessionType:'Demo', durationMinutes:240, createdAt:new Date(Date.now()-86400000).toISOString(), adminNotes:'Session confirmed for tomorrow 7 PM IST. Zoom link sent to your email.'},
                    {status:'completed', freelancerName:'Arjun M.', sessionType:'Development', durationMinutes:480, createdAt:new Date(Date.now()-604800000).toISOString(), budgetMin:2800, currency:'INR'},
                  ].map((req:any,i:number)=>(
                    <RequestTimeline key={i} req={{...req,id:`demo-${i}`}} onViewExpert={()=>{}}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

          {/* Admin response time */}
          <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:18, padding:'20px' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>Admin SLA</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                {l:'First response',v:'≤ 1 hr',icon:'⚡',col:'#60a5fa'},
                {l:'Expert match',v:'≤ 4 hrs',icon:'✅',col:'#34d399'},
                {l:'Session confirm',v:'≤ 6 hrs',icon:'📅',col:'#a78bfa'},
                {l:'Post-session',v:'Same day',icon:'🧾',col:'#fbbf24'},
              ].map(s=>(
                <div key={s.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.55)' }}>{s.icon} {s.l}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:s.col }}>{s.v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, padding:'10px 12px', background:'rgba(255,255,255,0.05)', borderRadius:10, fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6 }}>
              You receive an email update at every status change. Check spam if not received.
            </div>
          </div>

          {/* Upcoming meetings */}
          <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #f1f5f9', padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <h4 style={{ fontWeight:800, fontSize:14, color:'#0f172a', margin:0 }}>Upcoming sessions</h4>
              <Calendar size={15} color="#64748b"/>
            </div>
            {upcomingMeetings.length === 0 ? (
              <div style={{ textAlign:'center', padding:'20px 0', color:'#94a3b8', fontSize:13 }}>No upcoming sessions</div>
            ) : upcomingMeetings.map((m: any) => (
              <div key={m.id} style={{ padding:'10px 12px', background:'#f8fafc', borderRadius:12, marginBottom:8, border:'1px solid #f1f5f9' }}>
                <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:2 }}>{m.freelancerName || 'Expert'}</div>
                <div style={{ fontSize:12, color:'#64748b' }}>{m.scheduledAt ? new Date(m.scheduledAt).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}</div>
                {m.meetingLink && (
                  <a href={m.meetingLink} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#3b82f6', fontWeight:600, display:'inline-block', marginTop:4 }}>Join session →</a>
                )}
              </div>
            ))}
          </div>

          {/* Active projects summary */}
          {activeProjects.length > 0 && (
            <div style={{ background:'#fff', borderRadius:18, border:'1.5px solid #f1f5f9', padding:'18px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                <h4 style={{ fontWeight:800, fontSize:14, color:'#0f172a', margin:0 }}>Active projects</h4>
                <button onClick={()=>navigate('/client/projects')} style={{ fontSize:12, color:'#3b82f6', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}>View all</button>
              </div>
              {activeProjects.slice(0,3).map((p: any) => (
                <div key={p.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid #f8fafc' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{p.name}</div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{cur(p.totalBudget, p.currency)}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:6, borderRadius:3, background:'#f1f5f9' }}>
                      <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#3b82f6,#6366f1)', width:`${p.progress||0}%` }}/>
                    </div>
                    <span style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{p.progress||0}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick help */}
          <div style={{ background:'#f8fafc', borderRadius:16, padding:'16px', border:'1px solid #f1f5f9' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10 }}>Need help?</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                {l:'WhatsApp support', href:'https://wa.me/919441363687', icon:'💬'},
                {l:'Email admin team', href:'mailto:help@worksupport360.com', icon:'📧'},
                {l:'Browse more experts', href:'/', icon:'🔍'},
              ].map(l=>(
                <a key={l.l} href={l.href} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, background:'#fff', border:'1px solid #f1f5f9', fontSize:13, color:'#374151', fontWeight:500, textDecoration:'none', transition:'all .15s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.color='#1d4ed8';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.color='#374151';}}>
                  <span>{l.icon}</span> {l.l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
