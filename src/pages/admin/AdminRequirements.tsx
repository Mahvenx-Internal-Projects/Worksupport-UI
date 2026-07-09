import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { requirementsApi } from '../../services/endpoints';
import { api } from '../../services/api';

const AdminRequirements: React.FC = () => {
  const qc = useQueryClient();
  const [tab, setTab]       = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string|null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-requirements'],
    queryFn: async () => {
      const r = await requirementsApi.getAll();
      const result = r.data;
      // Handle both {items:[]} and plain array
      if (Array.isArray(result)) return result;
      if (result?.items) return result.items;
      return [];
    },
  });

  const allReqs: any[] = Array.isArray(data) ? data : [];

  const filtered = allReqs.filter(r => {
    const matchTab = tab === 'all' || r.status?.toLowerCase() === tab;
    const s = search.toLowerCase();
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(s) ||
      r.skillsRequired?.toLowerCase().includes(s) ||
      r.companyName?.toLowerCase().includes(s);
    return matchTab && matchSearch;
  });

  const counts: any = {
    all:      allReqs.length,
    pending:  allReqs.filter(r => r.status?.toLowerCase() === 'pending').length,
    open:     allReqs.filter(r => r.status?.toLowerCase() === 'open').length,
    allocated:allReqs.filter(r => r.status?.toLowerCase() === 'allocated').length,
    rejected: allReqs.filter(r => r.status?.toLowerCase() === 'rejected').length,
  };

  const approve = async (id: string) => {
    try {
      await api.patch(`/requirements/${id}`, { status: 'open' });
      toast.success('✅ Approved! Requirement is now live on the job board. Client email sent.');
      qc.invalidateQueries({ queryKey: ['admin-requirements'] });
      refetch();
    } catch { toast.error('Failed to approve'); }
  };

  const reject = async (id: string) => {
    try {
      await api.patch(`/requirements/${id}`, { status: 'rejected' });
      toast.success('Requirement rejected');
      qc.invalidateQueries({ queryKey: ['admin-requirements'] });
      refetch();
    } catch { toast.error('Failed to reject'); }
  };

  const tabs = [
    { v: 'all',       l: 'All',       col: '#374151' },
    { v: 'pending',   l: '⏳ Pending', col: '#d97706' },
    { v: 'open',      l: '🟢 Live',    col: '#059669' },
    { v: 'allocated', l: '✅ Assigned', col: '#7c3aed' },
    { v: 'rejected',  l: '❌ Rejected', col: '#dc2626' },
  ];

  const statusColor: Record<string,string> = {
    pending:   '#d97706',
    open:      '#059669',
    allocated: '#7c3aed',
    rejected:  '#dc2626',
    closed:    '#374151',
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 4px' }}>Requirements</h1>
          <p style={{ fontSize:13, color:'#64748b', margin:0 }}>Review and approve client-posted requirements · assign freelancers</p>
        </div>
        <button onClick={()=>refetch()} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', border:'1.5px solid #e2e8f0', borderRadius:10, background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer' }}>
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Pending alert */}
      {counts.pending > 0 && (
        <div style={{ background:'#fffbeb', border:'1.5px solid #fde68a', borderRadius:16, padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, color:'#92400e', fontSize:14 }}>{counts.pending} requirement{counts.pending>1?'s':''} pending approval</div>
              <div style={{ fontSize:12, color:'#b45309' }}>Approve to publish on the job board · client will be notified</div>
            </div>
          </div>
          <button onClick={()=>setTab('pending')} style={{ padding:'8px 18px', borderRadius:10, background:'#d97706', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            Review Now →
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {tabs.map(t => (
          <button key={t.v} onClick={()=>setTab(t.v)}
            style={{ padding:'8px 16px', borderRadius:10, border:`1.5px solid ${tab===t.v?t.col:'#e2e8f0'}`, background:tab===t.v?t.col:'#fff', color:tab===t.v?'#fff':'#374151', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all .15s' }}>
            {t.l} {counts[t.v]>0 && <span style={{ marginLeft:4, background:tab===t.v?'rgba(255,255,255,0.25)':'#f1f5f9', padding:'1px 6px', borderRadius:100, fontSize:11 }}>{counts[t.v]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position:'relative', marginBottom:16 }}>
        <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#94a3b8' }}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by title, skill, company…"
          style={{ width:'100%', padding:'10px 12px 10px 36px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }}/>
      </div>

      {/* Content */}
      <div style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:16, overflow:'hidden' }}>
        {isLoading ? (
          <div style={{ padding:48, textAlign:'center', color:'#94a3b8' }}>Loading requirements…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:64, textAlign:'center' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
            <div style={{ fontWeight:700, color:'#374151', fontSize:16, marginBottom:6 }}>
              {tab === 'all' ? 'No requirements yet' : `No ${tab} requirements`}
            </div>
            <div style={{ fontSize:13, color:'#94a3b8' }}>
              {tab === 'all' ? 'Client-posted requirements will appear here after they submit' : `Switch to "All" to see everything`}
            </div>
          </div>
        ) : (
          <div>
            {filtered.map((req: any) => {
              const col = statusColor[req.status?.toLowerCase()] || '#374151';
              const isOpen = expanded === req.id;
              const skills = (req.skillsRequired||'').split(',').map((s:string)=>s.trim()).filter(Boolean);
              const posted = req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : '—';
              return (
                <div key={req.id} style={{ borderBottom:'1px solid #f8fafc' }}>
                  {/* Row */}
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'flex-start', gap:14 }}>
                    {/* Status dot */}
                    <div style={{ width:10, height:10, borderRadius:'50%', background:col, marginTop:6, flexShrink:0 }}/>

                    {/* Main info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                        <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>{req.title || req.skillsRequired || 'Untitled'}</span>
                        <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6, background:col+'18', color:col, border:`1px solid ${col}33` }}>
                          {req.status?.toUpperCase() || 'PENDING'}
                        </span>
                        {req.urgency==='urgent' && <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6, background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5' }}>🔥 URGENT</span>}
                      </div>
                      <div style={{ fontSize:12, color:'#64748b', marginBottom:6 }}>
                        {req.companyName||'Client'} · {req.workMode||'Remote'} · {req.currency||'INR'}{req.budgetMin}–{req.currency||'INR'}{req.budgetMax}/hr · {req.hoursPerEngagement}hrs · Posted {posted}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                        {skills.slice(0,5).map((s:string)=>(
                          <span key={s} style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'#eff6ff', color:'#1d4ed8', border:'1px solid #bfdbfe' }}>{s}</span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {req.status?.toLowerCase() === 'pending' && (<>
                        <button onClick={()=>approve(req.id)}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 16px', background:'#059669', color:'#fff', border:'none', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          <Check size={13}/> Approve
                        </button>
                        <button onClick={()=>reject(req.id)}
                          style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', background:'#fef2f2', color:'#dc2626', border:'1.5px solid #fca5a5', borderRadius:9, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          <X size={13}/> Reject
                        </button>
                      </>)}
                      <button onClick={()=>setExpanded(isOpen?null:req.id)}
                        style={{ padding:'8px', background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:9, cursor:'pointer', display:'flex', alignItems:'center' }}>
                        {isOpen ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{ padding:'0 20px 18px 44px', background:'#f8fafc', borderTop:'1px solid #f1f5f9' }}>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:12 }}>
                        {[
                          ['Freelancers needed', req.freelancerCount||1],
                          ['Hours', req.hoursPerEngagement],
                          ['Duration', `${req.duration||'—'} ${req.durationType||''}`],
                          ['Work mode', req.workMode||'Remote'],
                          ['Budget', `${req.currency||'INR'}${req.budgetMin}–${req.budgetMax}/hr`],
                          ['Contact', req.contactName||'—'],
                        ].map(([l,v])=>(
                          <div key={String(l)} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'8px 12px' }}>
                            <div style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:2 }}>{l}</div>
                            <div style={{ fontSize:13, fontWeight:600, color:'#0f172a' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {req.description && (
                        <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px' }}>
                          <div style={{ fontSize:10, color:'#94a3b8', textTransform:'uppercase' as const, letterSpacing:'0.06em', marginBottom:4 }}>Description</div>
                          <p style={{ fontSize:13, color:'#374151', lineHeight:1.7, margin:0 }}>{req.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop:10, fontSize:12, color:'#94a3b8', textAlign:'center' }}>
        {filtered.length} of {allReqs.length} requirements
      </div>
    </div>
  );
};

export default AdminRequirements;
