import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Star, MapPin, Clock, Shield, Lock, Check, Zap, Briefcase,
  ChevronRight, Award, CheckCircle, Loader2, Globe, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useBookQuickSupport, useCreateRequest } from '../../hooks/useApi';
import { publicApi } from '../../services/endpoints';

const Stars = ({ r, s = 14 }: { r: number; s?: number }) => (
  <span style={{ display: 'inline-flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={s} height={s} fill={i <= Math.round(r) ? '#f59e0b' : '#e5e7eb'} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </span>
);

const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#0e7490'];

const ExpertPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab]     = useState<'about'|'skills'|'reviews'>('about');
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [view, setView]   = useState<'main'|'quick'|'hire'|'interest'>(searchParams.get('action') === 'quick' ? 'quick' : 'main');
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('zoom');
  const [rf, setRf] = useState({
    sessionType: 'consultation', budgetType: 'hourly',
    currency: 'USD', budgetMin: '', budgetMax: '',
    preferredDateTime: '', description: '',
  });

  const [interest, setInterest] = useState({ budget: '', budgetType: 'hourly', currency: 'USD', message: '' });
  const [interestLoading, setInterestLoading] = useState(false);
  const bookQ   = useBookQuickSupport();
  const createReq = useCreateRequest();

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      // Try to get from public featured list and find by id
      const r = await publicApi.getFeaturedFreelancers({ pageSize: 100 });
      const all = r.data?.items ?? [];
      return all.find((f: any) => f.id === id) ?? null;
    },
    enabled: !!id,
  });

  const guard = (pv: 'quick' | 'hire') => {
    if (isAuthenticated && (user?.role as string) === 'freelancer') {
      toast.error('Log in as a client to hire experts.', { icon: '🚫' }); return false;
    }
    if (!isAuthenticated) {
      localStorage.setItem('pendingAction', JSON.stringify({
        type: pv === 'quick' ? 'quickSupport' : 'requestDemo',
        expert, pendingView: pv, returnPath: `/expert/${id}`,
      }));
      navigate(`/login?returnTo=/expert/${id}&role=client`); return false;
    }
    return true;
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <Loader2 size={32} style={{ color: '#4f46e5', animation: 'spin 1s linear infinite' }}/>
        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>Loading expert profile…</div>
      </div>
    </div>
  );

  if (!expert) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif", gap: 16 }}>
      <div style={{ fontSize: 48 }}>🔍</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Expert not found</div>
      <button onClick={() => navigate('/')} style={{ padding: '12px 28px', borderRadius: 14, background: '#0f172a', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>← Back to home</button>
    </div>
  );

  const col = COLORS[expert.aliasName?.charCodeAt(0) % COLORS.length || 0];
  const cur = expert.currency === 'INR' ? '₹' : '$';
  const ini = expert.aliasName?.split(' ').map((w: string) => w[0]).join('').slice(0, 2) || '??';

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'); *{box-sizing:border-box} @keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} .fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both} input::placeholder,textarea::placeholder{color:#94a3b8} ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}`}</style>

      {/* ── TOP NAV ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(248,250,252,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f1f5f9', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#64748b' }}>
          <ArrowLeft size={16}/> Back
        </button>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Expert Profile</div>
        <div style={{ flex: 1 }}/>
        {isAuthenticated && (
          <button onClick={() => navigate(user?.role === 'admin' ? '/admin' : user?.role === 'freelancer' ? '/freelancer' : '/client')}
            style={{ fontSize: 13, fontWeight: 700, color: '#4f46e5', background: '#eff6ff', border: '1.5px solid #c7d2fe', borderRadius: 10, padding: '6px 14px', cursor: 'pointer' }}>
            Dashboard
          </button>
        )}
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>

        {/* ── LEFT: Profile ── */}
        <div className="fu">
          {/* Hero banner */}
          <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' }}>
            <div style={{ height: 180, background: `linear-gradient(135deg,${col}ee,${col}66)`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '18px 18px' }}/>
              <div style={{ position: 'absolute', bottom: -50, left: 32 }}>
                <div style={{ position: 'relative', width: 100, height: 100, borderRadius: 24, background: `linear-gradient(135deg,${col},${col}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 36, color: '#fff', border: '5px solid #f8fafc', boxShadow: `0 8px 24px ${col}50` }}>
                  {ini}
                  {expert.isAvailable && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: '#22c55e', border: '3px solid #f8fafc', boxShadow: '0 0 12px rgba(34,197,94,0.5)' }}/>}
                </div>
              </div>
              {expert.isFeatured && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: '#fbbf24', color: '#78350f', fontSize: 12, fontWeight: 800, padding: '5px 14px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Star size={11} fill="currentColor"/> FEATURED
                </div>
              )}
            </div>
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', padding: '64px 32px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>{expert.aliasName}</h1>
                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '3px 12px', borderRadius: 100, letterSpacing: '0.05em' }}>ALIAS</span>
                    {expert.isAvailable
                      ? <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 12px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}/>Available now</span>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '3px 12px', borderRadius: 100 }}>Limited availability</span>}
                  </div>
                  <div style={{ fontSize: 16, color: '#64748b', fontWeight: 500, marginBottom: 8 }}>{expert.currentRole}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stars r={expert.rating}/>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{expert.rating}</span>
                      <span style={{ fontSize: 13, color: '#9ca3af' }}>({expert.reviewCount} reviews)</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: col, background: `${col}15`, padding: '4px 14px', borderRadius: 100 }}>Trust score: {expert.trustScore}/100</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 40, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em', lineHeight: 1 }}>{cur}{expert.hourlyRate}</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>per hour</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Total exp', value: `${expert.totalExp} yrs`, icon: '💼' },
              { label: 'Freelance', value: `${expert.freelanceExp} yrs`, icon: '🧑‍💻' },
              { label: 'Projects done', value: expert.completedProjects, icon: '✅' },
              { label: 'Response time', value: `~${expert.responseTimeMinutes}m`, icon: '⚡' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 18, padding: '18px 16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 4 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #f8fafc', padding: '4px', background: '#f8fafc' }}>
              {(['about','skills','reviews'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, textTransform: 'capitalize', transition: 'all .2s', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#0f172a' : '#94a3b8', boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.08)' : 'none' }}>
                  {t}
                </button>
              ))}
            </div>
            <div style={{ padding: '24px 28px', minHeight: 200 }}>
              {tab === 'about' && (<>
                <p style={{ fontSize: 15, color: '#475569', lineHeight: 1.8, marginBottom: 20 }}>{expert.bio}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                  {[
                    { icon: <MapPin size={14}/>, val: expert.country || 'India' },
                    { icon: <Clock size={14}/>, val: expert.timezone || 'IST (+5:30)' },
                    { icon: <Globe size={14}/>, val: 'English, Hindi' },
                    { icon: <Shield size={14}/>, val: 'ID Verified by Admin' },
                  ].map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '7px 14px', borderRadius: 100 }}>
                      <span style={{ color: '#94a3b8' }}>{m.icon}</span>{m.val}
                    </div>
                  ))}
                </div>
                <div style={{ background: 'linear-gradient(135deg,#eff6ff,#ecfdf5)', border: '1px solid #bfdbfe', borderRadius: 16, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Lock size={16} style={{ color: '#3b82f6', flexShrink: 0, marginTop: 1 }}/>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#1e40af', marginBottom: 4 }}>100% Identity Protected</div>
                    <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.65 }}>Clients only see the alias name. Real name, LinkedIn and current employer are <strong>never revealed</strong> — not even to WorkSupport360 clients. Your employer will not find out.</div>
                  </div>
                </div>
              </>)}
              {tab === 'skills' && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {expert.skills?.map((s: string) => (
                    <span key={s} style={{ padding: '9px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#fff', background: `linear-gradient(135deg,${col},${col}cc)`, boxShadow: `0 2px 8px ${col}30` }}>{s}</span>
                  ))}
                </div>
              )}
              {tab === 'reviews' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { n: 'Client A', t: 'Delivered on time, exceptional quality. Best freelancer we hired.', r: 5, d: '2 weeks ago' },
                    { n: 'Client B', t: 'Production crisis at 11pm — fixed it in 35 minutes. Absolutely lifesaving.', r: 5, d: '1 month ago' },
                    { n: 'Client C', t: 'Deep expertise, clean code, great communication. Would hire again.', r: 4, d: '2 months ago' },
                  ].map((r, i) => (
                    <div key={i} style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 16, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg,${col},${col}88)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>{r.n[0]}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{r.n}</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{r.d}</div>
                          </div>
                        </div>
                        <Stars r={r.r}/>
                      </div>
                      <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', lineHeight: 1.65, margin: 0 }}>"{r.t}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Action card (sticky) ── */}
        <div style={{ position: 'sticky', top: 76 }} className="fu">

          {view === 'main' && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ background: `linear-gradient(135deg,${col}22,${col}08)`, padding: '24px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.04em' }}>{cur}{expert.hourlyRate}<span style={{ fontSize: 16, fontWeight: 400, color: '#94a3b8' }}>/hr</span></div>
                <div style={{ fontSize: 13, color: expert.isAvailable ? '#16a34a' : '#d97706', fontWeight: 700, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: expert.isAvailable ? '#22c55e' : '#f59e0b', display: 'inline-block' }}/>
                  {expert.isAvailable ? 'Available now' : 'Limited availability'}
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {[
                    { icon: '✅', text: 'No payment upfront' },
                    { icon: '🛡️', text: 'Escrow-protected projects' },
                    { icon: '⚡', text: 'Admin confirms within 4 hours' },
                    { icon: '🔒', text: 'Employer never notified' },
                  ].map(f => (
                    <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#475569' }}>
                      <span>{f.icon}</span>{f.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={() => { if (!guard('quick')) return; setView('quick'); }}
                    style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 20px rgba(249,115,22,0.35)', transition: 'all .2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
                    <Zap size={18}/> Quick 1-hr call
                  </button>
                  <button onClick={() => { if (!guard('hire')) return; setView('hire'); }}
                    style={{ width: '100%', padding: '15px', borderRadius: 18, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0f172a,#1e3a5f)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 6px 20px rgba(15,23,42,0.25)', transition: 'all .2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'none'}>
                    <Briefcase size={18}/> Hire for project
                  </button>
                  {/* Express Interest — softer CTA */}
                  <button onClick={() => { if (!guard('interest' as any)) return; setView('interest'); }}
                    style={{ width: '100%', padding: '12px', borderRadius: 16, border: '2px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#6366f1'; (e.currentTarget as HTMLElement).style.color = '#4f46e5'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.color = '#374151'; }}>
                    ✋ Express interest &amp; share budget
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === 'quick' && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#fff7ed' }}>
                <button onClick={() => setView('main')} style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={14} style={{ color: '#64748b' }}/>
                </button>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#c2410c' }}>⚡ Quick 1-hr session</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>with {expert.aliasName} · {cur}{expert.hourlyRate}/hr</div>
                </div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#9a3412', lineHeight: 1.65 }}>
                  Book → Expert joins your call in <strong>~30 minutes</strong> → 1-hour live session to solve your problem.
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>DESCRIBE YOUR PROBLEM *</label>
                  <textarea rows={4} value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. React useEffect infinite loop in production, need urgent fix..."
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', transition: 'border .15s', background: '#fafafa' }}
                    onFocus={e => e.target.style.borderColor = '#f97316'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>PLATFORM</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                    {[['zoom','Zoom'],['meet','Meet'],['teams','Teams']].map(([v,l]) => (
                      <button key={v} onClick={() => setPlatform(v)}
                        style={{ padding: '10px', borderRadius: 12, border: `2px solid ${platform === v ? '#f97316' : '#e2e8f0'}`, background: platform === v ? '#fff7ed' : '#fff', color: platform === v ? '#c2410c' : '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Session rate</div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#0f172a' }}>{cur}{expert.hourlyRate}/hr</div>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Platform fee (20%)</div>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#64748b' }}>{cur}{Math.round(expert.hourlyRate * 0.2)}</div>
                  </div>
                </div>
                <button onClick={async () => { if (!topic.trim()) { toast.error('Describe your problem'); return; } await bookQ.mutateAsync({ freelancerId: expert.id, topic, platform }); toast.success('Booked! Expert will join in ~30 min'); navigate('/client'); }} disabled={bookQ.isPending}
                  style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f97316,#ef4444)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: bookQ.isPending ? 0.6 : 1, boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}>
                  {bookQ.isPending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/>Booking…</> : <><Zap size={15}/>Confirm — joins in ~30 min</>}
                </button>
              </div>
            </div>
          )}

          {view === 'interest' && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f5f3ff' }}>
                <button onClick={() => setView('main')} style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={14} style={{ color: '#64748b' }}/>
                </button>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#4f46e5' }}>✋ Express interest</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>Share your budget — admin will coordinate</div>
                </div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#4338ca', lineHeight: 1.65 }}>
                  <strong>How this works:</strong><br/>
                  1. You share your budget here<br/>
                  2. Admin reviews &amp; contacts you within 4 hours<br/>
                  3. Admin notifies the expert with your offer<br/>
                  4. If expert agrees → meeting scheduled
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>BUDGET TYPE</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[['hourly','Hourly'],['fixed','Fixed']].map(([v,l]) => (
                        <button key={v} onClick={() => setInterest(i => ({ ...i, budgetType: v }))}
                          style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: `2px solid ${interest.budgetType === v ? '#6366f1' : '#e2e8f0'}`, background: interest.budgetType === v ? '#eff6ff' : '#fff', color: interest.budgetType === v ? '#4338ca' : '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>CURRENCY</label>
                    <select value={interest.currency} onChange={e => setInterest(i => ({ ...i, currency: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 11, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
                      <option>USD</option><option>INR</option><option>EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
                    YOUR BUDGET ({interest.budgetType === 'hourly' ? `${interest.currency}/hr` : `${interest.currency} total`})
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{interest.currency === 'INR' ? '₹' : '$'}</span>
                    <input type="number" value={interest.budget} onChange={e => setInterest(i => ({ ...i, budget: e.target.value }))}
                      placeholder={expert.hourlyRate} style={{ width: '100%', padding: '11px 12px 11px 28px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 14, fontWeight: 700, outline: 'none', fontFamily: 'inherit' }}
                      onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Expert rate: {expert.currency === 'INR' ? '₹' : '$'}{expert.hourlyRate}/hr — you can negotiate</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>MESSAGE TO ADMIN (optional)</label>
                  <textarea rows={3} value={interest.message} onChange={e => setInterest(i => ({ ...i, message: e.target.value }))}
                    placeholder="What do you need help with? Timeline? Team size? Any specific requirements..."
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', background: '#fafafa' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                </div>
                <button onClick={async () => {
                  if (!interest.budget) { toast.error('Please enter your budget'); return; }
                  setInterestLoading(true);
                  try {
                    // First create a request, then express interest
                    const { default: axiosLib } = await import('axios');
                    const apiUrl = process.env.REACT_APP_API_URL || '';
                    const token  = localStorage.getItem('accessToken');
                    // Create a demo request first
                    const reqRes = await axiosLib.post(`${apiUrl}/api/requests`, {
                      freelancerId: expert.id, sessionType: 'consultation',
                      preferredDateTime: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
                      durationMinutes: 45,
                      budgetMin: parseFloat(interest.budget) * 0.8,
                      budgetMax: parseFloat(interest.budget),
                      budgetType: interest.budgetType,
                      currency: interest.currency,
                      description: interest.message || `Interested in ${expert.aliasName} — offered ${interest.currency} ${interest.budget} (${interest.budgetType})`,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    // Then express interest
                    await axiosLib.post(`${apiUrl}/api/requests/${reqRes.data.id}/express-interest`, {
                      offeredBudget: parseFloat(interest.budget),
                      budgetType: interest.budgetType,
                      message: interest.message,
                    }, { headers: { Authorization: `Bearer ${token}` } });
                    toast.success('✅ Interest submitted! Admin will contact you within 4 hours.', { duration: 6000 });
                    setView('main');
                  } catch (err: any) {
                    toast.error(err?.response?.data?.message || 'Failed to submit interest');
                  } finally { setInterestLoading(false); }
                }} disabled={interestLoading || !interest.budget}
                  style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (interestLoading || !interest.budget) ? 0.5 : 1, boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
                  {interestLoading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/>Submitting…</> : <>✋ Submit interest — admin contacts in 4 hrs</>}
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: 0 }}>No commitment · Admin mediates · You decide after meeting expert</p>
              </div>
            </div>
          )}

          {view === 'hire' && (
            <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 24, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#eff6ff' }}>
                <button onClick={() => setView('main')} style={{ width: 32, height: 32, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowLeft size={14} style={{ color: '#64748b' }}/>
                </button>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#1d4ed8' }}>📋 Hire for a project</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>with {expert.aliasName} · {cur}{expert.hourlyRate}/hr</div>
                </div>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#1e40af', lineHeight: 1.65 }}>
                  Submit → Admin schedules <strong>45-min call</strong> within 4 hours → Interview → Approve → Project starts with escrow.
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>ENGAGEMENT TYPE</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                    {[['consultation','Consult'],['demo','Demo'],['project','Project']].map(([v,l]) => (
                      <button key={v} onClick={() => setRf(f => ({ ...f, sessionType: v }))}
                        style={{ padding: '9px 0', borderRadius: 11, border: `2px solid ${rf.sessionType === v ? col : '#e2e8f0'}`, background: rf.sessionType === v ? `${col}15` : '#fff', color: rf.sessionType === v ? col : '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>BUDGET TYPE</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[['hourly','Hourly'],['fixed','Fixed']].map(([v,l]) => (
                        <button key={v} onClick={() => setRf(f => ({ ...f, budgetType: v }))}
                          style={{ flex: 1, padding: '9px 0', borderRadius: 11, border: `2px solid ${rf.budgetType === v ? '#0f172a' : '#e2e8f0'}`, background: rf.budgetType === v ? '#0f172a' : '#fff', color: rf.budgetType === v ? '#fff' : '#94a3b8', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s' }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>CURRENCY</label>
                    <select value={rf.currency} onChange={e => setRf(f => ({ ...f, currency: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 11, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
                      <option>USD</option><option>INR</option><option>EUR</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <input type="number" value={rf.budgetMin} onChange={e => setRf(f => ({ ...f, budgetMin: e.target.value }))} placeholder="Min budget" style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
                  <input type="number" value={rf.budgetMax} onChange={e => setRf(f => ({ ...f, budgetMax: e.target.value }))} placeholder="Max budget" style={{ padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>PREFERRED CALL DATE & TIME *</label>
                  <input type="datetime-local" value={rf.preferredDateTime} onChange={e => setRf(f => ({ ...f, preferredDateTime: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit' }}/>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 800, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 7 }}>PROJECT DESCRIPTION *</label>
                  <textarea rows={3} value={rf.description} onChange={e => setRf(f => ({ ...f, description: e.target.value }))}
                    placeholder="Tech stack, what you need, team size, deadline..."
                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', background: '#fafafa' }}
                    onFocus={e => e.target.style.borderColor = col} onBlur={e => e.target.style.borderColor = '#e2e8f0'}/>
                </div>
                <button onClick={async () => {
                  if (!rf.description || !rf.preferredDateTime) { toast.error('Fill description and preferred date'); return; }
                  await createReq.mutateAsync({ freelancerId: expert.id, sessionType: rf.sessionType, preferredDateTime: new Date(rf.preferredDateTime).toISOString(), durationMinutes: 45, budgetMin: parseFloat(rf.budgetMin || '0'), budgetMax: parseFloat(rf.budgetMax || '0'), budgetType: rf.budgetType, currency: rf.currency, description: rf.description });
                  toast.success('Request submitted! Admin confirms in 4 hours.');
                  navigate('/client');
                }} disabled={createReq.isPending}
                  style={{ width: '100%', padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${col},${col}cc)`, color: '#fff', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: createReq.isPending ? 0.6 : 1, boxShadow: `0 6px 20px ${col}40` }}>
                  {createReq.isPending ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/>Submitting…</> : <><Briefcase size={15}/>Submit request</>}
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', margin: 0 }}>Free to request · No commitment · Cancel anytime</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpertPage;
