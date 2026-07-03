import React, { useState } from 'react';
import { Search, Loader2, X, Check, Send, Mail, MessageSquare,
         ChevronRight, Clock, DollarSign, User, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatusBadge, SectionCard, Tabs, Modal, Avatar } from '../../components/common';
import { useRequests, useUpdateRequestStatus, useScheduleMeeting } from '../../hooks/useApi';
import { api } from '../../services/api';

// ── Interest Status badge ───────────────────────────────────
const InterestBadge = ({ status }: { status: string }) => {
  const map: Record<string,{bg:string;txt:string;label:string}> = {
    none:                {bg:'#f1f5f9',txt:'#64748b',label:'No interest'},
    client_interested:   {bg:'#fef3c7',txt:'#d97706',label:'🔥 Client interested'},
    freelancer_notified: {bg:'#dbeafe',txt:'#1d4ed8',label:'📧 Freelancer notified'},
    freelancer_accepted: {bg:'#dcfce7',txt:'#16a34a',label:'✅ Freelancer accepted'},
    freelancer_declined: {bg:'#fee2e2',txt:'#dc2626',label:'❌ Freelancer declined'},
    scheduled:           {bg:'#f0fdf4',txt:'#15803d',label:'📅 Meeting scheduled'},
  };
  const s = map[status] || map.none;
  return <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:8,background:s.bg,color:s.txt}}>{s.label}</span>;
};

