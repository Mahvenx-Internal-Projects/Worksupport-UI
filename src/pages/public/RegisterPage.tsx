import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, User, Briefcase, Lock, Mail, Info, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

type Role = 'client' | 'freelancer';

const SKILL_CATEGORIES = [
  { label:'🖥️ Frontend',   color:'#3b82f6', bg:'#eff6ff', skills:['React','Angular','Vue.js','Next.js','TypeScript','JavaScript','HTML/CSS','Tailwind CSS'] },
  { label:'⚙️ Backend',    color:'#7c3aed', bg:'#f5f3ff', skills:['Node.js','Python','Django','FastAPI','Java','Spring Boot','.NET','C#','Go','Rust','PHP'] },
  { label:'☁️ Cloud/DevOps',color:'#0891b2', bg:'#ecfeff', skills:['AWS','GCP','Azure','Docker','Kubernetes','Terraform','CI/CD','Linux','Ansible'] },
  { label:'🗄️ Database',   color:'#059669', bg:'#ecfdf5', skills:['MySQL','PostgreSQL','MongoDB','Redis','Elasticsearch','GraphQL','Kafka'] },
  { label:'📱 Mobile',     color:'#db2777', bg:'#fdf2f8', skills:['React Native','Flutter','iOS','Android','Swift','Kotlin'] },
  { label:'🤖 AI / Data',  color:'#d97706', bg:'#fffbeb', skills:['Machine Learning','TensorFlow','PyTorch','Data Science','Power BI','Tableau'] },
  { label:'🔬 Testing',    color:'#dc2626', bg:'#fef2f2', skills:['Selenium','Cypress','Playwright','Microservices','Blockchain'] },
];

const TIMEZONES = ['IST (UTC+5:30)','EST (UTC-5)','PST (UTC-8)','GMT (UTC+0)','CET (UTC+1)','SGT (UTC+8)','AEST (UTC+10)'];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

