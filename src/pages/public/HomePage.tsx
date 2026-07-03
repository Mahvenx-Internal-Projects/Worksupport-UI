import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CheckCircle, Star, Send, UserPlus, FileText, Zap, Clock, Users, TrendingUp, Award, Code2, Cloud, GitBranch, Database, Smartphone, Shield, Search, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

/* ── IT skill categories only ──────────────────────────────── */
const IT_SKILLS = [
  { icon: <Code2 size={22} color="#f97316"/>, label: 'Frontend Dev',    sub: 'React, Vue, Angular, Next.js',   color: '#f97316', bg: '#fff7ed' },
  { icon: <Code2 size={22} color="#ea580c"/>, label: 'Backend Dev',     sub: 'Node.js, Python, Java, Go, .NET', color: '#ea580c', bg: '#fef2f2' },
  { icon: <Cloud size={22} color="#0891b2"/>, label: 'Cloud / AWS',     sub: 'AWS, Azure, GCP, DevOps',         color: '#0891b2', bg: '#ecfeff' },
  { icon: <GitBranch size={22} color="#7c3aed"/>, label: 'DevOps / CI-CD', sub: 'Docker, K8s, Jenkins, Terraform', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: <Database size={22} color="#059669"/>, label: 'Data Engineer',  sub: 'SQL, Spark, Kafka, Airflow',      color: '#059669', bg: '#ecfdf5' },
  { icon: <Smartphone size={22} color="#db2777"/>, label: 'Mobile Dev',  sub: 'React Native, Flutter, iOS, Android', color: '#db2777', bg: '#fdf2f8' },
  { icon: <Shield size={22} color="#dc2626"/>, label: 'QA / Testing',    sub: 'Selenium, Cypress, Playwright',   color: '#dc2626', bg: '#fef2f2' },
  { icon: <Code2 size={22} color="#d97706"/>, label: 'ML / AI',          sub: 'Python, TensorFlow, PyTorch',     color: '#d97706', bg: '#fffbeb' },
  { icon: <Database size={22} color="#0369a1"/>, label: 'Database Admin', sub: 'MySQL, PostgreSQL, MongoDB',      color: '#0369a1', bg: '#eff6ff' },
  { icon: <Cloud size={22} color="#4f46e5"/>, label: 'Full-Stack',        sub: 'MERN, MEAN, Django, Laravel',     color: '#4f46e5', bg: '#eef2ff' },
  { icon: <Shield size={22} color="#b45309"/>, label: 'Cyber Security',   sub: 'Pen testing, VAPT, SOC',          color: '#b45309', bg: '#fffbeb' },
  { icon: <Code2 size={22} color="#0f766e"/>, label: 'Embedded / IoT',   sub: 'C/C++, Arduino, RTOS, Firmware',  color: '#0f766e', bg: '#f0fdf4' },
];

const HOURS = [
  { h: '1',      label: '1 Hour',   icon: '⚡', best: false },
  { h: '2',      label: '2 Hours',  icon: '⏱️', best: false },
  { h: '4',      label: 'Half Day', icon: '🌤️', best: true  },
  { h: '6',      label: '6 Hours',  icon: '☀️', best: false },
  { h: '8',      label: 'Full Day', icon: '🗓️', best: false },
  { h: 'custom', label: 'Custom',   icon: '✏️', best: false },
];

const STATS = [
  { n: '1,200+', l: 'IT Experts',          icon: <Users size={18} color="#f97316"/>       },
  { n: '500+',   l: 'Businesses served',   icon: <Award size={18} color="#f97316"/>       },
  { n: '4 hrs',  l: 'Avg match time',      icon: <Clock size={18} color="#f97316"/>       },
  { n: '98%',    l: 'Client satisfaction', icon: <TrendingUp size={18} color="#f97316"/>  },
];

const STEPS = [
  { n:'01', e:'📋', t:'Post your requirement',   d:'Describe the skill, stack, and hours needed. Takes under 2 minutes.' },
  { n:'02', e:'🎯', t:'We match the right expert', d:'Admin reviews and assigns a verified MNC engineer within 4 hours.' },
  { n:'03', e:'💬', t:'Expert joins your session', d:'Remote or on-site — they code, debug, architect, or support live.' },
  { n:'04', e:'💳', t:'Pay only for hours used',   d:'Billed by the hour. GST invoice. No retainer, no subscription.' },
];

const TESTIMONIALS = [
  { q:'Booked a 4-hour React debugging session. Senior engineer fixed a critical production bug in 2 hours. Paid only for 2. Absolutely brilliant.', n:'Ramesh K.', c:'Fintech Startup · Hyderabad', r:5 },
  { q:'Our Kubernetes cluster kept crashing. Got a DevOps expert in 3 hours who sorted it live. Saved us an entire day of downtime.', n:'Anjali R.', c:'SaaS Company · Bangalore', r:5 },
  { q:'Needed a Python data pipeline reviewed urgently. Expert joined within 4 hours, reviewed 2,000 lines, pointed out 3 critical bugs. Worth every rupee.', n:'Arjun M.', c:'E-commerce · Mumbai', r:5 },
];

