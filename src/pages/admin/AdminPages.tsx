import React, { useState } from 'react';
import { Check, X, Trophy, DollarSign, TrendingUp, Users, Download, Loader2, Phone, Mail, AlertCircle, Calendar, ChevronDown, ChevronUp, Eye, Plus, Send, RefreshCw } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SectionCard, StatusBadge, StatCard, Tabs } from '../../components/common';
import {
  useProjects, useTimesheets, useInvoices, usePayments, useFreelancers, useLeaderboard, useRevenueReport,
  useApproveTimesheet, useMarkInvoicePaid, useMeetings, useSetMeetingOutcome, useCreateProject,
  useUpdateProgress, useSendPaymentInstructions, useSendInvoiceReminder, useRecordPayout,
  useVerifyFreelancer, useConfirmMeeting, usePendingPayouts, useAttendanceLogs, useRevenuBreakdown
} from '../../hooks/useApi';
import { api } from '../../services/api';
import { freelancerApi } from '../../services/endpoints';

const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white";
const lbl = "text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5";

// ── MEETINGS ─────────────────────────────────────────────────
export const AdminMeetings: React.FC = () => {
  const { data: meetings = [], isLoading } = useMeetings();
  const setOutcome = useSetMeetingOutcome();
  const [modal, setModal] = useState<any>(null);
  const [outcome, setOutcomeVal] = useState('');
  const [finalBudget, setFinalBudget] = useState('');
  const [finalBudgetType, setFinalBudgetType] = useState('hourly');

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Meetings</h1>
      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={24}/></div> : (
          <div className="space-y-3">
            {meetings.map((m: any) => (
              <div key={m.id} className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">{m.clientName} ↔ {m.freelancerName}</span>
                      <StatusBadge status={m.status}/>
                      {m.freelancerConfirmed === true && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Expert confirmed</span>}
                      {m.freelancerConfirmed === false && m.status !== 'upcoming' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Expert declined</span>}
                      {m.freelancerConfirmed === false && m.status === 'upcoming' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Awaiting expert confirmation</span>}
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>📅 {m.scheduledAt ? new Date(m.scheduledAt).toLocaleString() : '—'} · {m.platform} · {m.durationMinutes}min</div>
                      <div>💰 {m.currency} {m.agreedRate} ({m.budgetType}) · <span className="text-blue-600 font-medium">{m.sessionType}</span></div>
                      {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">🔗 Meeting link</a>}
                    </div>
                  </div>
                  {m.status === 'upcoming' && (
                    <button onClick={() => { setModal(m); setOutcomeVal(''); setFinalBudget(m.agreedRate?.toString() || ''); setFinalBudgetType(m.budgetType || 'hourly'); }}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
                      <Check size={14}/> Record outcome
                    </button>
                  )}
                </div>
              </div>
            ))}
            {meetings.length === 0 && <div className="text-center py-10 text-gray-400">No meetings yet</div>}
          </div>
        )}
      </SectionCard>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-4">Record Meeting Outcome</h3>
            <div><label className={lbl}>Outcome</label>
              <select value={outcome} onChange={e => setOutcomeVal(e.target.value)} className={inp}>
                <option value="">Select outcome…</option>
                <option value="approved">✅ Both parties approved — create project</option>
                <option value="client_declined">❌ Client declined the expert</option>
                <option value="freelancer_declined">❌ Expert declined the project</option>
                <option value="follow_up_needed">⏳ Follow-up needed</option>
              </select>
            </div>
            {outcome === 'approved' && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><label className={lbl}>Final budget type</label>
                  <select value={finalBudgetType} onChange={e => setFinalBudgetType(e.target.value)} className={inp}>
                    <option value="hourly">Hourly</option><option value="fixed">Fixed</option>
                  </select>
                </div>
                <div><label className={lbl}>Final agreed amount</label>
                  <input type="number" value={finalBudget} onChange={e => setFinalBudget(e.target.value)} placeholder={modal.agreedRate} className={inp}/>
                </div>
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={() => {
                if (!outcome) { toast.error('Select an outcome'); return; }
                setOutcome.mutate({ id: modal.id, data: { outcome, finalBudget: finalBudget ? parseFloat(finalBudget) : undefined, finalBudgetType } });
                setModal(null);
              }} disabled={setOutcome.isPending} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm hover:bg-indigo-700 disabled:opacity-50">
                {setOutcome.isPending ? 'Saving…' : 'Save outcome'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── PROJECTS ─────────────────────────────────────────────────
export const AdminProjects: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProgress();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Fetch freelancers for dropdown
  const { data: flData } = useQuery({
    queryKey: ['freelancers-all'],
    queryFn: () => freelancerApi.search({ pageSize: 100 }).then(r => r.data),
  });
  const freelancers = flData?.items ?? [];

  // Fetch approved requests for smart client dropdown
  const { data: reqData } = useQuery({
    queryKey: ['requests-approved'],
    queryFn: () => api.get('/requests?status=approved').then(r => r.data),
  });
  const approvedRequests = reqData ?? [];

  const [form, setForm] = useState({
    name: '', clientId: '', freelancerId: '', description: '',
    budgetType: 'hourly', currency: 'USD', hourlyRate: '', totalBudget: '', estimatedHours: '',
    dailyHours: '8',
    durationMonths: '1', monthlyBudget: '',
    startDate: '', endDate: '', timezone: 'IST', applyGst: false, gstRate: 18, bufferDays: '0',
    // Payment schedule
    advancePercent: '30', advanceAmount: '',
    paymentSchedule: 'monthly',
    paymentTermDays: '7',
    milestones: [] as { title: string; dueDate: string; amount: string }[],
  });

  const handleCreate = async () => {
    if (!form.name || !form.freelancerId || !form.startDate || !form.endDate || !form.clientId) {
      toast.error('Fill project name, client, expert, start and end dates'); return;
    }
    if (form.budgetType === 'fixed' && !form.totalBudget) {
      toast.error('Total budget required for fixed-price projects'); return;
    }
    if (form.budgetType === 'hourly' && !form.hourlyRate) {
      toast.error('Hourly rate required'); return;
    }
    await createProject.mutateAsync({
      name: form.name, clientId: form.clientId, freelancerId: form.freelancerId,
      description: form.description, budgetType: form.budgetType, currency: form.currency,
      hourlyRate: parseFloat(form.hourlyRate || '0'), totalBudget: parseFloat(form.totalBudget),
      estimatedHours: parseInt(form.estimatedHours || '0'),
      startDate: new Date(form.startDate).toISOString(), endDate: new Date(form.endDate).toISOString(),
      timezone: form.timezone, applyGst: form.applyGst, gstRate: form.gstRate,
      bufferDays: form.bufferDays, milestones: form.milestones.filter(m => m.title).map(m => ({
        title: m.title, description: '', amount: parseFloat(m.amount || '0'),
        dueDate: new Date(m.dueDate || form.endDate).toISOString(),
      })),
    });
    setShowCreate(false);
    setForm({ name:'', clientId:'', freelancerId:'', description:'', budgetType:'hourly', currency:'USD', hourlyRate:'', totalBudget:'', estimatedHours:'', dailyHours:'8', durationMonths:'1', monthlyBudget:'', startDate:'', endDate:'', timezone:'IST', applyGst:false, gstRate:18, bufferDays:'0', advancePercent:'30', advanceAmount:'', paymentSchedule:'monthly', paymentTermDays:'7', milestones:[] });
  };

  const changeStatus = async (id: string, status: string) => {
    await api.patch(`/projects/${id}`, { status });
    qc.invalidateQueries({ queryKey: ['projects'] });
    toast.success(`Project ${status}`);
  };


  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-gray-900">Projects</h1><p className="text-sm text-gray-500">{projects.length} total · Admin manages all project lifecycle</p></div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm">
          <Plus size={16}/> Create project
        </button>
      </div>

      {/* ─── CREATE PROJECT FULL SCREEN ─── */}
      {showCreate && (
        <div style={{position:'fixed',inset:0,zIndex:50,background:'#f8fafc',overflowY:'auto',fontFamily:"'Inter',system-ui,sans-serif"}}>
          <div style={{maxWidth:860,margin:'0 auto',padding:'0 24px 80px'}}>
            {/* Header */}
            <div style={{position:'sticky',top:0,background:'rgba(248,250,252,0.98)',backdropFilter:'blur(12px)',padding:'16px 0',marginBottom:24,borderBottom:'1px solid #f1f5f9',zIndex:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontWeight:900,fontSize:22,color:'#0f172a',letterSpacing:'-0.03em'}}>Create New Project</div>
                <div style={{fontSize:12,color:'#94a3b8',marginTop:2}}>Status will be <strong style={{color:'#d97706'}}>Pending Payment</strong> — activates when client pays the first invoice</div>
              </div>
              <button onClick={() => setShowCreate(false)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:12,background:'#fff',border:'1.5px solid #e2e8f0',fontSize:13,fontWeight:700,color:'#374151',cursor:'pointer'}}>
                ✕ Cancel
              </button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:20}}>
              {/* Project name */}
              <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
                <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>📋 Basic Info</div>
                <div><label className={lbl}>Project name *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. React Dashboard — Phase 1" className={inp}/></div>
              </div>

              {/* Client + Freelancer smart dropdowns */}
              <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
                <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>👥 Select Client & Expert</div>
                <div style={{fontSize:12,color:'#64748b',marginBottom:16}}>Only showing clients from <strong>approved requests</strong> and freelancers who confirmed meeting availability.</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {/* Smart client dropdown */}
                  <div>
                    <label className={lbl}>Client * (from approved requests)</label>
                    <select value={form.clientId} onChange={e => setForm({...form, clientId: e.target.value})} className={inp}>
                      <option value="">Select client…</option>
                      {(approvedRequests as any[]).filter((r:any,i:number,arr:any[])=>arr.findIndex((x:any)=>x.clientId===r.clientId)===i).map((r: any) => (
                        <option key={r.clientId} value={r.clientId}>
                          {r.clientName || r.clientEmail} — {r.projectTitle || r.title || 'Request'} ({new Date(r.createdAt||r.submittedAt||Date.now()).toLocaleDateString()})
                        </option>
                      ))}
                      {(approvedRequests as any[]).length === 0 && <option disabled>No approved requests yet</option>}
                    </select>
                    {form.clientId && (() => {
                      const sel = (approvedRequests as any[]).find((r:any)=>r.clientId===form.clientId);
                      return sel ? <div style={{marginTop:6,fontSize:11,color:'#4f46e5',background:'#eff6ff',padding:'5px 10px',borderRadius:8}}>✅ {sel.clientName || sel.clientEmail} · {sel.projectTitle || 'Project request'}</div> : null;
                    })()}
                  </div>
                  {/* Smart freelancer dropdown */}
                  <div>
                    <label className={lbl}>Expert/Freelancer * (from meetings)</label>
                    <select value={form.freelancerId} onChange={e => setForm({...form, freelancerId: e.target.value})} className={inp}>
                      <option value="">Select expert…</option>
                      {freelancers.map((f: any) => (
                        <option key={f.id} value={f.id}>
                          {f.aliasName} — {f.currentRole} · {f.currency === 'INR' ? '₹' : '$'}{f.hourlyRate}/hr
                        </option>
                      ))}
                    </select>
                    {form.freelancerId && (() => {
                      const sel = freelancers.find((f:any)=>f.id===form.freelancerId);
                      return sel ? <div style={{marginTop:6,fontSize:11,color:'#059669',background:'#f0fdf4',padding:'5px 10px',borderRadius:8}}>✅ {sel.aliasName} · Trust {sel.trustScore}/100</div> : null;
                    })()}
                  </div>
                </div>
              </div>

            </div>
            {/* Budget section */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>💰 Budget & Timeline</div>
            </div>
            {/* ═══ BUDGET & TIMELINE ═══ */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:18,display:'flex',alignItems:'center',gap:8}}>💰 Budget & Timeline</div>

              {/* Budget type + currency row */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                <div>
                  <label className={lbl}>Budget type *</label>
                  <div style={{display:'flex',gap:8}}>
                    {[['hourly','⏱ Hourly rate'],['fixed','📦 Fixed price']].map(([v,l])=>(
                      <button key={v} type="button" onClick={()=>setForm({...form,budgetType:v})}
                        style={{flex:1,padding:'10px 0',borderRadius:12,border:`2px solid ${form.budgetType===v?'#4f46e5':'#e2e8f0'}`,background:form.budgetType===v?'#eff6ff':'#fff',color:form.budgetType===v?'#4338ca':'#64748b',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Currency</label>
                  <select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} className={inp}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
              </div>

              {/* ── HOURLY fields ── */}
              {form.budgetType==='hourly'&&(
                <div style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:16,padding:'16px',marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'0.06em',marginBottom:12}}>HOURLY RATE SETTINGS</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                    <div>
                      <label className={lbl}>Hourly rate ({form.currency==='INR'?'₹':'$'}) *</label>
                      <input type="number" value={form.hourlyRate} onChange={e=>setForm({...form,hourlyRate:e.target.value})} placeholder="35" className={inp}/>
                    </div>
                    <div>
                      <label className={lbl}>Daily hours</label>
                      <select value={form.dailyHours} onChange={e=>setForm({...form,dailyHours:e.target.value})} className={inp}>
                        {['2','3','4','6','8'].map(h=><option key={h}>{h}h/day</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Est. total hours (optional)</label>
                      <input type="number" value={form.estimatedHours} onChange={e=>setForm({...form,estimatedHours:e.target.value})} placeholder="160" className={inp}/>
                    </div>
                  </div>
                  {form.hourlyRate&&form.estimatedHours&&(
                    <div style={{marginTop:12,padding:'8px 12px',background:'#eff6ff',borderRadius:10,fontSize:12,color:'#4338ca',fontWeight:600}}>
                      💡 Estimated total: {form.currency==='INR'?'₹':'$'}{(parseFloat(form.hourlyRate||'0')*parseInt(form.estimatedHours||'0')).toLocaleString()} ({form.estimatedHours} hrs × {form.currency==='INR'?'₹':'$'}{form.hourlyRate}/hr)
                    </div>
                  )}
                </div>
              )}

              {/* ── FIXED fields ── */}
              {form.budgetType==='fixed'&&(
                <div style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:16,padding:'16px',marginBottom:16}}>
                  <div style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'0.06em',marginBottom:12}}>FIXED PRICE SETTINGS</div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
                    <div>
                      <label className={lbl}>Total fixed budget ({form.currency==='INR'?'₹':'$'}) *</label>
                      <input type="number" value={form.totalBudget} onChange={e=>setForm({...form,totalBudget:e.target.value})} placeholder="10000" className={inp}/>
                    </div>
                    <div>
                      <label className={lbl}>Duration (months) *</label>
                      <select value={form.durationMonths} onChange={e=>setForm({...form,durationMonths:e.target.value})} className={inp}>
                        {['1','2','3','4','6','9','12'].map(m=><option key={m} value={m}>{m} month{m!=='1'?'s':''}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={lbl}>Monthly billing</label>
                      <input type="number" value={form.monthlyBudget||String(form.totalBudget?Math.round(parseFloat(form.totalBudget)/parseInt(form.durationMonths)):'')} onChange={e=>setForm({...form,monthlyBudget:e.target.value})} placeholder={form.totalBudget?String(Math.round(parseFloat(form.totalBudget)/parseInt(form.durationMonths))):''} className={inp}/>
                    </div>
                  </div>
                  {form.totalBudget&&form.durationMonths&&(
                    <div style={{marginTop:12,padding:'8px 12px',background:'#f0fdf4',borderRadius:10,fontSize:12,color:'#15803d',fontWeight:600}}>
                      💡 {form.durationMonths} months × {form.currency==='INR'?'₹':'$'}{Math.round(parseFloat(form.totalBudget)/parseInt(form.durationMonths)).toLocaleString()}/month = {form.currency==='INR'?'₹':'$'}{parseFloat(form.totalBudget).toLocaleString()} total
                    </div>
                  )}
                </div>
              )}

              {/* ── Date range ── */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                <div><label className={lbl}>Start date *</label><input type="date" value={form.startDate} onChange={e=>setForm({...form,startDate:e.target.value})} className={inp}/></div>
                <div><label className={lbl}>End date *</label><input type="date" value={form.endDate} onChange={e=>setForm({...form,endDate:e.target.value})} className={inp}/></div>
                <div><label className={lbl}>Buffer days</label><input type="number" value={form.bufferDays} onChange={e=>setForm({...form,bufferDays:e.target.value})} placeholder="5" className={inp}/></div>
              </div>

              {/* GST */}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:700,color:'#92400e'}}>Apply GST (18%)</div>
                  <div style={{fontSize:11,color:'#b45309'}}>For Indian clients — GST-compliant invoice generated</div>
                </div>
                <button type="button" onClick={()=>setForm({...form,applyGst:!form.applyGst})}
                  style={{width:44,height:24,borderRadius:12,background:form.applyGst?'#f59e0b':'#e2e8f0',border:'none',cursor:'pointer',position:'relative',transition:'background .2s'}}>
                  <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:form.applyGst?23:3,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
                </button>
              </div>
            </div>

            {/* ═══ PAYMENT SCHEDULE ═══ */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>💳 Payment Schedule</div>
              <div style={{fontSize:12,color:'#64748b',marginBottom:18}}>Define how the client pays — admin controls visibility. Both parties see project only after admin approval.</div>

              {/* Advance payment */}
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:14,padding:'16px',marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:800,color:'#15803d',marginBottom:12}}>⚡ Advance Payment</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
                  <div>
                    <label className={lbl}>Advance % of total</label>
                    <select value={form.advancePercent} onChange={e=>setForm({...form,advancePercent:e.target.value})} className={inp}>
                      {['0','10','20','25','30','40','50'].map(p=><option key={p} value={p}>{p}% advance</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Advance amount ({form.currency==='INR'?'₹':'$'})</label>
                    <input type="number" value={form.advanceAmount||
                      (form.advancePercent&&form.totalBudget?String(Math.round(parseFloat(form.totalBudget)*parseInt(form.advancePercent)/100)):
                       form.advancePercent&&form.hourlyRate&&form.estimatedHours?String(Math.round(parseFloat(form.hourlyRate)*parseInt(form.estimatedHours)*parseInt(form.advancePercent)/100)):'')
                    } onChange={e=>setForm({...form,advanceAmount:e.target.value})} placeholder="Auto-calculated" className={inp}/>
                  </div>
                  <div>
                    <label className={lbl}>When to collect advance</label>
                    <select className={inp} defaultValue="before_start">
                      <option value="before_start">Before project starts</option>
                      <option value="on_approval">On admin approval</option>
                      <option value="week1">End of week 1</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Recurring payment */}
              <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:14,padding:'16px'}}>
                <div style={{fontSize:12,fontWeight:800,color:'#1d4ed8',marginBottom:12}}>📅 Recurring Payment Cycle</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div>
                    <label className={lbl}>Payment frequency</label>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                      {[['weekly','Weekly'],['biweekly','Bi-weekly'],['monthly','Monthly'],['milestone','On milestone']].map(([v,l])=>(
                        <button key={v} type="button" onClick={()=>setForm({...form,paymentSchedule:v})}
                          style={{padding:'8px 0',borderRadius:10,border:`2px solid ${form.paymentSchedule===v?'#3b82f6':'#e2e8f0'}`,background:form.paymentSchedule===v?'#eff6ff':'#fff',color:form.paymentSchedule===v?'#1d4ed8':'#64748b',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Payment due within (days)</label>
                    <select value={form.paymentTermDays} onChange={e=>setForm({...form,paymentTermDays:e.target.value})} className={inp}>
                      {['3','5','7','10','14','30'].map(d=><option key={d} value={d}>{d} days after invoice</option>)}
                    </select>
                    <div style={{fontSize:11,color:'#64748b',marginTop:5}}>Admin sends invoice → client pays within this period</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ MILESTONES ═══ */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <div>
                  <div style={{fontSize:13,fontWeight:800,color:'#0f172a',display:'flex',alignItems:'center',gap:8}}>🏁 Milestones (optional)</div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:2}}>Break the project into deliverables. Each milestone can trigger a payment.</div>
                </div>
                <button type="button" onClick={()=>setForm({...form,milestones:[...form.milestones,{title:'',dueDate:'',amount:''}]})}
                  style={{padding:'7px 14px',borderRadius:10,background:'#f8fafc',border:'1.5px solid #e2e8f0',fontSize:12,fontWeight:700,color:'#374151',cursor:'pointer'}}>
                  + Add milestone
                </button>
              </div>
              {form.milestones.length===0&&<div style={{textAlign:'center',padding:'20px',fontSize:12,color:'#d1d5db'}}>No milestones added. Optional — add for phased delivery.</div>}
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {form.milestones.map((m,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 140px 120px 32px',gap:8,alignItems:'flex-end'}}>
                    <div><label className={lbl}>Milestone {i+1} title</label><input value={m.title} onChange={e=>{const ms=[...form.milestones];ms[i]={...ms[i],title:e.target.value};setForm({...form,milestones:ms});}} placeholder={`e.g. Phase ${i+1} delivery`} className={inp}/></div>
                    <div><label className={lbl}>Due date</label><input type="date" value={m.dueDate} onChange={e=>{const ms=[...form.milestones];ms[i]={...ms[i],dueDate:e.target.value};setForm({...form,milestones:ms});}} className={inp}/></div>
                    <div><label className={lbl}>Amount ({form.currency==='INR'?'₹':'$'})</label><input type="number" value={m.amount} onChange={e=>{const ms=[...form.milestones];ms[i]={...ms[i],amount:e.target.value};setForm({...form,milestones:ms});}} placeholder="2500" className={inp}/></div>
                    <button type="button" onClick={()=>setForm({...form,milestones:form.milestones.filter((_,j)=>j!==i)})} style={{height:38,width:32,borderRadius:10,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ DESCRIPTION ═══ */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{fontSize:13,fontWeight:800,color:'#0f172a',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>📝 Description (optional)</div>
              <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Project overview, tech stack, goals, special instructions for the expert…" style={{width:'100%',padding:'12px 14px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:13,resize:'none',outline:'none',fontFamily:'inherit',transition:'border .15s'}} onFocus={e=>e.target.style.borderColor='#4f46e5'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>

            {/* ═══ ADMIN NOTE + SUBMIT ═══ */}
            <div style={{background:'#fff',border:'1px solid #f1f5f9',borderRadius:20,padding:'24px'}}>
              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:14,padding:'14px 16px',marginBottom:16,fontSize:12,color:'#15803d',lineHeight:1.7}}>
                <strong>🔒 Admin-controlled visibility:</strong> After you create the project:
                <ul style={{margin:'8px 0 0',paddingLeft:18,display:'flex',flexDirection:'column',gap:3}}>
                  <li>Project is <strong>hidden from both client and freelancer</strong> until you approve</li>
                  <li>You review project details → click <strong>"Approve & Notify"</strong></li>
                  <li>Both parties get email + notification with project details</li>
                  <li>Advance payment invoice sent to client automatically</li>
                  <li>Project activates once advance is paid</li>
                </ul>
              </div>

              {/* Submit */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Project timezone</label>
                  <select value={form.timezone} onChange={e=>setForm({...form,timezone:e.target.value})} className={inp}>
                    {['IST','EST','PST','GMT','CET','SGT','JST','AEST'].map(tz=><option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div/>
              </div>


                <div><label className={lbl}>Budget type *</label>
                  <div className="flex gap-2">
                    {[['hourly','Hourly'],['fixed','Fixed']].map(([v,l]) => (
                      <button key={v} type="button" onClick={() => setForm({...form, budgetType: v})}
                        className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold ${form.budgetType === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div><label className={lbl}>Currency</label>
                  <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className={inp}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
              </div>

              <div className={`grid gap-4 ${form.budgetType === 'hourly' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                {form.budgetType === 'hourly' && (
                  <div><label className={lbl}>Hourly rate ({form.currency})</label><input type="number" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: e.target.value})} placeholder="35" className={inp}/></div>
                )}
                <div><label className={lbl}>Total budget ({form.currency}) *</label><input type="number" value={form.totalBudget} onChange={e => setForm({...form, totalBudget: e.target.value})} placeholder="6400" className={inp}/></div>
                <div><label className={lbl}>Estimated hours</label><input type="number" value={form.estimatedHours} onChange={e => setForm({...form, estimatedHours: e.target.value})} placeholder="200" className={inp}/></div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className={lbl}>Start date *</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={inp}/></div>
                <div><label className={lbl}>End date *</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className={inp}/></div>
                <div><label className={lbl}>Timezone</label>
                  <select value={form.timezone} onChange={e => setForm({...form, timezone: e.target.value})} className={inp}>
                    <option>IST (UTC+5:30)</option><option>UTC</option><option>EST (UTC-5)</option><option>SGT (UTC+8)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <input type="checkbox" checked={form.applyGst} onChange={e => setForm({...form, applyGst: e.target.checked})} id="gst" className="w-4 h-4 accent-amber-500"/>
                  <label htmlFor="gst" className="text-sm font-bold text-amber-900 cursor-pointer">Apply GST 18% 🇮🇳 (Indian clients)</label>
                </div>
                <div>
                  <label className={lbl}>Buffer days after payment</label>
                  <input type="number" value={form.bufferDays} onChange={e => setForm({...form, bufferDays: e.target.value})} placeholder="0" className={inp}/>
                  <div className="text-xs text-gray-400 mt-1">Project activates N days after payment received</div>
                </div>
              </div>

              {form.applyGst && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                  💡 With GST: Client pays {form.currency} {form.totalBudget} + GST {(parseFloat(form.totalBudget || '0') * 0.18).toFixed(0)} = <strong>{form.currency} {(parseFloat(form.totalBudget || '0') * 1.18).toFixed(0)}</strong>
                </div>
              )}


          </div>
        </div>
      )}

      {/* ─── PROJECT LIST ─── */}
      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-indigo-500" size={24}/></div> : (
        <div className="space-y-4">
          {projects.map((proj: any) => {
            const curr = proj.currency === 'INR' ? '₹' : '$';
            const expanded = expandedId === proj.id;
            return (
              <div key={proj.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all">
                {/* Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-black text-gray-900">{proj.name}</span>
                        <StatusBadge status={proj.status}/>
                        {proj.applyGst && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">GST 18%</span>}
                        {proj.budgetType && <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{proj.budgetType}</span>}
                      </div>
                      <div className="text-xs text-gray-500">{proj.clientName} · {proj.freelancerAlias || proj.freelancerName} · {proj.timezone}</div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-black text-gray-900 text-lg">{curr}{proj.totalBudget?.toLocaleString()}</div>
                      {proj.applyGst && <div className="text-xs text-amber-600">+GST {curr}{(proj.totalBudget * 0.18)?.toLocaleString()}</div>}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${proj.progress}%`, background: proj.status === 'completed' ? '#16a34a' : proj.status === 'paused' ? '#f59e0b' : '#4f46e5' }}/>
                    </div>
                    <span className="text-sm font-black text-gray-700 shrink-0">{proj.progress}%</span>
                  </div>

                  {/* Financials */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    {[
                      { l: 'Total budget', v: `${curr}${proj.totalBudget?.toLocaleString()}`, cls: 'text-gray-900' },
                      { l: 'Paid', v: `${curr}${proj.totalPaid?.toLocaleString()}`, cls: 'text-green-700' },
                      { l: 'Pending payment', v: `${curr}${proj.pendingAmount?.toLocaleString()}`, cls: proj.pendingAmount > 0 ? 'text-red-600 font-black' : 'text-gray-400' },
                      { l: 'Escrow balance', v: `${curr}${proj.escrowBalance?.toLocaleString()}`, cls: 'text-blue-700' },
                    ].map(f => (
                      <div key={f.l} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <div className="text-xs text-gray-500 mb-0.5">{f.l}</div>
                        <div className={`text-sm font-bold ${f.cls}`}>{f.v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                    <span>📅 Start: <strong className="text-gray-700">{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : '—'}</strong></span>
                    <span>🏁 End: <strong className="text-gray-700">{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : '—'}</strong></span>
                    <span>⏱ {proj.loggedHours}h / {proj.estimatedHours}h</span>
                    {proj.bufferDays && proj.bufferDays !== '0' && <span>⏳ {proj.bufferDays}d buffer</span>}
                  </div>

                  {/* Admin action for pending payment - no scary warning to client/freelancer */}
                  {proj.status === 'pending_payment' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold text-amber-700">🔒 Admin only: Pending approval · Not visible to client or freelancer yet</span>
                    </div>
                  )}

                  {/* Status actions */}
                  <div className="flex flex-wrap gap-2">
                    {proj.status === 'pending_payment' && <button onClick={() => changeStatus(proj.id, 'active')} className="text-xs bg-green-100 text-green-700 px-3 py-2 rounded-xl font-bold hover:bg-green-200">✓ Payment received — Activate</button>}
                    {proj.status === 'active' && <button onClick={() => changeStatus(proj.id, 'paused')} className="text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-xl font-bold hover:bg-amber-200">⏸ Pause</button>}
                    {proj.status === 'paused' && <button onClick={() => changeStatus(proj.id, 'active')} className="text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-xl font-bold hover:bg-blue-200">▶ Resume</button>}
                    {['active', 'paused'].includes(proj.status) && <button onClick={() => changeStatus(proj.id, 'completed')} className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-xl font-bold hover:bg-gray-200">✓ Complete</button>}
                    <button onClick={() => setExpandedId(expanded ? null : proj.id)} className="text-xs text-indigo-600 px-3 py-2 rounded-xl font-bold hover:bg-indigo-50 ml-auto flex items-center gap-1">
                      {expanded ? <><ChevronUp size={12}/>Hide details</> : <><ChevronDown size={12}/>More details</>}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    {proj.skills?.length > 0 && (
                      <div><div className="text-xs font-bold text-gray-500 mb-2">Skills</div>
                        <div className="flex flex-wrap gap-1">{proj.skills.map((s: string) => <span key={s} className="text-xs bg-white text-gray-600 px-2 py-0.5 rounded border border-gray-200">{s}</span>)}</div>
                      </div>
                    )}
                    {proj.milestones?.length > 0 && (
                      <div><div className="text-xs font-bold text-gray-500 mb-2">Milestones</div>
                        <div className="space-y-1.5">{proj.milestones.map((m: any) => (
                          <div key={m.id} className="flex items-center gap-3 text-sm">
                            <StatusBadge status={m.status}/> <span className="flex-1">{m.title}</span>
                            <span className="text-gray-500">{proj.currency === 'INR' ? '₹' : '$'}{m.amount?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400">{m.dueDate ? new Date(m.dueDate).toLocaleDateString() : ''}</span>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    {proj.statusLogs?.length > 0 && (
                      <div><div className="text-xs font-bold text-gray-500 mb-2">Status history</div>
                        <div className="space-y-1">{proj.statusLogs.map((l: any, i: number) => (
                          <div key={i} className="text-xs text-gray-500">{new Date(l.changedAt).toLocaleDateString()}: <span className="text-gray-400">{l.oldStatus || '—'}</span> → <span className="font-semibold text-gray-700">{l.newStatus}</span>{l.reason ? ` (${l.reason})` : ''}</div>
                        ))}</div>
                      </div>
                    )}
                    {proj.description && <div><div className="text-xs font-bold text-gray-500 mb-1">Description</div><div className="text-sm text-gray-600">{proj.description}</div></div>}
                  </div>
                )}
              </div>
            );
          })}
          {projects.length === 0 && (
            <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl">
              <div className="text-5xl mb-3">📁</div>
              <div className="text-gray-500 font-semibold mb-2">No projects yet</div>
              <div className="text-gray-400 text-sm mb-4">Create a project after a client approves a demo meeting</div>
              <button onClick={() => setShowCreate(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700">+ Create first project</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── TIMESHEETS ────────────────────────────────────────────────
export const AdminTimesheets: React.FC = () => {
  const [tab, setTab] = useState('submitted');
  const { data: timesheets = [], isLoading } = useTimesheets(tab === 'all' ? undefined : tab);
  const approve = useApproveTimesheet();
  const tabs = [
    { id: 'submitted', label: 'Pending approval', count: timesheets.filter((t: any) => t.status === 'submitted').length },
    { id: 'approved', label: 'Approved', count: 0 },
    { id: 'all', label: 'All', count: timesheets.length },
  ];
  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Timesheets</h1>
      <Tabs tabs={tabs} active={tab} onChange={setTab}/>
      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> : (
          <div className="space-y-3">
            {timesheets.map((ts: any) => (
              <div key={ts.id} className="border border-gray-100 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-gray-900">{ts.projectName}</span>
                      <StatusBadge status={ts.status}/>
                    </div>
                    <div className="text-xs text-gray-500">{ts.freelancerName} · Week: {ts.weekStart ? new Date(ts.weekStart).toLocaleDateString() : '—'} – {ts.weekEnd ? new Date(ts.weekEnd).toLocaleDateString() : '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-gray-900 text-lg">{ts.totalHours}h</div>
                    <div className="text-sm font-bold text-green-700">${ts.totalAmount?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {ts.entries?.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="flex items-center gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-gray-400 shrink-0">{e.date ? new Date(e.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) : ''}</span>
                      <span className="font-medium text-gray-700 shrink-0">{e.hours}h</span>
                      {e.taskType && <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">{e.taskType}</span>}
                      <span className="flex-1 truncate">{e.description}</span>
                    </div>
                  ))}
                  {ts.entries?.length > 3 && <div className="text-xs text-gray-400 px-3">+{ts.entries.length - 3} more entries</div>}
                </div>
                {ts.status === 'submitted' && (
                  <div className="flex gap-2">
                    <button onClick={() => approve.mutate({ id: ts.id, data: { approve: true } })} disabled={approve.isPending}
                      className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                      <Check size={14}/> Approve & generate invoice
                    </button>
                    <button onClick={() => approve.mutate({ id: ts.id, data: { approve: false, reason: 'Please review and resubmit with correct details' } })} disabled={approve.isPending}
                      className="flex items-center gap-1.5 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-bold">
                      <X size={14}/> Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
            {timesheets.length === 0 && <div className="text-center py-10 text-gray-400">No timesheets to review</div>}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

// ── INVOICES ─────────────────────────────────────────────────
export const AdminInvoices: React.FC = () => {
  const [tab, setTab] = useState('pending');
  const { data: invoices = [], isLoading } = useInvoices(tab === 'all' ? undefined : tab);
  const markPaid = useMarkInvoicePaid();
  const sendInstructions = useSendPaymentInstructions();
  const sendReminder = useSendInvoiceReminder();
  const [payModal, setPayModal] = useState<any>(null);
  const [method, setMethod] = useState('Bank Transfer');
  const [txnId, setTxnId] = useState('');

  const tabs = [
    { id: 'pending', label: 'Pending', count: invoices.filter((i: any) => i.status === 'pending').length },
    { id: 'overdue', label: 'Overdue', count: invoices.filter((i: any) => i.status === 'overdue').length },
    { id: 'paid', label: 'Paid', count: 0 },
    { id: 'all', label: 'All', count: invoices.length },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Invoices</h1>
      <Tabs tabs={tabs} active={tab} onChange={setTab}/>
      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> : (
          <div className="space-y-4">
            {invoices.map((inv: any) => {
              const curr = inv.currency === 'INR' ? '₹' : '$';
              const isOverdue = inv.status === 'overdue';
              return (
                <div key={inv.id} className={`border rounded-2xl p-5 ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-black text-gray-900">{inv.invoiceNumber}</span>
                        <StatusBadge status={inv.status}/>
                        {inv.applyGst && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium">GST 18%</span>}
                        {isOverdue && <span className="text-xs text-red-600 font-bold">OVERDUE</span>}
                      </div>
                      <div className="text-sm text-gray-600">{inv.clientName} · {inv.freelancerName} · {inv.projectName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Issued: {inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString() : '—'} · Due: {inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : '—'}
                        {inv.remindersSent > 0 && <span className="text-amber-600 ml-2">· {inv.remindersSent} reminder{inv.remindersSent > 1 ? 's' : ''} sent</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-black text-gray-900 text-xl">{curr}{inv.total?.toLocaleString()}</div>
                      {inv.applyGst && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          Subtotal: {curr}{inv.subtotal?.toLocaleString()}<br/>
                          GST: {curr}{inv.gstAmount?.toLocaleString()}<br/>
                          Commission: {curr}{inv.commission?.toLocaleString()} ({inv.commissionRate}%)
                        </div>
                      )}
                      {!inv.applyGst && (
                        <div className="text-xs text-gray-500">Commission: {curr}{inv.commission?.toLocaleString()} ({inv.commissionRate}%)</div>
                      )}
                      <div className="text-xs text-green-700 font-medium mt-1">Expert gets: {curr}{inv.freelancerAmount?.toLocaleString()}</div>
                    </div>
                  </div>
                  {inv.paymentInstructions && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 text-xs text-blue-700">
                      <strong>Payment instructions sent:</strong> {inv.paymentInstructions.substring(0, 100)}…
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {inv.status !== 'paid' && (
                      <>
                        <button onClick={() => sendInstructions.mutate(inv.id)} disabled={sendInstructions.isPending}
                          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold">
                          <Mail size={12}/> Send bank details to client
                        </button>
                        <button onClick={() => { setPayModal(inv); setMethod('Bank Transfer'); setTxnId(''); }}
                          className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl text-xs font-bold">
                          <Check size={12}/> Mark paid
                        </button>
                        <button onClick={() => sendReminder.mutate(inv.id)} disabled={sendReminder.isPending}
                          className="flex items-center gap-1.5 border border-amber-300 text-amber-700 hover:bg-amber-50 px-3 py-2 rounded-xl text-xs font-bold">
                          <Send size={12}/> Send reminder
                        </button>
                      </>
                    )}
                    {inv.status === 'paid' && <span className="text-xs text-green-600 font-bold flex items-center gap-1"><Check size={12}/>Paid {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : ''}</span>}
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && <div className="text-center py-10 text-gray-400">No invoices</div>}
          </div>
        )}
      </SectionCard>

      {payModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setPayModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-4">Mark Invoice Paid</h3>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-sm">
              <div className="font-bold text-green-900">{payModal.invoiceNumber}</div>
              <div className="text-green-700">Total: {payModal.currency === 'INR' ? '₹' : '$'}{payModal.total?.toLocaleString()}</div>
              {payModal.applyGst && <div className="text-xs text-amber-700 mt-1">Includes GST {payModal.currency === 'INR' ? '₹' : '$'}{payModal.gstAmount?.toLocaleString()}</div>}
            </div>
            <div className="space-y-3">
              <div><label className={lbl}>Payment method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} className={inp}>
                  <option>Bank Transfer</option><option>Wire Transfer</option><option>PayPal</option><option>Stripe</option><option>Razorpay</option><option>UPI</option>
                </select>
              </div>
              <div><label className={lbl}>Transaction ID (optional)</label><input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="UTR / transaction reference" className={inp}/></div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setPayModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={() => { markPaid.mutate({ id: payModal.id, data: { invoiceId: payModal.id, method, transactionId: txnId || undefined } }); setPayModal(null); }}
                disabled={markPaid.isPending} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-sm disabled:opacity-50">
                Confirm paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── PAYMENTS ─────────────────────────────────────────────────
export const AdminPayments: React.FC = () => {
  const { data: payments = [], isLoading } = usePayments();
  const { data: pending = [] } = usePendingPayouts();
  const recordPayout = useRecordPayout();
  const [payoutModal, setPayoutModal] = useState<any>(null);
  const [txnId, setTxnId] = useState('');
  const [tab, setTab] = useState('pending');

  const tabs = [
    { id: 'pending', label: 'Pending payouts', count: pending.length },
    { id: 'all', label: 'All payments', count: payments.length },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Payments & Payouts</h1>
      <Tabs tabs={tabs} active={tab} onChange={setTab}/>
      {tab === 'pending' ? (
        <div className="space-y-3">
          {pending.length === 0 ? <div className="text-center py-12 text-gray-400 bg-white border border-gray-100 rounded-2xl">🎉 No pending payouts</div> : (
            pending.map((p: any) => (
              <div key={p.id} className="bg-white border border-orange-100 rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-gray-900 mb-0.5">{p.freelancerName}</div>
                    <div className="text-xs text-gray-500 mb-2">{p.invoiceNumber} · Paid {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</div>
                    {/* Bank details */}
                    {(p.bankAccount || p.upiId) ? (
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs space-y-0.5">
                        {p.bankAccountName && <div><strong>Name:</strong> {p.bankAccountName}</div>}
                        {p.bankAccount && <div><strong>A/C:</strong> {p.bankAccount} · <strong>IFSC:</strong> {p.ifscCode || 'N/A'} · <strong>Bank:</strong> {p.bankName || 'N/A'}</div>}
                        {p.upiId && <div><strong>UPI:</strong> {p.upiId}</div>}
                        {p.freelancerEmail && <div><strong>Email:</strong> {p.freelancerEmail}</div>}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                        ⚠ Freelancer has not added bank details yet. Ask them to update in My Profile → Bank Details.
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="font-black text-gray-900 text-xl">{p.currency === 'INR' ? '₹' : '$'}{p.freelancerAmount?.toLocaleString()}</div>
                    <button onClick={() => { setPayoutModal(p); setTxnId(''); }}
                      className="mt-2 flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold">
                      <DollarSign size={14}/> Record payout
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <SectionCard>
          {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-100">
                  {['Invoice','Client','Freelancer','Amount','Commission','Status','Payout','Paid on'].map(h => (
                    <th key={h} className="text-left pb-3 text-xs font-bold text-gray-500 uppercase tracking-wide pr-4">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {payments.map((p: any) => {
                    const curr = p.currency === 'INR' ? '₹' : '$';
                    return (
                      <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 pr-4 font-medium text-gray-900">{p.invoiceNumber}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.clientName}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.freelancerName}</td>
                        <td className="py-3 pr-4 font-bold">{curr}{p.amount?.toLocaleString()}</td>
                        <td className="py-3 pr-4 text-gray-500">{curr}{p.commission?.toLocaleString()}</td>
                        <td className="py-3 pr-4"><StatusBadge status={p.status}/></td>
                        <td className="py-3 pr-4"><StatusBadge status={p.payoutStatus}/></td>
                        <td className="py-3 pr-4 text-gray-400 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {payments.length === 0 && <div className="text-center py-10 text-gray-400">No payments yet</div>}
            </div>
          )}
        </SectionCard>
      )}

      {payoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setPayoutModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-3">Record Freelancer Payout</h3>
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 text-sm">
              <div className="font-bold text-gray-900">{payoutModal.freelancerName}</div>
              <div className="text-green-700 font-black text-lg">{payoutModal.currency === 'INR' ? '₹' : '$'}{payoutModal.freelancerAmount?.toLocaleString()}</div>
              {payoutModal.bankAccount && <div className="text-xs text-gray-500 mt-1">To: {payoutModal.bankAccount} · {payoutModal.ifscCode}</div>}
              {payoutModal.upiId && <div className="text-xs text-gray-500">UPI: {payoutModal.upiId}</div>}
            </div>
            <div><label className={lbl}>Transaction ID (UTR/reference)</label><input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="UTR number or transaction ID" className={inp}/></div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setPayoutModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={() => { recordPayout.mutate({ id: payoutModal.id, data: { payoutTransactionId: txnId || undefined } }); setPayoutModal(null); }}
                disabled={recordPayout.isPending} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-black text-sm disabled:opacity-50">
                Confirm payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── FREELANCERS (admin view) ──────────────────────────────────
export const AdminFreelancers: React.FC = () => {
  const { data: flData } = useQuery({
    queryKey: ['admin-freelancers'],
    queryFn: () => api.get('/freelancers?pageSize=100').then(r => r.data),
  });
  const verifyFreelancer = useVerifyFreelancer();
  const freelancers = flData?.items ?? [];

  return (
    <div className="animate-fade-in space-y-5">
      <div><h1 className="text-2xl font-black text-gray-900">Freelancer Management</h1>
        <p className="text-sm text-gray-500">Verify identity, manage availability. Verified experts appear in Browse and Quick Support.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {freelancers.map((f: any) => {
          const curr = f.currency === 'INR' ? '₹' : '$';
          return (
            <div key={f.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl font-black flex items-center justify-center text-white text-sm shrink-0"
                  style={{ background: `hsl(${(f.aliasName?.charCodeAt(0) || 65) * 7}, 60%, 40%)` }}>
                  {f.aliasName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm truncate">{f.aliasName}</div>
                  <div className="text-xs text-gray-500 truncate">{f.currentRole}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {f.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>}
                    {!f.isVerified && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Unverified</span>}
                    {f.isAvailable && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Available</span>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-sm">{curr}{f.hourlyRate}/hr</div>
                  <div className="text-xs text-gray-400">Trust {f.trustScore}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {f.skills?.slice(0, 4).map((s: string) => <span key={s} className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-lg border border-gray-100">{s}</span>)}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-3">
                <div className="text-center"><div className="font-bold text-gray-900">{f.rating?.toFixed(1)}★</div><div>Rating</div></div>
                <div className="text-center"><div className="font-bold text-gray-900">{f.completedProjects}</div><div>Projects</div></div>
                <div className="text-center"><div className="font-bold text-gray-900">{f.totalExp}yr</div><div>Exp</div></div>
              </div>
              <button
                onClick={() => verifyFreelancer.mutate({ id: f.id, verified: !f.isVerified })}
                className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${f.isVerified ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                {f.isVerified ? 'Revoke verification' : '✓ Verify & activate'}
              </button>
            </div>
          );
        })}
        {freelancers.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">No freelancers registered yet</div>}
      </div>
    </div>
  );
};

// ── CLIENTS ───────────────────────────────────────────────────
export const AdminClients: React.FC = () => {
  const { data: clientsData } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => api.get('/admin/clients').then(r => r.data).catch(() => ({ items: [], total: 0 })),
  });
  const clients = Array.isArray(clientsData) ? clientsData : clientsData?.items ?? [];

  return (
    <div className="animate-fade-in space-y-5">
      <div><h1 className="text-2xl font-black text-gray-900">Clients</h1><p className="text-sm text-gray-500">{clients.length} registered clients</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c: any) => (
          <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-lg shrink-0">
                {c.companyName?.[0] || c.contactName?.[0] || 'C'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 truncate">{c.companyName}</div>
                <div className="text-xs text-gray-500 truncate">{c.contactName} · {c.country}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-bold shrink-0 ${c.plan === 'enterprise' ? 'bg-purple-100 text-purple-700' : c.plan === 'growth' ? 'bg-blue-100 text-blue-700' : c.plan === 'starter' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {c.plan?.toUpperCase() || 'PAYG'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              <div className="bg-gray-50 rounded-xl p-2"><div className="text-xs text-gray-400">Hours</div><div className="font-bold text-gray-900">{c.hoursUsed || 0}/{c.hoursIncluded || 0}</div></div>
              <div className="bg-gray-50 rounded-xl p-2"><div className="text-xs text-gray-400">Total spent</div><div className="font-bold text-gray-900">${c.totalSpent?.toLocaleString() || 0}</div></div>
            </div>
            {c.industry && <div className="text-xs text-gray-400">{c.industry}</div>}
            {c.isGstRegistered && c.gstNumber && <div className="text-xs text-amber-600 mt-1">🧾 GST: {c.gstNumber}</div>}
            {c.user?.mobileNumber && (
              <a href={`tel:+91${c.user.mobileNumber}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 mt-2">
                <Phone size={11}/> +91-{c.user.mobileNumber}
              </a>
            )}
          </div>
        ))}
        {clients.length === 0 && <div className="col-span-3 text-center py-16 text-gray-400">No clients yet</div>}
      </div>
    </div>
  );
};

// ── LEADERBOARD ───────────────────────────────────────────────
export const AdminLeaderboard: React.FC = () => {
  const { data: leaders = [], isLoading } = useLeaderboard();
  return (
    <div className="animate-fade-in space-y-5">
      <h1 className="text-2xl font-black text-gray-900">Expert Leaderboard — This Month</h1>
      <div className="grid grid-cols-1 gap-3">
        {leaders.map((l: any) => (
          <div key={l.rank} className={`bg-white border rounded-2xl p-5 flex items-center gap-4 ${l.rank <= 3 ? 'border-amber-200' : 'border-gray-100'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shrink-0 ${l.rank === 1 ? 'bg-amber-100 text-amber-700' : l.rank === 2 ? 'bg-gray-100 text-gray-600' : l.rank === 3 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
              {l.rank === 1 ? '🥇' : l.rank === 2 ? '🥈' : l.rank === 3 ? '🥉' : `#${l.rank}`}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-900">{l.freelancerName}</div>
              <div className="text-xs text-gray-500">{l.completedProjects} projects · {l.rating?.toFixed(1)}★</div>
              {l.badge && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">{l.badge}</span>}
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-gray-900 text-lg">${l.earnings?.toLocaleString()}</div>
              <div className="text-xs text-gray-400">earned this month</div>
            </div>
          </div>
        ))}
        {!isLoading && leaders.length === 0 && <div className="text-center py-12 text-gray-400">No payment data this month yet</div>}
      </div>
    </div>
  );
};

// ── REPORTS ───────────────────────────────────────────────────
export const AdminReports: React.FC = () => {
  const { data: report = [] } = useRevenueReport();
  const { data: breakdown } = useRevenuBreakdown();
  const maxRevenue = Math.max(...report.map((r: any) => r.revenue || 0), 1);

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-black text-gray-900">Revenue Reports</h1>

      {/* Revenue breakdown */}
      {breakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { l: 'Commission revenue', v: `$${breakdown.commissionRevenue?.toLocaleString() ?? 0}`, cls: 'text-green-600' },
            { l: 'Subscription revenue', v: `$${breakdown.subscriptionRevenue?.toLocaleString() ?? 0}`, cls: 'text-blue-600' },
            { l: 'Quick support fees', v: `$${breakdown.quickSupportRevenue?.toLocaleString() ?? 0}`, cls: 'text-amber-600' },
            { l: 'Pending payouts', v: `$${breakdown.pendingPayouts?.toLocaleString() ?? 0}`, cls: 'text-red-600' },
          ].map(s => (
            <div key={s.l} className="bg-white border border-gray-100 rounded-2xl p-4">
              <div className="text-xs text-gray-500 mb-1">{s.l}</div>
              <div className={`text-2xl font-black ${s.cls}`}>{s.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Monthly chart */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-900 mb-5">Monthly revenue & commission</h3>
        <div className="space-y-3">
          {report.map((r: any) => (
            <div key={r.month} className="flex items-center gap-4">
              <div className="text-xs font-medium text-gray-500 w-16 shrink-0">{r.month}</div>
              <div className="flex-1 flex gap-1 h-8 items-end">
                <div className="bg-indigo-500 rounded-t-sm transition-all" style={{ height: `${(r.revenue / maxRevenue) * 100}%`, width: '60%', minHeight: r.revenue > 0 ? 4 : 0 }} title={`Revenue: $${r.revenue?.toFixed(0)}`}/>
                <div className="bg-green-400 rounded-t-sm transition-all" style={{ height: `${(r.commission / maxRevenue) * 100}%`, width: '40%', minHeight: r.commission > 0 ? 4 : 0 }} title={`Commission: $${r.commission?.toFixed(0)}`}/>
              </div>
              <div className="text-xs font-bold text-gray-900 w-20 text-right">${r.revenue?.toFixed(0)}</div>
              <div className="text-xs text-green-700 w-16 text-right">${r.commission?.toFixed(0)}</div>
              {r.gstAmount > 0 && <div className="text-xs text-amber-600 w-16 text-right">GST ${r.gstAmount?.toFixed(0)}</div>}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-xs"><div className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-500 rounded"/>Revenue</div><div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-400 rounded"/>Commission</div></div>
      </div>
    </div>
  );
};

// ── ATTENDANCE LOGS ───────────────────────────────────────────
export const AdminAttendance: React.FC = () => {
  const { data: logs = [], isLoading } = useAttendanceLogs();
  return (
    <div className="animate-fade-in space-y-5">
      <div><h1 className="text-2xl font-black text-gray-900">Attendance Logs</h1>
        <p className="text-sm text-gray-500">Login, logout, timesheet submit, standups, support calls</p>
      </div>
      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {['User', 'Role', 'Action', 'Time', 'Note'].map(h => <th key={h} className="text-left pb-3 text-xs font-bold text-gray-500 uppercase tracking-wide pr-4">{h}</th>)}
              </tr></thead>
              <tbody>
                {logs.map((l: any) => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900">{l.userName}</td>
                    <td className="py-2.5 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.userRole === 'admin' ? 'bg-purple-100 text-purple-700' : l.userRole === 'freelancer' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{l.userRole}</span></td>
                    <td className="py-2.5 pr-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.action === 'login' ? 'bg-green-100 text-green-700' : l.action === 'logout' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{l.action}</span></td>
                    <td className="py-2.5 pr-4 text-gray-500 text-xs">{l.timestamp ? new Date(l.timestamp).toLocaleString() : '—'}</td>
                    <td className="py-2.5 text-gray-400 text-xs truncate max-w-48">{l.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && <div className="text-center py-10 text-gray-400">No attendance logs yet</div>}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
