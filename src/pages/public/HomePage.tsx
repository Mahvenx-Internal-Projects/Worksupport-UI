import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Star, Send, UserPlus, FileText,
  Clock, Users, TrendingUp, Award, Code2, Cloud, GitBranch,
  Database, Smartphone, Shield, Search,
  Globe, Lock, BarChart3, Terminal, Cpu
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
  { n:'4 hrs',  l:'Average match time',     icon:<Clock size={18}/> },
  { n:'₹2.4Cr', l:'Paid to freelancers',    icon:<TrendingUp size={18}/> },
];

const STEPS = [
  { n:'01', t:'Post your requirement',    d:'Describe the stack, problem, and hours needed. Takes under 2 minutes.' },
  { n:'02', t:'We match the right expert', d:'Admin reviews and assigns a background-verified MNC engineer within 4 hours.' },
  { n:'03', t:'Expert joins live',         d:'Remote screen share or on-site — they debug, build, or architect alongside you.' },
  { n:'04', t:'Pay only for hours used',   d:'Billed by the hour. GST invoice. No retainer, no surprise fees.' },
];

const TESTIMONIALS = [
  { q:'Got a React expert in 4 hours who fixed a critical production bug our team had been stuck on for 3 days. Paid for 2 hours. Phenomenal value.', n:'Ramesh K.', c:'CTO · Fintech startup, Hyderabad', r:5 },
  { q:'Our Kubernetes cluster was down. A DevOps engineer joined within hours, diagnosed the issue live on a call, and had us back up in 90 minutes.', n:'Anjali R.', c:'VP Engineering · SaaS company, Bangalore', r:5 },
  { q:'I was skeptical about hourly freelancers, but this is completely different. The engineer was senior, focused, and delivered exactly what we scoped.', n:'Vikram S.', c:'Founder · E-commerce platform, Mumbai', r:5 },
];