const FAQS = [
  { q:'What kind of IT work can I get help with?', a:'Frontend, backend, full-stack development, DevOps, cloud (AWS/Azure/GCP), data engineering, mobile apps, QA/testing, ML/AI, database administration, cybersecurity, embedded systems, and more.' },
  { q:'How does hourly booking work?', a:'Book a 1, 2, 4, 6, or 8-hour slot. We assign a verified expert. They join your session (video call, screen share, or on-site). You pay only for hours used. GST invoice provided after every session.' },
  { q:'How quickly can I get an expert?', a:'Most requests are fulfilled within 4 hours. Urgent bookings in metro cities (Hyderabad, Bangalore, Mumbai, Pune, Delhi NCR) can be done in 1–2 hours.' },
  { q:'Are these MNC employees working in their free hours?', a:'Yes. Our platform exclusively connects you with verified IT professionals employed at top MNCs — working on your project during their evenings, weekends, or off-hours. Your employer is never notified.' },
  { q:'Can I hire the same expert again?', a:'Absolutely. You can request a specific expert by name for future bookings, subject to their availability.' },
  { q:'Is there a subscription or monthly fee?', a:'None. Pure pay-as-you-go. Post a requirement, we fulfil it, you pay for hours used. No lock-in.' },
];

const COMPANY_LOGOS = ['Infosys','TCS','Wipro','HCL','Cognizant','Capgemini','Accenture','IBM','Tech Mahindra','Mphasis','Oracle','SAP'];

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [selH, setSelH] = useState('4');
  const [faqOpen, setFaqOpen] = useState<number|null>(0);
  const [skillFilter, setSkillFilter] = useState('');
  const [form, setForm] = useState({ name:'', mobile:'', skill:'', hours:'4', note:'' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const role = (user?.role as string) || '';
  const dash = role==='admin'?'/admin':role==='freelancer'?'/freelancer':'/client';

  /* Freelancers from API */
  const { data: flData, isLoading: flLoading } = useQuery({
    queryKey: ['home-freelancers'],
    queryFn: async () => {
      const r = await fetch('/api/public/featured-freelancers?pageSize=8&page=1');
      const j = await r.json();
      return j?.items ?? j ?? [];
    },
    staleTime: 60000,
  });
  const freelancers: any[] = Array.isArray(flData) ? flData : [];

  const handleEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.skill) return;
    setSubmitting(true);
    try {
      await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, email: `${form.mobile}@ws360.com`, reason: 'it_support_enquiry',
          message: `Skill: ${form.skill} | Hours: ${form.hours || selH} | Note: ${form.note}`,
        }),
      });
    } catch {}
    setSubmitted(true);
    setSubmitting(false);
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'12px 14px', border:'1.5px solid #e2e8f0', borderRadius:10,
    fontSize:14, outline:'none', fontFamily:'inherit', background:'#fff',
    color:'#0f172a', boxSizing:'border-box', transition:'border .15s',
  };
  const F = (e: any) => e.target.style.borderColor = '#f97316';
  const B = (e: any) => e.target.style.borderColor = '#e2e8f0';

  return (
    <div style={{ minHeight:'100vh', background:'#fff', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", color:'#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .fu{animation:fadeUp .6s ease both}
        .fu2{animation:fadeUp .6s .12s ease both}
        .fu3{animation:fadeUp .6s .24s ease both}
        .hov:hover{transform:translateY(-4px)!important;box-shadow:0 16px 40px rgba(249,115,22,0.13)!important;border-color:#fed7aa!important}
        .step:hover{background:#fff7ed!important;border-color:#fed7aa!important}
        input::placeholder,textarea::placeholder{color:#9ca3af}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}
        section{scroll-margin-top:64px}
        a{text-decoration:none;color:inherit}
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:300, height:64, background:'rgba(255,255,255,0.97)', backdropFilter:'blur(16px)', borderBottom:'1px solid #f1f5f9', display:'flex', alignItems:'center', padding:'0 40px', boxShadow:'0 1px 12px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth:1260, width:'100%', margin:'0 auto', display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={()=>navigate('/')} style={{ display:'flex', alignItems:'center', gap:9, background:'none', border:'none', cursor:'pointer', padding:0, marginRight:24, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#f97316,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 12px rgba(249,115,22,0.4)' }}>
              <Zap size={18} color="#fff" fill="#fff"/>
            </div>
            <span style={{ fontWeight:900, fontSize:18, color:'#0f172a', letterSpacing:'-0.03em', whiteSpace:'nowrap' }}>
              WorkSupport <span style={{ color:'#f97316' }}>360</span>
            </span>
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:1, flex:1 }}>
            {['IT Experts','Services','How it works','Contact'].map(l=>(
              <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
                style={{ padding:'7px 13px', borderRadius:8, fontSize:14, fontWeight:500, color:'#475569', transition:'all .15s' }}
                onMouseEnter={e=>{(e.target as HTMLElement).style.color='#0f172a';(e.target as HTMLElement).style.background='#f8fafc';}}
                onMouseLeave={e=>{(e.target as HTMLElement).style.color='#475569';(e.target as HTMLElement).style.background='transparent';}}>{l}
              </a>
            ))}
          </div>

          <div style={{ display:'flex', gap:10 }}>
            {isAuthenticated ? (
              <button onClick={()=>navigate(dash)} style={{ padding:'9px 24px', borderRadius:10, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(249,115,22,0.35)' }}>Dashboard →</button>
            ) : (<>
              <button onClick={()=>navigate('/login')} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 20px', borderRadius:10, background:'#fff', color:'#374151', border:'1.5px solid #e2e8f0', fontSize:14, fontWeight:600, cursor:'pointer', transition:'border .15s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='#f97316'} onMouseLeave={e=>e.currentTarget.style.borderColor='#e2e8f0'}>
                <ArrowRight size={14}/> Login
              </button>
              <button onClick={()=>navigate('/register')} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 22px', borderRadius:10, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(249,115,22,0.35)' }}>
                <UserPlus size={14}/> Sign Up
              </button>
            </>)}
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <section style={{ paddingTop:64, minHeight:'100vh', background:'linear-gradient(160deg,#fff7ed 0%,#fff 30%,#fef2f2 70%,#fff7ed 100%)', display:'flex', alignItems:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'8%', right:'4%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle,rgba(249,115,22,0.1) 0%,transparent 70%)', animation:'float 8s ease-in-out infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'8%', left:'3%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle,rgba(239,68,68,0.07) 0%,transparent 70%)', animation:'float 6s ease-in-out infinite reverse', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(249,115,22,0.08) 1px,transparent 1px)', backgroundSize:'38px 38px', pointerEvents:'none' }}/>

        <div style={{ maxWidth:1260, width:'100%', margin:'0 auto', padding:'80px 40px', position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'1fr 420px', gap:80, alignItems:'center' }}>

          {/* LEFT */}
          <div>
            <div className="fu" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:100, background:'#fff7ed', border:'1.5px solid #fed7aa', marginBottom:24 }}>
              <span style={{ width:7, height:7, borderRadius:'50%', background:'#f97316', animation:'pulse 2s ease infinite', display:'inline-block' }}/>
              <span style={{ fontSize:13, fontWeight:700, color:'#ea580c' }}>MNC engineers · Available today · Billed by the hour</span>
            </div>

            <h1 className="fu" style={{ fontSize:'clamp(2.6rem,4.2vw,4rem)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.045em', marginBottom:18, color:'#0f172a' }}>
              Expert IT Support<br/>
              <span style={{ background:'linear-gradient(135deg,#f97316,#ef4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Billed by the Hour</span>
            </h1>

            <p className="fu2" style={{ fontSize:18, color:'#475569', lineHeight:1.75, marginBottom:28, maxWidth:500 }}>
              Get a senior MNC engineer for 1, 2, 4, 6 hours or a full day. Debug production issues, review code, set up infrastructure, or accelerate your sprint — on demand.
            </p>

            <div className="fu2" style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
              {['💳 Pay only for hours used','⏱️ No subscription','🔒 MNC-verified experts','🧾 GST invoice'].map(b=>(
                <span key={b} style={{ padding:'8px 16px', borderRadius:100, background:'#fff', border:'1.5px solid #e2e8f0', fontSize:13, fontWeight:500, color:'#374151', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>{b}</span>
              ))}
            </div>

            <div className="fu3" style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:40 }}>
              <button onClick={()=>document.getElementById('enquiry')?.scrollIntoView({behavior:'smooth'})}
                style={{ display:'flex', alignItems:'center', gap:9, padding:'15px 32px', borderRadius:14, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(249,115,22,0.4)', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 10px 32px rgba(249,115,22,0.5)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 6px 24px rgba(249,115,22,0.4)';}}>
                <FileText size={17}/> Post IT Requirement
              </button>
              <button onClick={()=>navigate('/register?role=freelancer')}
                style={{ display:'flex', alignItems:'center', gap:9, padding:'15px 28px', borderRadius:14, background:'#fff', color:'#374151', border:'2px solid #e2e8f0', fontSize:16, fontWeight:600, cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#f97316';e.currentTarget.style.color='#ea580c';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.color='#374151';}}>
                <UserPlus size={17}/> Join as IT Freelancer
              </button>
            </div>

            {/* Stats */}
            <div className="fu3" style={{ display:'flex', flexWrap:'wrap', gap:28, paddingTop:24, borderTop:'1px solid #f1f5f9' }}>
              {STATS.map(s=>(
                <div key={s.l} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'#fff7ed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight:900, fontSize:20, color:'#0f172a', letterSpacing:'-0.02em', lineHeight:1 }}>{s.n}</div>
                    <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — service cards + quick book */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {[
              { e:'🔥', t:'Debug & Fix',       d:'Production down? Code not working? Get an expert on your screen in hours.', col:'#f97316' },
              { e:'🏗️', t:'Build & Develop',   d:'Frontend, backend, API, mobile — hire by the hour, not by the month.',      col:'#7c3aed' },
              { e:'☁️', t:'Cloud & DevOps',    d:'AWS setup, Docker, CI/CD pipeline, Kubernetes — done right, first time.',    col:'#0891b2' },
              { e:'📊', t:'Code Review & Arch',d:'Architect review, security audit, performance optimisation sessions.',       col:'#059669' },
            ].map((c,i)=>(
              <div key={i} className="hov" style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:18, padding:'18px 20px', cursor:'pointer', transition:'all .22s', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', display:'flex', alignItems:'center', gap:14 }}
                onClick={()=>document.getElementById('enquiry')?.scrollIntoView({behavior:'smooth'})}>
                <div style={{ width:44, height:44, borderRadius:14, background:`${c.col}12`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{c.e}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:3 }}>{c.t}</div>
                  <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{c.d}</div>
                </div>
                <ArrowRight size={15} color="#94a3b8"/>
              </div>
            ))}

            {/* Quick book */}
            <div style={{ background:'#0f172a', borderRadius:18, padding:'20px 22px', marginTop:4 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Quick Book</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:14 }}>
                {HOURS.map(h=>(
                  <button key={h.h} type="button" onClick={()=>setSelH(h.h)}
                    style={{ padding:'7px 12px', borderRadius:9, border:`1.5px solid ${selH===h.h?'#f97316':'rgba(255,255,255,0.1)'}`, background:selH===h.h?'rgba(249,115,22,0.2)':'rgba(255,255,255,0.04)', color:selH===h.h?'#fb923c':'rgba(255,255,255,0.5)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s', position:'relative' }}>
                    {h.best&&<span style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', background:'#f97316', color:'#fff', fontSize:7, fontWeight:800, padding:'1px 6px', borderRadius:10, whiteSpace:'nowrap' }}>POPULAR</span>}
                    {h.icon} {h.label}
                  </button>
                ))}
              </div>
              <button onClick={()=>document.getElementById('enquiry')?.scrollIntoView({behavior:'smooth'})}
                style={{ width:'100%', padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(249,115,22,0.4)' }}>
                Book {selH==='custom'?'Custom':selH==='8'?'Full Day':selH+' Hour'+(selH==='1'?'':'s')} →
              </button>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, background:'#0f172a', padding:'11px 0', overflow:'hidden' }}>
          <div style={{ display:'flex', width:'max-content', animation:'ticker 28s linear infinite' }}>
            {[...COMPANY_LOGOS,...COMPANY_LOGOS].map((c,i)=>(
              <span key={i} style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap', padding:'0 24px', letterSpacing:'0.07em', textTransform:'uppercase' }}>{c} <span style={{ marginLeft:24, color:'rgba(255,255,255,0.1)' }}>·</span></span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ IT EXPERTS GRID ══ */}
      <section id="it-experts" style={{ padding:'80px 40px', background:'#f8fafc' }}>
        <div style={{ maxWidth:1260, margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:14 }}>
            <div>
              <p style={{ margin:'0 0 6px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Available now</p>
              <h2 style={{ margin:0, fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>Verified IT Experts</h2>
            </div>
            <button onClick={()=>navigate('/register')} style={{ padding:'10px 22px', borderRadius:12, border:'1.5px solid #fed7aa', background:'#fff7ed', color:'#ea580c', fontSize:13, fontWeight:700, cursor:'pointer' }}>View all experts →</button>
          </div>

          {flLoading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {[...Array(8)].map((_,i)=>(
                <div key={i} style={{ background:'#fff', borderRadius:18, padding:'20px', border:'1.5px solid #f1f5f9', height:210, backgroundImage:'linear-gradient(90deg,#f8fafc 25%,#f1f5f9 50%,#f8fafc 75%)', backgroundSize:'400% 100%', animation:'shimmer 1.4s linear infinite' }}/>
              ))}
            </div>
          ) : freelancers.length===0 ? (
            <div style={{ textAlign:'center', padding:'64px', background:'#fff', borderRadius:22, border:'1.5px solid #f1f5f9' }}>
              <div style={{ fontSize:52, marginBottom:14 }}>👨‍💻</div>
              <p style={{ fontWeight:700, fontSize:16, color:'#374151', marginBottom:8 }}>Verified IT experts coming soon</p>
              <p style={{ fontSize:14, color:'#94a3b8', marginBottom:20 }}>Be the first MNC engineer to register and earn on your free hours</p>
              <button onClick={()=>navigate('/register?role=freelancer')} style={{ padding:'12px 28px', borderRadius:12, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(249,115,22,0.35)' }}>
                Register as IT Freelancer
              </button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
              {freelancers.map((f:any,i:number)=>{
                const grads=['linear-gradient(135deg,#f97316,#ef4444)','linear-gradient(135deg,#7c3aed,#a855f7)','linear-gradient(135deg,#059669,#10b981)','linear-gradient(135deg,#0891b2,#06b6d4)','linear-gradient(135deg,#dc2626,#f97316)','linear-gradient(135deg,#1d4ed8,#6366f1)','linear-gradient(135deg,#15803d,#059669)','linear-gradient(135deg,#be185d,#ec4899)'];
                const name=f.aliasName||f.AliasName||f.name||'Expert';
                const role2=f.currentRole||f.CurrentRole||'IT Professional';
                const rate=f.hourlyRate||f.HourlyRate||'—';
                const cur=(f.currency||f.Currency)==='INR'?'₹':'$';
                const rating=+(f.rating||f.Rating||4.9).toFixed(1);
                const projects=f.completedProjects||f.CompletedProjects||0;
                const skills=(f.skills||f.Skills||[]).slice(0,3);
                const photo=f.photoUrl||f.PhotoUrl||f.avatarUrl||null;
                const avail=f.isAvailable||f.IsAvailable;
                return (
                  <div key={f.id||i} className="hov" style={{ background:'#fff', borderRadius:18, padding:'20px', border:'1.5px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.05)', transition:'all .22s', cursor:'pointer' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ position:'relative', flexShrink:0 }}>
                        {photo&&<img src={photo} alt={name} style={{ width:54, height:54, borderRadius:14, objectFit:'cover', display:'block' }} onError={e=>{(e.target as HTMLImageElement).style.display='none';(e.target as HTMLImageElement).nextElementSibling!.removeAttribute('style');}}/>}
                        <div style={{ width:54, height:54, borderRadius:14, background:grads[i%grads.length], display:photo?'none':'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:22, color:'#fff', boxShadow:'0 3px 12px rgba(0,0,0,0.15)' }}>
                          {name[0]?.toUpperCase()||'?'}
                        </div>
                        {avail&&<div style={{ position:'absolute', bottom:-2, right:-2, width:13, height:13, borderRadius:'50%', background:'#22c55e', border:'2.5px solid #fff' }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{name}</div>
                        <div style={{ fontSize:12, color:'#64748b', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{role2}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, fontSize:13 }}>
                      <span style={{ color:'#f59e0b', fontWeight:800 }}>★ {rating}</span>
                      {projects>0&&<span style={{ color:'#94a3b8' }}>· {projects} projects</span>}
                    </div>
                    {skills.length>0&&(
                      <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:14 }}>
                        {skills.map((s:string)=><span key={s} style={{ fontSize:11, padding:'3px 9px', borderRadius:7, background:'#f8fafc', border:'1px solid #e2e8f0', color:'#475569', fontWeight:500 }}>{s}</span>)}
                      </div>
                    )}
                    <div style={{ height:1, background:'#f1f5f9', margin:'12px 0' }}/>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ fontWeight:900, fontSize:22, color:'#0f172a', letterSpacing:'-0.02em' }}>{cur}{rate}<span style={{ fontSize:13, fontWeight:400, color:'#94a3b8' }}>/hr</span></div>
                      <button onClick={e=>{e.stopPropagation();document.getElementById('enquiry')?.scrollIntoView({behavior:'smooth'});}}
                        style={{ padding:'9px 22px', borderRadius:10, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 10px rgba(249,115,22,0.35)' }}>Hire</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══ IT SKILL AREAS ══ */}
      <section id="services" style={{ padding:'80px 40px', background:'#fff' }}>
        <div style={{ maxWidth:1260, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>All IT domains covered</p>
            <h2 style={{ margin:'0 0 10px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>What IT Skill Do You Need?</h2>
            <p style={{ margin:0, fontSize:15, color:'#64748b', maxWidth:500, marginLeft:'auto', marginRight:'auto' }}>Click any skill area to pre-fill your requirement and get matched with the right expert.</p>
          </div>

          {/* Search */}
          <div style={{ position:'relative', maxWidth:420, margin:'0 auto 36px' }}>
            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}/>
            <input value={skillFilter} onChange={e=>setSkillFilter(e.target.value)} placeholder="Search skill e.g. React, AWS, Python…"
              style={{ ...inp, paddingLeft:42, borderRadius:12 }} onFocus={F} onBlur={B}/>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(195px,1fr))', gap:14 }}>
            {IT_SKILLS.filter(s=>!skillFilter||s.label.toLowerCase().includes(skillFilter.toLowerCase())||s.sub.toLowerCase().includes(skillFilter.toLowerCase())).map((s,i)=>(
              <div key={s.label} className="hov" style={{ background:'#fff', border:`1.5px solid ${s.color}18`, borderRadius:16, padding:'18px 16px', cursor:'pointer', transition:'all .22s', boxShadow:'0 1px 4px rgba(0,0,0,0.04)' }}
                onClick={()=>{setForm(f=>({...f,skill:s.label}));document.getElementById('enquiry')?.scrollIntoView({behavior:'smooth'});}}>
                <div style={{ width:46, height:46, borderRadius:13, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>{s.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:3 }}>{s.label}</div>
                <div style={{ fontSize:12, color:'#64748b', lineHeight:1.5 }}>{s.sub}</div>
              </div>
            ))}
          </div>
          <p style={{ textAlign:'center', marginTop:22, fontSize:14, color:'#64748b' }}>Don't see your stack? <a href="#enquiry" style={{ color:'#f97316', fontWeight:700 }}>Just describe it →</a></p>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" style={{ padding:'80px 40px', background:'#0f172a', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:360, height:360, borderRadius:'50%', background:'rgba(249,115,22,0.09)', filter:'blur(60px)' }}/>
        <div style={{ maxWidth:1260, margin:'0 auto', position:'relative', zIndex:1 }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Simple 4-step process</p>
            <h2 style={{ margin:'0 0 10px', fontSize:34, fontWeight:900, color:'#fff', letterSpacing:'-0.03em' }}>From Requirement to Live Expert in 4 Hours</h2>
            <p style={{ margin:0, fontSize:15, color:'rgba(255,255,255,0.45)' }}>Admin-coordinated. MNC-verified. No middlemen.</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
            {STEPS.map((s,i)=>(
              <div key={i} className="step" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, padding:'28px 22px', textAlign:'center', position:'relative', transition:'all .22s' }}>
                <div style={{ position:'absolute', top:14, right:16, fontSize:11, fontWeight:900, color:'rgba(249,115,22,0.4)', letterSpacing:'0.06em' }}>{s.n}</div>
                <div style={{ fontSize:40, marginBottom:14 }}>{s.e}</div>
                <h3 style={{ fontWeight:800, fontSize:15, color:'#fff', margin:'0 0 8px' }}>{s.t}</h3>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, margin:0 }}>{s.d}</p>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:10, marginTop:40 }}>
            {['🔒 MNC-verified only','🧾 GST invoice','⚡ 4-hr fulfillment','💳 Pay per hour','📹 Remote or on-site','🔄 Easy rebooking'].map(f=>(
              <span key={f} style={{ padding:'8px 16px', borderRadius:100, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)' }}>{f}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FREELANCER CTA ══ */}
      <section style={{ padding:'80px 40px', background:'linear-gradient(135deg,#fff7ed 0%,#fef2f2 100%)' }}>
        <div style={{ maxWidth:1260, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:72, alignItems:'center' }}>
          <div>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>For IT professionals</p>
            <h2 style={{ margin:'0 0 14px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>Earn on Your<br/>Free Hours</h2>
            <p style={{ fontSize:15, color:'#475569', lineHeight:1.75, marginBottom:24 }}>
              Employed at an MNC? Use your evenings and weekends to earn extra income. We match you with verified clients — your employer is <strong>never</strong> notified.
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:11, marginBottom:28 }}>
              {['Work during evenings, weekends, or public holidays','Get paid within 3 business days — no invoice chasing','Choose only the projects that suit your skills and schedule','Full identity protection — clients see only your alias profile','IT-only platform — every client is a genuine tech business'].map(item=>(
                <div key={item} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <CheckCircle size={16} color="#f97316" style={{ flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:14, color:'#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            <button onClick={()=>navigate('/register?role=freelancer')}
              style={{ display:'inline-flex', alignItems:'center', gap:9, padding:'14px 28px', borderRadius:14, background:'linear-gradient(135deg,#f97316,#ef4444)', color:'#fff', border:'none', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(249,115,22,0.35)' }}>
              <UserPlus size={16}/> Register as IT Freelancer →
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[{e:'💻',r:'Full-Stack Dev',rate:'₹500–₹2000/hr'},{e:'☁️',r:'Cloud / AWS',rate:'₹600–₹2500/hr'},{e:'🐍',r:'Python / ML',rate:'₹500–₹2000/hr'},{e:'📱',r:'Mobile Dev',rate:'₹500–₹1800/hr'},{e:'🔧',r:'DevOps / K8s',rate:'₹700–₹2500/hr'},{e:'🛡️',r:'QA / Security',rate:'₹400–₹1500/hr'}].map(r=>(
              <div key={r.r} style={{ background:'#fff', border:'1.5px solid #fed7aa', borderRadius:16, padding:'18px', boxShadow:'0 2px 8px rgba(249,115,22,0.08)', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(249,115,22,0.16)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 8px rgba(249,115,22,0.08)';}}>
                <div style={{ fontSize:28, marginBottom:7 }}>{r.e}</div>
                <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:4 }}>{r.r}</div>
                <div style={{ fontSize:12, color:'#f97316', fontWeight:700 }}>{r.rate}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section style={{ padding:'80px 40px', background:'#f8fafc' }}>
        <div style={{ maxWidth:1260, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Client stories</p>
            <h2 style={{ margin:0, fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>IT Teams Trust WorkSupport 360</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} className="hov" style={{ background:'#fff', border:'1.5px solid #f1f5f9', borderRadius:20, padding:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)', transition:'all .22s' }}>
                <div style={{ display:'flex', gap:2, marginBottom:14 }}>{[1,2,3,4,5].map(s=><Star key={s} size={15} fill="#f59e0b" color="#f59e0b"/>)}</div>
                <p style={{ fontSize:14, color:'#374151', lineHeight:1.78, margin:'0 0 18px' }}>"{t.q}"</p>
                <div style={{ display:'flex', alignItems:'center', gap:12, paddingTop:16, borderTop:'1px solid #f1f5f9' }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'linear-gradient(135deg,#f97316,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:15, color:'#fff' }}>{t.n[0]}</div>
                  <div><div style={{ fontWeight:700, fontSize:13, color:'#0f172a' }}>{t.n}</div><div style={{ fontSize:11, color:'#64748b' }}>{t.c}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ENQUIRY FORM ══ */}
      <section id="enquiry" style={{ padding:'80px 40px', background:'#fff' }}>
        <div style={{ maxWidth:720, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Get started now</p>
            <h2 style={{ margin:'0 0 8px', fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>Post Your IT Requirement</h2>
            <p style={{ margin:0, fontSize:15, color:'#64748b' }}>We reply within 4 hours with a matched, verified IT expert</p>
          </div>

          {submitted ? (
            <div style={{ background:'linear-gradient(135deg,#fff7ed,#fef2f2)', border:'2px solid #fed7aa', borderRadius:24, padding:'52px', textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
              <h3 style={{ fontWeight:900, fontSize:22, color:'#ea580c', margin:'0 0 10px' }}>Requirement received!</h3>
              <p style={{ fontSize:15, color:'#374151', lineHeight:1.7, margin:0 }}>Our admin team will match you with a verified IT expert and contact you within 4 hours on WhatsApp or mobile.</p>
            </div>
          ) : (
            <form onSubmit={handleEnquiry} style={{ background:'#f8fafc', borderRadius:24, padding:'36px', border:'1px solid #f1f5f9', display:'flex', flexDirection:'column', gap:16, boxShadow:'0 4px 24px rgba(0,0,0,0.04)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>Your Name *</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Full name" required style={inp} onFocus={F} onBlur={B}/>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>Mobile / WhatsApp *</label>
                  <input value={form.mobile} onChange={e=>setForm({...form,mobile:e.target.value})} placeholder="+91-XXXXXXXXXX" required style={inp} onFocus={F} onBlur={B}/>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>IT Skill / Technology *</label>
                <select value={form.skill} onChange={e=>setForm({...form,skill:e.target.value})} required style={{ ...inp, appearance:'none', cursor:'pointer' }} onFocus={F} onBlur={B}>
                  <option value="">Select skill or technology…</option>
                  {IT_SKILLS.map(s=><option key={s.label}>{s.label} — {s.sub}</option>)}
                  <option>Other (describe in notes below)</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:10 }}>Hours Needed</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {HOURS.map(h=>(
                    <button key={h.h} type="button" onClick={()=>setForm({...form,hours:h.h})}
                      style={{ padding:'9px 18px', borderRadius:10, border:`1.5px solid ${form.hours===h.h?'#f97316':'#e2e8f0'}`, background:form.hours===h.h?'#fff7ed':'#fff', color:form.hours===h.h?'#ea580c':'#374151', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s', position:'relative' }}>
                      {h.best&&<span style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', background:'#f97316', color:'#fff', fontSize:8, fontWeight:800, padding:'1px 7px', borderRadius:10, whiteSpace:'nowrap' }}>POPULAR</span>}
                      {h.icon} {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:7 }}>Describe the Problem / Task</label>
                <textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})} rows={3}
                  placeholder="e.g. Need a React developer to debug a performance issue in our dashboard — production app, urgent. Or: Need AWS DevOps to set up CI/CD pipeline."
                  style={{ ...inp, resize:'none', lineHeight:1.65 }} onFocus={F} onBlur={B}/>
              </div>
              <button type="submit" disabled={submitting}
                style={{ padding:'15px', borderRadius:14, background:submitting?'#f1f5f9':'linear-gradient(135deg,#f97316,#ef4444)', color:submitting?'#94a3b8':'#fff', border:'none', fontSize:15, fontWeight:700, cursor:submitting?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:submitting?'none':'0 6px 20px rgba(249,115,22,0.35)' }}>
                <Send size={16}/> {submitting?'Sending…':'Submit Requirement — We reply in 4 hours'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="contact" style={{ padding:'80px 40px', background:'#f8fafc' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <p style={{ margin:'0 0 8px', fontSize:12, fontWeight:800, color:'#f97316', letterSpacing:'0.1em', textTransform:'uppercase' }}>Got questions?</p>
            <h2 style={{ margin:0, fontSize:34, fontWeight:900, color:'#0f172a', letterSpacing:'-0.03em' }}>Frequently Asked</h2>
          </div>
          {FAQS.map((f,i)=>(
            <div key={i} style={{ background:'#fff', border:`1.5px solid ${faqOpen===i?'#fed7aa':'#e2e8f0'}`, borderRadius:16, overflow:'hidden', marginBottom:10, transition:'all .2s', boxShadow:faqOpen===i?'0 4px 16px rgba(249,115,22,0.08)':'0 1px 3px rgba(0,0,0,0.04)' }}>
              <button onClick={()=>setFaqOpen(faqOpen===i?null:i)} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px', background:'transparent', border:'none', cursor:'pointer', textAlign:'left', gap:12 }}>
                <span style={{ fontSize:14, fontWeight:700, color:faqOpen===i?'#ea580c':'#1e293b' }}>{f.q}</span>
                <span style={{ fontSize:20, color:'#94a3b8', transform:faqOpen===i?'rotate(45deg)':'none', transition:'transform .2s', flexShrink:0 }}>+</span>
              </button>
              {faqOpen===i&&<p style={{ margin:0, padding:'0 22px 18px', fontSize:14, color:'#475569', lineHeight:1.78 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{ background:'#0f172a', padding:'52px 40px 32px' }}>
        <div style={{ maxWidth:1260, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr 1fr', gap:48, marginBottom:48 }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#f97316,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center' }}><Zap size={15} color="#fff" fill="#fff"/></div>
                <span style={{ fontWeight:900, fontSize:16, color:'#fff' }}>WorkSupport <span style={{ color:'#fb923c' }}>360</span></span>
              </div>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.4)', lineHeight:1.75, marginBottom:16 }}>On-demand IT freelancers from top MNCs — billed by the hour. Debug, build, deploy, or review with verified engineers.</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>📧 help@worksupport360.com<br/>📞 +91-9441363687</p>
            </div>
            {[
              { title:'IT Services', links:['Frontend Dev','Backend Dev','Cloud / AWS','DevOps / CI-CD','Data Engineering','Mobile Dev','QA / Testing','ML / AI'] },
              { title:'Company',     links:['About us','How it works','Rate card','Register as Freelancer','Post a Requirement','Blog'] },
              { title:'Support',     links:['Help centre','WhatsApp us','Terms of service','Privacy policy','Refund policy'] },
            ].map(col=>(
              <div key={col.title}>
                <div style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.07em' }}>{col.title}</div>
                {col.links.map(l=>(
                  <div key={l} style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:9, cursor:'pointer', transition:'color .15s' }}
                    onMouseEnter={e=>(e.target as HTMLElement).style.color='rgba(255,255,255,0.8)'}
                    onMouseLeave={e=>(e.target as HTMLElement).style.color='rgba(255,255,255,0.4)'}>{l}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ margin:0, fontSize:12, color:'rgba(255,255,255,0.25)' }}>© 2025 WorkSpace Support 360 Pvt. Ltd. All rights reserved.</p>
            <div style={{ display:'flex', gap:6 }}>
              {COMPANY_LOGOS.slice(0,6).map(l=>(
                <span key={l} style={{ fontSize:10, padding:'3px 9px', borderRadius:6, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.25)', fontWeight:600, letterSpacing:'0.04em' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}