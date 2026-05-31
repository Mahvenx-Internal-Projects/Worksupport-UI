import React, { useState } from 'react';
import { Search, Phone, Calendar, Clock, DollarSign, Loader2, X, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge, SectionCard, Tabs, Modal } from '../../components/common';
import { useRequests, useUpdateRequestStatus, useScheduleMeeting } from '../../hooks/useApi';

const AdminRequests: React.FC = () => {
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState<any>(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [search, setSearch] = useState('');

  // Schedule form
  const [platform, setPlatform] = useState('zoom');
  const [agreedRate, setAgreedRate] = useState('');
  const [budgetType, setBudgetType] = useState('hourly');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [rejectNote, setRejectNote] = useState('');

  const { data: requests = [], isLoading } = useRequests(tab === 'all' ? undefined : tab);
  const updateStatus = useUpdateRequestStatus();
  const scheduleMeeting = useScheduleMeeting();

  const filtered = requests.filter((r: any) =>
    search === '' ||
    r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    r.freelancerName?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'pending', label: 'Pending', count: requests.filter((r: any) => r.status === 'pending').length },
    { id: 'scheduled', label: 'Scheduled', count: requests.filter((r: any) => r.status === 'scheduled').length },
    { id: 'approved', label: 'Approved', count: requests.filter((r: any) => r.status === 'approved').length },
    { id: 'all', label: 'All', count: requests.length },
  ];

  const handleSchedule = async () => {
    if (!scheduledDate || !meetingLink) { toast.error('Fill meeting link and date'); return; }
    if (!agreedRate) { toast.error('Enter agreed rate'); return; }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00Z`).toISOString();
    await scheduleMeeting.mutateAsync({
      requestId: selected.id,
      scheduledAt, durationMinutes: selected.durationMinutes || 45,
      platform, meetingLink,
      agreedRate: parseFloat(agreedRate),
      budgetType, currency: selected.currency || 'USD',
    });
    setScheduleModal(false); setSelected(null);
    setMeetingLink(''); setAgreedRate(''); setScheduledDate('');
  };

  const handleReject = async () => {
    await updateStatus.mutateAsync({ id: rejectModal.id, data: { status: 'rejected', adminNotes: rejectNote } });
    setRejectModal(null); setRejectNote('');
  };

  const inp = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const lbl = "text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5";

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Demo & Interview Requests</h1>
        <p className="text-sm text-gray-500 mt-0.5">Schedule meetings within 4 hours · Admin calls freelancer to confirm availability first</p>
      </div>

      {/* Info box about mobile */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <Phone size={18} className="text-blue-600 shrink-0 mt-0.5"/>
        <div className="text-sm text-blue-800">
          <strong>Availability check process:</strong> Before scheduling, call the freelancer on their mobile number to confirm they're available at the proposed time.
          If unavailable, propose an alternate time or pick a different expert. Only then send meeting invites.
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab}/>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or freelancer…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
      </div>

      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-indigo-500" size={24}/></div> : (
          <div className="space-y-3">
            {filtered.map((r: any) => (
              <div key={r.id} className="border border-gray-100 rounded-2xl p-5 hover:border-indigo-100 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900">{r.sessionType?.replace('_', ' ')} request</span>
                      <StatusBadge status={r.status}/>
                      {r.budgetType && <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">{r.budgetType}</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Client</div>
                        <div className="font-semibold text-gray-900">{r.clientName}</div>
                        {r.clientMobile && (
                          <a href={`tel:+91${r.clientMobile}`} className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-900 mt-0.5">
                            <Phone size={11}/> +91-{r.clientMobile}
                          </a>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Freelancer (alias)</div>
                        <div className="font-semibold text-gray-900">{r.freelancerName}</div>
                        {r.freelancerMobile && (
                          <a href={`tel:+91${r.freelancerMobile}`} className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 mt-0.5">
                            <Phone size={11}/> +91-{r.freelancerMobile} <span className="text-gray-400">(call to confirm availability)</span>
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-gray-500">
                      <div><span className="font-medium text-gray-700">Budget:</span> {r.currency} {r.budgetMin}–{r.budgetMax} ({r.budgetType})</div>
                      <div><span className="font-medium text-gray-700">Preferred:</span> {r.preferredDateTime ? new Date(r.preferredDateTime).toLocaleDateString() : '—'}</div>
                      <div><span className="font-medium text-gray-700">Duration:</span> {r.durationMinutes} min</div>
                    </div>
                    {r.description && <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 line-clamp-2">{r.description}</div>}
                    {r.adminNotes && <div className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2"><strong>Admin note:</strong> {r.adminNotes}</div>}
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => { setSelected(r); setAgreedRate(r.budgetMin?.toString() || ''); setBudgetType(r.budgetType || 'hourly'); setScheduleModal(true); }}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold whitespace-nowrap">
                        <Calendar size={14}/> Schedule meeting
                      </button>
                      <button onClick={() => setRejectModal(r)}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-sm font-bold">
                        <X size={14}/> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-gray-400">No requests found</div>}
          </div>
        )}
      </SectionCard>

      {/* ── SCHEDULE MEETING MODAL ── */}
      {scheduleModal && selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-start justify-center p-4 pt-10">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <div className="font-black text-gray-900">Schedule Meeting</div>
                <div className="text-xs text-gray-500">{selected.clientName} ↔ {selected.freelancerName}</div>
              </div>
              <button onClick={() => { setScheduleModal(false); setSelected(null); }} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Availability check reminder */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5"/>
                <div className="text-xs text-amber-800">
                  <strong>Before scheduling:</strong> Call freelancer <strong>+91-{selected.freelancerMobile || 'N/A'}</strong> to confirm availability at the proposed time.
                  If unavailable, adjust the date/time below.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className={lbl}>Date *</label><input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className={inp}/></div>
                <div><label className={lbl}>Time (UTC)</label><input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className={inp}/></div>
              </div>

              <div><label className={lbl}>Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {[['zoom','Zoom'],['meet','Google Meet'],['teams','MS Teams']].map(([v,l]) => (
                    <button key={v} type="button" onClick={() => setPlatform(v)} className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${platform === v ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{l}</button>
                  ))}
                </div>
              </div>

              <div><label className={lbl}>Meeting link *</label><input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." className={inp}/></div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Budget type</label>
                  <select value={budgetType} onChange={e => setBudgetType(e.target.value)} className={inp + " bg-white"}>
                    <option value="hourly">Hourly rate</option>
                    <option value="fixed">Fixed price</option>
                  </select>
                </div>
                <div>
                  <label className={lbl}>Agreed rate ({selected.currency || 'USD'}) *</label>
                  <input type="number" value={agreedRate} onChange={e => setAgreedRate(e.target.value)}
                    placeholder={budgetType === 'hourly' ? 'e.g. 35 per hr' : 'e.g. 5000 fixed'} className={inp}/>
                </div>
              </div>

              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                📧 Two emails will be sent automatically: (1) Availability check to <strong>{selected.freelancerName}</strong> with mobile {selected.freelancerMobile || 'N/A'}, (2) Meeting invite to <strong>{selected.clientName}</strong>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => { setScheduleModal(false); setSelected(null); }} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleSchedule} disabled={scheduleMeeting.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                  {scheduleMeeting.isPending ? <><Loader2 size={15} className="animate-spin"/>Scheduling…</> : <><Calendar size={15}/> Send meeting invites</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-gray-900 mb-3">Reject request</h3>
            <div className="text-sm text-gray-500 mb-3">Rejecting request from <strong>{rejectModal.clientName}</strong> for <strong>{rejectModal.freelancerName}</strong></div>
            <div><label className={lbl}>Reason / note for client</label><textarea rows={3} value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Why is this being rejected? (shown to client)" className={inp + " resize-none"}/></div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-sm">Cancel</button>
              <button onClick={handleReject} disabled={updateStatus.isPending} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl font-bold text-sm disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
