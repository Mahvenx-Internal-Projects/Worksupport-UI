import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RolePickerModal from '../../components/RolePickerModal';
import { useAuthStore } from '../../store/authStore';
import {
  ArrowLeft, ArrowRight, Check, Eye, EyeOff,
  User, Briefcase, Clock, Star, Shield, Lock, Zap, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

type Role = 'client' | 'freelancer';

const SKILLS_LIST = ['React','Angular','Vue.js','Node.js','Python','Django','FastAPI','Java','Spring Boot','.NET','C#','Go','Rust','Docker','Kubernetes','AWS','GCP','Azure','Terraform','MySQL','PostgreSQL','MongoDB','Redis','TypeScript','GraphQL','React Native','Flutter','iOS','Android','Machine Learning','TensorFlow','PyTorch','Data Science','Power BI','Tableau','Selenium','Cypress','Kafka','RabbitMQ','Elasticsearch','Linux','DevOps','CI/CD','Microservices','Blockchain','Solidity'];

const TIMEZONES = ['IST (UTC+5:30)','EST (UTC-5)','PST (UTC-8)','GMT (UTC+0)','CET (UTC+1)','SGT (UTC+8)','JST (UTC+9)','AEST (UTC+10)'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuthStore();
  const defaultRole = (searchParams.get('role') as Role) || 'client';
  const [role, setRole] = useState<Role>(defaultRole);
  const [roleReady, setRoleReady] = useState<boolean>(!!searchParams.get('role'));
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSkills] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', mobile: '',
    companyName: '', contactName: '', gstNumber: '',
    currentRole: '', currentCompany: '', totalExp: '', freelanceExp: '',
    hourlyRate: '', currency: 'USD', timezone: 'IST (UTC+5:30)', bio: '',
  });

  const [availability, setAvailability] = useState(
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ day: d, enabled: ['Mon','Tue','Wed','Thu','Fri'].includes(d), start: '18:00', end: '22:00' }))
  );

  // Scroll right panel to top on step change
  useEffect(()=>{
    const panel = document.getElementById('reg-right-panel');
    if(panel) panel.scrollTo({top:0,behavior:'smooth'});
    else window.scrollTo({top:0,behavior:'smooth'});
  },[step]);

  const steps = role === 'freelancer'
    ? ['Account','Professional','Availability','Skills','Review']
    : ['Account','Company','Review'];

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const toggleSkill = (s: string) => setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const canNext = () => {
    if (step === 0) return form.name && form.email && form.password.length >= 8 && form.password === form.confirmPassword && form.mobile;
    if (step === 1 && role === 'freelancer') return form.currentRole && form.currentCompany && form.totalExp && form.hourlyRate;
    if (step === 1 && role === 'client') return form.companyName && form.contactName;
    return true;
  };

  const handleSubmit = async () => {
    if (!agreed) { toast.error('Please agree to the terms and conditions'); return; }
    setLoading(true);
    try {
      await register({
        name: form.name, email: form.email, password: form.password,
        role, mobileNumber: form.mobile,
        companyName: role === 'client' ? form.companyName : form.currentCompany,
        contactName: role === 'client' ? form.contactName : undefined,
        gstNumber: form.gstNumber || undefined,
        currentRole: role === 'freelancer' ? form.currentRole : undefined,
        currentCompany: role === 'freelancer' ? form.currentCompany : undefined,
        totalExp: role === 'freelancer' ? parseInt(form.totalExp) : undefined,
        freelanceExp: role === 'freelancer' ? parseInt(form.freelanceExp || '0') : undefined,
        hourlyRate: role === 'freelancer' ? parseFloat(form.hourlyRate) : undefined,
        currency: role === 'freelancer' ? form.currency : undefined,
        timezone: role === 'freelancer' ? form.timezone : undefined,
        bio: role === 'freelancer' ? form.bio : undefined,
        skills: role === 'freelancer' ? selectedSkills : undefined,
        availability: role === 'freelancer' ? availability.filter(a => a.enabled).map(a => ({
          dayOfWeek:   a.day,
          isAvailable: a.enabled,
          startTime:   a.start,
          endTime:     a.end,
        })) : undefined,
      } as any);
      const enc = encodeURIComponent(form.email);
      navigate(`/login?registered=true&email=${enc}&role=${role}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: #94a3b8; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:none } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .fu { animation: fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
        ::-webkit-scrollbar { width: 4px } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 2px }
      `}</style>
      {!roleReady && <RolePickerModal onPick={(nextRole) => {
        setRole(nextRole === 'Freelancer' ? 'freelancer' : 'client');
        setRoleReady(true);
      }} />}

      {/* ── LEFT PANEL — colorful gradient ── */}
      <div style={{
        width: 440, flexShrink: 0,
        background: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 35%, #312e81 65%, #4c1d95 100%)',
        display: 'flex', flexDirection: 'column', padding: '40px 44px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Animated blobs */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)', filter: 'blur(30px)', animation: 'float 8s ease-in-out infinite' }}/>
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(25px)', animation: 'float 10s ease-in-out infinite reverse' }}/>
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', filter: 'blur(20px)', animation: 'float 6s ease-in-out infinite', animationDelay: '2s' }}/>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '44px 44px' }}/>

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 48 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff', boxShadow: '0 4px 14px rgba(249,115,22,0.45)' }}>WS</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>Work<span style={{ color: '#f97316' }}>Support</span><span style={{ opacity: .35, fontWeight: 300 }}>360</span></span>
          </button>

          <h2 style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16 }}>
            {role === 'freelancer' ? 'Freelance without limits' : 'Hire the best engineers'}
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 36 }}>
            {role === 'freelancer'
              ? 'Work under a privacy alias. Your MNC employer never finds out. Earn extra income with enterprise clients.'
              : 'Access senior MNC engineers from Infosys, TCS, Wipro under a privacy alias. Admin-coordinated. Escrow-protected.'}
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {(role === 'freelancer' ? [
              { i: '🔒', t: 'Identity 100% protected', d: 'Employer never notified' },
              { i: '💰', t: 'Earn extra income', d: 'Payouts in 3 business days' },
              { i: '⚡', t: 'Quick 1-hr sessions', d: 'Get paid for your expertise' },
            ] : [
              { i: '✅', t: 'Fast Hiring', d: 'Expert on a call same day' },
              { i: '🛡️', t: 'Escrow protected', d: 'Pay only for approved work' },
              { i: '🔍', t: 'ID-verified experts', d: 'All from top MNC companies' },
            ]).map(f => (
              <div key={f.i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.i}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#fff' }}>{f.t}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: i <= step ? 28 : 22, height: i <= step ? 28 : 22,
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i < step ? '#22c55e' : i === step ? '#f97316' : 'rgba(255,255,255,0.1)',
                    border: i === step ? '2px solid rgba(249,115,22,0.5)' : 'none',
                    fontSize: 11, fontWeight: 800, color: '#fff', transition: 'all .3s',
                    boxShadow: i === step ? '0 0 14px rgba(249,115,22,0.5)' : 'none',
                  }}>
                    {i < step ? <Check size={13}/> : i + 1}
                  </div>
                  <div style={{ fontSize: 9, color: i === step ? '#f97316' : 'rgba(255,255,255,0.35)', fontWeight: 600, whiteSpace: 'nowrap' }}>{s}</div>
                </div>
                {i < steps.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? '#22c55e' : 'rgba(255,255,255,0.1)', transition: 'background .3s', marginBottom: 14 }}/>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#f8fafc' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={15}/> {step > 0 ? 'Back' : 'Log in instead'}
          </button>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>Step {step + 1} of {steps.length}</div>
        </div>

        {/* Form area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px' }}>
          <div style={{ width: '100%', maxWidth: 520 }} className="fu">

            {/* Step title */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#4f46e5', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Step {step + 1} — {steps[step]}
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
                {step === 0 ? 'Create your account' :
                 step === 1 && role === 'freelancer' ? 'Your professional profile' :
                 step === 1 && role === 'client' ? 'Your company details' :
                 step === 2 && role === 'freelancer' ? 'Set your availability' :
                 step === 3 ? 'Select your skills' :
                 'Review & submit'}
              </h2>
            </div>

            {/* ── STEP 0: Account ── */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Full name *" placeholder="e.g. Rahul Sharma" value={form.name} onChange={v => set('name', v)} icon={<User size={14}/>}/>
                <Field label="Mobile number *" placeholder="+91-9876543210" value={form.mobile} onChange={v => set('mobile', v)} hint="Admin contacts you on this number"/>
                <Field label="Email address *" type="email" placeholder="you@company.com" value={form.email} onChange={v => set('email', v)} icon={<Mail size={14}/>}/>
                <div style={{ position: 'relative' }}>
                  <Field label="Password *" type={showPass ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={v => set('password', v)} icon={<Lock size={14}/>}/>
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, bottom: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <Field label="Confirm password *" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={v => set('confirmPassword', v)}
                  error={form.confirmPassword && form.password !== form.confirmPassword ? "Passwords don't match" : ''}/>
              </div>
            )}

            {/* ── STEP 1 Freelancer: Professional ── */}
            {step === 1 && role === 'freelancer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Lock size={13}/> Your company name is <strong>never shown</strong> to clients — only to admin for identity verification.
                </div>
                <Field label="Current job title *" placeholder='e.g. "Senior Software Engineer"' value={form.currentRole} onChange={v => set('currentRole', v)} icon={<Briefcase size={14}/>}/>
                <Field label="Current company *" placeholder='e.g. "Infosys" (kept private 🔒)' value={form.currentCompany} onChange={v => set('currentCompany', v)} icon={<Lock size={14}/>} hint="Never shown to clients"/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Total experience (years) *" type="number" placeholder="8" value={form.totalExp} onChange={v => set('totalExp', v)}/>
                  <Field label="Freelance experience (years)" type="number" placeholder="2" value={form.freelanceExp} onChange={v => set('freelanceExp', v)}/>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <Field label="Hourly rate *" type="number" placeholder="35" value={form.hourlyRate} onChange={v => set('hourlyRate', v)} icon={<span style={{fontSize:12,fontWeight:700,color:'#94a3b8'}}>{form.currency==='INR'?'₹':'$'}</span>}/>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Currency</label>
                    <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#374151' }}>
                      <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Timezone</label>
                  <select value={form.timezone} onChange={e => set('timezone', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#374151' }}>
                    {TIMEZONES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 6 }}>Professional bio (optional)</label>
                  <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} placeholder="Brief intro — shown to clients as your alias profile..." style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', background: '#fff', color: '#374151' }}/>
                </div>
              </div>
            )}

            {/* ── STEP 1 Client: Company ── */}
            {step === 1 && role === 'client' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Field label="Company name *" placeholder='e.g. "ABC Technologies Pvt Ltd"' value={form.companyName} onChange={v => set('companyName', v)} icon={<Briefcase size={14}/>}/>
                <Field label="Contact person name *" placeholder='e.g. "Priya Sharma"' value={form.contactName} onChange={v => set('contactName', v)} icon={<User size={14}/>}/>
                <Field label="GST number (optional)" placeholder="27AABCU9603R1ZV" value={form.gstNumber} onChange={v => set('gstNumber', v)} hint="For GST-compliant invoices"/>
              </div>
            )}

            {/* ── STEP 2 Freelancer: Availability ── */}
            {step === 2 && role === 'freelancer' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>Set when you're available for client work. This is shown to clients on the platform.</p>
                {availability.map((a, i) => (
                  <div key={a.day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, background: a.enabled ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${a.enabled ? '#86efac' : '#e2e8f0'}`, transition: 'all .2s' }}>
                    <button type="button" onClick={() => setAvailability(av => av.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))}
                      style={{ width: 40, height: 22, borderRadius: 11, background: a.enabled ? '#22c55e' : '#e2e8f0', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: a.enabled ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}/>
                    </button>
                    <span style={{ width: 32, fontWeight: 700, fontSize: 13, color: a.enabled ? '#15803d' : '#94a3b8' }}>{a.day}</span>
                    {a.enabled && (<>
                      <input type="time" value={a.start} onChange={e => setAvailability(av => av.map((x, j) => j === i ? { ...x, start: e.target.value } : x))}
                        style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}/>
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>to</span>
                      <input type="time" value={a.end} onChange={e => setAvailability(av => av.map((x, j) => j === i ? { ...x, end: e.target.value } : x))}
                        style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 8px', fontSize: 12, outline: 'none', fontFamily: 'inherit' }}/>
                    </>)}
                    {!a.enabled && <span style={{ fontSize: 12, color: '#d1d5db', marginLeft: 8 }}>Not available</span>}
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 3 Freelancer: Skills ── */}
            {step === 3 && role === 'freelancer' && (
              <div>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Select your top skills (pick at least 3):</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SKILLS_LIST.map(s => {
                    const sel = selectedSkills.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSkill(s)}
                        style={{ padding: '7px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: '1.5px solid', transition: 'all .15s',
                          background: sel ? '#0f172a' : '#fff',
                          color: sel ? '#fff' : '#64748b',
                          borderColor: sel ? '#0f172a' : '#e2e8f0',
                        }}>
                        {sel && <Check size={10} style={{ marginRight: 4, display: 'inline' }}/>}{s}
                      </button>
                    );
                  })}
                </div>
                {selectedSkills.length > 0 && (
                  <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                    ✅ {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected: {selectedSkills.slice(0, 5).join(', ')}{selectedSkills.length > 5 ? ` +${selectedSkills.length - 5} more` : ''}
                  </div>
                )}
              </div>
            )}

            {/* ── LAST STEP: Review + Terms ── */}
            {step === steps.length - 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Summary card */}
                <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '18px 20px' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a', marginBottom: 12 }}>Account summary</div>
                  {[
                    { label: 'Name', value: form.name },
                    { label: 'Email', value: form.email },
                    { label: 'Mobile', value: form.mobile },
                    { label: 'Role', value: role },
                    ...(role === 'freelancer' ? [
                      { label: 'Job title', value: form.currentRole },
                      { label: 'Company', value: `${form.currentCompany} (private 🔒)` },
                      { label: 'Rate', value: `${form.currency === 'INR' ? '₹' : '$'}${form.hourlyRate}/hr` },
                      { label: 'Skills', value: selectedSkills.slice(0, 3).join(', ') + (selectedSkills.length > 3 ? ` +${selectedSkills.length - 3}` : '') },
                    ] : [
                      { label: 'Company', value: form.companyName },
                      { label: 'Contact', value: form.contactName },
                    ]),
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: 13 }}>
                      <span style={{ color: '#94a3b8', fontWeight: 500 }}>{r.label}</span>
                      <span style={{ color: '#374151', fontWeight: 600, maxWidth: 240, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.value || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '14px', background: agreed ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${agreed ? '#86efac' : '#e2e8f0'}`, borderRadius: 14, transition: 'all .2s' }}>
                  <div onClick={() => setAgreed(!agreed)} style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${agreed ? '#22c55e' : '#e2e8f0'}`, background: agreed ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all .2s' }}>
                    {agreed && <Check size={12} style={{ color: '#fff' }}/>}
                  </div>
                  <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.6 }}>
                    I agree to the{' '}
                    <a href="/terms" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 700 }}>Terms & Conditions</a>
                    {' '}and{' '}
                    <a href="/privacy" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', fontWeight: 700 }}>Privacy Policy</a>.
                    {role === 'freelancer' && <span style={{ color: '#64748b' }}> I understand the 10–15% commission policy and anti-circumvention rules.</span>}
                    {role === 'client' && <span style={{ color: '#64748b' }}> I understand GST policy, payment obligations, and that bypassing platform billing is prohibited.</span>}
                  </span>
                </label>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              {step > 0 && (
                <button type="button" onClick={() => setStep(s => s - 1)}
                  style={{ flex: 1, padding: '14px', borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 14, fontWeight: 700, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <ArrowLeft size={16}/> Back
                </button>
              )}
              {step < steps.length - 1 ? (
                <button type="button" onClick={() => canNext() ? setStep(s => s + 1) : toast.error('Please fill required fields')}
                  style={{ flex: 1, padding: '14px', borderRadius: 16, border: 'none', background: canNext() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#e2e8f0', fontSize: 14, fontWeight: 800, color: canNext() ? '#fff' : '#94a3b8', cursor: canNext() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: canNext() ? '0 6px 20px rgba(79,70,229,0.3)' : 'none', transition: 'all .2s' }}>
                  Continue <ArrowRight size={16}/>
                </button>
              ) : (
                <button type="button" onClick={handleSubmit} disabled={loading || !agreed}
                  style={{ flex: 1, padding: '14px', borderRadius: 16, border: 'none', background: loading || !agreed ? '#e2e8f0' : 'linear-gradient(135deg,#f97316,#ef4444)', fontSize: 14, fontWeight: 800, color: loading || !agreed ? '#94a3b8' : '#fff', cursor: loading || !agreed ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: !agreed || loading ? 'none' : '0 6px 20px rgba(249,115,22,0.35)', transition: 'all .2s' }}>
                  {loading ? '⏳ Creating account...' : '🚀 Create account'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Input field component ────────────────────────────────────
const Field: React.FC<{
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string; error?: string;
  icon?: React.ReactNode;
}> = ({ label, value, onChange, placeholder, type = 'text', hint, error, icon }) => (
  <div>
    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      {icon && <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>{icon}</div>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: `11px ${icon ? '12px 12px 36px' : '14px'}`, paddingLeft: icon ? 36 : 14, border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fff', color: '#374151', transition: 'border .15s' }}
        onFocus={e => e.target.style.borderColor = error ? '#ef4444' : '#4f46e5'}
        onBlur={e => e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'}/>
    </div>
    {hint && !error && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</div>}
    {error && <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</div>}
  </div>
);

export default RegisterPage;
