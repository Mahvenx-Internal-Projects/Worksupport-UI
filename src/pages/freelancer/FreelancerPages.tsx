import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, Clock, FolderOpen, Star, Check, X, 
  Loader2, Home, ChevronRight, AlertCircle, Plus,
  Calendar, Award, Shield, Zap, Edit2, Save, TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import {
  useMyFreelancerProfile, useMyFreelancerStats, useProjects,
  useTimesheets, useSubmitTimesheet, useSubmitStandup,
  useMeetings, useConfirmMeeting, useUpdateFreelancerProfile, useNotifications,
  useMyApplications,
} from '../../hooks/useApi';

// ── Shared helpers ────────────────────────────────────────────
const currency = (amt: number, cur = 'USD') => (cur === 'INR' ? '₹' : '$') + amt?.toLocaleString();
const badge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_payment: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border-blue-200',
    paused: 'bg-orange-50 text-orange-700 border-orange-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    submitted: 'bg-purple-50 text-purple-700 border-purple-200',
    approved: 'bg-green-50 text-green-700 border-green-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${map[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>{status.replace('_', ' ')}</span>;
};

// ── FREELANCER DASHBOARD ──────────────────────────────────────
export const FreelancerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: stats } = useMyFreelancerStats();
  const { data: profile } = useMyFreelancerProfile();
  const { data: projects = [] } = useProjects();
  const { data: meetings = [] } = useMeetings();
  const { data: notifs = [] } = useNotifications();

  const activeProjects = projects.filter((p: any) => p.status === 'active');
  const upcomingMeetings = meetings.filter((m: any) => m.status === 'upcoming').slice(0, 3);
  const unreadNotifs = (notifs as any[]).filter((n: any) => !n.isRead).slice(0, 5);
  const profileIncomplete = !profile?.currentRole || profile.currentRole === 'Tech Professional';

  return (
    <div className="space-y-6">
      {/* Incomplete profile banner */}
      {profileIncomplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-amber-900 text-sm">Complete your profile to get discovered</div>
            <div className="text-amber-700 text-xs mt-0.5">Add your skills, availability, and hourly rate to appear in Browse Experts and Quick Support.</div>
          </div>
          <button onClick={() => navigate('/freelancer/complete-profile')}
            className="shrink-0 text-xs font-bold px-4 py-2 rounded-xl text-white bg-amber-500 hover:bg-amber-600">
            Complete now →
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This month's earnings", value: currency(stats?.monthlyEarnings ?? 0), icon: <DollarSign size={18}/>, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Pending payout', value: currency(stats?.pendingAmount ?? 0), icon: <Clock size={18}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active projects', value: stats?.activeProjects ?? 0, icon: <FolderOpen size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Trust score', value: `${stats?.trustScore ?? 60}/100`, icon: <Star size={18}/>, color: 'text-purple-600', bg: 'bg-purple-50' },
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
            <button onClick={() => navigate('/freelancer/assignments')} className="text-xs text-blue-600 font-medium hover:underline">View all</button>
          </div>
          {activeProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FolderOpen size={32} className="mx-auto mb-2 opacity-40"/>
              <div>No active projects yet</div>
              <div className="text-xs mt-1">Admin will assign you to projects after client approval</div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeProjects.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:border-gray-100 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.clientName} · {currency(p.hourlyRate, p.currency)}/hr · {new Date(p.endDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full"><div className="h-full bg-blue-500 rounded-full" style={{width:`${p.progress}%`}}/></div>
                      <span className="text-xs text-gray-500">{p.progress}%</span>
                    </div>
                  </div>
                  {p.pendingAmount > 0 && (
                    <div className="text-xs text-red-600 font-bold shrink-0">⚠ {currency(p.pendingAmount, p.currency)}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Upcoming meetings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Upcoming meetings</h3>
            {upcomingMeetings.length === 0 ? (
              <div className="text-xs text-gray-400 py-3 text-center">No upcoming meetings</div>
            ) : (
              <div className="space-y-2">
                {upcomingMeetings.map((m: any) => (
                  <div key={m.id} className="p-3 bg-blue-50 rounded-xl text-xs">
                    <div className="font-semibold text-blue-900">{m.clientName}</div>
                    <div className="text-blue-700">{new Date(m.scheduledAt).toLocaleString()}</div>
                    <div className="text-blue-600">{m.platform} · {currency(m.agreedRate, m.currency)}/hr</div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => navigate('/freelancer/meetings')} className="mt-3 w-full text-xs text-blue-600 font-medium hover:underline">View all meetings</button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-3">Notifications</h3>
            {unreadNotifs.length === 0 ? (
              <div className="text-xs text-gray-400 py-3 text-center">All caught up! ✓</div>
            ) : (
              <div className="space-y-2">
                {unreadNotifs.map((n: any) => (
                  <div key={n.id} className="p-2.5 bg-gray-50 rounded-xl">
                    <div className="text-xs font-semibold text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── ASSIGNMENTS (projects assigned to me) ─────────────────────
export const FreelancerAssignments: React.FC = () => {
  const { data: projects = [], isLoading } = useProjects();

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-sm text-gray-500 mt-0.5">Projects assigned to you by admin</p>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <FolderOpen size={40} className="mx-auto mb-3 text-gray-300"/>
          <div className="font-semibold text-gray-500">No projects assigned yet</div>
          <div className="text-sm text-gray-400 mt-1">Admin will assign you after a client approves a demo meeting</div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-bold text-gray-900 text-lg">{p.name}</span>
                  {badge(p.status)}
                  {p.applyGst && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">GST 18%</span>}
                </div>
                <div className="text-sm text-gray-500">{p.clientName}</div>
              </div>
              <div className="text-right ml-4">
                <div className="font-black text-xl text-gray-900">{currency(p.hourlyRate, p.currency)}/hr</div>
                <div className="text-xs text-gray-400">{p.budgetType} rate</div>
              </div>
            </div>

            {/* Dates & budget */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Start date</div>
                <div className="text-sm font-semibold">{new Date(p.startDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">End date</div>
                <div className="text-sm font-semibold">{new Date(p.endDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Total budget</div>
                <div className="text-sm font-bold text-green-700">{currency(p.totalBudget, p.currency)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Pending amount</div>
                <div className={`text-sm font-bold ${p.pendingAmount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {p.pendingAmount > 0 ? currency(p.pendingAmount, p.currency) : 'Nil'}
                </div>
              </div>
            </div>

            {/* GST breakdown */}
            {p.applyGst && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs">
                <div className="font-semibold text-amber-900 mb-1">💡 GST applies (Indian client)</div>
                <div className="flex gap-4 text-amber-800">
                  <span>Subtotal: {currency(p.totalBudget, p.currency)}</span>
                  <span>GST 18%: {currency(p.totalBudget * 0.18, p.currency)}</span>
                  <span className="font-bold">Total: {currency(p.totalBudget * 1.18, p.currency)}</span>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-bold text-gray-700">{p.progress}% · {p.loggedHours}h / {p.estimatedHours}h</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" 
                  style={{ width: `${p.progress}%`, background: p.status === 'completed' ? '#16a34a' : p.status === 'paused' ? '#f59e0b' : '#3b5bdb' }}/>
              </div>
            </div>

            {/* Description */}
            {p.description && <p className="text-sm text-gray-600 mb-4">{p.description}</p>}

            {/* Skills */}
            {p.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.skills.map((s: string) => <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">{s}</span>)}
              </div>
            )}

            {/* Milestones */}
            {p.milestones?.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-700 mb-2">Milestones</div>
                <div className="space-y-1.5">
                  {p.milestones.map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${m.status === 'completed' ? 'bg-green-500 text-white' : 'border-2 border-gray-200'}`}>
                        {m.status === 'completed' && <Check size={10}/>}
                      </div>
                      <span className={m.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-700'}>{m.title}</span>
                      <span className="text-gray-400 ml-auto">{currency(m.amount, p.currency)} · {new Date(m.dueDate).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending payment alert */}
            {p.status === 'pending_payment' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5"/>
                <div>
                  <strong>Waiting for client payment.</strong> Project will activate once client pays {currency(p.totalBudget, p.currency)}.
                  {p.bufferDays && parseInt(p.bufferDays) > 0 ? ` Buffer: ${p.bufferDays} days after payment.` : ''}
                </div>
              </div>
            )}

            {/* Status logs */}
            {p.statusLogs?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="text-xs text-gray-400 font-medium mb-2">Status history</div>
                <div className="space-y-1">
                  {p.statusLogs.slice(-4).map((l: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="text-gray-300">{new Date(l.changedAt).toLocaleDateString()}</span>
                      <span>{l.oldStatus} → <span className="font-medium text-gray-600">{l.newStatus}</span></span>
                      {l.reason && <span className="text-gray-400">({l.reason})</span>}
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

// ── TIMESHEETS ────────────────────────────────────────────────
export const FreelancerTimesheets: React.FC = () => {
  const { data: timesheets = [], isLoading } = useTimesheets();
  const { data: projects = [] } = useProjects();
  const submitTs = useSubmitTimesheet();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ projectId: '', weekStart: '', weekEnd: '', entries: [{ date: '', hours: '', description: '', taskType: 'development' }] });

  const activeProjects = projects.filter((p: any) => p.status === 'active');
  const addEntry = () => setForm(f => ({ ...f, entries: [...f.entries, { date: '', hours: '', description: '', taskType: 'development' }] }));
  const updateEntry = (i: number, k: string, v: string) => setForm(f => ({ ...f, entries: f.entries.map((e, idx) => idx === i ? { ...e, [k]: v } : e) }));

  const handleSubmit = async () => {
    if (!form.projectId || !form.weekStart) { toast.error('Select project and week start date'); return; }
    const entries = form.entries.filter(e => e.hours && e.description).map(e => ({ date: new Date(e.date || form.weekStart).toISOString(), hours: parseFloat(e.hours), description: e.description, taskType: e.taskType }));
    if (!entries.length) { toast.error('Add at least one entry'); return; }
    const weekEnd = new Date(form.weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
    await submitTs.mutateAsync({ projectId: form.projectId, weekStart: new Date(form.weekStart).toISOString(), weekEnd: weekEnd.toISOString(), entries });
    setShowForm(false);
    setForm({ projectId: '', weekStart: '', weekEnd: '', entries: [{ date: '', hours: '', description: '', taskType: 'development' }] });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Timesheets</h1><p className="text-sm text-gray-500">Submit weekly hours for billing</p></div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
          <Plus size={15}/> Submit timesheet
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">New Timesheet</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Project *</label>
              <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select active project...</option>
                {activeProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name} — {p.clientName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Week start date *</label>
              <input type="date" value={form.weekStart} onChange={e => setForm({...form, weekStart: e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Daily entries</div>
            {form.entries.map((e, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <input type="date" value={e.date} onChange={ev => updateEntry(i, 'date', ev.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"/>
                <input type="number" step="0.5" value={e.hours} onChange={ev => updateEntry(i, 'hours', ev.target.value)} placeholder="Hours" className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"/>
                <input value={e.description} onChange={ev => updateEntry(i, 'description', ev.target.value)} placeholder="Task description" className="col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none"/>
                <select value={e.taskType} onChange={ev => updateEntry(i, 'taskType', ev.target.value)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none bg-white">
                  <option value="development">Development</option>
                  <option value="meeting">Meeting</option>
                  <option value="review">Code Review</option>
                  <option value="support">Support</option>
                </select>
              </div>
            ))}
            <button onClick={addEntry} className="text-xs text-blue-600 font-medium hover:underline">+ Add row</button>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={submitTs.isPending} className="flex items-center gap-2 px-6 py-2 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
              {submitTs.isPending ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Submit for approval
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {timesheets.map((ts: any) => (
          <div key={ts.id} className="bg-white border border-gray-100 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-bold text-gray-900">{ts.projectName}</div>
                <div className="text-xs text-gray-500">Week: {new Date(ts.weekStart).toLocaleDateString()} — {new Date(ts.weekEnd).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">{badge(ts.status)}<span className="font-black text-gray-900">${ts.totalAmount?.toLocaleString()}</span></div>
            </div>
            <div className="text-xs text-gray-500 mb-3">{ts.totalHours}h total · Submitted {ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : '—'}</div>
            {ts.entries?.length > 0 && (
              <div className="border-t border-gray-50 pt-3 space-y-1">
                {ts.entries.map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="w-20 shrink-0 text-gray-400">{new Date(e.date).toLocaleDateString()}</span>
                    <span className="w-12 shrink-0 font-medium">{e.hours}h</span>
                    <span className="flex-1">{e.description}</span>
                    <span className="text-gray-400">{e.taskType}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {timesheets.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No timesheets submitted yet</div>}
      </div>
    </div>
  );
};

// ── MEETINGS (freelancer view + confirm/decline) ───────────────
export const FreelancerMeetings: React.FC = () => {
  const { data: meetings = [], isLoading } = useMeetings();
  const confirm = useConfirmMeeting();
  const [declineReason, setDeclineReason] = useState('');
  const [decliningId, setDecliningId] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-500" size={24}/></div>;

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Meetings</h1><p className="text-sm text-gray-500">Confirm or decline meeting requests</p></div>
      {meetings.map((m: any) => (
        <div key={m.id} className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="font-bold text-gray-900">{m.clientName}</div>
              <div className="text-xs text-gray-500">{m.sessionType?.replace('_',' ')} · {m.platform}</div>
            </div>
            <div className="flex items-center gap-2">{badge(m.status)}{badge(m.freelancerConfirmed ? 'approved' : 'pending')}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-3 text-xs">
            <div><span className="text-gray-400">Date</span><br/><span className="font-semibold">{new Date(m.scheduledAt).toLocaleString()}</span></div>
            <div><span className="text-gray-400">Rate</span><br/><span className="font-semibold">${m.agreedRate}/hr ({m.budgetType})</span></div>
            <div><span className="text-gray-400">Duration</span><br/><span className="font-semibold">{m.durationMinutes} min</span></div>
          </div>
          {m.meetingLink && <a href={m.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium block mb-3">🔗 Join {m.platform} meeting</a>}
          {/* Confirm/decline buttons for upcoming unconfirmed meetings */}
          {m.status === 'upcoming' && !m.freelancerConfirmed && (
            <div className="border-t border-gray-50 pt-3 space-y-2">
              {decliningId === m.id ? (
                <div className="space-y-2">
                  <input value={declineReason} onChange={e => setDeclineReason(e.target.value)} placeholder="Reason for declining (required)..." className="w-full px-3 py-2 border border-red-200 rounded-xl text-sm focus:outline-none"/>
                  <div className="flex gap-2">
                    <button onClick={() => setDecliningId(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm">Cancel</button>
                    <button onClick={() => { confirm.mutate({ id: m.id, data: { confirmed: false, declineReason } }); setDecliningId(null); setDeclineReason(''); }}
                      className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-bold hover:bg-red-600">Confirm decline</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setDecliningId(m.id)} className="flex-1 border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-1">
                    <X size={14}/> Decline
                  </button>
                  <button onClick={() => confirm.mutate({ id: m.id, data: { confirmed: true } })} disabled={confirm.isPending}
                    className="flex-1 bg-green-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 flex items-center justify-center gap-1">
                    <Check size={14}/> Confirm availability
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {meetings.length === 0 && <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">No meetings yet</div>}
    </div>
  );
};

// ── EARNINGS ──────────────────────────────────────────────────
export const FreelancerEarnings: React.FC = () => {
  const { data: stats } = useMyFreelancerStats();
  const { data: profile } = useMyFreelancerProfile();
  const updateProfile = useUpdateFreelancerProfile();
  const [editBank, setEditBank] = useState(false);
  const [bank, setBank] = useState({ bankAccountName: '', bankAccountNumber: '', bankIfscCode: '', bankName: '', upiId: '' });

  const saveBankDetails = async () => {
    await updateProfile.mutateAsync({ ...bank });
    setEditBank(false);
    toast.success('Bank details saved! Admin will use these for payouts.');
  };

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Earnings</h1><p className="text-sm text-gray-500">Track your income and payouts</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'This month', value: `$${stats?.monthlyEarnings?.toLocaleString() ?? 0}`, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Total earned', value: `$${stats?.allTimeEarned?.toLocaleString() ?? 0}`, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Cleared', value: `$${stats?.clearedAmount?.toLocaleString() ?? 0}`, color: 'text-gray-700', bg: 'bg-gray-50' },
          { label: 'Pending payout', value: `$${stats?.pendingAmount?.toLocaleString() ?? 0}`, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-gray-100`}>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bank details */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-900">Bank details for payouts</h3>
            <p className="text-xs text-gray-500 mt-0.5">Admin uses this to transfer your earnings. Keep it updated.</p>
          </div>
          <button onClick={() => { setEditBank(!editBank); setBank({ bankAccountName: profile?.bankAccountName||'', bankAccountNumber: profile?.bankAccountNumber||'', bankIfscCode: profile?.bankIfscCode||'', bankName: profile?.bankName||'', upiId: profile?.upiId||'' }); }}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
            <Edit2 size={14}/> {editBank ? 'Cancel' : 'Edit details'}
          </button>
        </div>
        {editBank ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'bankAccountName', label: 'Account holder name', placeholder: 'Full name as in bank' },
              { key: 'bankName', label: 'Bank name', placeholder: 'e.g. HDFC Bank' },
              { key: 'bankAccountNumber', label: 'Account number', placeholder: '1234567890' },
              { key: 'bankIfscCode', label: 'IFSC code', placeholder: 'HDFC0001234' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                <input value={(bank as any)[f.key]} onChange={e => setBank(b => ({...b, [f.key]: e.target.value}))} placeholder={f.placeholder} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">UPI ID (for fast transfers)</label>
              <input value={bank.upiId} onChange={e => setBank(b => ({...b, upiId: e.target.value}))} placeholder="yourname@upi" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="col-span-2 flex gap-3">
              <button onClick={() => setEditBank(false)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm">Cancel</button>
              <button onClick={saveBankDetails} disabled={updateProfile.isPending} className="flex items-center gap-2 px-6 py-2 text-white rounded-xl text-sm font-bold hover:opacity-90" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
                <Save size={14}/> Save bank details
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Account holder', value: profile?.bankAccountName },
              { label: 'Bank', value: profile?.bankName },
              { label: 'Account number', value: profile?.bankAccountNumber ? `****${profile.bankAccountNumber.slice(-4)}` : null },
              { label: 'IFSC code', value: profile?.bankIfscCode },
              { label: 'UPI ID', value: profile?.upiId },
            ].map(f => (
              <div key={f.label} className="p-3 bg-gray-50 rounded-xl">
                <div className="text-xs text-gray-500">{f.label}</div>
                <div className="text-sm font-semibold text-gray-900">{f.value || <span className="text-gray-300 font-normal">Not set</span>}</div>
              </div>
            ))}
          </div>
        )}
        {!editBank && !profile?.bankAccountNumber && (
          <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800">
            ⚠️ <strong>Add your bank details</strong> so admin can process payouts to your account.
          </div>
        )}
      </div>
    </div>
  );
};

// ── PROFILE ───────────────────────────────────────────────────
export const FreelancerProfile: React.FC = () => {
  const navigate = useNavigate();
  const { data: profile } = useMyFreelancerProfile();
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <button onClick={() => navigate('/freelancer/complete-profile')} className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
          <Edit2 size={14}/> Edit profile
        </button>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
            {profile?.aliasName?.split(' ').map((w: string) => w[0]).join('').slice(0,2) || '?'}
          </div>
          <div>
            <div className="font-black text-gray-900 text-xl">{profile?.aliasName || 'Your alias'}</div>
            <div className="text-gray-500">{profile?.currentRole || 'Tech Professional'}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-medium">Alias (shown to clients)</span>
              <Shield size={12} className="text-green-500"/>
              <span className="text-xs text-green-600">Real name private</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Real name 🔒', value: profile?.realName, private: true },
            { label: 'Company 🔒', value: profile?.currentCompany, private: true },
            { label: 'All-time earned', value: `$${profile?.totalEarned?.toLocaleString() ?? 0}` },
            { label: 'Projects done', value: profile?.completedProjects ?? 0 },
            { label: 'Trust score', value: `${profile?.trustScore ?? 0}/100` },
            { label: 'Profile views', value: profile?.profileViews ?? 0 },
          ].map(f => (
            <div key={f.label} className={`p-3 rounded-xl ${f.private ? 'bg-red-50 border border-red-100' : 'bg-gray-50'}`}>
              <div className="text-xs text-gray-500">{f.label}</div>
              <div className="text-sm font-semibold text-gray-900">{f.value || '—'}</div>
              {f.private && <div className="text-xs text-red-500 mt-0.5">Not visible to clients</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── STANDUPS ──────────────────────────────────────────────────
export const FreelancerStandups: React.FC = () => {
  const { data: projects = [] } = useProjects();
  const submitStandup = useSubmitStandup();
  const [form, setForm] = useState({ projectId: '', date: new Date().toISOString().split('T')[0], yesterdayWork: '', todayPlan: '', blockers: 'None', hoursWorked: '' });

  const handleSubmit = async () => {
    if (!form.projectId || !form.yesterdayWork || !form.todayPlan) { toast.error('Fill all fields'); return; }
    await submitStandup.mutateAsync({ projectId: form.projectId, date: new Date(form.date).toISOString(), yesterdayWork: form.yesterdayWork, todayPlan: form.todayPlan, blockers: form.blockers, hoursWorked: parseFloat(form.hoursWorked || '0') });
    setForm(f => ({ ...f, yesterdayWork: '', todayPlan: '', blockers: 'None', hoursWorked: '' }));
  };

  const activeProjects = projects.filter((p: any) => p.status === 'active');
  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold text-gray-900">Daily Standup</h1><p className="text-sm text-gray-500">Log your daily progress</p></div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Project *</label>
            <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})} className={inp + " bg-white"}>
              <option value="">Select project...</option>
              {activeProjects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Date</label>
            <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className={inp}/>
          </div>
        </div>
        <div className="space-y-4 mb-4">
          {[
            { key: 'yesterdayWork', label: "Yesterday's work *", ph: "What did you complete yesterday?" },
            { key: 'todayPlan', label: "Today's plan *", ph: "What will you work on today?" },
            { key: 'blockers', label: 'Blockers', ph: 'None' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
              <textarea rows={2} value={(form as any)[f.key]} onChange={e => setForm({...form, [f.key]: e.target.value})} placeholder={f.ph} className={inp + " resize-none"}/>
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Hours worked today</label>
            <input type="number" step="0.5" value={form.hoursWorked} onChange={e => setForm({...form, hoursWorked: e.target.value})} placeholder="4.5" className={inp}/>
          </div>
        </div>
        <button onClick={handleSubmit} disabled={submitStandup.isPending} className="flex items-center gap-2 px-6 py-3 text-white rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50" style={{background:'linear-gradient(135deg,#1a1a2e,#16213e)'}}>
          {submitStandup.isPending ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>} Submit standup
        </button>
      </div>
    </div>
  );
};

// ── MY JOB APPLICATIONS ──────────────────────────────────────
export const FreelancerApplications: React.FC = () => {
  const { data: apps = [], isLoading } = useMyApplications();
  const appArr = Array.isArray(apps) ? apps : [];

  const STATUS_CFG: Record<string, { color: string; bg: string; label: string; icon: string; step: number }> = {
    pending:     { color:'#d97706', bg:'#fffbeb', label:'Submitted',        icon:'📝', step:1 },
    reviewed:    { color:'#3b82f6', bg:'#eff6ff', label:'Under Review',     icon:'👁️', step:2 },
    shortlisted: { color:'#7c3aed', bg:'#f5f3ff', label:'Shortlisted',      icon:'⭐', step:3 },
    assigned:    { color:'#059669', bg:'#ecfdf5', label:'Assigned to You',  icon:'✅', step:4 },
    completed:   { color:'#16a34a', bg:'#f0fdf4', label:'Completed',        icon:'🎉', step:5 },
    rejected:    { color:'#dc2626', bg:'#fef2f2', label:'Not Selected',     icon:'❌', step:0 },
  };

  const demoApps = [
    { id:'d1', requirementTitle:'React Developer Needed', company:'Obsio Solutions', status:'shortlisted', appliedAt:new Date(Date.now()-86400000).toISOString(), type:'Hourly', rate:'₹500–₹800/hr', adminNote:'Your profile matches well. Admin will contact you to confirm session slot.' },
    { id:'d2', requirementTitle:'DevOps Engineer — AWS Setup', company:'TechCorp India', status:'pending', appliedAt:new Date(Date.now()-7200000).toISOString(), type:'Day', rate:'₹4,000/day', adminNote:'' },
    { id:'d3', requirementTitle:'Python Backend Developer', company:'StartupXYZ', status:'assigned', appliedAt:new Date(Date.now()-604800000).toISOString(), type:'Monthly', rate:'₹2,000/hr', adminNote:'You have been assigned! Session scheduled for Friday 7 PM IST. Check your WhatsApp.' },
  ];

  const display = appArr.length > 0 ? appArr : demoApps;
  const STEPS = ['Submitted','Reviewed','Shortlisted','Assigned','Completed'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-black text-xl text-gray-900">My Job Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your requirement applications and assignment status</p>
        </div>
      </div>

      {appArr.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-sm text-blue-800">
          <AlertCircle size={17} className="text-blue-500 shrink-0 mt-0.5"/>
          <div><strong>Preview mode</strong> — showing sample data. Apply to jobs from the <a href="/" className="underline font-bold">homepage job board</a> to see real applications here.</div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Loading applications…</div>
      ) : display.map((app: any) => {
        const cfg = STATUS_CFG[app.status] || STATUS_CFG.pending;
        const stepNum = cfg.step;
        return (
          <div key={app.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background:cfg.bg }}>
                {cfg.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
                  <div>
                    <div className="font-black text-gray-900 text-sm">{app.requirementTitle}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {app.company} · Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : 'recently'}
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.color}30` }}>
                    {cfg.label}
                  </span>
                </div>

                <div className="flex gap-4 text-xs text-gray-500 mb-3 mt-2 flex-wrap">
                  <span>⚡ {app.type}</span>
                  <span className="font-bold text-green-700">💰 {app.rate}</span>
                </div>

                {app.adminNote && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-xs text-blue-800 mb-3">
                    <strong>📩 Admin:</strong> {app.adminNote}
                  </div>
                )}

                {/* Timeline */}
                {app.status !== 'rejected' && (
                  <div className="flex items-center mt-3">
                    {STEPS.map((s, i) => {
                      const done = stepNum > i+1, active = stepNum === i+1;
                      return (
                        <React.Fragment key={s}>
                          <div className="flex flex-col items-center gap-1 flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${done?'bg-green-500 text-white':active?'bg-blue-600 text-white':'bg-gray-100 text-gray-400'}`}
                              style={active?{boxShadow:'0 0 0 3px rgba(37,99,235,0.2)'}:{}}>
                              {done ? '✓' : i+1}
                            </div>
                            <div className="text-center leading-tight" style={{ fontSize:8, maxWidth:44, whiteSpace:'nowrap', color:active?'#2563eb':done?'#16a34a':'#9ca3af', fontWeight:active||done?700:400 }}>{s}</div>
                          </div>
                          {i < STEPS.length-1 && (
                            <div className={`h-0.5 flex-1 mx-1 mb-3 transition-all ${done?'bg-green-400':'bg-gray-100'}`}/>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {app.status === 'rejected' && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-2">
                    ❌ Not selected for this requirement. Keep applying — new jobs are posted daily!
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <div className="font-black text-gray-900 text-sm mb-1">New requirements posted daily</div>
          <div className="text-xs text-gray-500">Visit the homepage job board to browse and apply for new IT requirements from verified businesses.</div>
        </div>
        <a href="/#jobs" className="text-xs font-bold px-4 py-2.5 rounded-xl text-white flex-shrink-0" style={{ background:'linear-gradient(135deg,#1e3a5f,#3b82f6)' }}>
          Browse Jobs →
        </a>
      </div>
    </div>
  );
};
