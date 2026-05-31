import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Filter, Star, Clock, Check, X, Loader2,
  AlertCircle, DollarSign, FolderOpen, FileText, Plus,
  ChevronRight, ChevronLeft, Zap, Shield, Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useFreelancers, useProjects, useTimesheets, useApproveTimesheet, useInvoices, useMarkInvoicePaid, useSendPaymentInstructions, useSendInvoiceReminder, useCreateRequest, useMeetings, useNotifications, useSubmitReview } from '../../hooks/useApi';
import { publicApi } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';

const cur = (amt: number, c = 'USD') => (c === 'INR' ? '₹' : '$') + (amt ?? 0).toLocaleString();
const badge = (status: string) => {
  const map: Record<string, string> = { active: 'bg-green-50 text-green-700 border-green-200', pending: 'bg-amber-50 text-amber-700 border-amber-200', pending_payment: 'bg-red-50 text-red-700 border-red-200', completed: 'bg-blue-50 text-blue-700 border-blue-200', paused: 'bg-orange-50 text-orange-700 border-orange-200', cancelled: 'bg-red-50 text-red-700 border-red-200', submitted: 'bg-purple-50 text-purple-700 border-purple-200', approved: 'bg-green-50 text-green-700 border-green-200', rejected: 'bg-red-50 text-red-700 border-red-200', paid: 'bg-green-50 text-green-700 border-green-200', overdue: 'bg-red-50 text-red-700 border-red-200', };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{status.replace('_',' ')}</span>;
};

// ── CLIENT DASHBOARD ─────────────────────────────────────────
export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();
  const { data: invoices = [] } = useInvoices();
  const { data: meetings = [] } = useMeetings();
  const { data: notifs = [] } = useNotifications();

  const activeProjects = projects.filter((p: any) => p.status === 'active');
  const pendingInvoices = (invoices as any[]).filter((i: any) => i.status === 'pending' || i.status === 'overdue');
  const overdueInvoices = (invoices as any[]).filter((i: any) => i.status === 'overdue');
  const upcomingMeetings = (meetings as any[]).filter((m: any) => m.status === 'upcoming').slice(0, 3);
  const totalPending = pendingInvoices.reduce((s: number, i: any) => s + (i.total ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Overdue alert */}
      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <div className="font-bold text-red-900 text-sm">{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}</div>
            <div className="text-red-700 text-xs mt-0.5">Total overdue: <strong>${overdueInvoices.reduce((s: number, i: any) => s + i.total, 0).toLocaleString()}</strong> — please pay to avoid project disruption.</div>
          </div>
          <button onClick={() => navigate('/client/invoices')} className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-white bg-red-600 hover:bg-red-700">Pay now →</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active projects', value: activeProjects.length, icon: <FolderOpen size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending invoices', value: cur(totalPending), icon: <AlertCircle size={18}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Upcoming meetings', value: upcomingMeetings.length, icon: <Clock size={18}/>, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Invoices to pay', value: pendingInvoices.length, icon: <FileText size={18}/>, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>{s.icon}</div>
            <div className="text-2xl font-black text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Active projects</h3>
            <button onClick={() => navigate('/client/projects')} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
          </div>
          {activeProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderOpen size={32} className="mx-auto mb-2 opacity-40"/>
              <div>No active projects</div>
              <button onClick={() => navigate('/client/browse')} className="mt-2 text-xs text-blue-600 font-medium hover:underline">Browse experts to get started</button>
            </div>
          ) : activeProjects.map((p: any) => (
            <div key={p.id} className="p-4 border border-gray-50 rounded-xl mb-3 hover:border-gray-100 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.freelancerAlias} · Due {new Date(p.endDate).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sm">{cur(p.totalBudget, p.currency)}</div>
                  {p.pendingAmount > 0 && <div className="text-xs text-red-600 font-medium">⚠ {cur(p.pendingAmount, p.currency)} pending</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:`${p.progress}%`}}/></div>
                <span className="text-xs text-gray-500">{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Pending invoices */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Pending payments</h3>
            {pendingInvoices.length === 0 ? <div className="text-xs text-gray-400 py-3 text-center">No pending payments</div> :
              pendingInvoices.slice(0, 3).map((inv: any) => (
                <div key={inv.id} className={`p-3 rounded-xl mb-2 ${inv.status === 'overdue' ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                  <div className="text-xs font-bold text-gray-900">{inv.invoiceNumber}</div>
                  <div className="text-sm font-black mt-0.5">{cur(inv.total, inv.currency)}{inv.applyGst && <span className="text-xs text-amber-700 ml-1">(incl. GST)</span>}</div>
                  <div className={`text-xs mt-0.5 ${inv.status === 'overdue' ? 'text-red-600 font-bold' : 'text-amber-700'}`}>Due: {new Date(inv.dueAt).toLocaleDateString()}</div>
                </div>
              ))
            }
            {pendingInvoices.length > 0 && <button onClick={() => navigate('/client/invoices')} className="w-full mt-2 text-xs text-blue-600 font-medium hover:underline">View all invoices</button>}
          </div>

          {/* Upcoming meetings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Upcoming meetings</h3>
            {upcomingMeetings.length === 0 ? <div className="text-xs text-gray-400 py-3 text-center">No upcoming meetings</div> :
              upcomingMeetings.map((m: any) => (
                <div key={m.id} className="p-3 bg-blue-50 rounded-xl mb-2 text-xs">
                  <div className="font-semibold text-blue-900">{m.freelancerName}</div>
                  <div className="text-blue-700">{new Date(m.scheduledAt).toLocaleString()}</div>
                  {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Join {m.platform}</a>}
                </div>
              ))
            }
          </div>
        </div>
      </div>
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