/* ── Role Picker Modal ─────────────────────────────────────── */
const RoleModal: React.FC<{ onPick:(r:Role)=>void }> = ({ onPick }) => {
  const [vis, setVis] = useState(false);
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),40); return()=>clearTimeout(t); },[]);
  const pick=(r:Role)=>{ setVis(false); setTimeout(()=>onPick(r),180); };
  return (
    <>
      <style>{`@keyframes mi{from{opacity:0;transform:scale(.94) translateY(14px)}to{opacity:1;transform:none}}`}</style>
      <div style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(15,23,42,0.75)',backdropFilter:'blur(8px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24,opacity:vis?1:0,transition:'opacity .2s' }}>
        <div style={{ background:'#fff',borderRadius:24,padding:'36px 32px',width:'100%',maxWidth:480,boxShadow:'0 28px 80px rgba(0,0,0,0.3)',animation:'mi .32s cubic-bezier(.16,1,.3,1) both' }}>
          <div style={{ textAlign:'center',marginBottom:26 }}>
            <div style={{ fontSize:40,marginBottom:10 }}>👋</div>
            <h2 style={{ fontWeight:900,fontSize:22,color:'#0f172a',margin:'0 0 6px',letterSpacing:'-0.03em' }}>How will you use WorkSupport 360?</h2>
            <p style={{ fontSize:13,color:'#64748b',margin:0 }}>Choose your role to personalise your registration</p>
          </div>
          {[
            { r:'client' as Role, icon:'🏢', title:"I'm a Client / Business", desc:'Hire IT experts on demand — hourly, day, or monthly support.', tags:['Hire by the hour','Post requirements','Day & monthly plans'], hc:'#2563eb', hl:'#eff6ff', hb:'#bfdbfe' },
            { r:'freelancer' as Role, icon:'👨‍💻', title:"I'm an IT Professional", desc:'Earn extra income during free hours. Identity fully protected from your employer.', tags:['Earn extra income','Identity protected','Flexible hours'], hc:'#7c3aed', hl:'#f5f3ff', hb:'#ddd6fe' },
          ].map(o=>(
            <button key={o.r} onClick={()=>pick(o.r)} style={{ display:'flex',alignItems:'flex-start',gap:14,width:'100%',padding:'16px 18px',borderRadius:16,marginBottom:10,border:'2px solid #e2e8f0',background:'#fff',cursor:'pointer',textAlign:'left',transition:'all .18s' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=o.hc;e.currentTarget.style.background=o.hl;e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#fff';e.currentTarget.style.transform='none';}}>
              <div style={{ width:48,height:48,borderRadius:13,flexShrink:0,background:o.r==='client'?'linear-gradient(135deg,#2563eb,#3b82f6)':'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>{o.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:800,fontSize:15,color:'#0f172a',marginBottom:4 }}>{o.title}</div>
                <div style={{ fontSize:12,color:'#64748b',lineHeight:1.6,marginBottom:8 }}>{o.desc}</div>
                <div style={{ display:'flex',flexWrap:'wrap',gap:4 }}>
                  {o.tags.map(t=><span key={t} style={{ fontSize:10,padding:'2px 8px',borderRadius:6,background:o.hl,color:o.hc,fontWeight:700,border:`1px solid ${o.hb}` }}>{t}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

/* ── Field ─────────────────────────────────────────────────── */
const F: React.FC<{ label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; hint?:string; error?:string; icon?:React.ReactNode; required?:boolean }> = ({ label,value,onChange,placeholder,type='text',hint,error,icon,required }) => (
  <div>
    <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:5,letterSpacing:'0.04em',textTransform:'uppercase' as const }}>{label}{required&&<span style={{ color:'#ef4444',marginLeft:2 }}>*</span>}</label>
    <div style={{ position:'relative' }}>
      {icon&&<div style={{ position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#94a3b8',display:'flex' }}>{icon}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%',padding:'10px 12px',paddingLeft:icon?34:12,border:`1.5px solid ${error?'#fca5a5':'#e2e8f0'}`,borderRadius:10,fontSize:13,outline:'none',fontFamily:'inherit',background:'#fff',color:'#0f172a',transition:'border .15s' }}
        onFocus={e=>e.target.style.borderColor=error?'#ef4444':'#4f46e5'}
        onBlur={e=>e.target.style.borderColor=error?'#fca5a5':'#e2e8f0'}/>
    </div>
    {hint&&!error&&<div style={{ fontSize:10,color:'#94a3b8',marginTop:3 }}>{hint}</div>}
    {error&&<div style={{ fontSize:10,color:'#ef4444',marginTop:3 }}>{error}</div>}
  </div>
);

/* ── Sticky Nav Buttons ────────────────────────────────────── */
const NavBtns: React.FC<{ step:number; steps:string[]; canNext:boolean; onBack:()=>void; onNext:()=>void; onSubmit:()=>void; loading:boolean; agreed:boolean }> =
({ step,steps,canNext,onBack,onNext,onSubmit,loading,agreed }) => (
  <div style={{ display:'flex',gap:10,padding:'10px 0' }}>
    {step>0&&<button type="button" onClick={onBack} style={{ flex:1,padding:'11px',borderRadius:12,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:13,fontWeight:700,color:'#374151',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}><ArrowLeft size={14}/> Back</button>}
    {step<steps.length-1
      ? <button type="button" onClick={onNext} style={{ flex:2,padding:'11px',borderRadius:12,border:'none',background:canNext?'linear-gradient(135deg,#4f46e5,#7c3aed)':'#e2e8f0',fontSize:13,fontWeight:800,color:canNext?'#fff':'#94a3b8',cursor:canNext?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>Continue <ArrowRight size={14}/></button>
      : <button type="button" onClick={onSubmit} disabled={loading||!agreed} style={{ flex:2,padding:'11px',borderRadius:12,border:'none',background:loading||!agreed?'#e2e8f0':'linear-gradient(135deg,#2563eb,#3b82f6)',fontSize:13,fontWeight:800,color:loading||!agreed?'#94a3b8':'#fff',cursor:loading||!agreed?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6 }}>
          {loading?'⏳ Creating…':'🚀 Create account'}
        </button>
    }
  </div>
);

/* ── Main RegisterPage ─────────────────────────────────────── */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { register } = useAuthStore();

  const defaultRole = (sp.get('role') as Role) || null;
  const [role, setRole] = useState<Role>(defaultRole || 'client');
  const [roleReady, setRoleReady] = useState(!!defaultRole);
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSkills, setSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string|null>(null);
  const [photoFile, setPhotoFile] = useState<File|null>(null);
  const [projects, setProjects] = useState<{title:string;role:string;company:string;tech:string;desc:string;url:string;type:string}[]>([]);
  const [addingProject, setAddingProject] = useState(false);
  const [proj, setProj] = useState({title:'',role:'',company:'',tech:'',desc:'',url:'',type:'freelance'});
  const [skillCat, setSkillCat] = useState('All');
  const [supportTypes, setSupportTypes] = useState<string[]>(['hourly']);

  const [form, setForm] = useState({
    name:'',email:'',password:'',confirmPassword:'',mobile:'',
    companyName:'',contactName:'',gstNumber:'',
    currentRole:'',currentCompany:'',totalExp:'',freelanceExp:'',
    hourlyRate:'',currency:'INR',timezone:'IST (UTC+5:30)',bio:'',
  });

  const [avail, setAvail] = useState(DAYS.map(d=>({ day:d, on:['Mon','Tue','Wed','Thu','Fri'].includes(d), start:'18:00', end:'22:00' })));

  const steps = role==='freelancer'
    ? ['Account','Profile','Availability','Photo & Bio','Skills','Portfolio','Review']
    : ['Account','Company','Review'];

  const set=(k:string,v:string)=>setForm(f=>({...f,[k]:v}));
  const toggleSkill=(s:string)=>setSkills(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const addCustom=()=>{ const v=customSkill.trim(); if(v&&!selectedSkills.includes(v)){setSkills(p=>[...p,v]);setCustomSkill('');} };
  const toggleSupport=(t:string)=>setSupportTypes(p=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);

  const canNext=()=>{
    if(step===0) return form.name&&form.email&&form.password.length>=8&&form.password===form.confirmPassword&&form.mobile;
    if(step===1&&role==='freelancer') return form.currentRole&&form.currentCompany&&form.totalExp&&form.hourlyRate&&supportTypes.length>0;
    if(step===1&&role==='client') return form.companyName&&form.contactName;
    if(step===4&&role==='freelancer') return selectedSkills.length>=3;
    if(step===5&&role==='freelancer') return true; // portfolio optional
    return true;
  };

  const handleSubmit=async()=>{
    if(!agreed){toast.error('Please agree to terms');return;}
    setLoading(true);
    try{
      // Step 1: register user
      await register({
        // Core fields
        email:        form.email,
        password:     form.password,
        role:         role==='client' ? 'Client' : 'Freelancer',
        name:         form.name,
        mobileNumber: form.mobile,
        // Client fields
        companyName:  role==='client' ? form.companyName : form.currentCompany,
        contactName:  role==='client' ? form.contactName : form.name,
        gstNumber:    form.gstNumber || undefined,
        // Freelancer fields (sent directly to API — no localStorage needed)
        currentRole:        role==='freelancer' ? form.currentRole : undefined,
        currentCompany:     role==='freelancer' ? form.currentCompany : undefined,
        totalExperience:    role==='freelancer' ? form.totalExp : undefined,
        freelanceExperience:role==='freelancer' ? form.freelanceExp : undefined,
        hourlyRate:         role==='freelancer' ? form.hourlyRate : undefined,
        currency:           role==='freelancer' ? form.currency : undefined,
        timezone:           role==='freelancer' ? form.timezone : undefined,
        bio:                role==='freelancer' ? form.bio : undefined,
        skills:             role==='freelancer' ? selectedSkills : undefined,
        supportTypes:       role==='freelancer' ? supportTypes : undefined,
        availability:       role==='freelancer' ? avail : undefined,
        portfolioProjects:  role==='freelancer' ? projects : undefined,
        totalExp:           role==='freelancer' ? parseInt(form.totalExp||'0') : undefined,
        freelanceExp:       role==='freelancer' ? parseInt(form.freelanceExp||'0') : undefined,
      } as any);

      // Step 2: upload profile photo to Cloudflare R2 if provided
      // Wait a moment for token to be stored by authStore
      if (photoFile && role === 'freelancer') {
        try {
          await new Promise(res => setTimeout(res, 500)); // ensure token stored
          const token = localStorage.getItem('accessToken');
          if (token) {
            const fd = new FormData();
            fd.append('file', photoFile);
            const apiBase = 'https://api.worksupport360.com/api';
            const uploadRes = await fetch(`${apiBase}/upload/profile-photo`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: fd,
            });
            const uploadData = await uploadRes.json();
            if (uploadData.url) {
              toast.success('Profile photo uploaded! 📸');
            }
          }
        } catch { /* photo upload failure shouldn't block registration */ }
      }
      navigate(`/login?registered=true&email=${encodeURIComponent(form.email)}&role=${role}`);
    }catch(err:any){ toast.error(err?.response?.data?.message||'Registration failed'); }
    finally{ setLoading(false); }
  };

  const inp:React.CSSProperties={ width:'100%',padding:'10px 12px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:13,outline:'none',fontFamily:'inherit',background:'#fff',color:'#0f172a',transition:'border .15s' };
  const onF=(e:any)=>e.target.style.borderColor='#4f46e5';
  const onB=(e:any)=>e.target.style.borderColor='#e2e8f0';

  const stepContent=()=>{

    /* ── STEP 0: Account ── */
    if(step===0) return(
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10 }} className="reg-grid">
          <F label="Full name" value={form.name} onChange={v=>set('name',v)} placeholder="Rahul Sharma" icon={<User size={13}/>} required/>
          <F label="Mobile" value={form.mobile} onChange={v=>set('mobile',v)} placeholder="+91-9876543210" required/>
        </div>
        <F label="Email" type="email" value={form.email} onChange={v=>set('email',v)} placeholder="you@company.com" icon={<Mail size={13}/>} required/>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10 }} className="reg-grid">
          <div style={{ position:'relative' }}>
            <F label="Password" type={showPass?'text':'password'} value={form.password} onChange={v=>set('password',v)} placeholder="Min 8 chars" icon={<Lock size={13}/>} required/>
            <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute',right:11,bottom:10,background:'none',border:'none',cursor:'pointer',color:'#94a3b8' }}>
              {showPass?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
          <F label="Confirm password" type="password" value={form.confirmPassword} onChange={v=>set('confirmPassword',v)} placeholder="Repeat password"
            error={form.confirmPassword&&form.password!==form.confirmPassword?"Passwords don't match":''}/>
        </div>
      </div>
    );

    /* ── STEP 1 Freelancer: Profile + Support types ── */
    if(step===1&&role==='freelancer') return(
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {/* Identity protection notice */}
        <div style={{ background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:11,padding:'9px 13px',fontSize:12,color:'#1e40af',display:'flex',alignItems:'center',gap:7 }}>
          <Lock size={12}/> Your employer name is <strong>never shown</strong> to clients — only to admin.
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10 }} className="reg-grid">
          <F label="Current job title" value={form.currentRole} onChange={v=>set('currentRole',v)} placeholder="Sr. Software Engineer" icon={<Briefcase size={13}/>} required/>
          <F label="Current company" value={form.currentCompany} onChange={v=>set('currentCompany',v)} placeholder="Infosys (private 🔒)" icon={<Lock size={13}/>} required hint="Never shown to clients"/>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10 }}>
          <F label="Total exp (yrs)" type="number" value={form.totalExp} onChange={v=>set('totalExp',v)} placeholder="8" required/>
          <F label="Freelance exp (yrs)" type="number" value={form.freelanceExp} onChange={v=>set('freelanceExp',v)} placeholder="2"/>
          <div>
            <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:5,letterSpacing:'0.04em',textTransform:'uppercase' as const }}>Timezone</label>
            <select value={form.timezone} onChange={e=>set('timezone',e.target.value)} style={{ ...inp,cursor:'pointer' }} onFocus={onF} onBlur={onB}>
              {TIMEZONES.map(t=><option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'2fr 1fr',gap:10 }}>
          <F label="Hourly rate" type="number" value={form.hourlyRate} onChange={v=>set('hourlyRate',v)} placeholder="500" required hint="Your base rate — clients can bid"/>
          <div>
            <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:5,letterSpacing:'0.04em',textTransform:'uppercase' as const }}>Currency</label>
            <select value={form.currency} onChange={e=>set('currency',e.target.value)} style={{ ...inp,cursor:'pointer' }} onFocus={onF} onBlur={onB}>
              <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
            </select>
          </div>
        </div>

        {/* Support types */}
        <div>
          <div style={{ fontSize:11,fontWeight:700,color:'#374151',marginBottom:6,textTransform:'uppercase' as const,letterSpacing:'0.04em' }}>
            What support types can you offer? <span style={{ color:'#ef4444' }}>*</span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {[
              { v:'hourly',   e:'⚡', t:'Hourly Support',   d:'Available for 1–8 hour sessions. Perfect for debugging, reviews, quick tasks.', col:'#3b82f6', bg:'#eff6ff', border:'#bfdbfe' },
              { v:'day',      e:'☀️', t:'Day Support',       d:'Can commit 4 or 8-hour blocks for sprints, migrations, or focused builds.', col:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
              { v:'monthly',  e:'📅', t:'Monthly Support',   d:'Available weekly across a month for ongoing on-call or recurring work.', col:'#059669', bg:'#ecfdf5', border:'#a7f3d0' },
            ].map(t=>{
              const sel=supportTypes.includes(t.v);
              return(
                <button key={t.v} type="button" onClick={()=>toggleSupport(t.v)}
                  style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 13px',borderRadius:12,border:`1.5px solid ${sel?t.col:t.border}`,background:sel?t.bg:'#fff',cursor:'pointer',textAlign:'left' as const,transition:'all .18s' }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:sel?t.col:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>{t.e}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:sel?t.col:'#0f172a',marginBottom:2 }}>{t.t}</div>
                    <div style={{ fontSize:11,color:'#64748b',lineHeight:1.5 }}>{t.d}</div>
                  </div>
                  <div style={{ width:20,height:20,borderRadius:'50%',border:`2px solid ${sel?t.col:'#e2e8f0'}`,background:sel?t.col:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                    {sel&&<Check size={11} color="#fff"/>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#374151',display:'block',marginBottom:5,textTransform:'uppercase' as const,letterSpacing:'0.04em' }}>Bio (optional)</label>
          <textarea value={form.bio} onChange={e=>set('bio',e.target.value)} rows={2} placeholder="Brief intro shown to clients on your alias profile…"
            style={{ ...inp,resize:'none' as const,lineHeight:1.6 }} onFocus={onF} onBlur={onB}/>
        </div>
      </div>
    );

    /* ── STEP 1 Client: Company ── */
    if(step===1&&role==='client') return(
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        <F label="Company name" value={form.companyName} onChange={v=>set('companyName',v)} placeholder="ABC Technologies Pvt Ltd" icon={<Briefcase size={13}/>} required/>
        <F label="Contact person" value={form.contactName} onChange={v=>set('contactName',v)} placeholder="Priya Sharma" icon={<User size={13}/>} required/>
        <F label="GST number" value={form.gstNumber} onChange={v=>set('gstNumber',v)} placeholder="27AABCU9603R1ZV" hint="For GST-compliant invoices (optional)"/>
      </div>
    );

    /* ── STEP 2 Freelancer: Availability ── */
    if(step===2&&role==='freelancer') return(
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        {/* Instruction banner */}
        <div style={{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:11,padding:'10px 13px',fontSize:12,color:'#92400e',lineHeight:1.6 }}>
          <strong>⚠️ Important:</strong> You must <strong>set your status to Active every day</strong> you're available. Only active profiles appear in client searches that day. Toggle availability from your dashboard daily.
        </div>
        <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:11,padding:'9px 13px',fontSize:12,color:'#15803d' }}>
          💡 Set your <strong>typical weekly availability</strong> here. You can update it anytime from your profile.
        </div>

        {/* Days grid — compact */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5 }}>
          {avail.map((a,i)=>(
            <button key={a.day} type="button" onClick={()=>setAvail(av=>av.map((x,j)=>j===i?{...x,on:!x.on}:x))}
              style={{ padding:'8px 4px',borderRadius:10,border:`1.5px solid ${a.on?'#3b82f6':'#e2e8f0'}`,background:a.on?'#eff6ff':'#fff',cursor:'pointer',textAlign:'center' as const,transition:'all .15s' }}>
              <div style={{ fontSize:11,fontWeight:800,color:a.on?'#1d4ed8':'#94a3b8',marginBottom:3 }}>{a.day}</div>
              <div style={{ width:8,height:8,borderRadius:'50%',background:a.on?'#3b82f6':'#e2e8f0',margin:'0 auto' }}/>
            </button>
          ))}
        </div>

        {/* Time range for enabled days — compact */}
        <div style={{ background:'#f8fafc',borderRadius:12,padding:'12px' }}>
          <div style={{ fontSize:11,fontWeight:700,color:'#374151',marginBottom:8,textTransform:'uppercase' as const,letterSpacing:'0.04em' }}>Time window for active days</div>
          <div style={{ display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:8,alignItems:'center' }}>
            <div>
              <label style={{ fontSize:10,color:'#64748b',display:'block',marginBottom:4 }}>FROM</label>
              <input type="time" defaultValue="18:00" onChange={e=>setAvail(av=>av.map(x=>x.on?{...x,start:e.target.value}:x))}
                style={{ ...inp,fontSize:13 }} onFocus={onF} onBlur={onB}/>
            </div>
            <div style={{ fontSize:12,color:'#94a3b8',marginTop:16 }}>to</div>
            <div>
              <label style={{ fontSize:10,color:'#64748b',display:'block',marginBottom:4 }}>TO</label>
              <input type="time" defaultValue="22:00" onChange={e=>setAvail(av=>av.map(x=>x.on?{...x,end:e.target.value}:x))}
                style={{ ...inp,fontSize:13 }} onFocus={onF} onBlur={onB}/>
            </div>
          </div>
          <div style={{ fontSize:11,color:'#94a3b8',marginTop:7 }}>This applies to all your selected days above. You can customise per day from your dashboard.</div>
        </div>

        {/* Active profile instructions */}
        <div style={{ background:'#0f172a',borderRadius:12,padding:'13px 14px' }}>
          <div style={{ fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.5)',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:8 }}>How your profile works</div>
          {[
            {e:'✅',t:'Mark yourself Active daily',d:'Log in and toggle status to Active each day you want to receive work.'},
            {e:'👁️',t:'Active profiles rank higher',d:'Only active profiles show at the top of client searches that day.'},
            {e:'🔔',t:'Get notified instantly',d:'When a client requests you, admin contacts you immediately via WhatsApp.'},
            {e:'💤',t:'Inactive = hidden',d:'If you don\'t mark Active, you won\'t appear in searches — no missed pings.'},
          ].map(item=>(
            <div key={item.e} style={{ display:'flex',gap:10,marginBottom:8 }}>
              <div style={{ fontSize:16,flexShrink:0 }}>{item.e}</div>
              <div>
                <div style={{ fontSize:12,fontWeight:700,color:'#fff',marginBottom:1 }}>{item.t}</div>
                <div style={{ fontSize:11,color:'rgba(255,255,255,0.4)',lineHeight:1.5 }}>{item.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );


    /* ── STEP 3 Freelancer: Photo & Bio ── */
    if(step===3&&role==='freelancer') return(
      <div style={{ display:'flex',flexDirection:'column',gap:16 }}>
        {/* Photo upload */}
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:12,fontWeight:700,color:'#374151',marginBottom:12 }}>Profile Photo (optional)</div>
          <div style={{ position:'relative',display:'inline-block' }}>
            <div style={{ width:88,height:88,borderRadius:'50%',background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',border:'3px solid #e2e8f0',margin:'0 auto' }}>
              {photoPreview
                ? <img src={photoPreview} alt="preview" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                : <span style={{ fontSize:32,fontWeight:900,color:'#fff' }}>{form.name?.[0]?.toUpperCase()||'?'}</span>
              }
            </div>
            <label style={{ position:'absolute',bottom:0,right:-4,width:26,height:26,borderRadius:'50%',background:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:'2px solid #fff',boxShadow:'0 2px 6px rgba(79,70,229,0.4)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={e=>{
                const f=e.target.files?.[0];
                if(f){setPhotoFile(f);const r=new FileReader();r.onload=ev=>setPhotoPreview(ev.target?.result as string);r.readAsDataURL(f);}
              }}/>
            </label>
          </div>
          {photoPreview&&<button type="button" onClick={()=>{setPhotoPreview(null);setPhotoFile(null);}} style={{ marginTop:8,fontSize:11,color:'#ef4444',background:'none',border:'none',cursor:'pointer' }}>Remove photo</button>}
          <div style={{ fontSize:11,color:'#94a3b8',marginTop:6 }}>JPG, PNG · Max 2MB · Shown as avatar (alias protects identity)</div>
        </div>

        <div style={{ height:1,background:'#f1f5f9' }}/>

        {/* Bio */}
        <div>
          <label style={{ fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6,textTransform:'uppercase' as const,letterSpacing:'0.06em' }}>Professional Bio <span style={{ color:'#94a3b8',fontWeight:400,textTransform:'none' as const }}>(optional)</span></label>
          <textarea value={form.bio} onChange={e=>set('bio',e.target.value)} rows={4}
            placeholder="Brief intro shown to clients on your alias profile. E.g: '8+ years in backend dev, ex-Infosys. Specialise in Node.js microservices and AWS infrastructure. Available evenings IST.'"
            style={{ ...inp,resize:'none' as const,fontSize:12,lineHeight:1.7 }} onFocus={onF} onBlur={onB}/>
          <div style={{ display:'flex',justifyContent:'space-between',marginTop:4 }}>
            <span style={{ fontSize:11,color:'#94a3b8' }}>Highlight your expertise, not your identity</span>
            <span style={{ fontSize:11,color:form.bio.length>400?'#ef4444':'#94a3b8' }}>{form.bio.length}/500</span>
          </div>
        </div>

        {/* Years breakdown */}
        <div style={{ background:'#f8fafc',borderRadius:12,padding:'12px 14px',fontSize:12,color:'#64748b',lineHeight:1.75 }}>
          💡 <strong>Tip:</strong> Clients see your alias name, experience years, skills and bio — never your real name, employer or photo identity. Your privacy is always protected.
        </div>
      </div>
    );

    /* ── STEP 4 Freelancer: Skills ── */
    if(step===4&&role==='freelancer') return(
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:12,fontWeight:700,color:'#0f172a',marginBottom:2 }}>Select your top skills <span style={{ color:'#ef4444' }}>*</span></div>
            <div style={{ fontSize:11,color:'#64748b' }}>Pick at least 3 — shown on your profile</div>
          </div>
          <div style={{ padding:'4px 12px',borderRadius:100,background:selectedSkills.length>=3?'#f0fdf4':'#fef2f2',border:`1px solid ${selectedSkills.length>=3?'#86efac':'#fca5a5'}`,fontSize:12,fontWeight:700,color:selectedSkills.length>=3?'#15803d':'#dc2626' }}>
            {selectedSkills.length}/3 min {selectedSkills.length>=3?'✓':''}
          </div>
        </div>

        {/* Category tabs — scrollable */}
        <div style={{ overflowX:'auto',paddingBottom:2 }}>
          <div style={{ display:'flex',gap:6,width:'max-content' }}>
            {['All',...SKILL_CATEGORIES.map(c=>c.label)].map(cat=>(
              <button key={cat} type="button" onClick={()=>setSkillCat(cat)}
                style={{ padding:'5px 11px',borderRadius:100,fontSize:11,fontWeight:700,cursor:'pointer',border:`1.5px solid ${skillCat===cat?'#4f46e5':'#e2e8f0'}`,background:skillCat===cat?'#4f46e5':'#fff',color:skillCat===cat?'#fff':'#64748b',whiteSpace:'nowrap' as const,flexShrink:0 }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{ maxHeight:180,overflowY:'auto',paddingRight:4 }}>
          {(skillCat==='All'?SKILL_CATEGORIES:SKILL_CATEGORIES.filter(c=>c.label===skillCat)).map(cat=>(
            <div key={cat.label} style={{ marginBottom:10 }}>
              {skillCat==='All'&&<div style={{ fontSize:10,fontWeight:800,color:cat.color,textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:6 }}>{cat.label}</div>}
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {cat.skills.map(s=>{
                  const sel=selectedSkills.includes(s);
                  return(
                    <button key={s} type="button" onClick={()=>toggleSkill(s)}
                      style={{ padding:'5px 11px',borderRadius:8,fontSize:11,fontWeight:600,cursor:'pointer',border:`1.5px solid ${sel?cat.color:`${cat.color}30`}`,background:sel?cat.color:cat.bg,color:sel?'#fff':cat.color,transition:'all .12s',display:'flex',alignItems:'center',gap:4 }}>
                      {sel&&<Check size={9}/>}{s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Custom skill */}
        <div style={{ display:'flex',gap:8 }}>
          <input value={customSkill} onChange={e=>setCustomSkill(e.target.value)}
            onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();addCustom();}}}
            placeholder="Add custom skill… (e.g. Salesforce, SAP)"
            style={{ ...inp,flex:1,fontSize:12 }} onFocus={onF} onBlur={onB}/>
          <button type="button" onClick={addCustom} disabled={!customSkill.trim()}
            style={{ padding:'9px 14px',borderRadius:10,background:customSkill.trim()?'#0f172a':'#f1f5f9',color:customSkill.trim()?'#fff':'#94a3b8',border:'none',fontSize:12,fontWeight:700,cursor:customSkill.trim()?'pointer':'not-allowed',whiteSpace:'nowrap' as const }}>
            + Add
          </button>
        </div>

        {/* Selected */}
        {selectedSkills.length>0&&(
          <div style={{ background:'#f0fdf4',border:'1.5px solid #86efac',borderRadius:12,padding:'10px 12px' }}>
            <div style={{ fontSize:11,fontWeight:700,color:'#15803d',marginBottom:7 }}>✅ {selectedSkills.length} selected</div>
            <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
              {selectedSkills.map(s=>(
                <span key={s} style={{ display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:7,background:'#fff',border:'1px solid #86efac',fontSize:11,fontWeight:600,color:'#15803d' }}>
                  {s}
                  <button type="button" onClick={()=>toggleSkill(s)} style={{ background:'none',border:'none',cursor:'pointer',color:'#86efac',fontSize:13,lineHeight:1,padding:0 }}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );


    /* ── STEP 5 Freelancer: Portfolio ── */
    if(step===5&&role==='freelancer') return(
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:'#0f172a' }}>Past Projects <span style={{ fontSize:11,color:'#94a3b8',fontWeight:400 }}>(optional — builds client trust)</span></div>
            <div style={{ fontSize:11,color:'#64748b',marginTop:2 }}>Add previous work — freelance, employment, or personal. Company name stays private.</div>
          </div>
          <div style={{ padding:'4px 12px',borderRadius:100,background:'#eff6ff',border:'1px solid #bfdbfe',fontSize:12,fontWeight:700,color:'#1d4ed8' }}>
            {projects.length} project{projects.length!==1?'s':''}
          </div>
        </div>

        {/* Existing projects */}
        {projects.map((p,i)=>(
          <div key={i} style={{ background:'#fff',border:'1.5px solid #e2e8f0',borderRadius:14,padding:'12px 14px',position:'relative' }}>
            <button type="button" onClick={()=>setProjects(ps=>ps.filter((_,j)=>j!==i))}
              style={{ position:'absolute',top:10,right:10,background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:16,lineHeight:1 }}>×</button>
            <div style={{ fontWeight:700,fontSize:13,color:'#0f172a',marginBottom:3 }}>{p.title}</div>
            <div style={{ fontSize:11,color:'#64748b',marginBottom:5 }}>{p.role}{p.company?` · ${p.company}`:''}</div>
            <div style={{ display:'flex',flexWrap:'wrap' as const,gap:5,marginBottom:5 }}>
              {p.tech.split(',').filter(Boolean).map(t=>(
                <span key={t} style={{ padding:'2px 8px',borderRadius:6,background:'#eff6ff',color:'#1d4ed8',fontSize:10,fontWeight:600,border:'1px solid #bfdbfe' }}>{t.trim()}</span>
              ))}
            </div>
            {p.desc&&<div style={{ fontSize:11,color:'#475569',lineHeight:1.55 }}>{p.desc.slice(0,120)}{p.desc.length>120?'…':''}</div>}
          </div>
        ))}

        {/* Add project form */}
        {addingProject?(
          <div style={{ background:'#f8fafc',border:'1.5px dashed #bfdbfe',borderRadius:14,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10 }}>
            <div style={{ fontWeight:700,fontSize:12,color:'#1d4ed8',marginBottom:2 }}>New Project</div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10 }} className="reg-grid">
              <div>
                <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Title *</label>
                <input value={proj.title} onChange={e=>setProj(p=>({...p,title:e.target.value}))} placeholder="e.g. E-commerce Platform" style={{ ...inp,fontSize:12 }} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Your Role *</label>
                <input value={proj.role} onChange={e=>setProj(p=>({...p,role:e.target.value}))} placeholder="e.g. Backend Developer" style={{ ...inp,fontSize:12 }} onFocus={onF} onBlur={onB}/>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10 }} className="reg-grid">
              <div>
                <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Client / Company <span style={{ fontWeight:400 }}>(optional 🔒)</span></label>
                <input value={proj.company} onChange={e=>setProj(p=>({...p,company:e.target.value}))} placeholder="Optional — not shown publicly" style={{ ...inp,fontSize:12 }} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Type</label>
                <select value={proj.type} onChange={e=>setProj(p=>({...p,type:e.target.value}))} style={{ ...inp,fontSize:12,cursor:'pointer' }}>
                  <option value="freelance">Freelance</option>
                  <option value="employment">Employment</option>
                  <option value="personal">Personal / Open Source</option>
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Tech Stack *</label>
              <input value={proj.tech} onChange={e=>setProj(p=>({...p,tech:e.target.value}))} placeholder="e.g. React, Node.js, PostgreSQL, AWS" style={{ ...inp,fontSize:12 }} onFocus={onF} onBlur={onB}/>
            </div>
            <div>
              <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Description / Outcome <span style={{ fontWeight:400 }}>(optional)</span></label>
              <textarea value={proj.desc} onChange={e=>setProj(p=>({...p,desc:e.target.value}))} rows={2}
                placeholder="What did you build / achieve? e.g. 'Reduced API response time by 60%'" style={{ ...inp,resize:'none' as const,fontSize:12 }} onFocus={onF} onBlur={onB}/>
            </div>
            <div>
              <label style={{ fontSize:10,fontWeight:700,color:'#64748b',display:'block',marginBottom:4,textTransform:'uppercase' as const }}>Live URL / Repo <span style={{ fontWeight:400 }}>(optional)</span></label>
              <input value={proj.url} onChange={e=>setProj(p=>({...p,url:e.target.value}))} placeholder="https://..." style={{ ...inp,fontSize:12 }} onFocus={onF} onBlur={onB}/>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <button type="button" onClick={()=>{
                if(!proj.title||!proj.role||!proj.tech){toast.error('Fill title, role and tech stack');return;}
                setProjects(ps=>[...ps,proj]);
                setProj({title:'',role:'',company:'',tech:'',desc:'',url:'',type:'freelance'});
                setAddingProject(false);
              }} style={{ flex:1,padding:'9px',borderRadius:10,background:'#0f172a',color:'#fff',border:'none',fontSize:12,fontWeight:700,cursor:'pointer' }}>
                ✅ Save Project
              </button>
              <button type="button" onClick={()=>{setAddingProject(false);setProj({title:'',role:'',company:'',tech:'',desc:'',url:'',type:'freelance'});}}
                style={{ padding:'9px 16px',borderRadius:10,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:12,fontWeight:600,color:'#374151',cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        ):(
          <button type="button" onClick={()=>setAddingProject(true)}
            style={{ padding:'12px',borderRadius:14,border:'1.5px dashed #bfdbfe',background:'#f0f9ff',fontSize:13,fontWeight:700,color:'#1d4ed8',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8 }}>
            + Add {projects.length===0?'a project':'another project'}
          </button>
        )}

        <div style={{ background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,padding:'10px 13px',fontSize:11,color:'#15803d',lineHeight:1.65 }}>
          💡 Projects are shown on your portfolio page (under your alias). Client names are kept private. You can add/edit more projects from your dashboard after registering.
        </div>
      </div>
    );

    /* ── LAST STEP: Review ── */
    return(
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        <div style={{ background:'#fff',border:'1px solid #f1f5f9',borderRadius:14,padding:'14px 16px' }}>
          <div style={{ fontWeight:800,fontSize:13,color:'#0f172a',marginBottom:10 }}>Account summary</div>
          {[
            {l:'Name',v:form.name},{l:'Email',v:form.email},{l:'Mobile',v:form.mobile},{l:'Role',v:role},
            ...(role==='freelancer'?[
              {l:'Job title',v:form.currentRole},{l:'Company',v:`${form.currentCompany} 🔒`},
              {l:'Rate',v:`${form.currency==='INR'?'₹':'$'}${form.hourlyRate}/hr`},
              {l:'Support types',v:supportTypes.join(', ')},
              {l:'Skills',v:selectedSkills.slice(0,4).join(', ')+(selectedSkills.length>4?` +${selectedSkills.length-4}`:'')},
              {l:'Projects',v:projects.length>0?`${projects.length} project${projects.length>1?'s':''} added`:'None added (can add later)'},
            ]:[
              {l:'Company',v:form.companyName},{l:'Contact',v:form.contactName},
            ]),
          ].map(r=>(
            <div key={r.l} style={{ display:'flex',justifyContent:'space-between',padding:'5px 0',borderBottom:'1px solid #f8fafc',fontSize:12 }}>
              <span style={{ color:'#94a3b8' }}>{r.l}</span>
              <span style={{ color:'#374151',fontWeight:600,maxWidth:200,textAlign:'right',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{r.v||'—'}</span>
            </div>
          ))}
        </div>

        {role==='freelancer'&&(
          <div style={{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:12,padding:'11px 13px',fontSize:12,color:'#92400e',lineHeight:1.65 }}>
            <strong>📌 Remember:</strong> After registering, mark yourself <strong>Active daily</strong> in your dashboard so clients can discover you. Inactive profiles do not appear in search results.
          </div>
        )}

        <label style={{ display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer',padding:'12px',background:agreed?'#f0fdf4':'#f8fafc',border:`1.5px solid ${agreed?'#86efac':'#e2e8f0'}`,borderRadius:12,transition:'all .2s' }}>
          <div onClick={()=>setAgreed(!agreed)} style={{ width:18,height:18,borderRadius:5,border:`2px solid ${agreed?'#22c55e':'#e2e8f0'}`,background:agreed?'#22c55e':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1,cursor:'pointer',transition:'all .2s' }}>
            {agreed&&<Check size={11} color="#fff"/>}
          </div>
          <span style={{ fontSize:12,color:'#374151',lineHeight:1.6 }}>
            I agree to the <a href="/terms" target="_blank" rel="noreferrer" style={{ color:'#4f46e5',fontWeight:700 }}>Terms</a> and <a href="/privacy" target="_blank" rel="noreferrer" style={{ color:'#4f46e5',fontWeight:700 }}>Privacy Policy</a>.
            {role==='freelancer'&&<span style={{ color:'#64748b' }}> I understand the platform commission policy.</span>}
          </span>
        </label>
      </div>
    );
  };

  return (
    <>
      {!roleReady&&<RoleModal onPick={r=>{setRole(r);setRoleReady(true);}}/>}
      <div style={{ height:'100vh',display:'flex',fontFamily:"'Inter',system-ui,sans-serif",overflow:'hidden' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          *{box-sizing:border-box}
          input::placeholder,textarea::placeholder{color:#94a3b8}
          @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
          @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
          .fu{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both}
          ::-webkit-scrollbar{width:4px;height:4px}
          ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}
        `}</style>

        {/* LEFT PANEL */}
        <div style={{ width:320,flexShrink:0,background:'linear-gradient(160deg,#0f172a 0%,#1e1b4b 50%,#4c1d95 100%)',display:'flex',flexDirection:'column',padding:'28px 28px',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',top:-60,right:-60,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%)',filter:'blur(24px)',animation:'float 8s ease-in-out infinite' }}/>
          <div style={{ position:'absolute',bottom:-40,left:-40,width:180,height:180,borderRadius:'50%',background:'radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 70%)',filter:'blur(20px)',animation:'float 10s ease-in-out infinite reverse' }}/>
          <div style={{ position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'32px 32px' }}/>

          <div style={{ position:'relative',zIndex:1,display:'flex',flexDirection:'column',height:'100%' }}>
            {/* Logo */}
            <button onClick={()=>navigate('/')} style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',marginBottom:28,padding:0 }}>
              <div style={{ width:30,height:30,borderRadius:9,background:'linear-gradient(135deg,#3b82f6,#6366f1)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:11,color:'#fff' }}>WS</div>
              <span style={{ fontWeight:800,fontSize:15,color:'#fff',letterSpacing:'-0.02em' }}>WorkSupport<span style={{ color:'#60a5fa' }}> 360</span></span>
            </button>

            {/* Dynamic content */}
            <h2 style={{ fontSize:22,fontWeight:900,color:'#fff',letterSpacing:'-0.03em',lineHeight:1.15,marginBottom:10 }}>
              {role==='freelancer'?'Earn on your free hours':'Hire the best engineers'}
            </h2>
            <p style={{ fontSize:13,color:'rgba(255,255,255,0.45)',lineHeight:1.7,marginBottom:20 }}>
              {role==='freelancer'
                ?'Work under a privacy alias. Your MNC employer never finds out.'
                :'Access senior MNC engineers from top companies. Admin-coordinated.'}
            </p>

            {/* Features */}
            <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
              {(role==='freelancer'?[
                {e:'🔒',t:'Identity protected',d:'Employer never notified'},
                {e:'⚡',t:'Hourly/Day/Monthly',d:'Choose what works for you'},
                {e:'💰',t:'Payout in 3 days',d:'After client approval'},
                {e:'📊',t:'Active profile gets work',d:'Mark Active daily to appear'},
              ]:[
                {e:'✅',t:'4-hour match',d:'Expert on call same day'},
                {e:'⚡',t:'Hourly/Day/Monthly',d:'Book exactly what you need'},
                {e:'🛡️',t:'Pay after approval',d:'Escrow protected'},
                {e:'🔍',t:'MNC-verified experts',d:'ID checked by admin'},
              ]).map(f=>(
                <div key={f.e} style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ width:32,height:32,borderRadius:9,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0 }}>{f.e}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:12,color:'#fff' }}>{f.t}</div>
                    <div style={{ fontSize:10,color:'rgba(255,255,255,0.38)' }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress dots — pushed to bottom */}
            <div style={{ marginTop:'auto' }}>
              <div style={{ fontSize:10,color:'rgba(255,255,255,0.3)',marginBottom:10,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase' as const }}>Step {step+1} of {steps.length}</div>
              <div style={{ display:'flex',alignItems:'center',gap:6 }}>
                {steps.map((s,i)=>(
                  <React.Fragment key={s}>
                    <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:3 }}>
                      <div style={{ width:i<=step?24:18,height:i<=step?24:18,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:'#fff',transition:'all .3s',
                        background:i<step?'#22c55e':i===step?'#3b82f6':'rgba(255,255,255,0.1)',
                        boxShadow:i===step?'0 0 10px rgba(59,130,246,0.5)':'none',
                      }}>{i<step?<Check size={10}/>:i+1}</div>
                      <div style={{ fontSize:8,color:i===step?'#60a5fa':'rgba(255,255,255,0.25)',fontWeight:600,whiteSpace:'nowrap' as const }}>{s}</div>
                    </div>
                    {i<steps.length-1&&<div style={{ flex:1,height:1,background:i<step?'#22c55e':'rgba(255,255,255,0.1)',transition:'background .3s',marginBottom:16 }}/>}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ flex:1,display:'flex',flexDirection:'column',background:'#f8fafc',overflow:'hidden' }}>
          {/* Top bar */}
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px',background:'#fff',borderBottom:'1px solid #f1f5f9',flexShrink:0 }}>
            <button onClick={()=>step>0?setStep(s=>s-1):navigate('/login')} style={{ display:'flex',alignItems:'center',gap:5,fontSize:13,fontWeight:600,color:'#64748b',background:'none',border:'none',cursor:'pointer' }}>
              <ArrowLeft size={14}/> {step>0?'Back':'Log in instead'}
            </button>
            {/* Role toggle */}
            <div style={{ display:'flex',gap:5 }}>
              {(['client','freelancer'] as Role[]).map(r=>(
                <button key={r} type="button" onClick={()=>{setRole(r);setStep(0);}}
                  style={{ padding:'5px 14px',borderRadius:100,fontSize:11,fontWeight:700,cursor:'pointer',border:`1.5px solid ${role===r?'#3b82f6':'#e2e8f0'}`,background:role===r?'#eff6ff':'#fff',color:role===r?'#1d4ed8':'#64748b' }}>
                  {r==='client'?'🏢 Client':'👨‍💻 Freelancer'}
                </button>
              ))}
            </div>
            <div style={{ fontSize:11,color:'#94a3b8' }}>Step {step+1}/{steps.length}</div>
          </div>

          {/* Scrollable form area */}
          <div style={{ flex:1,overflowY:'auto',padding:'16px 28px 0' }}>
            <div key={step} className="fu">
              {/* Step label */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:10,fontWeight:800,color:'#4f46e5',letterSpacing:'0.08em',textTransform:'uppercase' as const,marginBottom:3 }}>Step {step+1} — {steps[step]}</div>
                <h2 style={{ fontSize:20,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:0 }}>
                  {step===0?'Create your account':step===1&&role==='freelancer'?'Your profile & services':step===1&&role==='client'?'Company details':step===2&&role==='freelancer'?'Your availability':step===3&&role==='freelancer'?'Photo & bio':step===4&&role==='freelancer'?'Your skills':step===5&&role==='freelancer'?'Portfolio projects':'Review & submit'}
                </h2>
              </div>

              {/* NAV BUTTONS — TOP */}
              <NavBtns step={step} steps={steps} canNext={!!canNext()} onBack={()=>setStep(s=>s-1)} onNext={()=>canNext()?setStep(s=>s+1):toast.error(step===4?'Select at least 3 skills':'Please fill required fields')} onSubmit={handleSubmit} loading={loading} agreed={agreed}/>

              {/* Step content */}
              {stepContent()}

              {/* NAV BUTTONS — BOTTOM */}
              <div style={{ paddingTop:14,paddingBottom:20 }}>
                <NavBtns step={step} steps={steps} canNext={!!canNext()} onBack={()=>setStep(s=>s-1)} onNext={()=>canNext()?setStep(s=>s+1):toast.error(step===4?'Select at least 3 skills':'Please fill required fields')} onSubmit={handleSubmit} loading={loading} agreed={agreed}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
