import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ChevronRight, Lock, Plus, Loader2, ArrowLeft } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { UserRole } from '../../store/authStore';

const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const skillOptions = ['React','Node.js','AWS','Python','TypeScript','Docker','Kubernetes','SQL','MongoDB','GraphQL','Vue.js','Java','.NET','Go','Power BI','TensorFlow'];
const steps = ['Account','Professional','Availability','Submit'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forcedRole = searchParams.get('role') as 'freelancer' | 'client' | null;
  const { register, loginWithGoogle, isLoading } = useAuthStore();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<'freelancer' | 'client'>(forcedRole || 'freelancer');
  const [newSkill, setNewSkill] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [form, setForm] = useState({
    email:'', password:'', confirmPassword:'',
    name:'', mobileNumber:'',
    companyName:'', contactName:'',
    currentRole:'', currentCompany:'', totalExp:'', freelanceExp:'',
    skills:[] as string[], hourlyRate:'', currency:'USD', country:'India', timezone:'IST (UTC+5:30)', bio:'',
    availability: Object.fromEntries(days.map(d => [d, { available: false, startTime:'18:00', endTime:'22:00' }]))
  });

  const toggleSkill = (s: string) =>
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));
  const toggleDay  = (d: string) =>
    setForm(f => ({ ...f, availability: { ...f.availability, [d]: { ...f.availability[d], available: !f.availability[d].available } } }));

  const googleRegister = useGoogleLogin({
    onSuccess: async (resp) => {
      try {
        await loginWithGoogle(resp.access_token);
        const r = localStorage.getItem('userRole') as UserRole;
        navigate(r === 'admin' ? '/admin' : r === 'freelancer' ? '/freelancer' : '/client');
        toast.success('Welcome to WorkSupport360!');
      } catch { toast.error('Google sign-in failed'); }
    },
  });

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (role === 'freelancer' && !form.currentRole) { toast.error('Please fill your job title'); return; }
    try {
      // Build availability array from form state
      const availability = days.map(d => ({
        dayOfWeek:   d,
        isAvailable: form.availability[d].available,
        startTime:   form.availability[d].startTime || undefined,
        endTime:     form.availability[d].endTime   || undefined,
      }));

      await register({
        email:    form.email,
        password: form.password,
        name:     form.name,
        mobileNumber: form.mobileNumber || undefined,
        role,
        // Client fields
        companyName: role === 'client' ? form.companyName : undefined,
        contactName: role === 'client' ? form.contactName : undefined,
        // Freelancer fields — all sent now
        currentRole:    role === 'freelancer' ? form.currentRole    : undefined,
        currentCompany: role === 'freelancer' ? form.currentCompany : undefined,
        totalExp:       role === 'freelancer' ? parseInt(form.totalExp || '0') : undefined,
        freelanceExp:   role === 'freelancer' ? parseInt(form.freelanceExp || '0') : undefined,
        hourlyRate:     role === 'freelancer' ? parseFloat(form.hourlyRate || '0') : undefined,
        currency:       role === 'freelancer' ? form.currency  : undefined,
        timezone:       role === 'freelancer' ? form.timezone  : undefined,
        bio:            role === 'freelancer' ? form.bio       : undefined,
        skills:         role === 'freelancer' ? form.skills    : undefined,
        availability:   role === 'freelancer' ? availability   : undefined,
      } as any);

      // Show verify email notice — not just a toast
      toast.success(
        role === 'freelancer'
          ? '🎉 Account created! Check your email to verify your address. Admin will verify your identity shortly.'
          : '🎉 Account created! Check your email to verify your address.',
        { duration: 6000 }
      );
      navigate(role === 'freelancer' ? '/freelancer' : '/client');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    }
  };

  const canProceed = () => {
    if (step === 0) return form.email && form.password && form.confirmPassword && form.name;
    if (step === 1 && role === 'freelancer') return form.currentRole;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft size={14}/> Home
          </button>
          <div className="text-2xl font-bold text-blue-800">Work<span className="text-orange-500">Support</span>360</div>
          <div className="w-16"/>
        </div>
        <div className="text-center mb-6">
          <div className="text-gray-500 text-sm">Create your account — your employer never finds out</div>
        </div>

        {/* Steps */}
        <div className="flex items-center mb-8">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${i<step?'bg-green-600 text-white':i===step?'bg-blue-700 text-white':'bg-gray-200 text-gray-500'}`}>
                  {i < step ? <Check size={14}/> : i+1}
                </div>
                <div className={`text-xs mt-1 font-medium ${i===step?'text-blue-700':i<step?'text-green-600':'text-gray-400'}`}>{s}</div>
              </div>
              {i < steps.length-1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${i<step?'bg-green-400':'bg-gray-200'}`}/>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">

          {/* STEP 0 — Account */}
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>

              {/* Role */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                {(['freelancer','client'] as const).map(r => (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all capitalize
                      ${role===r?'border-blue-600 bg-blue-50 text-blue-700':'border-gray-100 text-gray-500 hover:border-gray-200'}`}>
                    {r === 'freelancer' ? '🧑‍💻 Freelancer' : '🏢 Client / Company'}
                  </button>
                ))}
              </div>

              {/* Google */}
              <button type="button" onClick={() => googleRegister()}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-all">
                <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Continue with Google
              </button>
              <div className="flex items-center gap-3"><div className="flex-1 h-px bg-gray-100"/><span className="text-xs text-gray-400">or email</span><div className="flex-1 h-px bg-gray-100"/></div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Full name *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your full name"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Mobile number <span className="text-gray-400 font-normal">(Admin uses this to contact you for scheduling)</span></label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50 shrink-0">+91</span>
                  <input value={form.mobileNumber} onChange={e=>setForm({...form,mobileNumber:e.target.value})} type="tel" placeholder="9999999999"
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div className="text-xs text-gray-400 mt-1">Admin calls this number to confirm meeting availability. Not shown to clients.</div>
              </div>
              {role === 'client' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1.5">Company name *</label>
                    <input value={form.companyName} onChange={e=>setForm({...form,companyName:e.target.value})} placeholder="Your company"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                  </div>
                </>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email address *</label>
                <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} type="email" placeholder="you@company.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Password *</label>
                  <input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} type="password" placeholder="Min 8 chars"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Confirm password *</label>
                  <input value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} type="password" placeholder="Repeat password"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
            </div>
          )}

          {/* STEP 1 — Professional (freelancer only) */}
          {step === 1 && role === 'freelancer' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Professional details</h2>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm">
                <Lock size={16} className="text-blue-600 shrink-0 mt-0.5"/>
                <div className="text-blue-800">Your <strong>current company is never shown to clients</strong>. You appear under a privacy alias only.</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Your job title *</label>
                  <input value={form.currentRole} onChange={e=>setForm({...form,currentRole:e.target.value})} placeholder="e.g. Senior Engineer"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Current company <span className="text-red-400">🔒 Private</span></label>
                  <input value={form.currentCompany} onChange={e=>setForm({...form,currentCompany:e.target.value})} placeholder="e.g. Infosys, TCS..."
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-red-50"/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Currency</label>
                  <select value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Hourly rate</label>
                  <input type="number" value={form.hourlyRate} onChange={e=>setForm({...form,hourlyRate:e.target.value})} placeholder="35"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Total exp (yrs)</label>
                  <input type="number" value={form.totalExp} onChange={e=>setForm({...form,totalExp:e.target.value})} placeholder="8"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Freelance exp (yrs)</label>
                  <input type="number" value={form.freelanceExp} onChange={e=>setForm({...form,freelanceExp:e.target.value})} placeholder="2"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Country</label>
                  <select value={form.country} onChange={e=>setForm({...form,country:e.target.value})} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                    <option>India</option><option>USA</option><option>Singapore</option><option>UK</option><option>UAE</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-2">Skills — select all that apply</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {skillOptions.map(s => (
                    <button key={s} type="button" onClick={() => toggleSkill(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        ${form.skills.includes(s)?'bg-blue-700 text-white border-blue-700':'border-gray-200 text-gray-600 hover:border-blue-200'}`}>{s}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newSkill} onChange={e=>setNewSkill(e.target.value)} placeholder="Add custom skill..."
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={e=>{ if(e.key==='Enter'&&newSkill){toggleSkill(newSkill);setNewSkill('');} }}/>
                  <button type="button" onClick={()=>{if(newSkill){toggleSkill(newSkill);setNewSkill('');}}}
                    className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-800"><Plus size={15}/></button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Bio (shown on profile)</label>
                <textarea rows={2} value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Describe your expertise..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"/>
              </div>
            </div>
          )}

          {/* STEP 1 — Client info */}
          {step === 1 && role === 'client' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Company details</h2>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Industry</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option>Technology</option><option>Fintech</option><option>E-commerce</option><option>Healthcare</option><option>SaaS</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Country</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
                  <option>India</option><option>USA</option><option>Singapore</option><option>UK</option><option>UAE</option><option>Other</option>
                </select>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
                <strong>What happens next:</strong> After registration, browse and request demos from our verified experts. Admin will confirm your first meeting within 4 hours.
              </div>
            </div>
          )}

          {/* STEP 2 — Availability (freelancer) */}
          {step === 2 && role === 'freelancer' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Set your availability</h2>
              <p className="text-sm text-gray-500">Clients see these slots on your profile. Update anytime.</p>
              <div className="grid grid-cols-7 gap-2">
                {days.map((d, i) => (
                  <div key={d} className="text-center">
                    <div className="text-xs text-gray-500 mb-1.5 font-medium">{dayLabels[i]}</div>
                    <button type="button" onClick={() => toggleDay(d)}
                      className={`w-full py-2 rounded-lg border-2 text-xs font-semibold transition-all
                        ${form.availability[d].available?'border-blue-600 bg-blue-50 text-blue-700':'border-gray-200 text-gray-400'}`}>
                      {form.availability[d].available ? 'On' : 'Off'}
                    </button>
                    {form.availability[d].available && (
                      <div className="mt-1.5 space-y-1">
                        <input type="time" value={form.availability[d].startTime}
                          onChange={e=>setForm(f=>({...f,availability:{...f.availability,[d]:{...f.availability[d],startTime:e.target.value}}}))}
                          className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"/>
                        <input type="time" value={form.availability[d].endTime}
                          onChange={e=>setForm(f=>({...f,availability:{...f.availability,[d]:{...f.availability[d],endTime:e.target.value}}}))}
                          className="w-full text-xs border border-gray-200 rounded px-1 py-1 focus:outline-none"/>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Client skip */}
          {step === 2 && role === 'client' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Almost there!</h2>
              <div className="bg-green-50 border border-green-100 rounded-xl p-5 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <div className="font-semibold text-green-900 mb-2">Ready to create your account</div>
                <div className="text-sm text-green-700">Click Submit to complete registration. You can browse and hire experts immediately.</div>
              </div>
            </div>
          )}

          {/* STEP 3 — Submit */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Review & submit</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{form.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium">{form.email}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{role}</span></div>
                {role === 'client' && form.companyName && <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{form.companyName}</span></div>}
                {role === 'freelancer' && form.currentRole && <div className="flex justify-between"><span className="text-gray-500">Job title</span><span className="font-medium">{form.currentRole}</span></div>}
                {form.skills.length > 0 && <div className="flex justify-between"><span className="text-gray-500">Skills</span><span className="font-medium">{form.skills.slice(0,4).join(', ')}{form.skills.length>4?` +${form.skills.length-4}`:''}</span></div>}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                By creating an account you agree to WorkSupport360's terms of service. Your employer will never be notified.
              </div>
            </div>
          )}

          {/* Navigation */}
          {/* Terms & Conditions — shown on last step only */}
          {step === steps.length - 1 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-gray-300 shrink-0" style={{ accentColor: '#f97316' }}/>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I have read and agree to the{' '}
                  <Link to="/terms" className="font-bold underline" style={{ color: '#f97316' }}>Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="font-bold underline" style={{ color: '#f97316' }}>Privacy Policy</Link>.
                  {role === 'freelancer' && <span className="text-gray-400"> Commission 10–15% on all projects. Direct billing outside platform is prohibited.</span>}
                  {role === 'client' && <span className="text-gray-400"> I understand payment terms, GST policy, and anti-circumvention rules.</span>}
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => step > 0 && setStep(s => s-1)}
              className={`text-sm px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 ${step===0?'invisible':''}`}>
              ← Back
            </button>
            {step < steps.length-1 ? (
              <button type="button" onClick={() => { if(canProceed()) setStep(s=>s+1); else toast.error('Please fill required fields'); }}
                className="flex items-center gap-2 bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800">
                Continue <ChevronRight size={16}/>
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={isLoading || !agreedToTerms}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 disabled:opacity-60">
                {isLoading ? <><Loader2 size={16} className="animate-spin"/>Creating...</> : <><Check size={16}/> Create account</>}
              </button>
            )}
          </div>
        </div>
        <div className="text-center mt-5 text-sm text-gray-500">
          Already have an account? <button onClick={()=>navigate('/login')} className="text-blue-600 font-medium hover:text-blue-800">Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