const FAQS = [
  { q:'Are these real MNC employees or just freelancers?', a:'All experts are employed full-time at top MNCs — Infosys, TCS, Wipro, HCL, Cognizant, Accenture. They work with you during their evenings and weekends under a privacy alias. Their employer is never notified.' },
  { q:'How quickly can I get an expert?', a:'Most requests are matched and confirmed within 4 hours. For urgent issues in metro cities, we can often arrange 1–2 hour turnarounds.' },
  { q:'What if the expert can\'t solve my problem?', a:'You pay only for productive time. If the session doesn\'t meet your expectations, flag it within 24 hours and we\'ll either rematch you with another expert or issue a credit.' },
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
    flexShrink: 0, boxShadow: dark ? 'none' : '0 4px 14px rgba(59,130,246,0.35)',
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
      <p style={{ fontSize:14,color:'#475569',lineHeight:1.75,margin:'0 0 20px' }}>Our admin team will review your requirement and post it for freelancers within <strong>4 hours</strong>. You'll receive a confirmation email once published.</p>
      <div style={{ background:'#f8fafc',borderRadius:16,padding:'16px',marginBottom:20,textAlign:'left' }}>
        {[
          {n:'1',t:'Admin reviews & approves',d:'Within 2 hours'},
          {n:'2',t:'Posted to freelancer job board',d:'Within 4 hours'},
          {n:'3',t:'Freelancers apply',d:'Within 24 hours'},
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
      <button onClick={onClose} style={{ padding:'12px 28px',borderRadius:13,background:'linear-gradient(135deg,#1e3a5f,#3b82f6)',color:'#fff',border:'none',fontSize:14,fontWeight:700,cursor:'pointer' }}>Done</button>
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
            <option value="4">4 hours (Half day)</option>
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
        ✅ After submitting, admin reviews and publishes to the job board within 4 hours. Freelancers then apply and admin assigns the best match to you.
      </div>

      {/* Submit */}
      <button onClick={handleSubmit} disabled={submitting}
        style={{ padding:'14px',borderRadius:13,background:submitting?'#f1f5f9':'linear-gradient(135deg,#059669,#10b981)',color:submitting?'#94a3b8':'#fff',border:'none',fontSize:15,fontWeight:700,cursor:submitting?'not-allowed':'pointer',boxShadow:submitting?'none':'0 4px 16px rgba(5,150,105,0.35)' }}>
        {submitting?'⏳ Submitting…':'📋 Submit Requirement — Admin reviews within 4 hrs'}
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
  const [form, setForm] = useState({ name:'', mobile:'', skill:'', note:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(0);

  const pageSize = 10;
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobSkillFilter, setJobSkillFilter] = useState('All');
  const [jobTypeFilter, setJobTypeFilter] = useState('All');
  const { data: jobsData, isLoading: jobsLoading } = usePublicRequirements();
  const liveJobs: any[] = (jobsData as any)?.items ?? (Array.isArray(jobsData) ? jobsData as any[] : []);
  const [scrolled, setScrolled] = useState(false);

  const userRole = (user?.role as string) || '';
  const role = userRole;
  const dash = role==='admin'?'/admin':role==='freelancer'?'/freelancer':'/client';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const { data: flData, isLoading: flLoading } = useFeaturedFreelancers({ page: 1, pageSize: 8 });
  const freelancers: any[] = flData?.items ?? (Array.isArray(flData) ? flData : []);
  const totalPages = Math.ceil(freelancers.length / pageSize);
  const pgStart = page * pageSize;

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.skill) return;
    setSubmitting(true);
    try {
      await publicApi.contact({
        name: form.name,
        email: `${form.mobile}@ws360.com`,
        reason: 'it_support_enquiry',
        message: `Skill: ${form.skill} | Hours: ${selH} | Note: ${form.note}`,
      });
    } catch {}
    setSubmitted(true); setSubmitting(false);
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
        @media(max-width:768px){.grid-4{grid-template-columns:repeat(2,1fr)!important}.grid-3{grid-template-columns:1fr!important}.hide-mobile{display:none!important}.hero-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:300, height:68,
        background: scrolled ? 'rgba(255,255,255,0.98)' : '#fff',
        backdropFilter:'blur(20px)',
        borderBottom:`1px solid ${scrolled ? '#e2e8f0' : '#f1f5f9'}`,
        display:'flex', alignItems:'center', padding:'0 40px',
        transition:'all .25s', boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      }}>
        <div style={{ maxWidth:1300, width:'100%', margin:'0 auto', display:'flex', alignItems:'center', gap:8 }}>
          {/* Logo */}
          <button onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:10, background:'none', border:'none', cursor:'pointer', padding:0, marginRight:28, flexShrink:0 }}>
            <WSLogo size={36}/>
            <div>
              <span style={{ fontWeight:800, fontSize:17, color:'#0f172a', letterSpacing:'-0.04em' }}>
                WorkSupport<span style={{ color:'#3b82f6' }}> 360</span>
              </span>
            </div>
          </button>

          {/* Nav links */}
          <div className="hide-mobile" style={{ display:'flex', alignItems:'center', gap:2, flex:1 }}>
            {[['IT Experts','#experts'],['Find Work','#jobs'],['How it works','#how'],['For Freelancers','#freelancer-cta'],['Contact','#contact']].map(([l,h])=>(
              <a key={l} href={h} style={{ padding:'7px 14px', borderRadius:8, fontSize:14, fontWeight:500, color:'#475569', transition:'all .15s' }}
                onMouseEnter={e=>{(e.target as HTMLElement).style.color='#0f172a';(e.target as HTMLElement).style.background='#f8fafc';}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.color='#475569';(e.target as HTMLElement).style.background='transparent';}}>{l}</a>
            ))}
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {isAuthenticated ? (<>
              <button onClick={()=>{ if(!isAuthenticated){ navigate('/login?returnTo=/post-requirement'); return; } if(userRole==='freelancer'){ toast.error('Only clients can post requirements',{icon:'🚫'}); return; } navigate('/post-requirement'); }} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(5,150,105,0.4)' }}>
                📋 Post Requirement
              </button>
              <button onClick={()=>navigate(dash)} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 22px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(59,130,246,0.35)' }}>
                Dashboard →
              </button>
            </>) : (<>
              <button onClick={()=>{ if(!isAuthenticated){ navigate('/login?returnTo=/post-requirement'); return; } if(userRole==='freelancer'){ toast.error('Only clients can post requirements',{icon:'🚫'}); return; } navigate('/post-requirement'); }} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:10, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 10px rgba(5,150,105,0.4)' }}>
                📋 Post Requirement
              </button>
              <button onClick={()=>navigate('/login')} style={{ padding:'9px 18px', borderRadius:10, background:'#fff', color:'#374151', border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                Sign in
              </button>
              <button onClick={()=>navigate('/register')} style={{ padding:'9px 20px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(59,130,246,0.3)' }}>
                Get started →
              </button>
            </>)}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ paddingTop:68, background:'linear-gradient(165deg,#0f172a 0%,#1e3a5f 55%,#0f172a 100%)', position:'relative', overflow:'hidden', minHeight:'100vh', display:'flex', flexDirection:'column' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(59,130,246,0.07) 1px,transparent 1px)', backgroundSize:'28px 28px', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(59,130,246,0.13) 0%,transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:-80, left:-80, width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', pointerEvents:'none' }}/>

        <style>{`
          @keyframes scrollUp { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
          @keyframes scrollDown { 0%{transform:translateY(-50%)} 100%{transform:translateY(0)} }
          @keyframes heroPulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
          @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(59,130,246,0.3)} 50%{box-shadow:0 0 40px rgba(59,130,246,0.6)} }
          .scroll-col-up   { animation: scrollUp   18s linear infinite; }
          .scroll-col-down { animation: scrollDown 18s linear infinite; }
          .hero-card { transition: all .2s; }
          .hero-card:hover { transform: scale(1.02); }
        `}</style>

        <div style={{ maxWidth:1300, margin:'0 auto', padding:'60px 40px 0', position:'relative', zIndex:1, flex:1, display:'flex', flexDirection:'column' }}>

          {/* Badge */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', borderRadius:100, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', animation:'heroPulse 2s ease infinite', display:'inline-block' }}/>
              <span style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.7)' }}>1,240+ MNC engineers · Available now · Admin-coordinated</span>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ textAlign:'center', fontSize:'clamp(2.2rem,4.2vw,3.8rem)', fontWeight:900, color:'#fff', letterSpacing:'-0.05em', lineHeight:1.07, margin:'0 auto 14px', maxWidth:780 }}>
            Hire IT Experts &amp;{' '}
            <span style={{ background:'linear-gradient(90deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Find Freelance Work
            </span>
          </h1>
          <p style={{ textAlign:'center', fontSize:17, color:'rgba(255,255,255,0.5)', lineHeight:1.75, maxWidth:540, margin:'0 auto 36px' }}>
            One platform — businesses hire MNC experts by the hour, IT professionals earn on their free time. Identity safe. Admin coordinated.
          </p>

          {/* Two CTAs */}
          <div style={{ display:'flex', justifyContent:'center', gap:14, marginBottom:48, flexWrap:'wrap' }}>
            <button onClick={()=>document.getElementById('experts')?.scrollIntoView({behavior:'smooth'})}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:13, background:'linear-gradient(135deg,#2563eb,#3b82f6)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 20px rgba(59,130,246,0.4)' }}>
              🏢 Hire an Expert
            </button>
            <button onClick={()=>document.getElementById('jobs')?.scrollIntoView({behavior:'smooth'})}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 28px', borderRadius:13, background:'rgba(255,255,255,0.08)', color:'#fff', border:'1.5px solid rgba(255,255,255,0.15)', fontSize:15, fontWeight:700, cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.25)';e.currentTarget.style.borderColor='rgba(124,58,237,0.5)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';e.currentTarget.style.borderColor='rgba(255,255,255,0.15)';}}>
              👨‍💻 Find IT Work
            </button>
          </div>

          {/* ── ANIMATED DUAL SCROLL ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 1fr', gap:0, alignItems:'center', flex:1, minHeight:0, maxHeight:320, overflow:'hidden', position:'relative' }}>

            {/* Fade top */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:60, background:'linear-gradient(to bottom,#0f172a,transparent)', zIndex:10, pointerEvents:'none' }}/>
            {/* Fade bottom */}
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:60, background:'linear-gradient(to top,#0f172a,transparent)', zIndex:10, pointerEvents:'none' }}/>

            {/* LEFT — Client requirements (scroll up) */}
            <div style={{ overflow:'hidden', height:320 }}>
              <div className="scroll-col-up">
                {[...Array(2)].flatMap(()=>[
                  {icon:'🔥',tag:'Urgent',type:'Hourly',col:'#ef4444',tc:'#fef2f2',title:'Production Bug Fix — React Dashboard',company:'FinTech Corp',skills:['React','TypeScript','Redux'],rate:'₹800/hr',time:'Now'},
                  {icon:'☁️',tag:'Day',type:'Day',col:'#7c3aed',tc:'#f5f3ff',title:'AWS Infrastructure Setup',company:'StartupXYZ',skills:['AWS','Terraform','Docker'],rate:'₹5,000/day',time:'2h ago'},
                  {icon:'⚙️',tag:'Monthly',type:'Monthly',col:'#059669',tc:'#ecfdf5',title:'Backend Dev — Node.js APIs',company:'E-commerce Co.',skills:['Node.js','PostgreSQL','Redis'],rate:'₹2,500/hr',time:'5h ago'},
                  {icon:'📱',tag:'Hourly',type:'Hourly',col:'#2563eb',tc:'#eff6ff',title:'Flutter App — UI Screens',company:'MobileFirst',skills:['Flutter','Dart','Firebase'],rate:'₹600/hr',time:'8h ago'},
                  {icon:'🤖',tag:'Day',type:'Day',col:'#d97706',tc:'#fffbeb',title:'ML Pipeline — NLP Classification',company:'DataSoft',skills:['Python','TensorFlow','NLP'],rate:'₹4,500/day',time:'1d ago'},
                ]).map((j,i)=>(
                  <div key={i} className="hero-card" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}
                    onClick={()=>document.getElementById('jobs')?.scrollIntoView({behavior:'smooth'})}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ width:34, height:34, borderRadius:10, background:j.tc, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{j.icon}</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{j.title}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{j.company} · {j.time}</div>
                      </div>
                      <span style={{ fontSize:9, fontWeight:800, padding:'2px 7px', borderRadius:5, background:j.tc, color:j.col, flexShrink:0 }}>{j.type}</span>
                    </div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                      {j.skills.map(s=><span key={s} style={{ fontSize:9, padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>{s}</span>)}
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#34d399' }}>{j.rate}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* CENTER connector */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, position:'relative', zIndex:5 }}>
              <div style={{ width:2, flex:1, background:'linear-gradient(to bottom,transparent,rgba(59,130,246,0.5),transparent)' }}/>
              <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:12, color:'#fff', flexShrink:0, animation:'glow 3s ease infinite', border:'2px solid rgba(59,130,246,0.4)' }}>WS</div>
              <div style={{ width:2, flex:1, background:'linear-gradient(to bottom,transparent,rgba(124,58,237,0.5),transparent)' }}/>
            </div>

            {/* RIGHT — Freelancer profiles (scroll down) */}
            <div style={{ overflow:'hidden', height:320 }}>
              <div className="scroll-col-down">
                {[...Array(2)].flatMap(()=>[
                  {name:'Rahul S.',role:'Senior React Dev',company:'ex-Infosys',skills:['React','TypeScript','Node.js'],rating:4.9,jobs:29,avail:true,col:'linear-gradient(135deg,#1e3a5f,#3b82f6)'},
                  {name:'Deepa N.',role:'QA Lead',company:'ex-TCS',skills:['Selenium','Playwright','JIRA'],rating:4.7,jobs:18,avail:true,col:'linear-gradient(135deg,#7c3aed,#a855f7)'},
                  {name:'Arjun M.',role:'DevOps Lead',company:'ex-Wipro',skills:['AWS','Kubernetes','Terraform'],rating:4.8,jobs:12,avail:true,col:'linear-gradient(135deg,#059669,#10b981)'},
                  {name:'Sneha R.',role:'.NET Developer',company:'ex-HCL',skills:['C#','Azure','Microservices'],rating:4.6,jobs:11,avail:false,col:'linear-gradient(135deg,#0891b2,#06b6d4)'},
                  {name:'Vikram S.',role:'Java Architect',company:'ex-Cognizant',skills:['Spring Boot','Kafka','Redis'],rating:4.5,jobs:7,avail:true,col:'linear-gradient(135deg,#d97706,#f59e0b)'},
                ]).map((f,i)=>(
                  <div key={i} className="hero-card" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'14px 16px', marginBottom:10, cursor:'pointer' }}
                    onClick={()=>document.getElementById('experts')?.scrollIntoView({behavior:'smooth'})}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        <div style={{ width:36, height:36, borderRadius:11, background:f.col, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:15, color:'#fff' }}>{f.name[0]}</div>
                        {f.avail&&<div style={{ position:'absolute', bottom:-1, right:-1, width:9, height:9, borderRadius:'50%', background:'#22c55e', border:'1.5px solid #0f172a' }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:800, color:'#fff' }}>{f.name}</div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>{f.role} · {f.company}</div>
                      </div>
                      <div style={{ fontSize:11, color:'#fbbf24', fontWeight:700, flexShrink:0 }}>★ {f.rating}</div>
                    </div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                      {f.skills.map(s=><span key={s} style={{ fontSize:9, padding:'2px 6px', borderRadius:4, background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.5)' }}>{s}</span>)}
                    </div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{f.jobs} projects completed</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Labels below columns */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 1fr', marginBottom:0, paddingTop:12, position:'relative', zIndex:5 }}>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.06em', textTransform:'uppercase' }}>🏢 Client Requirements</div>
            </div>
            <div/>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.06em', textTransform:'uppercase' }}>👨‍💻 Available Experts</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ background:'rgba(0,0,0,0.3)', borderTop:'1px solid rgba(255,255,255,0.06)', padding:'14px 40px', marginTop:16 }}>
          <div style={{ maxWidth:1300, margin:'0 auto', display:'flex', flexWrap:'wrap', justifyContent:'center', gap:0 }}>
            {STATS.map((s,i)=>(
              <div key={s.l} style={{ flex:'1 1 160px', textAlign:'center', padding:'10px 20px', borderRight:i<STATS.length-1?'1px solid rgba(255,255,255,0.07)':'none' }}>
                <div style={{ fontWeight:900, fontSize:22, color:'#fff', letterSpacing:'-0.03em', lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Companies ticker */}
        <div style={{ background:'rgba(0,0,0,0.25)', borderTop:'1px solid rgba(255,255,255,0.05)', padding:'9px 0', overflow:'hidden' }}>
          <div style={{ display:'flex', width:'max-content', animation:'ticker 28s linear infinite' }}>
            {[...COMPANIES,...COMPANIES].map((co,i)=>(
              <span key={i} style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap', padding:'0 22px', letterSpacing:'0.08em', textTransform:'uppercase' }}>
                {co}<span style={{ marginLeft:22, color:'rgba(255,255,255,0.07)' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

            {/* ══ EXPERTS ══ */}
      <section id="experts" style={{ padding:'72px 40px', background:'#f8fafc' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
            <div>
              <p style={{ margin:'0 0 4px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Available now</p>
              <h2 style={{ margin:0, fontSize:28, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Verified IT Experts</h2>
            </div>
            <p style={{ margin:0, fontSize:13, color:'#64748b' }}>Click any card to view full profile</p>
          </div>

          {flLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {[...Array(10)].map((_,i)=>(
                <div key={i} style={{ background:'#fff', borderRadius:16, height:180, border:'1.5px solid #f1f5f9', backgroundImage:'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize:'400% 100%', animation:'shimmer 1.4s linear infinite' }}/>
              ))}
            </div>
          ) : freelancers.length===0 ? (
            <div style={{ textAlign:'center', padding:'48px', background:'#fff', borderRadius:20, border:'1.5px solid #f1f5f9' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>👨‍💻</div>
              <p style={{ fontWeight:700, fontSize:16, color:'#374151', marginBottom:8 }}>Verified experts joining soon</p>
              <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer' }}>Register as Expert</button>
            </div>
          ) : (<>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14 }}>
              {(freelancers as any[]).slice(pgStart, pgStart+pageSize).map((f:any,i:number)=>{
                const grads=['linear-gradient(135deg,#1e3a5f,#3b82f6)','linear-gradient(135deg,#7c3aed,#a855f7)','linear-gradient(135deg,#059669,#10b981)','linear-gradient(135deg,#0891b2,#06b6d4)','linear-gradient(135deg,#1d4ed8,#6366f1)','linear-gradient(135deg,#15803d,#059669)','linear-gradient(135deg,#be185d,#ec4899)','linear-gradient(135deg,#b45309,#f59e0b)'];
                const name=f.aliasName||f.AliasName||f.name||'Expert';
                const role2=f.currentRole||f.CurrentRole||'IT Professional';
                const rate=f.hourlyRate||f.HourlyRate||'—';
                const cur=(f.currency||f.Currency)==='INR'?'₹':'$';
                const rating=+(f.rating||f.Rating||4.9).toFixed(1);
                const projects=f.completedProjects||f.CompletedProjects||0;
                const skills=(f.primarySkills||f.skills||f.Skills||[]);
                const skillArr=Array.isArray(skills)?skills.slice(0,3):String(skills).split(',').map((s:string)=>s.trim()).slice(0,3);
                const photo=f.photoUrl||f.PhotoUrl||null;
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
                            ? <img src={photo} alt={name} style={{ width:44, height:44, borderRadius:12, objectFit:'cover' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
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
              Showing {pgStart+1}–{Math.min(pgStart+pageSize, freelancers.length)} of {freelancers.length} experts · Click any card to view full profile
            </p>
          </>)}

        </div>
      </section>
      {/* ══ HOW IT WORKS ══ */}
      <section id="how" style={{ padding:'80px 40px', background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:500, height:500, borderRadius:'50%', background:'rgba(59,130,246,0.06)', filter:'blur(60px)', pointerEvents:'none' }}/>
        <div style={{ maxWidth:1300, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#60a5fa', letterSpacing:'0.08em', textTransform:'uppercase' }}>Four steps</p>
            <h2 style={{ margin:'0 0 10px', fontSize:34, fontWeight:900, color:'#fff', letterSpacing:'-0.04em' }}>From requirement to live expert in 4 hours</h2>
            <p style={{ margin:0, fontSize:15, color:'rgba(255,255,255,0.45)' }}>Admin-coordinated. MNC-verified. No middlemen.</p>
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


      {/* ══ FREELANCER CTA ══ */}
      <section style={{ padding:'80px 40px', background:'#fff' }}>
        <div style={{ maxWidth:1300, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }} className="hero-grid">
          <div>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>For MNC professionals</p>
            <h2 style={{ margin:'0 0 14px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Earn on Your<br/>Free Hours</h2>
            <p style={{ fontSize:15, color:'#475569', lineHeight:1.78, marginBottom:24 }}>
              Employed at an MNC? Use evenings and weekends to earn extra income — completely anonymous. Your employer is <strong>never</strong> notified.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:28 }}>
              {['Work during evenings, weekends, or public holidays','Get paid within 3 business days — GST invoice provided','Choose only projects that match your skills and schedule','Full identity protection — clients only see your alias profile','IT-only platform — every client is a genuine tech business'].map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <CheckCircle size={16} color="#3b82f6" style={{ flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:14, color:'#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/register?role=freelancer')}
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 28px', borderRadius:14, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(59,130,246,0.35)' }}>
              <UserPlus size={16}/> Register as IT Expert →
            </button>
          </div>
          {/* Role rate cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[{e:'💻',r:'Full-Stack Dev',rate:'₹500–₹2,000/hr'},{e:'☁️',r:'Cloud / AWS',rate:'₹600–₹2,500/hr'},{e:'🐍',r:'Python / ML',rate:'₹500–₹2,000/hr'},{e:'📱',r:'Mobile Dev',rate:'₹500–₹1,800/hr'},{e:'🔧',r:'DevOps / K8s',rate:'₹700–₹2,500/hr'},{e:'🛡️',r:'QA / Security',rate:'₹400–₹1,500/hr'}].map(r=>(
              <div key={r.r} style={{ background:'#f8fafc', border:'1.5px solid #e2e8f0', borderRadius:16, padding:'18px', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.background='#eff6ff';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 20px rgba(59,130,246,0.1)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#f8fafc';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{ fontSize:26, marginBottom:7 }}>{r.e}</div>
                <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:4 }}>{r.r}</div>
                <div style={{ fontSize:12, color:'#3b82f6', fontWeight:700 }}>{r.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ JOB BOARD ══ */}
      <section id="jobs" style={{ padding:'72px 40px', background:'#fff' }}>
        <div style={{ maxWidth:1300, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:32, flexWrap:'wrap', gap:14 }}>
            <div>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Freelancer opportunities</p>
              <h2 style={{ margin:'0 0 6px', fontSize:28, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Find IT Work</h2>
              <p style={{ margin:0, fontSize:14, color:'#64748b' }}>Client requirements posted by verified businesses — freelancers only can apply</p>
            </div>
            <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'10px 22px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:7 }}>
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
                      toast.success('Application submitted! Admin will contact you within 4 hours.',{icon:'✅'});
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
            <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'10px 20px', borderRadius:11, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
              Join Now →
            </button>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:'80px 40px', background:'#f8fafc' }}>
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

      {/* ══ CONTACT FORM ══ */}
      <section id="contact" style={{ padding:'80px 40px', background:'#fff' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:700, color:'#3b82f6', letterSpacing:'0.08em', textTransform:'uppercase' }}>Get started in 2 minutes</p>
            <h2 style={{ margin:'0 0 8px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.04em' }}>Post Your IT Requirement</h2>
            <p style={{ margin:0, fontSize:15, color:'#64748b' }}>We reply within 4 hours with a matched, verified engineer</p>
          </div>

          {submitted ? (
            <div style={{ background:'linear-gradient(135deg,#eff6ff,#f0fdf4)', border:'2px solid #bfdbfe', borderRadius:24, padding:'52px', textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', fontSize:32, boxShadow:'0 6px 20px rgba(59,130,246,0.35)' }}>✓</div>
              <h3 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 10px' }}>Requirement received!</h3>
              <p style={{ fontSize:15, color:'#475569', lineHeight:1.7, margin:0 }}>Our admin team will match you with a verified engineer and contact you within 4 hours on WhatsApp or mobile.</p>
            </div>
          ) : (
            <form onSubmit={handleEnquiry} style={{ background:'#f8fafc', borderRadius:24, padding:'36px', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:16, boxShadow:'0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your Name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" required style={inp} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em' }}>Mobile / WhatsApp *</label>
                  <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="+91-XXXXXXXXXX" required style={inp} onFocus={onF} onBlur={onB}/>
                </div>
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
                style={{ padding:'15px', borderRadius:14, background:submitting?'#f1f5f9':'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:submitting?'#94a3b8':'#fff', border:'none', fontSize:15, fontWeight:700, cursor:submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:submitting?'none':'0 6px 20px rgba(59,130,246,0.35)' }}>
                <Send size={16}/> {submitting?'Sending…':'Submit Requirement — We reply in 4 hours'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section style={{ padding:'80px 40px', background:'#f8fafc' }}>
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
          <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr', gap:48, marginBottom:52 }}>
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
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.22)' }}>© 2025 WorkSpace Support 360 Pvt. Ltd. All rights reserved.</p>
            <div style={{ display:'flex', gap:6 }}>
              {COMPANIES.slice(0,6).map(c=>(
                <span key={c} style={{ fontSize:10, padding:'3px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.2)', fontWeight:600 }}>{c}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Support chat widget — visible on homepage too */}
      <SupportChatWidget/>
    </div>
  );
}