const AdminRequests: React.FC = () => {
  const [tab, setTab] = useState('pending');
  const [selected, setSelected] = useState<any>(null);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [notifyModal, setNotifyModal] = useState<any>(null);
  const [notifyNote, setNotifyNote] = useState('');
  const [notifying, setNotifying] = useState(false);
  // Conversation panel
  const [convoRequest, setConvoRequest] = useState<any>(null);

  // Schedule form
  const [platform, setPlatform] = useState('zoom');
  const [agreedRate, setAgreedRate] = useState('');
  const [budgetType, setBudgetType] = useState('hourly');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [rejectNote, setRejectNote] = useState('');

  const { data: requests = [], isLoading, refetch } = useRequests(tab === 'all' ? undefined : tab);
  const updateStatus = useUpdateRequestStatus();
  const scheduleMeeting = useScheduleMeeting();

  const interested = (requests as any[]).filter((r: any) => r.clientInterested);

  const filtered = (requests as any[]).filter((r: any) =>
    search === '' ||
    r.clientName?.toLowerCase().includes(search.toLowerCase()) ||
    (r.freelancerName || r.freelancerAliasName)?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'pending',    label: 'Pending',       count: (requests as any[]).filter((r:any) => r.status === 'pending').length },
    { id: 'scheduled',  label: 'Scheduled',      count: (requests as any[]).filter((r:any) => r.status === 'scheduled').length },
    { id: 'approved',   label: 'Approved',       count: (requests as any[]).filter((r:any) => r.status === 'approved').length },
    { id: 'interested', label: '🔥 Interested',  count: interested.length },
    { id: 'all',        label: 'All',            count: (requests as any[]).length },
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
    setScheduleModal(false);
    toast.success('Meeting scheduled! Invites sent to both parties.');
  };

  const handleNotifyFreelancer = async () => {
    if (!notifyModal) return;
    setNotifying(true);
    try {
      await api.post(`/requests/${notifyModal.id}/notify-freelancer`, { adminNotes: notifyNote });
      toast.success(`✅ ${notifyModal.freelancerAliasName || notifyModal.freelancerName} notified via email + app!`, { duration: 5000 });
      setNotifyModal(null); setNotifyNote('');
      refetch();
    } catch {
      toast.error('Failed to notify freelancer');
    } finally { setNotifying(false); }
  };

  const cur = (r: any) => r.currency === 'INR' ? '₹' : '$';

  // ── INTERESTED TAB ─────────────────────────────────────────
  if (tab === 'interested') {
    return (
      <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
        <style>{`*{box-sizing:border-box} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Interested Requests</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Clients who expressed interest + set a budget — contact them and notify the freelancer</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '7px 14px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: tab === t.id ? '#0f172a' : '#f8fafc', color: tab === t.id ? '#fff' : '#64748b', transition: 'all .15s' }}>
                {t.label} {t.count > 0 ? `(${t.count})` : ''}
              </button>
            ))}
          </div>
        </div>

        {interested.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>No interested requests yet</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>When clients express interest in a freelancer from the homepage, they'll appear here.</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: convoRequest ? '1fr 420px' : '1fr', gap: 20 }}>
            {/* Left: list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {interested.map((r: any) => (
                <div key={r.id} style={{ background: '#fff', border: `2px solid ${convoRequest?.id === r.id ? '#6366f1' : '#f1f5f9'}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: 'fadeIn .3s ease', cursor: 'pointer', transition: 'all .2s' }}
                  onClick={() => setConvoRequest(r)}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc', background: r.interestStatus === 'client_interested' ? '#fffbeb' : '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 15 }}>
                        {(r.clientName || r.clientCompany || '?')[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{r.clientName || r.clientCompany}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{r.clientEmail || 'Client'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <InterestBadge status={r.interestStatus || 'client_interested'}/>
                      {r.clientInterestedAt && <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(r.clientInterestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
                      {/* Client side */}
                      <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: '0.06em', marginBottom: 8 }}>👤 CLIENT WANTS</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                          {cur(r)}{r.clientOfferedBudget?.toLocaleString()} <span style={{ fontSize: 11, fontWeight: 400, color: '#64748b' }}>({r.clientBudgetType})</span>
                        </div>
                        {r.clientMessage && <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.clientMessage}"</div>}
                      </div>
                      {/* Freelancer side */}
                      <div style={{ background: '#f0fdf4', borderRadius: 14, padding: '14px' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#059669', letterSpacing: '0.06em', marginBottom: 8 }}>🧑‍💻 EXPERT PROFILE</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{r.freelancerAliasName || r.freelancerName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>
                          Original rate: {cur(r)}{r.budgetMin}–{cur(r)}{r.budgetMax} ({r.budgetType})
                        </div>
                        {r.interestStatus === 'freelancer_notified' && (
                          <div style={{ fontSize: 11, marginTop: 6, color: '#1d4ed8', fontWeight: 700 }}>📧 Notified — awaiting response</div>
                        )}
                      </div>
                    </div>

                    {/* Original request description */}
                    {r.description && <div style={{ fontSize: 12, color: '#64748b', background: '#f8fafc', borderRadius: 10, padding: '8px 12px', marginBottom: 14, lineHeight: 1.65 }}>📋 {r.description.slice(0, 180)}{r.description.length > 180 ? '…' : ''}</div>}

                    {/* Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); setConvoRequest(r); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#eff6ff', border: '1.5px solid #bfdbfe', fontSize: 12, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>
                        <MessageSquare size={13}/> View conversation
                      </button>
                      {r.interestStatus !== 'freelancer_notified' && r.interestStatus !== 'scheduled' && (
                        <button onClick={e => { e.stopPropagation(); setNotifyModal(r); setNotifyNote(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#faf5ff', border: '1.5px solid #ddd6fe', fontSize: 12, fontWeight: 700, color: '#7c3aed', cursor: 'pointer' }}>
                          <Send size={13}/> Notify freelancer
                        </button>
                      )}
                      <button onClick={e => { e.stopPropagation(); setSelected(r); setAgreedRate(String(r.clientOfferedBudget || r.budgetMin || '')); setBudgetType(r.clientBudgetType || r.budgetType); setScheduleModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#f0fdf4', border: '1.5px solid #86efac', fontSize: 12, fontWeight: 700, color: '#15803d', cursor: 'pointer' }}>
                        📅 Schedule meeting
                      </button>
                      <button onClick={async e => {
                        e.stopPropagation();
                        if (!window.confirm(`Contact ${r.clientName} at ${r.clientEmail}?`)) return;
                        window.open(`mailto:${r.clientEmail}?subject=Your interest in WorkSupport360 Expert&body=Hi ${r.clientName},%0A%0AThank you for your interest in ${r.freelancerAliasName}!%0A%0AWe have reviewed your budget of ${cur(r)}${r.clientOfferedBudget} (${r.clientBudgetType}) and would like to schedule a consultation.%0A%0APlease let us know your availability.%0A%0ABest regards,%0AWorkSupport360 Team`);
                      }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                        <Mail size={13}/> Email client
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: conversation panel */}
            {convoRequest && (
              <div style={{ position: 'sticky', top: 80, height: 'fit-content', background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
                {/* Header */}
                <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fafafa' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Conversation thread</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{convoRequest.clientName} ↔ {convoRequest.freelancerAliasName}</div>
                  </div>
                  <button onClick={() => setConvoRequest(null)} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={13}/></button>
                </div>

                {/* Conversation timeline */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 500, overflowY: 'auto' }}>
                  {/* Step 1: Request created */}
                  <ConvoMessage
                    from="Client"
                    avatar={convoRequest.clientName?.[0] || 'C'}
                    color="#6366f1"
                    time={convoRequest.createdAt}
                    label="Submitted request"
                    message={convoRequest.description || 'Requested a demo/consultation session'}
                    meta={`Budget: ${cur(convoRequest)}${convoRequest.budgetMin}–${convoRequest.budgetMax} (${convoRequest.budgetType})`}
                  />

                  {/* Step 2: Client expressed interest */}
                  {convoRequest.clientInterested && (
                    <ConvoMessage
                      from="Client"
                      avatar={convoRequest.clientName?.[0] || 'C'}
                      color="#f97316"
                      time={convoRequest.clientInterestedAt}
                      label="Expressed Interest 🔥"
                      message={convoRequest.clientMessage || 'Expressed interest in this expert'}
                      meta={`Offered: ${cur(convoRequest)}${convoRequest.clientOfferedBudget} (${convoRequest.clientBudgetType})`}
                    />
                  )}

                  {/* Step 3: Freelancer notified */}
                  {(convoRequest.interestStatus === 'freelancer_notified' || convoRequest.interestStatus === 'scheduled') && (
                    <ConvoMessage
                      from="Admin"
                      avatar="A"
                      color="#0891b2"
                      time={null}
                      label="Notified freelancer 📧"
                      message={convoRequest.adminNotes || `Sent email + in-app notification to ${convoRequest.freelancerAliasName}`}
                      meta="Email sent + in-app notification"
                    />
                  )}

                  {/* Status badge */}
                  <div style={{ textAlign: 'center', padding: '8px 0' }}>
                    <InterestBadge status={convoRequest.interestStatus || 'client_interested'}/>
                  </div>
                </div>

                {/* Action area */}
                <div style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>Next actions:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {convoRequest.interestStatus !== 'freelancer_notified' && convoRequest.interestStatus !== 'scheduled' && (
                      <button onClick={() => { setNotifyModal(convoRequest); setNotifyNote(''); }}
                        style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                        <Send size={14}/> Notify freelancer with budget
                      </button>
                    )}
                    <button onClick={() => { setSelected(convoRequest); setAgreedRate(String(convoRequest.clientOfferedBudget || convoRequest.budgetMin || '')); setBudgetType(convoRequest.clientBudgetType || convoRequest.budgetType); setScheduleModal(true); }}
                      style={{ width: '100%', padding: '10px', borderRadius: 12, background: '#0f172a', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                      📅 Schedule meeting
                    </button>
                    <a href={`mailto:${convoRequest.clientEmail}?subject=Your interest in our expert&body=Hi ${convoRequest.clientName},`}
                      style={{ width: '100%', padding: '10px', borderRadius: 12, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, textDecoration: 'none' }}>
                      <Mail size={14}/> Reply to client
                    </a>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
                    Client: {convoRequest.clientEmail} · Expert: {convoRequest.freelancerEmail}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notify Freelancer Modal */}
        {notifyModal && (
          <div onClick={() => setNotifyModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', marginBottom: 4 }}>📧 Notify {notifyModal.freelancerAliasName}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Email + in-app notification will be sent</div>
              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 14, padding: '14px', marginBottom: 16, fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: '#6b21a8', marginBottom: 8 }}>Client offer summary:</div>
                <div style={{ color: '#7c3aed', lineHeight: 1.7 }}>
                  <div>👤 Client: <strong>{notifyModal.clientName}</strong> ({notifyModal.clientCompany})</div>
                  <div>💰 Budget: <strong>{cur(notifyModal)}{notifyModal.clientOfferedBudget?.toLocaleString()}</strong> ({notifyModal.clientBudgetType})</div>
                  {notifyModal.clientMessage && <div>💬 "{notifyModal.clientMessage}"</div>}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>YOUR NOTE TO FREELANCER (optional)</label>
                <textarea value={notifyNote} onChange={e => setNotifyNote(e.target.value)} rows={3}
                  placeholder="e.g. This client is serious, has 3 more projects. Good fit for your React skills. Please respond via portal within 24 hours."
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setNotifyModal(null)} style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleNotifyFreelancer} disabled={notifying}
                  style={{ flex: 2, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: notifying ? 0.6 : 1 }}>
                  {notifying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/>Sending…</> : <><Send size={14}/>Send to freelancer</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule modal */}
        {scheduleModal && selected && (
          <ScheduleModal selected={selected} onClose={() => setScheduleModal(false)} platform={platform} setPlatform={setPlatform} agreedRate={agreedRate} setAgreedRate={setAgreedRate} budgetType={budgetType} setBudgetType={setBudgetType} meetingLink={meetingLink} setMeetingLink={setMeetingLink} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} onConfirm={handleSchedule} loading={scheduleMeeting.isPending}/>
        )}
      </div>
    );
  }

  // ── OTHER TABS (pending / scheduled / approved / all) ──────
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Requests</h1>
          <p className="text-sm text-gray-500">{(requests as any[]).length} total · Admin reviews all demo/hire requests</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client or expert…" className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 w-56"/>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab}/>

      <SectionCard>
        {isLoading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-indigo-500"/></div> : (
          <div className="space-y-3">
            {filtered.map((r: any) => (
              <div key={r.id} className="border border-gray-100 rounded-2xl hover:shadow-md transition-all">
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Avatar name={r.clientName} size="sm"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="font-bold text-gray-900 text-sm">{r.clientName}</span>
                        <span className="text-gray-400 text-xs">→</span>
                        <span className="font-bold text-indigo-700 text-sm">{r.freelancerAliasName || r.freelancerName}</span>
                        <StatusBadge status={r.status}/>
                        {r.clientInterested && <span className="text-xs font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">🔥 Interested</span>}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cur(r)}{r.budgetMin}–{cur(r)}{r.budgetMax} · {r.budgetType} · {r.sessionType}
                      </div>
                      {r.clientInterested && r.clientOfferedBudget && (
                        <div className="mt-1 text-xs font-bold text-purple-700 bg-purple-50 inline-block px-2 py-0.5 rounded-full border border-purple-200">
                          Client offered: {cur(r)}{r.clientOfferedBudget} ({r.clientBudgetType})
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 shrink-0">{new Date(r.preferredDateTime || r.createdAt).toLocaleDateString()}</div>
                  </div>

                  {r.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{r.description}</p>}

                  <div className="flex flex-wrap gap-2">
                    {r.status === 'pending' && (<>
                      <button onClick={() => { setSelected(r); setAgreedRate(String(r.clientOfferedBudget || r.budgetMin || '')); setBudgetType(r.clientBudgetType || r.budgetType); setScheduleModal(true); }} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-xl font-bold hover:bg-indigo-700">📅 Schedule</button>
                      <button onClick={() => updateStatus.mutate({ id: r.id, data: { status: 'approved' } })} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-xl font-bold hover:bg-green-200">✓ Approve</button>
                      <button onClick={() => setRejectModal(r)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-bold hover:bg-red-200">✕ Reject</button>
                    </>)}
                    {r.clientInterested && r.interestStatus !== 'freelancer_notified' && (
                      <button onClick={() => { setNotifyModal(r); setNotifyNote(''); }} className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl font-bold border border-purple-200 flex items-center gap-1">
                        <Send size={10}/> Notify freelancer
                      </button>
                    )}
                    {r.clientInterested && (
                      <button onClick={() => { setTab('interested'); setConvoRequest(r); }} className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl font-bold border border-amber-200">
                        🔥 View interest details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="text-4xl mb-3">📋</div>
                <div className="font-semibold">No {tab !== 'all' ? tab : ''} requests</div>
              </div>
            )}
          </div>
        )}
      </SectionCard>

      {/* Reject modal */}
      {rejectModal && (
        <Modal open={!!rejectModal} title="Reject request" onClose={() => setRejectModal(null)}>
          <div className="space-y-4 p-1">
            <p className="text-sm text-gray-600">Reject request from <strong>{rejectModal.clientName}</strong>?</p>
            <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} rows={3} placeholder="Reason (optional — will be shown to client)" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none"/>
            <div className="flex gap-2">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-gray-200 py-2 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={async () => { await updateStatus.mutateAsync({ id: rejectModal.id, data: { status: 'rejected', adminNotes: rejectNote } }); setRejectModal(null); }} className="flex-1 bg-red-600 text-white py-2 rounded-xl text-sm font-bold">Reject</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule modal */}
      {scheduleModal && selected && (
        <ScheduleModal selected={selected} onClose={() => setScheduleModal(false)} platform={platform} setPlatform={setPlatform} agreedRate={agreedRate} setAgreedRate={setAgreedRate} budgetType={budgetType} setBudgetType={setBudgetType} meetingLink={meetingLink} setMeetingLink={setMeetingLink} scheduledDate={scheduledDate} setScheduledDate={setScheduledDate} scheduledTime={scheduledTime} setScheduledTime={setScheduledTime} onConfirm={handleSchedule} loading={scheduleMeeting.isPending}/>
      )}

      {/* Notify modal */}
      {notifyModal && (
        <div onClick={() => setNotifyModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 14 }}>📧 Notify {notifyModal.freelancerAliasName}</div>
            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12, color: '#7c3aed' }}>
              Client offered: <strong>{cur(notifyModal)}{notifyModal.clientOfferedBudget}</strong> ({notifyModal.clientBudgetType}) · {notifyModal.clientMessage || ''}
            </div>
            <textarea value={notifyNote} onChange={e => setNotifyNote(e.target.value)} rows={3} placeholder="Add note to freelancer…" style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', marginBottom: 12 }}/>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setNotifyModal(null)} style={{ flex: 1, padding: 11, borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleNotifyFreelancer} disabled={notifying} style={{ flex: 2, padding: 11, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 800, cursor: 'pointer', opacity: notifying ? 0.6 : 1 }}>
                {notifying ? 'Sending…' : 'Send to freelancer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Conversation message bubble ─────────────────────────────
const ConvoMessage = ({ from, avatar, color, time, label, message, meta }: any) => (
  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
    <div style={{ width: 32, height: 32, borderRadius: 10, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{avatar}</div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{from}</span>
        <span style={{ fontSize: 10, color: '#6366f1', fontWeight: 700, background: '#eff6ff', padding: '2px 7px', borderRadius: 6 }}>{label}</span>
        {time && <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 'auto' }}>{new Date(time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 12, padding: '10px 12px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>
        {message}
      </div>
      {meta && <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{meta}</div>}
    </div>
  </div>
);

// ── Schedule Meeting modal ──────────────────────────────────
const ScheduleModal = ({ selected, onClose, platform, setPlatform, agreedRate, setAgreedRate, budgetType, setBudgetType, meetingLink, setMeetingLink, scheduledDate, setScheduledDate, scheduledTime, setScheduledTime, onConfirm, loading }: any) => (
  <Modal open={true} title="Schedule meeting" onClose={onClose}>
    <div className="space-y-4 p-1">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-gray-500 block mb-1">Date *</label><input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
        <div><label className="text-xs font-bold text-gray-500 block mb-1">Time</label><input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/></div>
      </div>
      <div><label className="text-xs font-bold text-gray-500 block mb-1">Meeting link *</label><input value={meetingLink} onChange={e => setMeetingLink(e.target.value)} placeholder="https://zoom.us/j/..." className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-bold text-gray-500 block mb-1">Agreed rate</label><input type="number" value={agreedRate} onChange={e => setAgreedRate(e.target.value)} placeholder="35" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/></div>
        <div><label className="text-xs font-bold text-gray-500 block mb-1">Budget type</label>
          <select value={budgetType} onChange={e => setBudgetType(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option value="hourly">Hourly</option><option value="fixed">Fixed</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {['zoom','meet','teams'].map(p => <button key={p} type="button" onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 capitalize ${platform === p ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500'}`}>{p}</button>)}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 border border-gray-200 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2">
          {loading ? <><Loader2 size={14} className="animate-spin"/>Scheduling…</> : 'Confirm & send invites'}
        </button>
      </div>
    </div>
  </Modal>
);

export default AdminRequests;
