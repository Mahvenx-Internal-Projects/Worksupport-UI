import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Star, Clock, Shield, Check, Briefcase, Globe,
  CheckCircle, Award, TrendingUp, Calendar, ChevronRight, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { useCreateRequest } from '../../hooks/useApi';
import { publicApi } from '../../services/endpoints';

const Stars = ({ r, s = 14 }: { r: number; s?: number }) => (
  <span style={{ display:'inline-flex', gap:2 }}>
    {[1,2,3,4,5].map(i => (
      <svg key={i} width={s} height={s} fill={i<=Math.round(r)?'#f59e0b':'#e5e7eb'} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </span>
);

const GRADS=['linear-gradient(135deg,#1e3a5f,#3b82f6)','linear-gradient(135deg,#7c3aed,#a855f7)','linear-gradient(135deg,#059669,#10b981)','linear-gradient(135deg,#0891b2,#06b6d4)','linear-gradient(135deg,#dc2626,#f87171)','linear-gradient(135deg,#d97706,#fbbf24)','linear-gradient(135deg,#be185d,#ec4899)'];

const MOCK_PROJECTS=[
  {title:'E-commerce Platform Rebuild',desc:'Migrated legacy PHP monolith to React + Node.js microservices. 3x performance improvement, 99.9% uptime post-launch.',tags:['React','Node.js','PostgreSQL'],duration:'6 weeks',outcome:'300% faster'},
  {title:'Real-time Trading Dashboard',desc:'Built WebSocket-powered dashboard processing 10K events/sec with live chart updates and zero data loss.',tags:['React','WebSockets','Redis'],duration:'4 weeks',outcome:'<50ms latency'},
  {title:'Cloud Infrastructure Migration',desc:'Migrated on-premise infra to AWS — zero downtime deployment, 40% cost reduction through right-sizing.',tags:['AWS','Terraform','Docker'],duration:'8 weeks',outcome:'40% cost saved'},
  {title:'ML Pipeline for Fraud Detection',desc:'End-to-end ML pipeline detecting fraudulent transactions with 99.2% accuracy across 2M daily transactions.',tags:['Python','TensorFlow','Kafka'],duration:'10 weeks',outcome:'99.2% accuracy'},
];

const MOCK_REVIEWS=[
  {text:'Exceptional engineer. Delivered exactly what we scoped, on time. Will hire again without hesitation.',author:'Priya M.',company:'Fintech startup',rating:5,date:'2 weeks ago'},
  {text:'Fixed a production issue in 90 minutes that our team had been stuck on for 3 days. Brilliant.',author:'Rajan K.',company:'E-commerce platform',rating:5,date:'1 month ago'},
  {text:'Deep expertise in cloud architecture. The infra he designed scaled to 10x traffic without issues.',author:'Anika S.',company:'SaaS company',rating:5,date:'6 weeks ago'},
];

const ExpertPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<'about'|'projects'|'reviews'>('about');
  const [view, setView] = useState<'profile'|'hire'>('profile');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [hireForm, setHireForm] = useState({
    sessionType: 'consultation', hours: '4',
    bidRate: '', currency: 'INR',
    preferredDate: '', preferredTime: '',
    problemDesc: '', techStack: '', expectedOutcome: '', additionalInfo: '',
  });

  const createReq = useCreateRequest();

  const { data: expert, isLoading } = useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const r = await publicApi.getFeaturedFreelancers({ pageSize: 100 });
      const all = r.data?.items ?? [];
      return all.find((f: any) => String(f.id) === id || String(f.UserId) === id) ?? null;
    },
    enabled: !!id,
  });

  const handleHireClick = () => {
    if (!isAuthenticated) { setShowLoginModal(true); return; }
    if (user?.role === 'freelancer') { setShowRoleModal(true); return; }
    setView('hire');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!hireForm.problemDesc) { toast.error('Please describe what you need help with'); return; }
    if (!hireForm.preferredDate) { toast.error('Please select a preferred date'); return; }
    setHiring(true);
    try {
      const dt = `${hireForm.preferredDate}T${hireForm.preferredTime || '10:00'}:00`;
      await createReq.mutateAsync({
        freelancerId: id,
        sessionType: hireForm.sessionType,
        preferredDateTime: new Date(dt).toISOString(),
        durationMinutes: parseInt(hireForm.hours) * 60,
        budgetMin: parseFloat(hireForm.bidRate || '0'),
        budgetMax: parseFloat(hireForm.bidRate || '0') * 1.2,
        budgetType: 'hourly',
        currency: hireForm.currency,
        description: `${hireForm.problemDesc}\n\nTech stack: ${hireForm.techStack}\nExpected outcome: ${hireForm.expectedOutcome}\nAdditional info: ${hireForm.additionalInfo}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit. Please try again.');
    }
    setHiring(false);
  };

  const inp: React.CSSProperties = {
    width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0',
    borderRadius:11, fontSize:14, outline:'none', fontFamily:'inherit',
    background:'#fff', color:'#0f172a', boxSizing:'border-box', transition:'border .15s',
  };
  const onF = (e: any) => e.target.style.borderColor = '#3b82f6';
  const onB = (e: any) => e.target.style.borderColor = '#e2e8f0';

  if (isLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#3b82f6', animation:'spin 1s linear infinite', margin:'0 auto 14px' }}/>
        <p style={{ color:'#64748b', fontSize:14 }}>Loading expert profile…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!expert) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:56, marginBottom:14 }}>🔍</div>
        <h2 style={{ fontWeight:800, color:'#0f172a', marginBottom:8 }}>Expert not found</h2>
        <button onClick={()=>navigate('/')} style={{ padding:'11px 24px', borderRadius:12, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>← Back to Home</button>
      </div>
    </div>
  );

  const name = expert.aliasName||expert.AliasName||expert.name||'Expert';
  const role2 = expert.currentRole||expert.CurrentRole||'IT Professional';
  const rate = expert.hourlyRate||expert.HourlyRate||'—';
  const cur2 = (expert.currency||expert.Currency)==='INR'?'₹':'$';
  const rating = +(expert.rating||expert.Rating||4.9).toFixed(1);
  const projects = expert.completedProjects||expert.CompletedProjects||0;
  const exp = expert.experienceYears||expert.ExperienceYears||expert.totalExp||0;
  const skills = expert.primarySkills||expert.skills||expert.Skills||[];
  const skillArr = Array.isArray(skills)?skills:String(skills).split(',').map((s:string)=>s.trim());
  const photo = expert.photoUrl||expert.PhotoUrl||null;
  const bio = expert.bioDescription||expert.bio||`Senior ${role2} with ${exp}+ years of enterprise experience. Available for hourly engagements.`;
  const avail = expert.isAvailable||expert.IsAvailable;
  const grad = GRADS[(name.charCodeAt(0)||0)%GRADS.length];

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif", color:'#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes checkPop{0%{transform:scale(0)}80%{transform:scale(1.2)}100%{transform:scale(1)}}
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #f1f5f9', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <button onClick={()=>{ if(view==='hire') setView('profile'); else { window.close(); navigate('/'); } }} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:14, fontWeight:600 }}>
          <ArrowLeft size={16}/> {view==='hire'?'Back to profile':'Back'}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:'#fff' }}>WS</div>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>WorkSupport <span style={{ color:'#3b82f6' }}>360</span></span>
        </div>
        {view==='profile'
          ? <button onClick={handleHireClick} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 22px', borderRadius:10, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 3px 12px rgba(59,130,246,0.35)' }}>
              <Briefcase size={14}/> Hire {name.split(' ')[0]}
            </button>
          : <div style={{ fontSize:13, color:'#64748b', fontWeight:500 }}>Step 2 of 2 — Your request</div>
        }
      </nav>

      {/* ── PROFILE VIEW ── */}
      {view === 'profile' && (<>
        {/* Hero banner */}
        <div style={{ background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)', padding:'48px 40px 0', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize:'24px 24px' }}/>
          <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'rgba(59,130,246,0.1)', filter:'blur(40px)' }}/>
          <div style={{ maxWidth:960, margin:'0 auto', position:'relative', zIndex:1, display:'grid', gridTemplateColumns:'auto 1fr auto', gap:28, alignItems:'flex-end' }}>
            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              {photo
                ? <img src={photo} alt={name} style={{ width:110, height:110, borderRadius:22, objectFit:'cover', border:'3px solid rgba(255,255,255,0.2)' }}/>
                : <div style={{ width:110, height:110, borderRadius:22, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:42, color:'#fff', border:'3px solid rgba(255,255,255,0.15)', boxShadow:'0 8px 32px rgba(0,0,0,0.3)' }}>{name[0]?.toUpperCase()}</div>
              }
              {avail&&<div style={{ position:'absolute', bottom:6, right:6, display:'flex', alignItems:'center', gap:4, background:'#22c55e', borderRadius:100, padding:'3px 8px 3px 5px', border:'2px solid #0f172a' }}><div style={{ width:7, height:7, borderRadius:'50%', background:'#fff' }}/><span style={{ fontSize:10, fontWeight:800, color:'#fff' }}>Available</span></div>}
            </div>
            {/* Info */}
            <div style={{ paddingBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
                <h1 style={{ fontWeight:900, fontSize:28, color:'#fff', letterSpacing:'-0.04em', margin:0 }}>{name}</h1>
                <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, padding:'4px 10px' }}>
                  <Shield size={12} color="#60a5fa"/>
                  <span style={{ fontSize:11, fontWeight:700, color:'#93c5fd' }}>MNC Verified</span>
                </div>
              </div>
              <div style={{ fontSize:16, color:'rgba(255,255,255,0.7)', marginBottom:12 }}>{role2}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:16, fontSize:13, color:'rgba(255,255,255,0.55)' }}>
                <span><Star size={13} color="#f59e0b" fill="#f59e0b" style={{ display:'inline', verticalAlign:'middle' }}/> <strong style={{ color:'#fff' }}>{rating}</strong> rating</span>
                <span><CheckCircle size={13} color="#22c55e" style={{ display:'inline', verticalAlign:'middle' }}/> <strong style={{ color:'#fff' }}>{projects}</strong> projects</span>
                <span><Award size={13} style={{ display:'inline', verticalAlign:'middle' }}/> <strong style={{ color:'#fff' }}>{exp}+</strong> years exp</span>
                <span><Clock size={13} style={{ display:'inline', verticalAlign:'middle' }}/> Responds in ~25m</span>
              </div>
            </div>
            {/* Rate card */}
            <div style={{ background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:20, padding:'20px 24px', textAlign:'center', marginBottom:24 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.45)', fontWeight:600, marginBottom:6, textTransform:'uppercase', letterSpacing:'0.06em' }}>Hourly Rate</div>
              <div style={{ fontSize:36, fontWeight:900, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>{cur2}{rate}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:16 }}>/hour · billed after session</div>
              <button onClick={handleHireClick} style={{ width:'100%', padding:'12px', borderRadius:13, background:'linear-gradient(135deg,#2563eb,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(59,130,246,0.4)' }}>
                Hire Now →
              </button>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:10 }}>No payment until you approve</div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ maxWidth:960, margin:'0 auto', display:'flex', gap:0, position:'relative', zIndex:1 }}>
            {(['about','projects','reviews'] as const).map(t=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{ padding:'14px 24px', border:'none', borderRadius:'10px 10px 0 0', fontSize:14, fontWeight:700, cursor:'pointer', transition:'all .15s',
                  background: tab===t?'#f8fafc':'transparent',
                  color: tab===t?'#0f172a':'rgba(255,255,255,0.5)',
                }}>
                {t==='about'?'👤 About':t==='projects'?'🏗️ Projects':'⭐ Reviews'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth:960, margin:'0 auto', padding:'0 40px 60px', display:'grid', gridTemplateColumns:'1fr 300px', gap:28, alignItems:'flex-start' }}>
          <div style={{ background:'#fff', borderRadius:'0 0 20px 20px', padding:'28px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9', borderTop:'none' }}>

            {tab==='about'&&(
              <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:12 }}>About</h3>
                  <p style={{ fontSize:14, color:'#475569', lineHeight:1.8 }}>{bio}</p>
                </div>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:14 }}>Skills & Technologies</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {skillArr.map((s:string,i:number)=>{
                      const cols=['#3b82f6','#7c3aed','#059669','#d97706','#0891b2','#dc2626','#be185d'];
                      const col=cols[i%cols.length];
                      return <span key={s} style={{ padding:'6px 14px', borderRadius:9, background:`${col}12`, border:`1.5px solid ${col}25`, color:col, fontSize:12, fontWeight:700 }}>{s}</span>;
                    })}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                  {[{l:'Projects',v:projects||'24+',icon:<CheckCircle size={18} color="#22c55e"/>},{l:'Experience',v:`${exp}yr`,icon:<Award size={18} color="#3b82f6"/>},{l:'Rating',v:rating,icon:<Star size={18} color="#f59e0b" fill="#f59e0b"/>},{l:'Repeat hire',v:'88%',icon:<TrendingUp size={18} color="#7c3aed"/>}].map(s=>(
                    <div key={s.l} style={{ background:'#f8fafc', borderRadius:14, padding:'16px 14px', textAlign:'center', border:'1px solid #f1f5f9' }}>
                      <div style={{ display:'flex', justifyContent:'center', marginBottom:6 }}>{s.icon}</div>
                      <div style={{ fontWeight:900, fontSize:20, color:'#0f172a' }}>{s.v}</div>
                      <div style={{ fontSize:11, color:'#64748b', marginTop:2 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h3 style={{ fontWeight:800, fontSize:16, color:'#0f172a', marginBottom:12 }}>Typical availability</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>{
                      const active=['Mon','Tue','Wed','Thu','Fri','Sat'].includes(d);
                      return <div key={d} style={{ padding:'8px 16px', borderRadius:10, background:active?'#eff6ff':'#f8fafc', border:`1.5px solid ${active?'#bfdbfe':'#e2e8f0'}`, fontSize:13, fontWeight:600, color:active?'#1d4ed8':'#94a3b8' }}>{d} {active?'✓':''}</div>;
                    })}
                  </div>
                  <p style={{ fontSize:12, color:'#64748b', marginTop:10 }}>6:00 PM – 11:00 PM IST weekdays · All day weekends</p>
                </div>
              </div>
            )}

            {tab==='projects'&&(
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                  <h3 style={{ fontWeight:800, fontSize:16, color:'#0f172a', margin:0 }}>Past Projects</h3>
                  <span style={{ fontSize:12, color:'#94a3b8' }}>Company names protected</span>
                </div>
                {MOCK_PROJECTS.map((p,i)=>(
                  <div key={i} style={{ background:'#f8fafc', border:'1.5px solid #f1f5f9', borderRadius:16, padding:'18px', transition:'all .2s' }}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#bfdbfe';e.currentTarget.style.background='#eff6ff';}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor='#f1f5f9';e.currentTarget.style.background='#f8fafc';}}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:8, gap:12 }}>
                      <h4 style={{ fontWeight:800, fontSize:14, color:'#0f172a', margin:0 }}>{p.title}</h4>
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:8, background:'#dcfce7', color:'#15803d', flexShrink:0 }}>✓ {p.outcome}</span>
                    </div>
                    <p style={{ fontSize:13, color:'#475569', lineHeight:1.7, margin:'0 0 10px' }}>{p.desc}</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                      <div style={{ display:'flex', gap:5 }}>{p.tags.map(t=><span key={t} style={{ fontSize:11, padding:'2px 8px', borderRadius:6, background:'#fff', border:'1px solid #e2e8f0', color:'#475569' }}>{t}</span>)}</div>
                      <span style={{ fontSize:11, color:'#94a3b8' }}>⏱ {p.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab==='reviews'&&(
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:16, padding:'18px', background:'linear-gradient(135deg,#eff6ff,#f0fdf4)', borderRadius:14, border:'1px solid #bfdbfe', marginBottom:4 }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:44, fontWeight:900, color:'#0f172a', lineHeight:1 }}>{rating}</div>
                    <Stars r={rating} s={15}/>
                    <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>Overall rating</div>
                  </div>
                  <div style={{ flex:1 }}>
                    {[5,4,3].map(star=>(
                      <div key={star} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                        <span style={{ fontSize:11, color:'#64748b', width:8 }}>{star}</span>
                        <Star size={10} fill="#f59e0b" color="#f59e0b"/>
                        <div style={{ flex:1, height:7, borderRadius:4, background:'#e2e8f0', overflow:'hidden' }}>
                          <div style={{ height:'100%', borderRadius:4, background:'#f59e0b', width:star===5?'80%':star===4?'15%':'5%' }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {MOCK_REVIEWS.map((r,i)=>(
                  <div key={i} style={{ background:'#f8fafc', border:'1.5px solid #f1f5f9', borderRadius:14, padding:'18px' }}>
                    <div style={{ display:'flex', gap:2, marginBottom:8 }}><Stars r={r.rating} s={13}/></div>
                    <p style={{ fontSize:13, color:'#374151', lineHeight:1.75, margin:'0 0 12px', fontStyle:'italic' }}>"{r.text}"</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:'#fff' }}>{r.author[0]}</div>
                        <div><div style={{ fontWeight:700, fontSize:12, color:'#0f172a' }}>{r.author}</div><div style={{ fontSize:11, color:'#64748b' }}>{r.company}</div></div>
                      </div>
                      <span style={{ fontSize:11, color:'#94a3b8' }}>{r.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, paddingTop:4 }}>
            <div style={{ background:'#fff', borderRadius:20, padding:'22px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
              <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:4 }}>Hire {name.split(' ')[0]}</div>
              <div style={{ fontSize:13, color:'#64748b', marginBottom:14, lineHeight:1.6 }}>Submit a bid — admin matches and confirms within 4 hours.</div>
              <button onClick={handleHireClick} style={{ width:'100%', padding:'13px', borderRadius:13, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', marginBottom:8, boxShadow:'0 4px 14px rgba(59,130,246,0.3)' }}>
                Submit Hire Request →
              </button>
              <div style={{ fontSize:11, color:'#94a3b8', textAlign:'center' }}>No payment until session confirmed</div>
            </div>
            <div style={{ background:'#fff', borderRadius:20, padding:'18px', boxShadow:'0 4px 20px rgba(0,0,0,0.06)', border:'1px solid #f1f5f9' }}>
              <div style={{ fontWeight:700, fontSize:13, color:'#0f172a', marginBottom:12 }}>Expert details</div>
              {[{l:'Response time',v:'~25 min'},{l:'Projects done',v:`${projects||24}+`},{l:'Repeat hire',v:'88%'},{l:'Languages',v:'English, Hindi'},{l:'Identity',v:'MNC-verified'},{l:'Experience',v:`${exp}+ years`}].map(item=>(
                <div key={item.l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f8fafc', fontSize:12 }}>
                  <span style={{ color:'#64748b' }}>{item.l}</span>
                  <span style={{ fontWeight:600, color:'#0f172a' }}>{item.v}</span>
                </div>
              ))}
            </div>
            <div style={{ background:'linear-gradient(135deg,#0f172a,#1e3a5f)', borderRadius:18, padding:'18px' }}>
              <div style={{ fontWeight:700, fontSize:12, color:'rgba(255,255,255,0.5)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em' }}>Our guarantee</div>
              {['Identity 100% protected','Pay only after you approve','4-hour admin response','GST invoice provided'].map(g=>(
                <div key={g} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7, fontSize:12, color:'rgba(255,255,255,0.7)' }}>
                  <CheckCircle size={13} color="#22c55e"/> {g}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>)}

      {/* ── HIRE FORM VIEW ── */}
      {view === 'hire' && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'40px 24px 60px' }}>

          {submitted ? (
            /* Success state */
            <div style={{ background:'#fff', borderRadius:24, padding:'52px 40px', textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', border:'1px solid #f1f5f9', animation:'fadeIn .5s ease' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', animation:'checkPop .4s ease', boxShadow:'0 8px 24px rgba(34,197,94,0.3)' }}>
                <Check size={36} color="#fff" strokeWidth={3}/>
              </div>
              <h2 style={{ fontWeight:900, fontSize:26, color:'#0f172a', margin:'0 0 10px', letterSpacing:'-0.03em' }}>Request submitted! 🎉</h2>
              <p style={{ fontSize:15, color:'#475569', lineHeight:1.75, margin:'0 0 8px' }}>
                Your hire request for <strong>{name}</strong> has been received.
              </p>
              <p style={{ fontSize:14, color:'#64748b', lineHeight:1.7, margin:'0 0 28px' }}>
                Our admin team will review your request and contact you within <strong>4 hours</strong> via email and WhatsApp. They'll confirm availability and schedule the demo/session.
              </p>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:16, padding:'18px 20px', marginBottom:28, textAlign:'left' }}>
                <div style={{ fontSize:12, fontWeight:800, color:'#374151', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>What happens next</div>
                {[
                  {step:'1',text:'Admin reviews your request and contacts the expert',time:'Within 1 hour'},
                  {step:'2',text:'Expert confirms availability and session details',time:'Within 2 hours'},
                  {step:'3',text:'Admin sends you calendar invite + session link',time:'Within 4 hours'},
                  {step:'4',text:'Session happens — you pay only after approval',time:'On session day'},
                ].map(s=>(
                  <div key={s.step} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:12 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>{s.step}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#374151', fontWeight:500 }}>{s.text}</div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>{s.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:12 }}>
                <button onClick={()=>navigate('/client')} style={{ flex:1, padding:'13px', borderRadius:13, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(59,130,246,0.3)' }}>
                  View My Dashboard →
                </button>
                <button onClick={()=>{setSubmitted(false);setView('profile');}} style={{ flex:1, padding:'13px', borderRadius:13, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>
                  Back to Profile
                </button>
              </div>
            </div>
          ) : (
            /* Hire form */
            <div style={{ animation:'slideIn .3s ease' }}>
              {/* Expert mini card */}
              <div style={{ background:'#fff', borderRadius:18, padding:'18px 20px', marginBottom:20, border:'1.5px solid #f1f5f9', display:'flex', alignItems:'center', gap:14, boxShadow:'0 2px 8px rgba(0,0,0,0.05)' }}>
                {photo
                  ? <img src={photo} alt={name} style={{ width:52, height:52, borderRadius:14, objectFit:'cover' }}/>
                  : <div style={{ width:52, height:52, borderRadius:14, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:20, color:'#fff', flexShrink:0 }}>{name[0]?.toUpperCase()}</div>
                }
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>{name}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{role2} · <Stars r={rating} s={11}/> {rating}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:900, fontSize:22, color:'#0f172a' }}>{cur2}{rate}</div>
                  <div style={{ fontSize:11, color:'#94a3b8' }}>/hr listed rate</div>
                </div>
              </div>

              <div style={{ background:'#fff', borderRadius:22, padding:'28px', boxShadow:'0 4px 24px rgba(0,0,0,0.07)', border:'1px solid #f1f5f9' }}>
                <h2 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 4px', letterSpacing:'-0.03em' }}>Submit your hire request</h2>
                <p style={{ fontSize:14, color:'#64748b', margin:'0 0 24px' }}>WorkSupport 360 admin will review and connect you with the expert within 4 hours.</p>

                <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
                  {/* What kind of help */}
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>What kind of help do you need?</label>
                    <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 10px' }}>Choose the type of session — admin will schedule it accordingly</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {[
                        {v:'consultation', e:'💬', l:'Ask & Advise', sub:'Talk through a problem, get expert advice, architecture review, or a second opinion on your approach.'},
                        {v:'demo',         e:'🖥️', l:'Live Debug / Fix', sub:'Expert joins your screen via Zoom/Meet and fixes the issue live with you — ideal for production bugs.'},
                        {v:'development',  e:'⚙️', l:'Build & Develop', sub:'Expert writes code, sets up infrastructure, or completes a defined task during the session.'},
                      ].map(t=>(
                        <button key={t.v} type="button" onClick={()=>setHireForm({...hireForm,sessionType:t.v})}
                          style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'13px 14px', borderRadius:13, border:`1.5px solid ${hireForm.sessionType===t.v?'#3b82f6':'#e2e8f0'}`, background:hireForm.sessionType===t.v?'#eff6ff':'#fff', cursor:'pointer', transition:'all .18s', textAlign:'left' as const }}>
                          <div style={{ fontSize:22, flexShrink:0, marginTop:1 }}>{t.e}</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:13, color:hireForm.sessionType===t.v?'#1d4ed8':'#0f172a', marginBottom:3 }}>{t.l}</div>
                            <div style={{ fontSize:12, color:'#64748b', lineHeight:1.55 }}>{t.sub}</div>
                          </div>
                          {hireForm.sessionType===t.v && <div style={{ marginLeft:'auto', flexShrink:0, width:20, height:20, borderRadius:'50%', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}><polyline points="20 6 9 17 4 12"/></svg></div>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration + Bid rate */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Duration needed</label>
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {['1','2','4','6','8'].map(h=>(
                          <button key={h} type="button" onClick={()=>setHireForm({...hireForm,hours:h})}
                            style={{ padding:'8px 14px', borderRadius:9, border:`1.5px solid ${hireForm.hours===h?'#3b82f6':'#e2e8f0'}`, background:hireForm.hours===h?'#eff6ff':'#fff', color:hireForm.hours===h?'#1d4ed8':'#374151', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all .15s' }}>{h}hr</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your bid rate / hr <span style={{ color:'#94a3b8', fontWeight:400, textTransform:'none' }}>(optional)</span></label>
                      <div style={{ display:'flex', gap:8 }}>
                        <select value={hireForm.currency} onChange={e=>setHireForm({...hireForm,currency:e.target.value})} style={{ padding:'11px 10px', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:13, outline:'none', fontFamily:'inherit', background:'#fff', color:'#374151', width:80 }}>
                          <option>INR</option><option>USD</option><option>EUR</option>
                        </select>
                        <input type="number" value={hireForm.bidRate} onChange={e=>setHireForm({...hireForm,bidRate:e.target.value})} placeholder={`${cur2}${rate} listed`} style={{ ...inp, flex:1 }} onFocus={onF} onBlur={onB}/>
                      </div>
                      <div style={{ fontSize:11, color:'#94a3b8', marginTop:5 }}>Listed rate: {cur2}{rate}/hr · bid lower or match</div>
                    </div>
                  </div>

                  {/* Preferred date/time */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Preferred date *</label>
                      <input type="date" value={hireForm.preferredDate} min={new Date().toISOString().split('T')[0]} onChange={e=>setHireForm({...hireForm,preferredDate:e.target.value})} style={inp} onFocus={onF} onBlur={onB}/>
                    </div>
                    <div>
                      <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Preferred time</label>
                      <input type="time" value={hireForm.preferredTime} onChange={e=>setHireForm({...hireForm,preferredTime:e.target.value})} style={inp} onFocus={onF} onBlur={onB}/>
                    </div>
                  </div>

                  {/* Problem description */}
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Describe the problem / task *</label>
                    <textarea value={hireForm.problemDesc} onChange={e=>setHireForm({...hireForm,problemDesc:e.target.value})} rows={4}
                      placeholder="e.g. Our React dashboard is slow — FCP is 8 seconds. Need someone to profile, identify bottlenecks and fix. Production app with ~5K daily users."
                      style={{ ...inp, resize:'none', lineHeight:1.65 }} onFocus={onF} onBlur={onB}/>
                  </div>

                  {/* Tech stack */}
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Your tech stack</label>
                    <input value={hireForm.techStack} onChange={e=>setHireForm({...hireForm,techStack:e.target.value})} placeholder="e.g. React 18, Node.js, PostgreSQL, AWS EC2" style={inp} onFocus={onF} onBlur={onB}/>
                  </div>

                  {/* Expected outcome */}
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Expected outcome</label>
                    <input value={hireForm.expectedOutcome} onChange={e=>setHireForm({...hireForm,expectedOutcome:e.target.value})} placeholder="e.g. FCP under 2 seconds, root cause identified, fix deployed" style={inp} onFocus={onF} onBlur={onB}/>
                  </div>

                  {/* Additional info */}
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.04em' }}>Additional information <span style={{ color:'#94a3b8', fontWeight:400, textTransform:'none' }}>(optional)</span></label>
                    <textarea value={hireForm.additionalInfo} onChange={e=>setHireForm({...hireForm,additionalInfo:e.target.value})} rows={2}
                      placeholder="Any specific requirements, NDA, access details, or questions for the expert…"
                      style={{ ...inp, resize:'none', lineHeight:1.65 }} onFocus={onF} onBlur={onB}/>
                  </div>

                  {/* Cost estimate */}
                  {hireForm.bidRate && (
                    <div style={{ background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:13, padding:'14px 16px' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1d4ed8', marginBottom:4 }}>💰 Estimated cost</div>
                      <div style={{ fontSize:22, fontWeight:900, color:'#0f172a' }}>
                        {hireForm.currency==='INR'?'₹':'$'}{(parseFloat(hireForm.bidRate||'0')*parseInt(hireForm.hours||'1')).toLocaleString()}
                      </div>
                      <div style={{ fontSize:12, color:'#3b82f6' }}>{hireForm.bidRate}/hr × {hireForm.hours} hours · Pay only after session is confirmed & approved</div>
                    </div>
                  )}

                  {/* Notice */}
                  <div style={{ background:'#f0fdf4', border:'1px solid #86efac', borderRadius:12, padding:'12px 14px', fontSize:13, color:'#15803d' }}>
                    ✅ After submitting, WorkSupport 360 admin will contact you and the expert within 4 hours to confirm the session. A confirmation email will be sent to your registered email.
                  </div>

                  {/* Submit */}
                  <button onClick={handleSubmit} disabled={hiring||!hireForm.problemDesc||!hireForm.preferredDate}
                    style={{ padding:'15px', borderRadius:14, background:hiring||!hireForm.problemDesc||!hireForm.preferredDate?'#f1f5f9':'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:hiring||!hireForm.problemDesc||!hireForm.preferredDate?'#94a3b8':'#fff', border:'none', fontSize:15, fontWeight:700, cursor:hiring||!hireForm.problemDesc||!hireForm.preferredDate?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:hiring||!hireForm.problemDesc||!hireForm.preferredDate?'none':'0 6px 20px rgba(59,130,246,0.35)' }}>
                    {hiring?'⏳ Submitting…':'🚀 Submit Hire Request — Admin responds in 4 hrs'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LOGIN MODAL ── */}
      {showLoginModal&&(
        <div onClick={()=>setShowLoginModal(false)} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(7px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:24, padding:'36px 32px', maxWidth:420, width:'100%', boxShadow:'0 28px 80px rgba(0,0,0,0.25)', textAlign:'center', animation:'modalIn .3s ease' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28, boxShadow:'0 6px 20px rgba(59,130,246,0.3)' }}>🔒</div>
            <h3 style={{ fontWeight:900, fontSize:22, color:'#0f172a', margin:'0 0 8px' }}>Sign in to hire</h3>
            <p style={{ fontSize:14, color:'#64748b', lineHeight:1.75, margin:'0 0 20px' }}>You need a <strong>client account</strong> to hire {name}. Sign in or create a free account.</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={()=>{ localStorage.setItem('pendingHire',JSON.stringify({expertId:id,expertName:name})); navigate(`/login?returnTo=/expert/${id}`); setShowLoginModal(false); }}
                style={{ padding:'13px', borderRadius:13, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(59,130,246,0.35)' }}>Sign in →</button>
              <button onClick={()=>{ navigate('/register?role=client'); setShowLoginModal(false); }}
                style={{ padding:'13px', borderRadius:13, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>Register as Client (free)</button>
              <button onClick={()=>setShowLoginModal(false)} style={{ padding:'10px', background:'none', border:'none', fontSize:13, color:'#94a3b8', cursor:'pointer' }}>Stay on this page</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ROLE MODAL ── */}
      {showRoleModal&&(
        <div onClick={()=>setShowRoleModal(false)} style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.65)', backdropFilter:'blur(7px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:24 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:24, padding:'36px 32px', maxWidth:420, width:'100%', boxShadow:'0 28px 80px rgba(0,0,0,0.25)', textAlign:'center', animation:'modalIn .3s ease' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,#f59e0b,#ef4444)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>⚠️</div>
            <h3 style={{ fontWeight:900, fontSize:20, color:'#0f172a', margin:'0 0 8px' }}>You're signed in as a Freelancer</h3>
            <p style={{ fontSize:14, color:'#64748b', lineHeight:1.75, margin:'0 0 12px' }}>Only <strong>clients</strong> can hire experts. Sign in with a client account to hire {name}.</p>
            <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:12, padding:'10px 14px', marginBottom:20, fontSize:13, color:'#92400e' }}>
              💡 You can register a separate client account with a different email.
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={()=>{ navigate('/login?returnTo=/expert/'+id); setShowRoleModal(false); }}
                style={{ padding:'13px', borderRadius:13, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer' }}>Sign in as Client →</button>
              <button onClick={()=>{ navigate('/register?role=client'); setShowRoleModal(false); }}
                style={{ padding:'13px', borderRadius:13, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>Register a Client Account</button>
              <button onClick={()=>setShowRoleModal(false)} style={{ padding:'10px', background:'none', border:'none', fontSize:13, color:'#94a3b8', cursor:'pointer' }}>Stay on this page</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertPage;
