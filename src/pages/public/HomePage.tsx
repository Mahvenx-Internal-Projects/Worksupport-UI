import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Star, Send, UserPlus, FileText,
  Clock, Users, TrendingUp, Award, Code2, Cloud, GitBranch,
  Database, Smartphone, Shield, Search,
  Globe, Lock, BarChart3, Terminal, Cpu, MapPin
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useFeaturedFreelancers, usePublicRequirements } from '../../hooks/useApi';
import SupportChatWidget from '../../components/SupportChatWidget';
import { publicApi } from '../../services/endpoints';
import toast from 'react-hot-toast';

/* ── Design tokens ─────────────────────────────────────────────
   Navy/slate dark theme — no orange anywhere
   Primary: #1e3a5f (deep navy)
   Accent:  #3b82f6 (electric blue)
   Surface: #0f172a (darkest)
   Mid:     #1e293b
   Light bg: #f8fafc
   Text:    #0f172a / #475569 / #94a3b8
──────────────────────────────────────────────────────────────── */

const IT_SKILLS = [
  { icon: <Code2 size={20}/>,      label: 'Frontend Dev',    sub: 'React, Vue, Angular, Next.js',       color: '#3b82f6', bg: '#eff6ff' },
  { icon: <Terminal size={20}/>,   label: 'Backend Dev',     sub: 'Node.js, Python, Java, Go, .NET',    color: '#6366f1', bg: '#eef2ff' },
  { icon: <Cloud size={20}/>,      label: 'Cloud / AWS',     sub: 'AWS, Azure, GCP, Terraform',         color: '#0891b2', bg: '#ecfeff' },
  { icon: <GitBranch size={20}/>,  label: 'DevOps / CI-CD',  sub: 'Docker, K8s, Jenkins, Ansible',      color: '#7c3aed', bg: '#f5f3ff' },
  { icon: <Database size={20}/>,   label: 'Data Engineering', sub: 'SQL, Spark, Kafka, Airflow',        color: '#059669', bg: '#ecfdf5' },
  { icon: <Smartphone size={20}/>, label: 'Mobile Dev',      sub: 'React Native, Flutter, iOS/Android', color: '#db2777', bg: '#fdf2f8' },
  { icon: <Shield size={20}/>,     label: 'QA / Testing',    sub: 'Selenium, Cypress, Playwright',      color: '#dc2626', bg: '#fef2f2' },
  { icon: <Cpu size={20}/>,        label: 'ML / AI',         sub: 'Python, TensorFlow, PyTorch',        color: '#d97706', bg: '#fffbeb' },
  { icon: <Database size={20}/>,   label: 'Database Admin',  sub: 'MySQL, PostgreSQL, MongoDB',         color: '#0369a1', bg: '#eff6ff' },
  { icon: <Globe size={20}/>,      label: 'Full-Stack',      sub: 'MERN, MEAN, Django, Laravel',        color: '#4f46e5', bg: '#eef2ff' },
  { icon: <Lock size={20}/>,       label: 'Cyber Security',  sub: 'Pen testing, VAPT, SOC',             color: '#b45309', bg: '#fffbeb' },
  { icon: <BarChart3 size={20}/>,  label: 'Data Science',    sub: 'Analysis, Power BI, Tableau',        color: '#0f766e', bg: '#f0fdf4' },
];

const HOURS = [
  { h:'1',      label:'1 Hour',   note:'Quick fix',     price:'from ₹500' },
  { h:'2',      label:'2 Hours',  note:'Code review',   price:'from ₹1,000' },
  { h:'4',      label:'Half Day', note:'Most popular',  price:'from ₹2,000', best:true },
  { h:'6',      label:'6 Hours',  note:'Deep work',     price:'from ₹3,000' },
  { h:'8',      label:'Full Day', note:'Sprint partner', price:'from ₹4,000' },
  { h:'custom', label:'Custom',   note:'Multi-day',     price:'Let\'s talk' },
];

const STATS = [
  { n:'1,240+', l:'Verified MNC engineers', icon:<Users size={18}/> },
  { n:'98%',    l:'Client satisfaction',    icon:<Star size={18}/> },
  { n:'Fast',  l:'Average match time',     icon:<Clock size={18}/> },
  { n:'₹2.4Cr', l:'Paid to freelancers',    icon:<TrendingUp size={18}/> },
];

const STEPS = [
  { n:'01', t:'Post your requirement',    d:'Describe the stack, problem, and hours needed. Takes under 2 minutes.' },
  { n:'02', t:'We match the right expert', d:'Admin reviews and assigns a background-verified MNC engineer promptly.' },
  { n:'03', t:'Expert joins live',         d:'Remote screen share or on-site — they debug, build, or architect alongside you.' },
  { n:'04', t:'Pay only for hours used',   d:'Billed by the hour. GST invoice. No retainer, no surprise fees.' },
];

const TESTIMONIALS = [
  { q:'Got a React expert soon who fixed a critical production bug our team had been stuck on for 3 days. Paid for 2 hours. Phenomenal value.', n:'Ramesh K.', c:'CTO · Fintech startup, Hyderabad', r:5 },
  { q:'Our Kubernetes cluster was down. A DevOps engineer joined within hours, diagnosed the issue live on a call, and had us back up in 90 minutes.', n:'Anjali R.', c:'VP Engineering · SaaS company, Bangalore', r:5 },
  { q:'I was skeptical about hourly freelancers, but this is completely different. The engineer was senior, focused, and delivered exactly what we scoped.', n:'Vikram S.', c:'Founder · E-commerce platform, Mumbai', r:5 },
];

const FAQS = [
  { q:'Are these real MNC employees or just freelancers?', a:'All experts are employed full-time at top MNCs — Infosys, TCS, Wipro, HCL, Cognizant, Accenture. They work with you during their evenings and weekends under a privacy alias. Their employer is never notified.' },
  { q:'How quickly can I get an expert?', a:'Most requests are matched and confirmed promptly. For urgent issues in metro cities, we can often arrange 1–2 hour turnarounds.' },
  { q:'What if the expert can\'t solve my problem?', a:'You pay only for productive time. If the session doesn\'t meet your expectations, flag it within 2soon and we\'ll either rematch you with another expert or issue a credit.' },
  { q:'Can I request the same expert again?', a:'Yes. You can request a specific expert by name for future bookings, subject to their availability.' },
  { q:'How does billing work?', a:'You\'re billed for actual hours worked. After the session, you receive a GST-compliant invoice. We support bank transfer, UPI, and corporate credit cards.' },
  { q:'Is there a monthly fee or subscription?', a:'None. Pure pay-as-you-go. Post a requirement when you need it, pay for what you use. No lock-in, no retainer.' },
];

const COMPANIES = ['Infosys','TCS','Wipro','HCL','Cognizant','Accenture','IBM','Capgemini','Tech Mahindra','Mphasis','Oracle','SAP'];

/* ── WS Logo component ─────────────────────────────────────── */
const WSLogo: React.FC<{ size?: number; dark?: boolean }> = ({ size = 36, dark = false }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.28),
    background: dark ? '#fff' : 'linear-gradient(135deg,#1e3a5f 0%,#3b82f6 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: dark ? 'none' : '0 4px 14px rgba(30,58,95,0.35)',
  }}>
    <span style={{
      fontWeight: 900, fontSize: Math.round(size * 0.35),
      color: dark ? '#1e3a5f' : '#fff',
      letterSpacing: '-0.05em', lineHeight: 1,
      fontFamily: 'system-ui, sans-serif',
    }}>WS</span>
  </div>
);

