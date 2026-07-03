import React, { useState } from 'react';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, X, Send, Check, Search, UserPlus, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

/* ── colour helpers ─────────────────────────────────────────── */
const SC: Record<string,{bg:string;color:string;dot:string}> = {
  open:        {bg:'#dcfce7',color:'#15803d',dot:'#22c55e'},
  in_progress: {bg:'#dbeafe',color:'#1d4ed8',dot:'#3b82f6'},
  closed:      {bg:'#f1f5f9',color:'#475569',dot:'#94a3b8'},
  cancelled:   {bg:'#fee2e2',color:'#dc2626',dot:'#ef4444'},
};
const AC: Record<string,{bg:string;color:string;border:string}> = {
  notified:   {bg:'#dbeafe',color:'#1d4ed8',border:'#93c5fd'},
  interested: {bg:'#dcfce7',color:'#15803d',border:'#86efac'},
  declined:   {bg:'#fee2e2',color:'#dc2626',border:'#fca5a5'},
  hired:      {bg:'#ede9fe',color:'#6d28d9',border:'#c4b5fd'},
};
const GRAD = ['linear-gradient(135deg,#6366f1,#8b5cf6)','linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#059669,#0891b2)','linear-gradient(135deg,#f59e0b,#d97706)','linear-gradient(135deg,#3b82f6,#1d4ed8)'];

const Badge = ({status,map}:{status:string,map:typeof SC}) => {
  const s = map[status] || {bg:'#f1f5f9',color:'#475569',dot:'#94a3b8'};
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:20,background:s.bg,color:s.color,fontSize:11,fontWeight:700,textTransform:'capitalize' as const}}>
      <span style={{width:6,height:6,borderRadius:'50%',background:(s as any).dot || s.color,display:'inline-block'}}/>
      {status.replace(/_/g,' ')}
    </span>
  );
};

