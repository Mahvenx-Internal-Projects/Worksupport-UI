import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Calendar, Video, Check, X, Clock, RefreshCw, Send,
  Mail, ChevronDown, Loader2, Plus, Edit2, Link as LinkIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMeetings, useSetMeetingOutcome } from '../../hooks/useApi';
import { api } from '../../services/api';

const PLATFORMS = ['Zoom','Google Meet','MS Teams','Phone Call','In-Person'];

const AdminMeetings: React.FC = () => {
  const qc = useQueryClient();
  const { data: meetings = [], isLoading } = useMeetings();
  const setOutcome = useSetMeetingOutcome();

  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '', platform: '', link: '' });
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: 'approved', notes: '' });
  const [sending, setSending] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  const filtered = (meetings as any[]).filter((m: any) => filter === 'all' || m.status === filter);

  const resend = async (m: any) => {
    setSending(m.id);
    try {
      await api.post(`/meetings/${m.id}/send-invite`);
      toast.success(`Invite resent to ${m.clientName || 'client'} & ${m.freelancerAliasName || 'expert'}!`);
    } catch {
      // Fallback: at minimum show the info to manually resend
      toast.success(`Meeting details: ${m.platform} on ${m.scheduledDate} ${m.scheduledTime} — link: ${m.meetingLink || 'Not set'}`, { duration: 8000 });
    } finally { setSending(null); }
  };

  const reschedule = async () => {
    if (!rescheduleForm.date || !rescheduleForm.time) { toast.error('Set new date and time'); return; }
    try {
      const dt = new Date(`${rescheduleForm.date}T${rescheduleForm.time}`).toISOString();
      await api.patch(`/meetings/${rescheduleId}/reschedule`, {
        scheduledAt: dt,
        platform: rescheduleForm.platform || undefined,
        meetingLink: rescheduleForm.link || undefined,
      });
      qc.invalidateQueries({ queryKey: ['meetings'] });
      toast.success('Meeting rescheduled! Invites sent automatically.');
      setRescheduleId(null);
      setRescheduleForm({ date: '', time: '', platform: '', link: '' });
    } catch {
      toast.error('Reschedule failed — check API'); setRescheduleId(null);
    }
  };

  const saveOutcome = async () => {
    await setOutcome.mutateAsync({ id: outcomeId!, data: { outcome: outcomeForm.outcome, notes: outcomeForm.notes } });
    setOutcomeId(null);
    toast.success('Outcome saved. Notifications sent to client & expert.');
  };

  const STATUS: Record<string,{bg:string;txt:string;label:string}> = {
    upcoming:  { bg:'#eff6ff', txt:'#1d4ed8', label:'Upcoming' },
    completed: { bg:'#f0fdf4', txt:'#16a34a', label:'Completed' },
    cancelled: { bg:'#fef2f2', txt:'#dc2626', label:'Cancelled' },
    rescheduled: { bg:'#fff7ed', txt:'#c2410c', label:'Rescheduled' },
  };

  const statCounts = {
    upcoming:  (meetings as any[]).filter((m: any) => m.status === 'upcoming').length,
    completed: (meetings as any[]).filter((m: any) => m.status === 'completed').length,
    cancelled: (meetings as any[]).filter((m: any) => m.status === 'cancelled').length,
  };

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`*{box-sizing:border-box} input::placeholder{color:#94a3b8} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}} .card{animation:fadeIn .4s ease both}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: '0 0 4px' }}>Meetings</h1>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Manage all client-expert sessions · reschedule · resend invites</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all','upcoming','completed','cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '7px 14px', borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize', background: filter === f ? '#0f172a' : '#f8fafc', color: filter === f ? '#fff' : '#64748b', transition: 'all .15s' }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Upcoming', n: statCounts.upcoming, bg: '#eff6ff', txt: '#1d4ed8', icon: '📅' },
          { label: 'Completed', n: statCounts.completed, bg: '#f0fdf4', txt: '#16a34a', icon: '✅' },
          { label: 'Cancelled', n: statCounts.cancelled, bg: '#fef2f2', txt: '#dc2626', icon: '❌' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.txt}22`, borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.txt, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontSize: 12, color: s.txt, fontWeight: 600, opacity: .8 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting cards */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Loader2 size={24} style={{ color: '#d1d5db', animation: 'spin 1s linear infinite' }}/></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 60, color: '#d1d5db' }}>
          <Calendar size={40} style={{ margin: '0 auto 12px' }}/>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af' }}>No {filter !== 'all' ? filter : ''} meetings</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((m: any) => {
            const sc = STATUS[m.status] || STATUS.upcoming;
            return (
              <div key={m.id} className="card" style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                {/* Top bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f8fafc', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                      {(m.clientName || m.clientEmail || '?')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                        {m.clientName || m.clientEmail || 'Client'} ↔ {m.freelancerAliasName || m.freelancerName || 'Expert'}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{m.sessionType || m.type || 'Session'} · {m.currency === 'INR' ? '₹' : '$'}{m.hourlyRate || m.rate}/hr</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: sc.bg, color: sc.txt }}>{sc.label}</span>
                </div>

                {/* Details */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' }}>
                      <Calendar size={14} style={{ color: '#94a3b8' }}/>
                      {m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : m.date || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' }}>
                      <Clock size={14} style={{ color: '#94a3b8' }}/>
                      {m.scheduledTime || m.time || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#64748b' }}>
                      <Video size={14} style={{ color: '#94a3b8' }}/>
                      {m.platform || 'Zoom'}
                    </div>
                    {(m.meetingLink || m.link) && (
                      <a href={m.meetingLink || m.link} target="_blank" rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#4f46e5', textDecoration: 'none', background: '#eff6ff', padding: '4px 12px', borderRadius: 8 }}>
                        <LinkIcon size={11}/> Join link
                      </a>
                    )}
                    {m.clientEmail && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8' }}><Mail size={11}/>{m.clientEmail}</div>}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {m.status === 'upcoming' && (<>
                      {/* Resend invite */}
                      <button onClick={() => resend(m)} disabled={sending === m.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#eff6ff', border: '1.5px solid #bfdbfe', fontSize: 12, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer', transition: 'all .15s', opacity: sending === m.id ? .6 : 1 }}>
                        {sending === m.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={12}/>}
                        Resend invite
                      </button>
                      {/* Reschedule */}
                      <button onClick={() => { setRescheduleId(m.id); setRescheduleForm({ date: '', time: '', platform: m.platform || '', link: m.meetingLink || m.link || '' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#fff7ed', border: '1.5px solid #fed7aa', fontSize: 12, fontWeight: 700, color: '#c2410c', cursor: 'pointer', transition: 'all .15s' }}>
                        <RefreshCw size={12}/> Reschedule
                      </button>
                      {/* Join */}
                      {(m.meetingLink || m.link) && (
                        <a href={m.meetingLink || m.link} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#1d4ed8', color: '#fff', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'opacity .15s' }}>
                          <Video size={12}/> Join meeting
                        </a>
                      )}
                      {/* Mark completed */}
                      <button onClick={() => { setOutcomeId(m.id); setOutcomeForm({ outcome: 'approved', notes: '' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        <Check size={12}/> Set outcome
                      </button>
                      {/* Cancel */}
                      <button onClick={async () => { if (!window.confirm('Cancel this meeting?')) return; await api.patch(`/meetings/${m.id}/cancel`); qc.invalidateQueries({ queryKey: ['meetings'] }); toast.success('Meeting cancelled'); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #fecaca', background: '#fff', fontSize: 12, fontWeight: 700, color: '#dc2626', cursor: 'pointer' }}>
                        <X size={12}/> Cancel
                      </button>
                    </>)}
                    {m.status === 'completed' && (<>
                      <button onClick={() => { setRescheduleId(m.id); setRescheduleForm({ date: '', time: '', platform: m.platform || '', link: '' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
                        <Plus size={12}/> Schedule follow-up
                      </button>
                      <button onClick={() => api.post(`/projects`, { requestId: m.requestId, clientId: m.clientId, freelancerId: m.freelancerId }).then(() => toast.success('Project creation started!')).catch(() => toast.error('Go to Projects → Create with this meeting data'))}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#059669', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Create project →
                      </button>
                    </>)}
                    {m.status === 'cancelled' && (
                      <button onClick={() => { setRescheduleId(m.id); setRescheduleForm({ date: '', time: '', platform: m.platform || '', link: '' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: '#eff6ff', border: '1.5px solid #bfdbfe', fontSize: 12, fontWeight: 700, color: '#1d4ed8', cursor: 'pointer' }}>
                        <RefreshCw size={12}/> Reschedule
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleId && (
        <div onClick={() => setRescheduleId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>Reschedule meeting</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>New invites will be sent automatically</div>
              </div>
              <button onClick={() => setRescheduleId(null)} style={{ width: 30, height: 30, borderRadius: '50%', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={14}/></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>NEW DATE *</label>
                  <input type="date" value={rescheduleForm.date} onChange={e => setRescheduleForm(f => ({ ...f, date: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>NEW TIME *</label>
                  <input type="time" value={rescheduleForm.time} onChange={e => setRescheduleForm(f => ({ ...f, time: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>PLATFORM</label>
                <select value={rescheduleForm.platform} onChange={e => setRescheduleForm(f => ({ ...f, platform: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>MEETING LINK (optional)</label>
                <input value={rescheduleForm.link} onChange={e => setRescheduleForm(f => ({ ...f, link: e.target.value }))} placeholder="https://zoom.us/j/..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
              </div>
              <button onClick={reschedule}
                style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}>
                <Send size={16}/> Save & send new invites
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome modal */}
      {outcomeId && (
        <div onClick={() => setOutcomeId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, padding: 28, width: '100%', maxWidth: 400, boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', marginBottom: 6 }}>Set meeting outcome</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Client and expert will be notified</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>OUTCOME</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['approved','✅ Client approved — ready to create project'],['rejected','❌ Client not interested'],['pending_decision','⏳ Pending client decision']].map(([v,l]) => (
                    <label key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: `1.5px solid ${outcomeForm.outcome === v ? '#4f46e5' : '#e2e8f0'}`, background: outcomeForm.outcome === v ? '#eff6ff' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'all .15s' }}>
                      <input type="radio" value={v} checked={outcomeForm.outcome === v} onChange={() => setOutcomeForm(f => ({ ...f, outcome: v }))} style={{ accentColor: '#4f46e5' }}/>{l}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>NOTES (optional)</label>
                <textarea value={outcomeForm.notes} onChange={e => setOutcomeForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any notes about the meeting..." style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit' }}/>
              </div>
              <button onClick={saveOutcome} disabled={setOutcome.isPending}
                style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg,#059669,#047857)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {setOutcome.isPending ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> : <Check size={15}/>}
                Save outcome
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMeetings;