/* ── Post Requirement Form ───────────────────────────────────── */
const PostRequirementForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [form, setForm] = useState({
    skillset:'', hours:'', freelancerCount:'1', budgetMin:'', budgetMax:'',
    currency:'INR', duration:'', durationType:'months',
    workMode:'remote', jd:'', companyName:'', contactName:'',
  });
  const [jdFile, setJdFile] = useState<File|null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set2 = (k: string, v: string) => setForm(f=>({...f,[k]:v}));
  const inp2: React.CSSProperties = { width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:13,outline:'none',fontFamily:'inherit',background:'#fff',color:'#0f172a',transition:'border .15s',boxSizing:'border-box' as const };
  const onF2 = (e: any) => e.target.style.borderColor='#3b82f6';
  const onB2 = (e: any) => e.target.style.borderColor='#e2e8f0';

  const handleSubmit = async () => {
    if(!form.skillset||!form.hours||!form.budgetMin){ toast.error('Fill required fields'); return; }
    setSubmitting(true);
    try {
      await publicApi.contact({
        name: form.contactName||'Client',
        email: form.companyName+'@requirement.ws360',
        reason: 'post_requirement',
        message: `REQUIREMENT: ${form.skillset} | Hours: ${form.hours} | Freelancers: ${form.freelancerCount} | Budget: ${form.currency}${form.budgetMin}–${form.currency}${form.budgetMax} | Duration: ${form.duration} ${form.durationType} | Mode: ${form.workMode} | JD: ${form.jd}`,
      });
      setSubmitted(true);
    } catch { toast.error('Failed to submit. Please try again.'); }
    setSubmitting(false);
  };

  if(submitted) return (
    <div style={{ padding:'44px 28px',textAlign:'center' }}>
      <div style={{ width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',fontSize:32 }}>✓</div>
      <h3 style={{ fontWeight:900,fontSize:22,color:'#0f172a',margin:'0 0 10px' }}>Requirement submitted! 🎉</h3>
      <p style={{ fontSize:14,color:'#475569',lineHeight:1.75,margin:'0 0 20px' }}>Our admin team will review your requirement and post it for freelancers within <strong>soon</strong>. You'll receive a confirmation email once published.</p>
      <div style={{ background:'#f8fafc',borderRadius:16,padding:'16px',marginBottom:20,textAlign:'left' }}>
        {[
          {n:'1',t:'Admin reviews & approves',d:'Within 2 hours'},
          {n:'2',t:'Posted to freelancer job board',d:'Withsoon'},
          {n:'3',t:'Freelancers apply',d:'Within 2soon'},
          {n:'4',t:'Admin matches & assigns best fit',d:'Within 48 hours'},
        ].map(s=>(
          <div key={s.n} style={{ display:'flex',alignItems:'flex-start',gap:12,marginBottom:10 }}>
            <div style={{ width:24,height:24,borderRadius:'50%',background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0 }}>{s.n}</div>
            <div>
              <div style={{ fontSize:13,fontWeight:600,color:'#374151' }}>{s.t}</div>
              <div style={{ fontSize:11,color:'#94a3b8' }}>{s.d}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#fff',border:'none',fontSize:14,fontWeight:700,cursor:'pointer' }}>Done</button>
    </div>
  );

  return (
    <div style={{ padding:'22px 28px 28px',display:'flex',flexDirection:'column',gap:14 }}>

      {/* Skillset */}
      <div>
        <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Skillset / Technology Required <span style={{ color:'#ef4444' }}>*</span></label>
        <input value={form.skillset} onChange={e=>set2('skillset',e.target.value)} placeholder="e.g. React.js, Node.js, AWS — or describe the role"
          style={inp2} onFocus={onF2} onBlur={onB2}/>
        <div style={{ fontSize:10,color:'#94a3b8',marginTop:4 }}>Be specific — e.g. "React 18 + TypeScript + REST APIs"</div>
      </div>

      {/* Hours + Freelancer count */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Hours per engagement <span style={{ color:'#ef4444' }}>*</span></label>
          <select value={form.hours} onChange={e=>set2('hours',e.target.value)} style={{ ...inp2,cursor:'pointer' }} onFocus={onF2} onBlur={onB2}>
            <option value="">Select hours…</option>
            <option value="1">1 hour (Quick fix)</option>
            <option value="2">2 hours</option>
            <option value="4">soon (Half day)</option>
            <option value="8">8 hours (Full day)</option>
            <option value="20">20 hrs/week</option>
            <option value="40">40 hrs/week (Full time)</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Number of freelancers</label>
          <select value={form.freelancerCount} onChange={e=>set2('freelancerCount',e.target.value)} style={{ ...inp2,cursor:'pointer' }} onFocus={onF2} onBlur={onB2}>
            {['1','2','3','4','5','5+'].map(n=><option key={n} value={n}>{n} {n==='1'?'freelancer':'freelancers'}</option>)}
          </select>
        </div>
      </div>

      {/* Budget range */}
      <div>
        <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Budget Range <span style={{ color:'#ef4444' }}>*</span></label>
        <div style={{ display:'grid',gridTemplateColumns:'80px 1fr auto 1fr',gap:8,alignItems:'center' }}>
          <select value={form.currency} onChange={e=>set2('currency',e.target.value)} style={{ ...inp2,cursor:'pointer' }} onFocus={onF2} onBlur={onB2}>
            <option>INR</option><option>USD</option><option>EUR</option>
          </select>
          <input type="number" value={form.budgetMin} onChange={e=>set2('budgetMin',e.target.value)} placeholder="Min (e.g. 500)" style={inp2} onFocus={onF2} onBlur={onB2}/>
          <span style={{ textAlign:'center',color:'#94a3b8',fontSize:13 }}>to</span>
          <input type="number" value={form.budgetMax} onChange={e=>set2('budgetMax',e.target.value)} placeholder="Max (e.g. 1500)" style={inp2} onFocus={onF2} onBlur={onB2}/>
        </div>
        <div style={{ fontSize:10,color:'#94a3b8',marginTop:4 }}>Per hour rate. Freelancers will see this range when applying.</div>
      </div>

      {/* Duration */}
      <div>
        <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Engagement Duration</label>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 120px',gap:8 }}>
          <input type="number" value={form.duration} onChange={e=>set2('duration',e.target.value)} placeholder="e.g. 3" style={inp2} onFocus={onF2} onBlur={onB2}/>
          <select value={form.durationType} onChange={e=>set2('durationType',e.target.value)} style={{ ...inp2,cursor:'pointer' }} onFocus={onF2} onBlur={onB2}>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
            <option value="years">Years</option>
          </select>
        </div>
      </div>

      {/* Work mode */}
      <div>
        <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:8,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Work Mode</label>
        <div style={{ display:'flex',gap:8 }}>
          {[{v:'remote',l:'🌐 Remote / Virtual'},{v:'hybrid',l:'🏢 Hybrid'},{v:'onsite',l:'📍 On-site'}].map(m=>(
            <button key={m.v} type="button" onClick={()=>set2('workMode',m.v)}
              style={{ flex:1,padding:'10px 8px',borderRadius:11,border:`1.5px solid ${form.workMode===m.v?'#3b82f6':'#e2e8f0'}`,background:form.workMode===m.v?'#eff6ff':'#fff',color:form.workMode===m.v?'#1d4ed8':'#374151',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .15s' }}>
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* JD */}
      <div>
        <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Job Description / Requirement Details</label>
        <textarea value={form.jd} onChange={e=>set2('jd',e.target.value)} rows={4}
          placeholder="Describe the requirement in detail — what needs built/fixed, tech stack, expected output, experience needed"
          style={{ ...inp2, resize:'none' as any, lineHeight:1.65 }} onFocus={onF2} onBlur={onB2}/>
        <div style={{ fontSize:10,color:'#94a3b8',marginTop:4 }}>Or upload a JD file:
          <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={e=>setJdFile(e.target.files?.[0]||null)}
            style={{ marginLeft:8,fontSize:11 }}/>
          {jdFile&&<span style={{ color:'#059669',fontWeight:600 }}> ✓ {jdFile.name}</span>}
        </div>
      </div>

      {/* Company info */}
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>
        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Company name</label>
          <input value={form.companyName} onChange={e=>set2('companyName',e.target.value)} placeholder="ABC Technologies" style={inp2} onFocus={onF2} onBlur={onB2}/>
        </div>
        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:6,textTransform:'uppercase' as any,letterSpacing:'0.04em' }}>Contact person</label>
          <input value={form.contactName} onChange={e=>set2('contactName',e.target.value)} placeholder="Your name" style={inp2} onFocus={onF2} onBlur={onB2}/>
        </div>
      </div>

      {/* Notice */}
      <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:12,padding:'11px 14px',fontSize:12,color:'#15803d' }}>
        ✅ After submitting, admin reviews and publishes to the job board promptly. Freelancers then apply and admin assigns the best match to you.
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting}
        style={{ padding:'14px',borderRadius:13,background:submitting?'#f1f5f9':'linear-gradient(135deg,#059669,#10b981)',color:submitting?'#94a3b8':'#fff',border:'none',fontSize:15,fontWeight:700,cursor:submitting?'not-allowed':'pointer',boxShadow:submitting?'none':'0 4px 16px rgba(5,150,105,0.35)' }}>
        {submitting?'⏳ Submitting…':'📋 Submit Requirement'}
      </button>
    </div>
  );
};


export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [selH, setSelH] = useState('4');
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [skillSearch, setSkillSearch] = useState('');
  const [form, setForm] = useState({ name:'', email:'', mobile:'', countryCode:'+91', skill:'', note:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);

  const pageSize = 10;
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroExp, setHeroExp] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [jobSkillFilter, setJobSkillFilter] = useState('All');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');

// ── AI Chat Widget state ──────────────────────────────────────
  const [chatOpen, setChatOpen] = useState(false);

  // ── AI Requirement Expander state ────────────────────────────
  const [expandInput, setExpandInput]   = useState('');
  const [expandLoading, setExpandLoading] = useState(false);
  const [expandResult, setExpandResult] = useState<any>(null);


  const expandRequirement = async () => {
    if (!expandInput.trim()) return;
    setExpandLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('https://api.worksupport360.com/api/ai/expand-requirement', {
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ description: expandInput })
      });
      const data = await res.json();
      if (data.success) setExpandResult(data.requirement);
      else toast.error('Could not expand requirement');
    } catch { toast.error('AI service unavailable'); }
    finally { setExpandLoading(false); }
  };
  const { data: jobsData, isLoading: jobsLoading } = usePublicRequirements();
  const liveJobs: any[] = (jobsData as any)?.items ?? (Array.isArray(jobsData) ? jobsData as any[] : []);
  const [scrolled, setScrolled] = useState(false);

  const userRole = ((user?.role as string) || localStorage.getItem('userRole') || '').toLowerCase();
  const role = userRole;
  const dash = role==='admin'?'/admin':role==='freelancer'?'/freelancer':'/client';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: flData, isLoading: flLoading } = useFeaturedFreelancers({ page: 1, pageSize: 8 });
  const freelancers: any[] = flData?.items ?? flData?.data?.items ?? (Array.isArray(flData) ? flData : []);
  const filteredFreelancers = heroSearch
    ? freelancers.filter((f:any) => {
        const s = heroSearch.toLowerCase();
        const skills = Array.isArray(f.skills) ? f.skills.join(' ') : String(f.primarySkills||f.skills||'');
        return (f.currentRole||f.CurrentRole||'').toLowerCase().includes(s)
          || skills.toLowerCase().includes(s)
          || (f.userName||f.name||'').toLowerCase().includes(s);
      })
    : freelancers;
  const totalPages = Math.ceil(freelancers.length / pageSize);
  const pgStart = page * pageSize;

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.mobile || !form.skill) { toast.error('Please fill all required fields'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error('Enter a valid email address'); return; }
    if (form.mobile.length < 8) { toast.error('Enter a valid mobile number'); return; }
    setSubmitting(true);
    // Fire-and-forget — don't await email, respond to user instantly
    publicApi.contact({
      name: form.name,
      email: form.email,
      countryCode: form.countryCode,
      mobile: form.mobile,
      reason: 'it_support_enquiry',
      message: `Skill: ${form.skill} | Hours: ${selH} | Note: ${form.note}`,
    }).catch(() => {}); // ignore email errors
    // Show success immediately without waiting for email
    setSubmitted(true);
    setSubmitting(false);
  };

  const filteredSkills = IT_SKILLS.filter(s =>
    !skillSearch || s.label.toLowerCase().includes(skillSearch.toLowerCase()) ||
    s.sub.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e2e8f0',
    borderRadius: 12, fontSize: 14, outline: 'none', fontFamily: 'inherit',
    background: '#fff', color: '#0f172a', boxSizing: 'border-box', transition: 'border .15s',
  };
  const onF = (e: any) => e.target.style.borderColor = '#3b82f6';
  const onB = (e: any) => e.target.style.borderColor = '#e2e8f0';

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:"'Inter',system-ui,sans-serif", color:'#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;0,14..32,900;1,14..32,400&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .fu{animation:fadeUp .5s ease both}
        .fu2{animation:fadeUp .5s .1s ease both}
        .fu3{animation:fadeUp .5s .2s ease both}
        .card:hover{transform:translateY(-3px)!important;box-shadow:0 12px 32px rgba(59,130,246,0.12)!important;border-color:#bfdbfe!important}
        .skill-card:hover{transform:translateY(-2px)!important;box-shadow:0 8px 20px rgba(0,0,0,0.08)!important}
        .fl-card:hover{transform:translateY(-4px)!important;box-shadow:0 16px 40px rgba(15,23,42,0.12)!important;border-color:#bfdbfe!important}
        input::placeholder,textarea::placeholder{color:#9ca3af}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}
        section{scroll-margin-top:68px}
        a{text-decoration:none;color:inherit}
        @media(max-width:768px){
          .hide-desktop{display:flex!important}
          .grid-4{grid-template-columns:repeat(2,1fr)!important}
          .grid-3{grid-template-columns:1fr!important}
          .hide-mobile{display:none!important}
          .hero-grid{grid-template-columns:1fr!important}
          .mobile-col{flex-direction:column!important}
          .mobile-full{width:100%!important}
          .mobile-pad{padding:20px!important}
          .mobile-text-sm{font-size:14px!important}
          .mobile-hide{display:none!important}
        }
        @media(max-width:480px){
          .grid-4{grid-template-columns:1fr 1fr!important}
          .grid-3{grid-template-columns:1fr!important}
          .grid-2{grid-template-columns:1fr!important}
        }
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:300, height:68,
        background: scrolled ? 'rgba(255,255,255,0.98)' : '#fff',
        backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${scrolled ? '#e2e8f0' : '#f1f5f9'}`,
        display:'flex', alignItems:'center', padding:'0 clamp(12px,3vw,40px)',
        transition:'all .25s', boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth:1300, width:'100%', margin:'0 auto', display:'flex', alignItems:'center', gap:8 }}>
          {/* Logo */}
          <button onClick={()=>{ if(window.location.pathname==='/'){window.scrollTo({top:0,behavior:'smooth'});}else{navigate('/');} }} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0, marginRight:28, flexShrink:0 }}>
            <WSLogo size={36}/>
            <div>
              <span style={{ fontWeight:800, fontSize:17, color:'#0f172a', letterSpacing:'-0.04em' }}>
                WorkSupport<span style={{ color:'#3b82f6' }}> 360</span>
              </span>
            </div>
          </button>

          {/* Hamburger - mobile only */}
          <button onClick={()=>setMenuOpen(m=>!m)} className="hide-desktop"
            style={{ display:'none', background:'none', border:'none', cursor:'pointer', padding:4, marginLeft:'auto' }}>
            <div style={{ width:22, height:2, background:'#374151', marginBottom:5, borderRadius:2 }}/>
            <div style={{ width:22, height:2, background:'#374151', marginBottom:5, borderRadius:2 }}/>
            <div style={{ width:22, height:2, background:'#374151', borderRadius:2 }}/>
          </button>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
            {[['IT Experts','#experts'],['Find Work','#jobs'],['How it works','#how']].map(([l,h])=>(
              <a key={l} href={h} style={{ padding:'7px 14px', borderRadius:8, fontSize:14, fontWeight:500, color:'#475569', transition:'all .15s' }}
                onMouseEnter={e=>{(e.target as HTMLElement).style.color='#0f172a';(e.target as HTMLElement).style.background='#f8fafc';}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.color='#475569';(e.target as HTMLElement).style.background='transparent';}}>{l}</a>
            ))}
            <a href="#contact" onClick={e=>{e.preventDefault();document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});}}
              style={{ padding:'7px 16px', borderRadius:9, background:'linear-gradient(135deg,#dc2626,#ef4444)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', textDecoration:'none', display:'inline-block', marginLeft:8, animation:'contactPulse 2s ease-in-out infinite' }}>
              📞 Contact Us
            </a>
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {isAuthenticated ? (<>
              {userRole !== 'freelancer' && (
              <button onClick={()=>navigate('/post-requirement')} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(30,58,95,0.35)' }}>
                📋 Post Requirement
              </button>
              )}
              <button onClick={()=>{ const r=((user?.role as string)||localStorage.getItem('userRole')||'').toLowerCase(); navigate(r==='admin'?'/admin':r==='freelancer'?'/freelancer':'/client'); }} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 22px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(30,58,95,0.35)' }}>
                Dashboard →
              </button>
            </>) : (<>
              <button onClick={()=>navigate('/login')} style={{ padding:'9px 18px', borderRadius:10, background:'transparent', color:'#1e3a5f', border:'1.5px solid #1e3a5f', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                Sign in
              </button>
              <button onClick={()=>navigate('/register')} style={{ padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(30,58,95,0.35)' }}>
                Get started →
              </button>
            </>)}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ position:'fixed', top:68, left:0, right:0, background:'#fff', zIndex:299, borderBottom:'1px solid #e2e8f0', padding:'16px 20px', display:'flex', flexDirection:'column', gap:12, boxShadow:'0 8px 24px rgba(0,0,0,0.1)' }}>
          {[['IT Experts','#experts'],['Find Work','#jobs'],['How it works','#how'],['Contact Us','#contact']].map(([l,h])=>(
            <a key={l} href={h} onClick={()=>setMenuOpen(false)} style={{ fontSize:16, fontWeight:600, color:'#374151', padding:'8px 0', borderBottom:'1px solid #f1f5f9' }}>{l}</a>
          ))}
          {!isAuthenticated && (<>
            <button onClick={()=>{navigate('/login');setMenuOpen(false);}} style={{ padding:'12px', borderRadius:10, border:'1.5px solid #1e3a5f', background:'transparent', color:'#1e3a5f', fontSize:15, fontWeight:700, cursor:'pointer' }}>Sign in</button>
            <button onClick={()=>{navigate('/register');setMenuOpen(false);}} style={{ padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer' }}>Get started →</button>
          </>)}
          {isAuthenticated && (
            <button onClick={()=>{const r=userRole;navigate(r==='admin'?'/admin':r==='freelancer'?'/freelancer':'/client');setMenuOpen(false);}} style={{ padding:'12px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer' }}>Dashboard →</button>
          )}
        </div>
      )}

      {/* ══ HERO ══ */}
      <section style={{ paddingTop:68, background:'linear-gradient(160deg,#0a0f1e 0%,#0f1f3d 40%,#1a2a4a 70%,#0a0f1e 100%)', position:'relative', overflow:'hidden', minHeight:'100vh', display:'flex', flexDirection:'column' }}>

        {/* Animated background orbs */}
        <div style={{ position:'absolute', top:'10%', left:'5%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.12) 0%,transparent 70%)', filter:'blur(40px)', animation:'orbFloat 8s ease-in-out infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:'20%', right:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', filter:'blur(40px)', animation:'orbFloat 10s ease-in-out infinite reverse', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'10%', left:'30%', width:600, height:300, borderRadius:'50%', background:'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize:'32px 32px', pointerEvents:'none' }}/>

        <style>{`
          @keyframes orbFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-20px) scale(1.05)}}
          @keyframes heroPulse{0%,100%{opacity:1}50%{opacity:.4}}
          @keyframes scrollUp{0%{transform:translateY(0)}100%{transform:translateY(-50%)}}
          @keyframes scrollDown{0%{transform:translateY(-50%)}100%{transform:translateY(0)}}
          @keyframes wsGlow{0%,100%{box-shadow:0 0 20px rgba(30,58,95,0.4),0 0 40px rgba(59,130,246,0.1)}50%{box-shadow:0 0 40px rgba(59,130,246,0.7),0 0 80px rgba(59,130,246,0.2)}}
          @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
          @keyframes ticker{to{transform:translateX(-50%)}}
          @keyframes shimmer{0%{background-position:0% 50%}100%{background-position:200% 50%}}
          @keyframes contactPulse{0%,100%{opacity:1;box-shadow:0 2px 10px rgba(220,38,38,0.35)}50%{opacity:.82;box-shadow:0 4px 24px rgba(220,38,38,0.65)}}
          .hero-card{transition:transform .2s,box-shadow .2s}
          .hero-card:hover{transform:translateY(-2px)!important}
          .scroll-col-up{animation:scrollUp 20s linear infinite}
          .scroll-col-down{animation:scrollDown 20s linear infinite}
          .tag-btn:hover{background:rgba(255,255,255,0.18)!important;border-color:rgba(255,255,255,0.4)!important}
          .srch-inp:focus{outline:none}
        `}</style>

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'clamp(20px,4vw,44px) clamp(16px,4vw,40px) 0', position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column', gap:0 }}>

          {/* ── FREELANCER SEARCH — TOP ── */}
          <div style={{ animation:'fadeSlideUp .6s ease both', marginBottom:40 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:14 }}>
              <div style={{ height:1, flex:1, maxWidth:80, background:'rgba(255,255,255,0.1)' }}/>
              <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em', textTransform:'uppercase' }}>{(userRole||'').toLowerCase()==='freelancer'?'👨‍💻 Find Freelance IT Work':'🔍 Search IT Experts or Find Work'}</span>
              <div style={{ height:1, flex:1, maxWidth:80, background:'rgba(255,255,255,0.1)' }}/>
            </div>
            {/* Search pill */}
            <div style={{ maxWidth:820, margin:'0 auto', background:'rgba(255,255,255,0.97)', borderRadius:'clamp(12px,3vw,100px)', display:'flex', alignItems:'center', padding:'7px 7px 7px 16px', flexWrap:'wrap', boxShadow:'0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)', gap:0 }}>
              <Search size={17} color="#94a3b8" style={{ flexShrink:0 }}/>
              <input className="srch-inp" value={heroSearch} onChange={e=>setHeroSearch(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'){const t=(userRole||'').toLowerCase()==='freelancer'?'jobs':'experts';document.getElementById(t)?.scrollIntoView({behavior:'smooth'});}}}
                placeholder="Enter skills / designation / technology…"
                style={{ flex:1, border:'none', outline:'none', fontSize:15, color:'#0f172a', background:'transparent', fontFamily:'inherit', padding:'8px 14px' }}/>
              <div style={{ width:1, height:30, background:'#e2e8f0', margin:'0 4px', flexShrink:0 }}/>
              <select value={heroExp} onChange={e=>setHeroExp(e.target.value)}
                style={{ border:'none', outline:'none', fontSize:13, color:heroExp?'#0f172a':'#9ca3af', background:'transparent', fontFamily:'inherit', cursor:'pointer', padding:'8px 8px 8px 12px', minWidth:150 }}>
                <option value="">Select experience</option>
                {['0–1 yr (Fresher)','1–3 yrs','3–5 yrs','5–8 yrs','8–12 yrs','12+ yrs'].map(e=><option key={e}>{e}</option>)}
              </select>
              <div style={{ width:1, height:30, background:'#e2e8f0', margin:'0 4px', flexShrink:0 }}/>
              <select value={jobTypeFilter} onChange={e=>setJobTypeFilter(e.target.value)}
                style={{ border:'none', outline:'none', fontSize:13, color:jobTypeFilter&&jobTypeFilter!=='All'?'#0f172a':'#9ca3af', background:'transparent', fontFamily:'inherit', cursor:'pointer', padding:'8px 8px 8px 12px', minWidth:120 }}>
                <option value="All">All types</option>
                <option value="Hourly">⚡ Hourly</option>
                <option value="Day">☀️ Day</option>
                <option value="Monthly">📅 Monthly</option>
              </select>
              <button onClick={()=>{const t=(userRole||'').toLowerCase()==='freelancer'?'jobs':'experts';document.getElementById(t)?.scrollIntoView({behavior:'smooth'});}}
                style={{ flexShrink:0, padding:'12px 28px', borderRadius:100, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(30,58,95,0.45)', whiteSpace:'nowrap', marginLeft:4 }}>
                {(userRole||'').toLowerCase()==='freelancer' ? 'Find Work →' : 'Find Expert →'}
              </button>
            </div>
            {/* Popular tags */}
            <div style={{ display:'flex', gap:7, marginTop:13, flexWrap:'wrap', justifyContent:'center', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:600, marginRight:2 }}>Trending:</span>
              {['React.js','Node.js','AWS','DevOps','Python','Flutter','Java','.NET','Data Science','Kubernetes'].map(tag=>(
                <button key={tag} className="tag-btn" onClick={()=>{setHeroSearch(tag);const t=(userRole||'').toLowerCase()==='freelancer'?'jobs':'experts';document.getElementById(t)?.scrollIntoView({behavior:'smooth'});}}
                  style={{ padding:'4px 13px', borderRadius:100, background:heroSearch===tag?'rgba(30,58,95,0.35)':'rgba(255,255,255,0.07)', border:`1px solid ${heroSearch===tag?'rgba(59,130,246,0.7)':'rgba(255,255,255,0.12)'}`, color:heroSearch===tag?'#93c5fd':'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .18s' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:36, animation:'fadeSlideUp .7s .1s ease both' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
            <span style={{ fontSize:11, color:'rgba(255,255,255,0.2)', fontWeight:600, letterSpacing:'0.08em' }}>OR BROWSE & HIRE EXPERTS</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
          </div>

          {/* ── BADGE ── */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:16, animation:'fadeSlideUp .7s .15s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 18px', borderRadius:100, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(8px)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'heroPulse 2s ease infinite', display:'inline-block' }}/>
              <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.65)' }}>1,240+ MNC engineers · Available now · Admin-verified</span>
            </div>
          </div>

          {/* ── HEADLINE ── */}
          <div style={{ textAlign:'center', marginBottom:14, animation:'fadeSlideUp .7s .2s ease both' }}>
            <h1 style={{ fontSize:'clamp(1.6rem,5vw,3rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.05em', lineHeight:1.04, margin:'0 auto', maxWidth:860 }}>
              Hire IT Experts &amp;{' '}
              <span style={{ background:'linear-gradient(90deg,#60a5fa 0%,#a78bfa 50%,#60a5fa 100%)', backgroundSize:'200%', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', animation:'shimmer 4s linear infinite' }}>
                Find Freelance Work
              </span>
            </h1>
          </div>
          <p style={{ textAlign:'center', fontSize:20, color:'rgba(255,255,255,0.7)', lineHeight:1.75, maxWidth:580, margin:'0 auto 32px', animation:'fadeSlideUp .7s .25s ease both' }}>
            Businesses hire verified MNC engineers by the hour. IT professionals earn on their free time. Identity safe. Admin coordinated.
          </p>

          {/* ── 3 CTAs ── */}
          <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:44, flexWrap:'wrap', animation:'fadeSlideUp .7s .3s ease both' }}>
            <button onClick={()=>document.getElementById('experts')?.scrollIntoView({behavior:'smooth'})}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(30,58,95,0.4)' }}>
              🏢 Hire an Expert
            </button>
            <button onClick={()=>navigate('/post-requirement')}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:12, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(5,150,105,0.4)' }}>
              📋 Post Requirement
            </button>
            <button onClick={()=>document.getElementById('jobs')?.scrollIntoView({behavior:'smooth'})}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:12, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.9)', border:'1.5px solid rgba(255,255,255,0.2)', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              👨‍💻 Find IT Work
            </button>
          </div>

          {/* ── DUAL SCROLL ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 56px 1fr', gap:0, maxHeight:240, overflow:'hidden', position:'relative', animation:'fadeSlideUp .7s .35s ease both' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:48, background:'linear-gradient(to bottom,#0a0f1e,transparent)', zIndex:10, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:48, background:'linear-gradient(to top,#0a0f1e,transparent)', zIndex:10, pointerEvents:'none' }}/>

            {/* Left — requirements scroll up */}
            <div style={{ overflow:'hidden', height:240 }}>
              <div className="scroll-col-up">
                {[...Array(2)].flatMap(()=>[
                  {icon:'🔥',col:'#ef4444',bg:'rgba(239,68,68,0.15)',title:'Production Bug Fix — React',company:'FinTech Corp',skills:['React','TypeScript'],rate:'₹800/hr',tag:'Urgent'},
                  {icon:'☁️',col:'#7c3aed',bg:'rgba(124,58,237,0.15)',title:'AWS Infrastructure Setup',company:'StartupXYZ',skills:['AWS','Terraform'],rate:'₹5K/day',tag:'Day'},
                  {icon:'⚙️',col:'#059669',bg:'rgba(5,150,105,0.15)',title:'Backend Dev — Node.js APIs',company:'E-commerce Co.',skills:['Node.js','PostgreSQL'],rate:'₹2.5K/hr',tag:'Monthly'},
                  {icon:'📱',col:'#2563eb',bg:'rgba(37,99,235,0.15)',title:'Flutter App — UI Screens',company:'MobileFirst',skills:['Flutter','Firebase'],rate:'₹600/hr',tag:'Hourly'},
                  {icon:'🤖',col:'#d97706',bg:'rgba(217,119,6,0.15)',title:'ML Pipeline — NLP',company:'DataSoft',skills:['Python','TensorFlow'],rate:'₹4.5K/day',tag:'Day'},
                ]).map((j,i)=>(
                  <div key={i} className="hero-card" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'11px 13px', marginBottom:7, cursor:'pointer' }}
                    onClick={()=>document.getElementById('jobs')?.scrollIntoView({behavior:'smooth'})}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:6 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:j.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{j.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.title}</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{j.company}</div>
                      </div>
                      <span style={{ fontSize:8, fontWeight:800, padding:'2px 6px', borderRadius:4, background:j.bg, color:j.col, flexShrink:0 }}>{j.tag}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      {j.skills.map(s=><span key={s} style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }}>{s}</span>)}
                      <span style={{ fontSize:10, fontWeight:700, color:'#34d399', marginLeft:'auto' }}>{j.rate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Center WS */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', position:'relative', zIndex:5 }}>
              <div style={{ width:2, flex:1, background:'linear-gradient(to bottom,transparent,rgba(30,58,95,0.4),transparent)' }}/>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:10, color:'#fff', flexShrink:0, animation:'wsGlow 3s ease infinite', border:'1.5px solid rgba(59,130,246,0.5)', letterSpacing:'0.02em' }}>WS</div>
              <div style={{ width:2, flex:1, background:'linear-gradient(to bottom,transparent,rgba(124,58,237,0.4),transparent)' }}/>
            </div>

            {/* Right — experts scroll down */}
            <div style={{ overflow:'hidden', height:240 }}>
              <div className="scroll-col-down">
                {[...Array(2)].flatMap(()=>[
                  {name:'Rahul S.',role:'Senior React Dev',co:'ex-Infosys',skills:['React','TS'],rating:4.9,avail:true,col:'#3b82f6'},
                  {name:'Deepa N.',role:'QA Lead',co:'ex-TCS',skills:['Selenium','Playwright'],rating:4.7,avail:true,col:'#7c3aed'},
                  {name:'Arjun M.',role:'DevOps Lead',co:'ex-Wipro',skills:['AWS','K8s'],rating:4.8,avail:true,col:'#059669'},
                  {name:'Sneha R.',role:'.NET Developer',co:'ex-HCL',skills:['C#','Azure'],rating:4.6,avail:false,col:'#0891b2'},
                  {name:'Vikram S.',role:'Java Architect',co:'ex-Cognizant',skills:['Spring','Kafka'],rating:4.5,avail:true,col:'#d97706'},
                ]).map((f,i)=>(
                  <div key={i} className="hero-card" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'11px 13px', marginBottom:7, cursor:'pointer' }}
                    onClick={()=>document.getElementById('experts')?.scrollIntoView({behavior:'smooth'})}>
                    <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:5 }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:28, height:28, borderRadius:9, background:`linear-gradient(135deg,${f.col}88,${f.col})`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#fff' }}>{f.name[0]}</div>
                        {f.avail&&<div style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8, borderRadius:'50%', background:'#22c55e', border:'1.5px solid #0a0f1e' }}/>}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11, fontWeight:800, color:'#f1f5f9' }}>{f.name}</div>
                        <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>{f.role} · {f.co}</div>
                      </div>
                      <div style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>★ {f.rating}</div>
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      {f.skills.map(s=><span key={s} style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)' }}>{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column labels */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 56px 1fr', paddingTop:8, marginBottom:0 }}>
            <div style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em', textTransform:'uppercase' }}>🏢 Client Requirements</div>
            <div/>
            <div style={{ textAlign:'center', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em', textTransform:'uppercase' }}>👨‍💻 Available Experts</div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background:'rgba(0,0,0,0.4)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'12px 40px', marginTop:20 }}>
          <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'center' }}>
            {STATS.map((s,i)=>(
              <div key={s.l} style={{ flex:'1 1 150px', textAlign:'center', padding:'8px 20px', borderRight:i<STATS.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                <div style={{ fontWeight:900, fontSize:20, color:'#fff', letterSpacing:'-0.03em' }}>{s.n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker */}
        <div style={{ background:'rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.04)', padding:'8px 0', overflow:'hidden' }}>
          <div style={{ display:'flex', width:'max-content', animation:'ticker 28s linear infinite' }}>
            {[...COMPANIES,...COMPANIES].map((co,i)=>(
              <span key={i} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.18)', whiteSpace:'nowrap', padding:'0 22px', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {co}<span style={{ marginLeft:22, color:'rgba(255,255,255,0.06)' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

            {/* ══ EXPERTS ══ */}
      <section id="experts" style={{ padding:'clamp(40px,6vw,72px) clamp(16px,4vw,40px)', background:'#f8fafc' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Available now</p>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <h2 style={{ margin:0, fontSize:28, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>
                {heroSearch ? `Experts — "${heroSearch}"` : 'Verified IT Experts'}
              </h2>
              {heroSearch && <button onClick={()=>setHeroSearch('')} style={{ padding:'5px 12px', borderRadius:100, background:'#f1f5f9', border:'1.5px solid #e2e8f0', fontSize:12, fontWeight:600, color:'#64748b', cursor:'pointer' }}>✕ Clear</button>}
            </div>
            </div>
            <p style={{ margin:0, fontSize:13, color:'#64748b' }}>Click any card to view full profile</p>
          </div>

          {flLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
              {[...Array(10)].map((_,i)=>(
                <div key={i} style={{ background:'#fff', borderRadius:16, height:180, border:'1.5px solid #f1f5f9', backgroundImage:'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize:'400% 100%', animation:'shimmer 1.4s linear infinite' }}/>
              ))}
            </div>
          ) : filteredFreelancers.length===0 ? (
            <div style={{ textAlign:'center', padding:'48px', background:'#fff', borderRadius:20, border:'1.5px solid #f1f5f9' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>👨‍💻</div>
              <p style={{ fontWeight:700, fontSize:16, color:'#374151', marginBottom:8 }}>Verified experts joining soon</p>
              <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>Register as Expert</button>
            </div>
          ) : (<>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:14 }}>
              {(freelancers as any[]).slice(pgStart, pgStart+pageSize).map((f:any,i:number)=>{
                const grads=['linear-gradient(135deg,#1e3a5f,#3b82f6)','linear-gradient(135deg,#7c3aed,#a855f7)','linear-gradient(135deg,#059669,#10b981)','linear-gradient(135deg,#0891b2,#06b6d4)','linear-gradient(135deg,#1d4ed8,#6366f1)','linear-gradient(135deg,#15803d,#059669)','linear-gradient(135deg,#be185d,#ec4899)','linear-gradient(135deg,#b45309,#f59e0b)'];
                const name=f.userName||f.UserName||f.name||f.Name||'Expert';
                const role2=f.currentRole||f.CurrentRole||'IT Professional';
                const rate=f.hourlyRate||f.HourlyRate||'—';
                const cur=(f.currency||f.Currency)==='INR'?'₹':'$';
                const rating=+(f.rating||f.Rating||4.9).toFixed(1);
                const projects=f.completedProjects||f.CompletedProjects||0;
                const skills=(f.primarySkills||f.skills||f.Skills||[]);
                const skillArr=Array.isArray(skills)?skills.slice(0,3):String(skills).split(',').map((s:string)=>s.trim()).slice(0,3);
                const photo = f.photoUrl || f.PhotoUrl || f.photo || f.Photo || null;
                const avail=f.isAvailable||f.IsAvailable;
                const grad=grads[(name.charCodeAt(0)||0)%grads.length];
                return (
                  <div key={f.id||f.UserId||i}
                    onClick={()=>{ window.open(`/expert/${f.id||f.UserId}`, '_blank'); }}
                    style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 6px rgba(0,0,0,0.05)', transition:'all .22s', cursor:'pointer' }}
                    onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 28px rgba(59,130,246,0.12)';e.currentTarget.style.borderColor='#bfdbfe';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 6px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor='#f1f5f9';}}>
                    {/* Color bar */}
                    <div style={{ height:5, background:grad }}/>
                    <div style={{ padding:'14px 14px 12px' }}>
                      {/* Avatar + rate */}
                      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ position:'relative' }}>
                          {photo
                            ? <img src={photo} alt={name} style={{ width:44, height:44, borderRadius:12, objectFit:'cover' }}
                onError={e=>{
                  const el = e.target as HTMLImageElement;
                  el.style.display='none';
                  const parent = el.parentElement;
                  if(parent){
                    const div = document.createElement('div');
                    div.style.cssText=`width:44px;height:44px;border-radius:12px;background:${grad};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:#fff`;
                    div.textContent=name[0]?.toUpperCase()||'E';
                    parent.appendChild(div);
                  }
                }}/>
                            : <div style={{ width:44, height:44, borderRadius:12, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:18, color:'#fff' }}>{name[0]?.toUpperCase()}</div>
                          }
                          {avail&&<div style={{ position:'absolute', bottom:-2, right:-2, width:11, height:11, borderRadius:'50%', background:'#22c55e', border:'2px solid #fff' }}/>}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div style={{ fontWeight:900, fontSize:17, color:'#0f172a', letterSpacing:'-0.02em', lineHeight:1 }}>{cur}{rate}</div>
                          <div style={{ fontSize:10, color:'#94a3b8' }}>/hr</div>
                        </div>
                      </div>
                      {/* Name + role */}
                      <div style={{ fontWeight:800, fontSize:13, color:'#0f172a', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginBottom:8, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{role2}</div>
                      {/* Rating */}
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:9, fontSize:11 }}>
                        <span style={{ color:'#f59e0b', fontWeight:800 }}>★ {rating}</span>
                        {projects>0&&<span style={{ color:'#94a3b8' }}>· {projects} jobs</span>}
                      </div>
                      {/* Skills */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                        {skillArr.map((s:string)=><span key={s} style={{ fontSize:10, padding:'2px 7px', borderRadius:6, background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', fontWeight:500 }}>{s}</span>)}
                      </div>
                      {/* Hire button */}
                      <button
                        onClick={ev=>{
                          ev.stopPropagation();
                          window.open(`/expert/${f.id||f.UserId}`, '_blank');
                        }}
                        style={{ width:'100%', padding:'8px', borderRadius:9, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', transition:'all .2s' }}>
                        View & Hire →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginTop:28 }}>
                <button onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}
                  style={{ padding:'9px 18px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:page===0?'not-allowed':'pointer', opacity:page===0?.4:1 }}>← Prev</button>
                {Array.from({length:totalPages},(_,i)=>i).map(i=>(
                  <button key={i} onClick={()=>setPage(i)}
                    style={{ width:36, height:36, borderRadius:9, border:`1.5px solid ${page===i?'#3b82f6':'#e2e8f0'}`, background:page===i?'#3b82f6':'#fff', color:page===i?'#fff':'#374151', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                    {i+1}
                  </button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}
                  style={{ padding:'9px 18px', borderRadius:10, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:13, fontWeight:600, color:'#374151', cursor:page===totalPages-1?'not-allowed':'pointer', opacity:page===totalPages-1?.4:1 }}>Next →</button>
              </div>
            )}
            <p style={{ textAlign:'center', marginTop:12, fontSize:12, color:'#94a3b8' }}>
              Showing {pgStart+1}–{Math.min(pgStart+pageSize, filteredFreelancers.length)} of {filteredFreelancers.length} experts · Click any card to view full profile
            </p>
          </>)}

        </div>
      </section>
      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,40px)', background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, borderRadius:'50%', background:'rgba(59,130,246,0.06)', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1300, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#60a5fa', letterSpacing:'0.08em', textTransform:'uppercase' }}>Four steps</p>
            <h2 style={{ margin:'0 0 10px', fontSize:34, fontWeight:900, color:'#fff', letterSpacing:'-0.04em' }}>From requirement to live expert soon</h2>
            <p style={{ margin:0, fontSize:15, color:'rgba(255,255,255,0.45)' }}>Admin-verified. MNC-verified. No middlemen.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }} className="grid-4">
            {STEPS.map((s,i)=>(
              <div key={i} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'28px 22px', position:'relative', transition:'all .22s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(59,130,246,0.1)';e.currentTarget.style.borderColor='rgba(59,130,246,0.25)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';}}>
                <div style={{ fontSize:11, fontWeight:900, color:'rgba(59,130,246,0.5)', letterSpacing:'0.06em', marginBottom:16 }}>{s.n}</div>
                <h3 style={{ fontWeight:800, fontSize:15, color:'#fff', margin:'0 0 8px' }}>{s.t}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10, marginTop:44 }}>
            {['🔒 MNC-verified','🧾 GST invoice','⚡ 4-hr match','💳 Pay per hour','📹 Remote or on-site','🔄 Easy rebooking','🛡️ Identity protected'].map(f=>(
              <span key={f} style={{ padding:'8px 16px', borderRadius:100, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.65)' }}>{f}</span>
            ))}
          </div>
        </div>
      </section>



      {/* ══ JOB BOARD ══ */}
      <section id="jobs" style={{ padding:'clamp(40px,6vw,72px) clamp(16px,4vw,40px)', background:'#fff' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Open Requirements</p>
              <h2 style={{ margin:'0 0 4px', fontSize:26, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Freelance IT Work</h2>
              <p style={{ margin:0, fontSize:13, color:'#64748b' }}>Admin-approved client requirements · freelancers only can apply</p>
            </div>
            <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'9px 20px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              Register to Apply →
            </button>
          </div>

          {jobsLoading ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#94a3b8' }}>Loading requirements…</div>
          ) : liveJobs.length === 0 ? (
            <div style={{ textAlign:'center', padding:'48px 20px', background:'#f8fafc', borderRadius:18, border:'1.5px dashed #e2e8f0' }}>
              <div style={{ fontSize:44, marginBottom:12 }}>📋</div>
              <p style={{ fontWeight:700, color:'#374151', marginBottom:6 }}>No open requirements right now</p>
              <p style={{ fontSize:13, color:'#94a3b8' }}>New client requirements are posted daily after admin approval. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
              {liveJobs.map((job:any)=>{
                const skills = (job.skillsRequired||'').split(',').map((s:string)=>s.trim()).filter(Boolean);
                const isUrgent = job.urgency === 'urgent';
                const hrs = parseInt(job.hoursPerEngagement||'0');
                const typeLabel = hrs >= 8 ? 'Day' : hrs >= 20 ? 'Monthly' : 'Hourly';
                const typeCol = typeLabel==='Hourly'?{c:'#2563eb',bg:'#eff6ff'}:typeLabel==='Day'?{c:'#7c3aed',bg:'#f5f3ff'}:{c:'#059669',bg:'#ecfdf5'};
                const h = job.createdAt ? Math.round((Date.now()-new Date(job.createdAt).getTime())/3600000) : 0;
                const postedAgo = h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : `${Math.floor(h/24)}d ago`;
                return (
                  <div key={job.id} style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:18, padding:'20px 22px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all .22s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.boxShadow='0 8px 24px rgba(59,130,246,0.08)';e.currentTarget.style.transform='translateY(-2px)';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.04)';e.currentTarget.style.transform='none';}}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:'#fff', flexShrink:0 }}>{(job.companyName||'C')[0]}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:800, fontSize:14, color:'#0f172a' }}>{job.title}</div>
                        <div style={{ fontSize:11, color:'#64748b' }}>{job.companyName||'Company'} · {postedAgo}</div>
                      </div>
                      {isUrgent&&<span style={{ fontSize:10, fontWeight:800, padding:'2px 8px', borderRadius:6, background:'#fef2f2', color:'#dc2626', border:'1px solid #fca5a5' }}>🔥 URGENT</span>}
                    </div>
                    {job.description&&<p style={{ fontSize:12, color:'#475569', lineHeight:1.65, margin:'0 0 10px' }}>{job.description.slice(0,140)}{job.description.length>140?'…':''}</p>}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:10 }}>
                      {skills.slice(0,4).map((s:string)=><span key={s} style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1d4ed8', fontWeight:600 }}>{s}</span>)}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:10, fontSize:11, color:'#64748b', marginBottom:12 }}>
                      <span>🌐 {job.workMode||'Remote'}</span>
                      <span>⏱ {job.hoursPerEngagement}hrs</span>
                      <span style={{ fontWeight:700, color:'#059669' }}>💰 {job.currency}{job.budgetMin}–{job.currency}{job.budgetMax}/hr</span>
                      <span style={{ padding:'2px 7px', borderRadius:5, background:typeCol.bg, color:typeCol.c, fontWeight:700 }}>{typeLabel==='Hourly'?'⚡ Hourly':typeLabel==='Day'?'☀️ Day':'📅 Monthly'}</span>
                    </div>
                    <button onClick={()=>{
                      if(!isAuthenticated){ navigate('/login?returnTo=/'); return; }
                      if(userRole!=='freelancer'){ toast.error('Only freelancers can apply',{icon:'🚫'}); return; }
                      toast.success('Application submitted! Admin will contact you promptly.',{icon:'✅'});
                    }}
                      style={{ width:'100%', padding:'10px', borderRadius:11, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      {isAuthenticated&&userRole==='freelancer'?'Apply Now →':'Login as Freelancer to Apply'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Register CTA */}
          <div style={{ background:'linear-gradient(135deg,#f8fafc,#eff6ff)', border:'1.5px solid #bfdbfe', borderRadius:16, padding:'16px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginTop:16 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:3 }}>More jobs posted every day</div>
              <div style={{ fontSize:13, color:'#64748b' }}>Register as a freelancer to see all requirements and get notified via WhatsApp.</div>
            </div>
            <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'10px 20px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
              Join Now →
            </button>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,40px)', background:'#f8fafc' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Client stories</p>
            <h2 style={{ margin:0, fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Trusted by 500+ tech teams</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }} className="grid-3">
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="card" style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:20, padding:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all .22s' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>{[1,2,3,4,5].map(s=><Star key={s} size={14} fill="#f59e0b" color="#f59e0b"/>)}</div>
                <p style={{ fontSize:14, color:'#374151', lineHeight:1.78, margin:'0 0 20px', fontStyle:'italic' }}>"{t.q}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:18, borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, color:'#fff' }}>{t.n[0]}</div>
                  <div><div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{t.n}</div><div style={{ fontSize:11, color:'#64748b' }}>{t.c}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══ AI FEATURES ══ */}
      <section style={{ padding:'80px 40px', background:'linear-gradient(180deg,#fff 0%,#f8fafc 100%)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', borderRadius:100, background:'linear-gradient(135deg,#eff6ff,#f5f3ff)', border:'1px solid #bfdbfe', marginBottom:14 }}>
              <span style={{ fontSize:16 }}>🤖</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#1d4ed8', letterSpacing:'0.06em' }}>AI-POWERED PLATFORM</span>
            </div>
            <h2 style={{ fontSize:'clamp(1.8rem,3vw,2.6rem)', fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em', margin:'0 0 12px' }}>
              Intelligence Built Into Every Step
            </h2>
            <p style={{ fontSize:16, color:'#64748b', maxWidth:520, margin:'0 auto', lineHeight:1.75 }}>
              AI assists clients, freelancers, and admins — making every interaction smarter, faster, and more accurate.
            </p>
          </div>

          {/* 5 AI feature cards */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, marginBottom:52 }}>
            {[
              {
                icon:'💬', color:'#2563eb', bg:'#eff6ff', border:'#bfdbfe',
                title:'AI Support Chat',
                desc:'Get instant answers 24/7. Ask about pricing, how the platform works, or get help posting requirements. Handles 80% of questions without admin.',
                tag:'Live below ↓', role:'Everyone'
              },
              {
                icon:'✍️', color:'#059669', bg:'#ecfdf5', border:'#86efac',
                title:'Smart Requirement Writer',
                desc:'Type a rough description — AI expands it into a full structured requirement with skills, budget, JD, and timeline. Perfect requirements every time.',
                tag:'For Clients', role:'Clients'
              },
              {
                icon:'🎯', color:'#7c3aed', bg:'#f5f3ff', border:'#c4b5fd',
                title:'Expert Matching Engine',
                desc:'AI reads requirements and scores all available freelancers by skill match, experience, rate fit, and rating — admin just confirms the top match.',
                tag:'Admin Tool', role:'Admin'
              },
              {
                icon:'📈', color:'#d97706', bg:'#fffbeb', border:'#fde68a',
                title:'Profile Optimizer',
                desc:'AI reviews your freelancer profile and suggests better bio, missing skills, optimal rate based on market data, and profile tips to get more matches.',
                tag:'For Freelancers', role:'Freelancers'
              },
              {
                icon:'📊', color:'#dc2626', bg:'#fef2f2', border:'#fca5a5',
                title:'Admin Intelligence',
                desc:'Daily AI summaries highlight pending actions, platform health, revenue trends, and bottlenecks. Admin sees insights instead of raw numbers.',
                tag:'Admin Dashboard', role:'Admin'
              },
            ].map(f=>(
              <div key={f.title} style={{ background:'#fff', border:`1.5px solid ${f.border}`, borderRadius:20, padding:'24px', boxShadow:'0 4px 16px rgba(0,0,0,0.04)', transition:'transform .2s, box-shadow .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:12 }}>
                  <div style={{ width:44, height:44, borderRadius:13, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{f.icon}</div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:100, background:f.bg, color:f.color, border:`1px solid ${f.border}` }}>{f.tag}</span>
                </div>
                <h3 style={{ fontWeight:800, fontSize:17, color:'#0f172a', margin:'0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'#64748b', lineHeight:1.7, margin:0 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* AI Requirement Expander — demo */}
          {isAuthenticated && (userRole === 'client' || userRole === 'admin') && (
            <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:24, padding:'36px 40px', color:'#fff' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16, marginBottom:24 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:'rgba(59,130,246,0.2)', border:'1px solid rgba(30,58,95,0.35)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>✍️</div>
                <div>
                  <h3 style={{ fontWeight:900, fontSize:20, margin:'0 0 4px', letterSpacing:'-0.02em' }}>AI Requirement Writer</h3>
                  <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, margin:0 }}>Describe what you need in plain language — AI builds the full requirement</p>
                </div>
              </div>
              <textarea value={expandInput} onChange={e=>setExpandInput(e.target.value)}
                placeholder='e.g. "I need a React developer to fix a production bug in my dashboard app, urgent, 1 day, around 8 hours"'
                style={{ width:'100%', background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:14, padding:'14px 16px', color:'#fff', fontSize:14, lineHeight:1.7, resize:'none', outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const, minHeight:80 }}/>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginTop:12 }}>
                <button onClick={expandRequirement} disabled={!expandInput.trim() || expandLoading}
                  style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px', borderRadius:12, background:expandLoading?'#374151':'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', opacity: !expandInput.trim() ? 0.5 : 1 }}>
                  {expandLoading ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⏳</span> Expanding…</> : '✨ Expand with AI →'}
                </button>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.35)' }}>Takes ~3 seconds</span>
              </div>
              {expandResult && (
                <div style={{ marginTop:20, background:'rgba(255,255,255,0.06)', borderRadius:16, padding:'20px', border:'1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#34d399', marginBottom:12, letterSpacing:'0.06em' }}>✅ AI-GENERATED REQUIREMENT</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
                    {[
                      ['Title', expandResult.title],
                      ['Skills', expandResult.skillsRequired],
                      ['Hours', expandResult.hoursPerEngagement+'hrs'],
                      ['Budget', `${expandResult.currency}${expandResult.budgetMin}–${expandResult.currency}${expandResult.budgetMax}/hr`],
                      ['Mode', expandResult.workMode],
                      ['Urgency', expandResult.urgency],
                    ].map(([l,v])=>(
                      <div key={l} style={{ background:'rgba(255,255,255,0.05)', borderRadius:10, padding:'10px 12px' }}>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:3, textTransform:'uppercase' as const, letterSpacing:'0.06em' }}>{l}</div>
                        <div style={{ fontSize:13, color:'#f1f5f9', fontWeight:600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  {expandResult.description && <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', lineHeight:1.7, marginTop:12 }}>{expandResult.description}</p>}
                  <button onClick={()=>{ navigate('/post-requirement'); }}
                    style={{ marginTop:14, padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                    Post This Requirement →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ══ CONTACT FORM ══ */}
      <section id="contact" style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,40px)', background:'#fff' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px', borderRadius:100, background:'#fef2f2', border:'1px solid #fca5a5', marginBottom:14 }}>
              <span style={{ fontSize:14 }}>📞</span>
              <span style={{ fontSize:12, fontWeight:700, color:'#dc2626', letterSpacing:'0.06em', textTransform:'uppercase' as const }}>Contact Us</span>
            </div>
            <h2 style={{ margin:'0 0 8px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Get in Touch</h2>
            <p style={{ margin:0, fontSize:15, color:'#64748b' }}>Tell us your requirement — we'll match you with the right expert</p>
          </div>

          {submitted ? (
            <div style={{ background:'linear-gradient(135deg,#eff6ff,#f0fdf4)', border:'2px solid #bfdbfe', borderRadius:24, padding:'52px', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:32, boxShadow:'0 6px 20px rgba(30,58,95,0.35)' }}>✓</div>
              <h3 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 10px' }}>Requirement received!</h3>
              <p style={{ fontSize:15, color:'#475569', lineHeight:1.7, margin:0 }}>Our admin team will match you with a verified engineer and contact you promptly on WhatsApp or mobile.</p>
            </div>
          ) : (
            <form onSubmit={handleEnquiry} style={{ background:'#f8fafc', borderRadius:24, padding:'36px', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:16, boxShadow:'0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your Name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" required style={inp} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Email Address *</label>
                  <input type="email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@company.com" required style={inp} onFocus={onF} onBlur={onB}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Mobile / WhatsApp *</label>
                <div style={{ display:'flex', gap:8 }}>
                  <select value={form.countryCode||'+91'} onChange={e=>setForm({...form,countryCode:e.target.value})}
                    style={{ width:110, padding:'10px 8px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:13, outline:'none', fontFamily:'inherit', background:'#fff', cursor:'pointer' }}
                    onFocus={onF} onBlur={onB}>
                    {[{c:'+91',l:'🇮🇳 +91'},{c:'+1',l:'🇺🇸 +1'},{c:'+44',l:'🇬🇧 +44'},{c:'+65',l:'🇸🇬 +65'},{c:'+971',l:'🇦🇪 +971'},{c:'+61',l:'🇦🇺 +61'},{c:'+49',l:'🇩🇪 +49'},{c:'+33',l:'🇫🇷 +33'}].map(x=>(
                      <option key={x.c} value={x.c}>{x.l}</option>
                    ))}
                  </select>
                  <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value.replace(/\D/g,'')})}
                    placeholder="9876543210" required maxLength={12} style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB}/>
                </div>
                {form.mobile && form.mobile.length < 8 && <div style={{ fontSize:11, color:'#ef4444', marginTop:4 }}>Enter a valid mobile number</div>}
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>IT Skill / Technology *</label>
                <select value={form.skill} onChange={e=>setForm({...form,skill:e.target.value})} required style={{ ...inp, appearance:'none', cursor:'pointer' }} onFocus={onF} onBlur={onB}>
                  <option value="">Select skill or technology…</option>
                  {IT_SKILLS.map(s=><option key={s.label}>{s.label} — {s.sub}</option>)}
                  <option>Other (describe below)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.04em' }}>Hours needed</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {HOURS.map(h=>(
                    <button key={h.h} type="button" onClick={()=>setSelH(h.h)}
                      style={{ padding:'9px 16px', borderRadius:10, border:`1.5px solid ${selH===h.h?'#3b82f6':'#e2e8f0'}`, background:selH===h.h?'#eff6ff':'#fff', color:selH===h.h?'#1d4ed8':'#374151', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s' }}>
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Describe the problem / task</label>
                <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} rows={3}
                  placeholder="e.g. Need a React developer to debug a performance issue in our dashboard — production app, urgent. Stack: React 18, TypeScript, Node.js backend."
                  style={{ ...inp, resize:'none', lineHeight:1.65 }} onFocus={onF} onBlur={onB}/>
              </div>
              <button type="submit" disabled={submitting}
                style={{ padding:'15px', borderRadius:14, background:submitting?'#f1f5f9':'linear-gradient(135deg,#dc2626,#ef4444)', color:submitting?'#94a3b8':'#fff', border:'none', fontSize:15, fontWeight:700, cursor:submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:submitting?'none':'0 6px 20px rgba(220,38,38,0.35)' }}>
                <Send size={16}/> {submitting?'Sending…':'Send Message 📞'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding:'clamp(40px,6vw,80px) clamp(16px,4vw,40px)', background:'#f8fafc' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Got questions?</p>
            <h2 style={{ margin:0, fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Frequently Asked</h2>
          </div>
          {FAQS.map((f,i)=>(
            <div key={i} style={{ background:'#fff', border:`1.5px solid ${faqOpen===i?'#bfdbfe':'#e2e8f0'}`, borderRadius:16, overflow:'hidden', marginBottom:10, transition:'all .2s', boxShadow:faqOpen===i?'0 4px 16px rgba(59,130,246,0.08)':'0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:12 }}>
                <span style={{ fontSize:14, fontWeight:700, color:faqOpen===i?'#1d4ed8':'#1e293b' }}>{f.q}</span>
                <span style={{ fontSize:20, color:'#94a3b8', transform:faqOpen===i?'rotate(45deg)':'none', transition:'transform .2s', flexShrink:0 }}>+</span>
              </button>
              {faqOpen===i&&<p style={{ margin:0, padding:'0 22px 18px', fontSize:14, color:'#475569', lineHeight:1.78 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:'#0f172a', padding:'56px 40px 32px' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:32, marginBottom:52 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <WSLogo size={36}/>
                <span style={{ fontWeight:800, fontSize:17, color:'#fff', letterSpacing:'-0.03em' }}>WorkSupport<span style={{ color:'#60a5fa' }}> 360</span></span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.78, marginBottom:18 }}>
                On-demand IT engineers from top MNCs — billed by the hour. Debug, build, deploy, or review with verified professionals.
              </p>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>
                📧 help@worksupport360.com<br/>
                📞 +91-9441363687
              </div>
            </div>
            {[
              { title:'IT Services', links:['Frontend Dev','Backend Dev','Cloud / AWS','DevOps / CI-CD','Data Engineering','Mobile Dev','QA / Testing','ML / AI'] },
              { title:'Company',     links:['About us','How it works','Rate card','Register as Expert','Post a Requirement','Blog'] },
              { title:'Support',     links:['Help centre','WhatsApp us','Terms of service','Privacy policy','Refund policy'] },
            ].map(col=>(
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:16, textTransform:'uppercase', letterSpacing:'0.08em' }}>{col.title}</div>
                {col.links.map(l=>(
                  <div key={l} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:10, cursor:'pointer', transition:'color .15s' }}
                    onMouseEnter={e=>(e.target as HTMLElement).style.color='rgba(255,255,255,0.8)'}
                    onMouseLeave={e=>(e.target as HTMLElement).style.color='rgba(255,255,255,0.4)'}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          {/* App Download */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:28, marginBottom:28, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20 }}>
            <div>
              <h4 style={{ fontWeight:800, fontSize:16, color:'#fff', margin:'0 0 4px' }}>Apply on the go</h4>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', margin:0 }}>Get real-time job updates on our App</p>
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <a href="#" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:12, background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', textDecoration:'none', minWidth:155 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
                <svg width="22" height="22" viewBox="0 0 24 24"><path d="M3.18 23.76a2 2 0 0 1-.68-.63V.87A2 2 0 0 1 3.18.24L13.5 12 3.18 23.76z" fill="#EA4335"/><path d="M16.82 15.35 5.3 21.94l8.2-9.94 3.32 3.35z" fill="#FBBC05"/><path d="M21.1 10.6a2 2 0 0 1 0 2.8l-4.28 2.45-3.32-3.35L16.82 9.1l4.28 1.5z" fill="#4285F4"/><path d="M5.3 2.06l11.52 6.59L13.5 12 3.18.24A2 2 0 0 1 5.3 2.06z" fill="#34A853"/></svg>
                <div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em' }}>GET IT ON</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Google Play</div>
                </div>
              </a>
              <a href="#" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 20px', borderRadius:12, background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', textDecoration:'none', minWidth:155 }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Download on the</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>App Store</div>
                </div>
              </a>
            </div>
          </div>

          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.3)' }}>© 2025 Mahvenx IT Solutions Pvt. Ltd. All rights reserved.</p>
            <div style={{ display:'flex', gap:6 }}>
              {COMPANIES.slice(0,6).map(c=>(
                <span key={c} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.2)', fontWeight:600 }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>



      {/* ══ SUPPORT CHAT WIDGET (WhatsApp) ══ */}
      <style>{`
        @keyframes chatPop{from{opacity:0;transform:scale(.9) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        .chat-scroll::-webkit-scrollbar{width:4px}.chat-scroll::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:4px}
      `}</style>

      <button onClick={()=>setChatOpen(o=>!o)}
        style={{ position:'fixed', bottom:24, right:24, width:58, height:58, borderRadius:'50%', background:'linear-gradient(135deg,#25d366,#128c7e)', color:'#fff', border:'none', fontSize:26, cursor:'pointer', boxShadow:'0 6px 24px rgba(37,211,102,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform .2s' }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
        {chatOpen ? '✕' : '💬'}
      </button>

      {!chatOpen && <div style={{ position:'fixed', bottom:70, right:20, background:'#ef4444', color:'#fff', fontSize:9, fontWeight:800, width:18, height:18, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1001 }}>1</div>}

      {chatOpen && (
        <div style={{ position:'fixed', bottom:94, right:24, width:320, borderRadius:20, background:'#fff', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', zIndex:999, animation:'chatPop .25s ease', overflow:'hidden', border:'1px solid #e2e8f0' }}>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#25d366,#128c7e)', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>💬</div>
            <div>
              <div style={{ fontWeight:800, color:'#fff', fontSize:14 }}>WorkSupport360</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.75)' }}>Typically replies instantly</div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding:'20px', background:'#f0f4f8' }}>
            <div style={{ background:'#fff', borderRadius:'12px 12px 12px 0', padding:'12px 14px', fontSize:13, color:'#374151', lineHeight:1.65, boxShadow:'0 1px 4px rgba(0,0,0,0.08)', marginBottom:16 }}>
              👋 Hi! Welcome to <strong>WorkSupport360</strong>.<br/><br/>
              Need to hire an IT expert or find freelance work? We're here to help!<br/><br/>
              Click below to chat with us on WhatsApp or contact us directly.
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <a href="https://wa.me/919441363687?text=Hi%20WorkSupport360%2C%20I%20need%20help%20with%20IT%20support"
                target="_blank" rel="noreferrer"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'#25d366', borderRadius:12, textDecoration:'none', color:'#fff', fontWeight:700, fontSize:13 }}>
                <span style={{ fontSize:20 }}>💬</span>
                Chat on WhatsApp
              </a>

              <button onClick={()=>{ setChatOpen(false); navigate('/post-requirement'); }}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', borderRadius:12, color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>
                <span style={{ fontSize:20 }}>📋</span>
                Post a Requirement
              </button>

              <a href="mailto:help@worksupport360.com"
                style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'#f8fafc', borderRadius:12, textDecoration:'none', color:'#374151', fontWeight:600, fontSize:13, border:'1.5px solid #e2e8f0' }}>
                <span style={{ fontSize:20 }}>📧</span>
                help@worksupport360.com
              </a>
            </div>
          </div>

          <div style={{ padding:'10px 20px', textAlign:'center', fontSize:11, color:'#94a3b8', borderTop:'1px solid #f1f5f9' }}>
            +91-9441363687 · Mon–Sat 9AM–8PM IST
          </div>
        </div>
      )}

    </div>
  );
}