const AdminRequirements: React.FC = () => {
  const qc = useQueryClient();
  const [filter, setFilter]   = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [assignModal, setAssignModal] = useState<any>(null);
  const [closeModal, setCloseModal]   = useState<any>(null);
  const [adminNote, setAdminNote]     = useState('');
  const [closeStatus, setCloseStatus] = useState('closed');
  const [closeNote, setCloseNote]     = useState('');
  const [search, setSearch]           = useState('');
  const [selFl, setSelFl]             = useState<string[]>([]);
  const [flSearch, setFlSearch]       = useState('');

  const { data: raw = [], isLoading } = useQuery({
    queryKey: ['admin-requirements', filter],
    queryFn: () => api.get(`/requirements${filter !== 'all' ? `?status=${filter}` : ''}`).then(r => r.data),
    staleTime: 20000,
  });

  const { data: flRaw } = useQuery({
    queryKey: ['fl-assign'],
    queryFn:  () => api.get('/freelancers?pageSize=100').then(r => r.data),
    staleTime: 60000,
  });
  const freelancers: any[] = flRaw?.items ?? (Array.isArray(flRaw) ? flRaw : []);

  const assignMut = useMutation({
    mutationFn: ({id,ids,note}:any) => api.post(`/requirements/${id}/assign`,{freelancerIds:ids,adminNote:note}),
    onSuccess: () => { toast.success('Assigned! Freelancers notified via email ✅',{duration:5000}); qc.invalidateQueries({queryKey:['admin-requirements']}); setAssignModal(null); setSelFl([]); setAdminNote(''); },
    onError:   () => toast.error('Assignment failed'),
  });

  const closeMut = useMutation({
    mutationFn: ({id,status,notes}:any) => api.patch(`/requirements/${id}/close`,{status,notes}),
    onSuccess: () => { toast.success('Status updated'); qc.invalidateQueries({queryKey:['admin-requirements']}); setCloseModal(null); },
    onError:   () => toast.error('Failed to update'),
  });

  const reqs: any[]    = Array.isArray(raw) ? raw : [];
  const filtered: any[] = reqs.filter(r =>
    !search || r.title?.toLowerCase().includes(search.toLowerCase()) || r.clientName?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredFl: any[] = freelancers.filter(f =>
    !flSearch ||
    (f.aliasName||f.name||'').toLowerCase().includes(flSearch.toLowerCase()) ||
    (f.currentRole||'').toLowerCase().includes(flSearch.toLowerCase())
  );

  const cnt = {
    all: reqs.length,
    open: reqs.filter(r=>r.status==='open').length,
    in_progress: reqs.filter(r=>r.status==='in_progress').length,
    closed: reqs.filter(r=>r.status==='closed'||r.status==='cancelled').length,
  };

  const cur = (r:any) => r?.currency==='INR'?'₹':r?.currency==='EUR'?'€':'$';

  /* ── inline styles ─────────────────────────────────────────── */
  const card: React.CSSProperties = {
    background:'#ffffff', border:'1.5px solid #e2e8f0', borderRadius:16,
    boxShadow:'0 1px 6px rgba(0,0,0,0.06)', overflow:'hidden',
  };
  const inp: React.CSSProperties = {
    width:'100%', padding:'10px 14px', border:'1.5px solid #e2e8f0',
    borderRadius:11, fontSize:13, outline:'none', fontFamily:'inherit',
    background:'#fff', color:'#1e293b', transition:'border .15s',
    boxSizing:'border-box',
  };
  const F = (e:any) => e.target.style.borderColor='#6366f1';
  const B = (e:any) => e.target.style.borderColor='#e2e8f0';

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans','Inter',system-ui,sans-serif",color:'#1e293b'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}} .req-card{animation:fadeIn .3s ease both}`}</style>

      {/* ── Header ── */}
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:24,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 4px'}}>Requirements</h1>
          <p style={{fontSize:13,color:'#64748b',margin:0}}>Client requirements · Assign freelancers · Track interest</p>
        </div>
        <div style={{position:'relative'}}>
          <Search size={14} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',pointerEvents:'none'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
            style={{...inp,paddingLeft:32,width:200}}
            onFocus={F} onBlur={B}/>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{display:'flex',gap:7,marginBottom:20,flexWrap:'wrap'}}>
        {([['all','All'],['open','🟢 Open'],['in_progress','🔵 In Progress'],['closed','⚫ Closed']] as const).map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)}
            style={{padding:'7px 16px',borderRadius:9,border:'none',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all .15s',
              background:filter===v?'#0f172a':'#f1f5f9',
              color:filter===v?'#fff':'#475569'}}>
            {l} ({cnt[v as keyof typeof cnt] ?? 0})
          </button>
        ))}
      </div>

      {/* ── Two-panel ── */}
      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 400px':'1fr',gap:18,alignItems:'start'}}>

        {/* Left: list */}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {isLoading ? (
            <div style={{display:'flex',justifyContent:'center',padding:'48px 0'}}>
              <Loader2 size={24} style={{color:'#cbd5e1',animation:'spin 1s linear infinite'}}/>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{textAlign:'center',padding:'48px 24px',...card}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div style={{fontWeight:700,fontSize:15,color:'#374151',marginBottom:6}}>No requirements found</div>
              <div style={{fontSize:13,color:'#64748b'}}>Requirements posted by clients will appear here</div>
            </div>
          ) : filtered.map((r:any) => {
            const s   = SC[r.status] || SC.open;
            const ass: any[] = r.assignments ?? [];
            const interested = ass.filter((a:any)=>a.status==='interested');
            const isSelected = selected?.id === r.id;
            return (
              <div key={r.id} className="req-card"
                onClick={()=>setSelected(isSelected?null:r)}
                style={{...card,cursor:'pointer',borderColor:isSelected?'#6366f1':'#e2e8f0',
                  boxShadow:isSelected?'0 0 0 2px rgba(99,102,241,0.2)':'0 1px 6px rgba(0,0,0,0.06)',
                  transition:'all .18s'}}>

                {/* Card header */}
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'14px 16px 12px',gap:10,borderBottom:'1px solid #f1f5f9',background:'#fafafa'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:5}}>
                      <span style={{fontWeight:800,fontSize:14,color:'#0f172a'}}>{r.title}</span>
                      <Badge status={r.status} map={SC}/>
                      {interested.length>0&&<span style={{fontSize:11,fontWeight:700,padding:'2px 9px',borderRadius:9,background:'#dcfce7',color:'#15803d'}}>🎉 {interested.length} interested</span>}
                    </div>
                    <div style={{fontSize:12,color:'#64748b',display:'flex',flexWrap:'wrap',gap:'4px 14px'}}>
                      <span>🏢 {r.clientName||'Client'}</span>
                      <span>💰 {cur(r)}{r.budgetMin}–{cur(r)}{r.budgetMax} ({r.budgetType})</span>
                      <span>🏠 {r.workMode}</span>
                      <span>👥 {r.openPositions} position(s)</span>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:'#94a3b8',flexShrink:0}}>{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                </div>

                {/* Card body */}
                <div style={{padding:'10px 16px',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                  {ass.length===0
                    ? <span style={{fontSize:11,color:'#f97316',fontWeight:600}}>⏳ No freelancers assigned yet</span>
                    : ass.slice(0,6).map((a:any)=>{
                        const ac=AC[a.status]||AC.notified;
                        return(
                          <span key={a.id} style={{fontSize:11,padding:'3px 9px',borderRadius:7,background:ac.bg,color:ac.color,border:`1px solid ${ac.border}`,fontWeight:600}}>
                            {a.freelancerName||'Expert'} · {a.status}
                          </span>
                        );
                      })
                  }
                  {ass.length>6&&<span style={{fontSize:11,color:'#94a3b8'}}>+{ass.length-6} more</span>}

                  <div style={{marginLeft:'auto',display:'flex',gap:7,flexShrink:0}}>
                    {r.status!=='closed'&&r.status!=='cancelled'&&(
                      <button onClick={e=>{e.stopPropagation();setAssignModal(r);setSelFl([]);setAdminNote('');setFlSearch('');}}
                        style={{display:'flex',alignItems:'center',gap:5,padding:'6px 13px',borderRadius:9,background:'#eff6ff',border:'1px solid #bfdbfe',fontSize:12,fontWeight:700,color:'#1d4ed8',cursor:'pointer',transition:'all .15s'}}
                        onMouseEnter={ev=>ev.currentTarget.style.background='#dbeafe'}
                        onMouseLeave={ev=>ev.currentTarget.style.background='#eff6ff'}>
                        <UserPlus size={12}/> Assign
                      </button>
                    )}
                    {(r.status==='open'||r.status==='in_progress')&&(
                      <button onClick={e=>{e.stopPropagation();setCloseModal(r);setCloseStatus('closed');setCloseNote('');}}
                        style={{padding:'6px 13px',borderRadius:9,background:'#f8fafc',border:'1px solid #e2e8f0',fontSize:12,fontWeight:600,color:'#475569',cursor:'pointer',transition:'all .15s'}}
                        onMouseEnter={ev=>ev.currentTarget.style.background='#f1f5f9'}
                        onMouseLeave={ev=>ev.currentTarget.style.background='#f8fafc'}>
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: detail panel */}
        {selected && (
          <div style={{...card,position:'sticky',top:72,maxHeight:'calc(100vh - 100px)',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',borderBottom:'1px solid #f1f5f9',background:'#fafafa',flexShrink:0}}>
              <div style={{fontWeight:800,fontSize:14,color:'#0f172a'}}>Requirement Detail</div>
              <button onClick={()=>setSelected(null)} style={{width:26,height:26,borderRadius:'50%',background:'#f1f5f9',border:'1px solid #e2e8f0',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><X size={12}/></button>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
              <h3 style={{fontWeight:900,fontSize:16,color:'#0f172a',margin:'0 0 10px',letterSpacing:'-0.02em'}}>{selected.title}</h3>
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:14}}>
                <Badge status={selected.status} map={SC}/>
                <span style={{fontSize:11,padding:'3px 9px',borderRadius:9,background:'#f0fdf4',color:'#15803d',fontWeight:600}}>{selected.engagementType}</span>
              </div>

              {/* Details table */}
              <div style={{background:'#f8fafc',borderRadius:12,padding:'12px 14px',marginBottom:14}}>
                {[
                  ['🏢 Client',  `${selected.clientName||'—'} (${selected.clientEmail||'—'})`],
                  ['💰 Budget',  `${cur(selected)}${selected.budgetMin||0}–${cur(selected)}${selected.budgetMax||0} (${selected.budgetType})`],
                  ['🏠 Work',    selected.workMode==='hybrid'?`Hybrid (${selected.hybridDays||'?'} days/wk)`:selected.workMode],
                  ['📍 Location',selected.location||'Remote'],
                  ['⭐ Exp',     `${selected.experienceMin||'Any'} – ${selected.experienceMax||'∞'} yrs`],
                  ['👥 Positions',`${selected.openPositions} opening(s)`],
                  ['🛠 Skills',  selected.skills||'—'],
                  ['🕐 Timings', selected.workTimings||'Flexible'],
                ].map(([l,v])=>(
                  <div key={l} style={{display:'flex',gap:8,padding:'5px 0',borderBottom:'1px solid #f1f5f9',fontSize:12}}>
                    <span style={{color:'#64748b',width:100,flexShrink:0}}>{l}</span>
                    <span style={{color:'#1e293b',fontWeight:500,flex:1,wordBreak:'break-word'}}>{v}</span>
                  </div>
                ))}
              </div>

              {/* JD */}
              {selected.description&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase' as const,letterSpacing:'0.05em',marginBottom:8}}>Job Description</div>
                  <div style={{background:'#f8fafc',borderLeft:'3px solid #6366f1',borderRadius:'0 10px 10px 0',padding:'10px 13px',fontSize:12,color:'#374151',lineHeight:1.7,maxHeight:160,overflowY:'auto',whiteSpace:'pre-line' as const}}>{selected.description}</div>
                </div>
              )}

              {/* Assignments */}
              {(selected.assignments??[]).length>0&&(
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase' as const,letterSpacing:'0.05em',marginBottom:8}}>
                    Assigned Experts ({(selected.assignments??[]).length})
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:7}}>
                    {(selected.assignments??[]).map((a:any)=>{
                      const ac=AC[a.status]||AC.notified;
                      return(
                        <div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:11,background:ac.bg,border:`1px solid ${ac.border}`}}>
                          <div style={{width:28,height:28,borderRadius:9,background:ac.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0}}>{(a.freelancerName||'?')[0]}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:12,color:ac.color}}>{a.freelancerName||'Expert'}</div>
                            {a.freelancerNote&&<div style={{fontSize:11,color:'#64748b',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>"{a.freelancerNote}"</div>}
                          </div>
                          <span style={{fontSize:10,fontWeight:700,color:ac.color,textTransform:'capitalize' as const,flexShrink:0}}>{a.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {selected.status!=='closed'&&selected.status!=='cancelled'&&(
                  <button onClick={()=>{setAssignModal(selected);setSelFl([]);setAdminNote('');setFlSearch('');}}
                    style={{width:'100%',padding:'11px',borderRadius:13,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 4px 14px rgba(99,102,241,0.3)'}}>
                    <UserPlus size={14}/> Assign Freelancers
                  </button>
                )}
                {(selected.status==='open'||selected.status==='in_progress')&&(
                  <button onClick={()=>{setCloseModal(selected);setCloseStatus('closed');setCloseNote('');}}
                    style={{width:'100%',padding:'11px',borderRadius:13,background:'#f8fafc',color:'#475569',border:'1.5px solid #e2e8f0',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Update status
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ASSIGN MODAL ═══ */}
      {assignModal&&(
        <div onClick={()=>setAssignModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:24,width:'100%',maxWidth:620,maxHeight:'88vh',overflow:'hidden',display:'flex',flexDirection:'column',boxShadow:'0 24px 80px rgba(0,0,0,0.22)'}}>

            {/* Modal header */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',borderBottom:'1px solid #f1f5f9',background:'#fafafa'}}>
              <div>
                <div style={{fontWeight:900,fontSize:16,color:'#0f172a'}}>Assign Freelancers</div>
                <div style={{fontSize:12,color:'#64748b',marginTop:2}}>
                  <span style={{fontWeight:600,color:'#6366f1'}}>"{assignModal.title}"</span> — select experts, they'll each get a full JD email
                </div>
              </div>
              <button onClick={()=>setAssignModal(null)} style={{width:30,height:30,borderRadius:'50%',background:'#f1f5f9',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#64748b'}}><X size={14}/></button>
            </div>

            {/* Search bar */}
            <div style={{padding:'12px 22px',borderBottom:'1px solid #f1f5f9'}}>
              <div style={{position:'relative'}}>
                <Search size={13} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',pointerEvents:'none'}}/>
                <input value={flSearch} onChange={e=>setFlSearch(e.target.value)} placeholder="Search by name, role or skill…"
                  style={{...inp,paddingLeft:32}} onFocus={F} onBlur={B}/>
              </div>
              {selFl.length>0&&<div style={{marginTop:8,fontSize:12,color:'#6366f1',fontWeight:700}}>✓ {selFl.length} selected — each gets a full JD + budget email</div>}
            </div>

            {/* Freelancer list */}
            <div style={{flex:1,overflowY:'auto',padding:'10px 22px',display:'flex',flexDirection:'column',gap:7}}>
              {filteredFl.length===0
                ?<div style={{textAlign:'center',padding:'28px 0',fontSize:13,color:'#94a3b8'}}>No freelancers found</div>
                :filteredFl.map((f:any,i:number)=>{
                  const sel=selFl.includes(f.id);
                  const skills=(f.skills||[]).slice(0,4);
                  return(
                    <div key={f.id} onClick={()=>setSelFl(p=>sel?p.filter(x=>x!==f.id):[...p,f.id])}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'11px 13px',borderRadius:13,border:`1.5px solid ${sel?'#6366f1':'#e2e8f0'}`,background:sel?'#eff6ff':'#fafafa',cursor:'pointer',transition:'all .15s'}}
                      onMouseEnter={ev=>{if(!sel){ev.currentTarget.style.background='#f5f3ff';ev.currentTarget.style.borderColor='#c7d2fe';}}}
                      onMouseLeave={ev=>{if(!sel){ev.currentTarget.style.background='#fafafa';ev.currentTarget.style.borderColor='#e2e8f0';}}}>
                      <div style={{width:36,height:36,borderRadius:11,background:GRAD[i%GRAD.length],display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'#fff',flexShrink:0}}>
                        {(f.aliasName||f.name||'?')[0]}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:2}}>{f.aliasName||f.name}</div>
                        <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{f.currentRole} · {f.totalExp||0}yr exp · {f.currency==='INR'?'₹':'$'}{f.hourlyRate}/hr</div>
                        {skills.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                          {skills.map((s:string)=><span key={s} style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'#f1f5f9',color:'#64748b',fontWeight:600}}>{s}</span>)}
                        </div>}
                      </div>
                      <div style={{width:22,height:22,borderRadius:7,border:`2px solid ${sel?'#6366f1':'#e2e8f0'}`,background:sel?'#6366f1':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .15s'}}>
                        {sel&&<Check size={12} style={{color:'#fff'}}/>}
                      </div>
                    </div>
                  );
                })
              }
            </div>

            {/* Admin note + submit */}
            <div style={{padding:'14px 22px',borderTop:'1px solid #f1f5f9',background:'#fafafa'}}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,fontWeight:700,color:'#64748b',letterSpacing:'0.05em',display:'block',marginBottom:7,textTransform:'uppercase' as const}}>Admin note (included in email, optional)</label>
                <textarea value={adminNote} onChange={e=>setAdminNote(e.target.value)} rows={2}
                  placeholder="e.g. Budget is negotiable. Client is serious, ready to start immediately. Good fit for your skills."
                  style={{...inp,resize:'none' as const,lineHeight:1.65}} onFocus={F} onBlur={B}/>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setAssignModal(null)} style={{flex:1,padding:'12px',borderRadius:13,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>{if(selFl.length===0){toast.error('Select at least one freelancer');return;}assignMut.mutate({id:assignModal.id,ids:selFl,note:adminNote});}}
                  disabled={assignMut.isPending||selFl.length===0}
                  style={{flex:2,padding:'12px',borderRadius:13,background:selFl.length===0?'#f1f5f9':'linear-gradient(135deg,#6366f1,#8b5cf6)',color:selFl.length===0?'#94a3b8':'#fff',border:'none',fontSize:13,fontWeight:800,cursor:selFl.length===0?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,opacity:assignMut.isPending?.6:1,boxShadow:selFl.length>0?'0 4px 14px rgba(99,102,241,0.3)':'none'}}>
                  {assignMut.isPending?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>Assigning…</>:<><Send size={14}/>Assign &amp; send JD email ({selFl.length})</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CLOSE MODAL ═══ */}
      {closeModal&&(
        <div onClick={()=>setCloseModal(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:22,padding:26,maxWidth:440,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
            <div style={{fontWeight:900,fontSize:16,color:'#0f172a',marginBottom:3}}>Update requirement status</div>
            <div style={{fontSize:12,color:'#64748b',marginBottom:20}}>
              <span style={{fontWeight:600,color:'#374151'}}>"{closeModal.title}"</span>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:700,color:'#64748b',letterSpacing:'0.05em',display:'block',marginBottom:9,textTransform:'uppercase' as const}}>New status</label>
              <div style={{display:'flex',gap:8}}>
                {[['closed','✅ Closed (filled)'],['cancelled','❌ Cancelled']].map(([v,l])=>(
                  <button key={v} type="button" onClick={()=>setCloseStatus(v)}
                    style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${closeStatus===v?'#6366f1':'#e2e8f0'}`,background:closeStatus===v?'#eff6ff':'#fff',color:closeStatus===v?'#4338ca':'#475569',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,fontWeight:700,color:'#64748b',letterSpacing:'0.05em',display:'block',marginBottom:7,textTransform:'uppercase' as const}}>Note to client (optional)</label>
              <textarea value={closeNote} onChange={e=>setCloseNote(e.target.value)} rows={2}
                placeholder="e.g. Position filled. We'll reach out for future openings."
                style={{...inp,resize:'none' as const}} onFocus={F} onBlur={B}/>
            </div>
            <div style={{display:'flex',gap:9}}>
              <button onClick={()=>setCloseModal(null)} style={{flex:1,padding:'12px',borderRadius:13,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:600,color:'#475569',cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>closeMut.mutate({id:closeModal.id,status:closeStatus,notes:closeNote})}
                disabled={closeMut.isPending}
                style={{flex:1,padding:'12px',borderRadius:13,background:'linear-gradient(135deg,#0f172a,#1e3a5f)',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',opacity:closeMut.isPending?.6:1}}>
                {closeMut.isPending?'Saving…':'Update status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequirements;
