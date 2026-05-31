import React,{useState,useEffect,useRef,useCallback}from'react';
import{useNavigate}from'react-router-dom';
import{Search,Zap,Shield,Star,ChevronRight,ChevronLeft,Clock,Check,X,Lock,LayoutDashboard,ArrowRight,MapPin,Briefcase,DollarSign,Users,CheckCircle,ChevronDown,Send,Loader2,Play,TrendingUp,Award}from'lucide-react';
import toast from'react-hot-toast';
import SupportChatWidget from'../../components/SupportChatWidget';
import{usePublicStats,useFeaturedFreelancers,useFaqs,usePublicSettings,useAvailableQuickSupport,useBookQuickSupport,useCreateRequest}from'../../hooks/useApi';
import{publicApi}from'../../services/endpoints';
import{useAuthStore}from'../../store/authStore';

const GF='https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap';

const EXPERTS=Array.from({length:24},(_,i)=>({
  id:`e${i}`,
  aliasName:['Rahul S.','Priya K.','Arjun M.','Sneha R.','Vikram S.','Deepa N.','Kiran P.','Ananya T.','Ravi C.','Meera J.','Suresh B.','Lakshmi V.','Naveen G.','Pooja M.','Dinesh K.','Swathi R.','Rajesh T.','Kavya L.','Harish N.','Divya P.','Sanjay A.','Nisha B.','Pradeep V.','Keerthi M.'][i],
  role:['Sr. React Developer','ML Engineer','DevOps Lead','Full-Stack Dev','.NET Architect','QA Lead','Cloud Engineer','Data Scientist','Java Architect','Python Expert','Mobile Dev','Angular Lead','Vue.js Dev','Node.js Expert','AWS Architect','K8s Engineer','DBA','Security Eng.','UI/UX Dev','Go Developer','Rust Engineer','iOS Dev','Data Analyst','Blockchain Dev'][i],
  company:['Infosys','TCS','Wipro','HCL','Cognizant','Capgemini','Accenture','IBM','Tech Mahindra','Mphasis','L&T','Hexaware','Mindtree','Persistent','NIIT','Mastech','Syntel','iGate','Patni','Mastek','Zensar','Oracle','SAP','Cisco'][i],
  rate:[35,2800,28,30,40,22,45,2500,32,2200,38,25,27,3000,42,33,2600,29,36,41,2900,48,1800,55][i],
  currency:i%3===1?'INR':'USD',
  rating:+(4.5+(i*.02)%0.5).toFixed(1),
  reviews:8+i*3,exp:3+(i%10),
  available:i%4!==3,
  projects:6+i*2,
  skills:[['React','TypeScript','AWS'],['Python','TensorFlow','SQL'],['K8s','Docker','AWS'],['React','.NET','Azure'],['Java','Spring','Kafka'],['Cypress','Selenium','JIRA'],['AWS','Terraform','CDK'],['Python','Spark','Tableau'],['Java','MySQL','Redis'],['Django','PostgreSQL','AWS'],['React Native','Flutter','Firebase'],['Angular','NgRx','TS'],['Vue','Nuxt','GraphQL'],['Node.js','MongoDB','REST'],['AWS','Lambda','CDK'],['K8s','ArgoCD','Helm'],['MySQL','Mongo','Redis'],['OWASP','Burp','AWS'],['Figma','React','CSS'],['Go','gRPC','Docker'],['Rust','WASM','C++'],['Swift','Xcode','iOS'],['Python','R','PowerBI'],['Solidity','Web3','ETH']][i]||['React','Node.js'],
  bio:['8yr fintech + SaaS. React/AWS certified.','ML pipelines, NLP, Power BI dashboards.','K8s certified, 0-downtime deployments.','C#/.NET microservices, Azure cloud.','Java Spring Boot 10yr, Kafka at scale.','Test automation lead, 99% coverage.','AWS/GCP architect, IaC specialist.','Data science, ML models, BI.','Java microservices, high-traffic APIs.','Python/Django, PostgreSQL at scale.','React Native + Flutter, published apps.','Angular SPAs, enterprise-grade.','Vue.js/Nuxt, JAMstack expert.','Node.js APIs, 500ms SLAs.','AWS architect, serverless expert.','K8s platform engineer, GitOps.','DB perf tuning, 10x query speed.','AppSec engineer, AWS certified.','React + Figma, pixel-perfect UIs.','Go systems, gRPC microservices.','Rust + WASM, embedded systems.','iOS/Swift, 2M+ app downloads.','Data analyst, Python + PowerBI.','Solidity, DeFi protocols, Web3.'][i],
}));

const CATS=[
  {icon:'⚛️',name:'React / Frontend',n:42,clr:'#3b82f6',bg:'#eff6ff'},
  {icon:'🐍',name:'Python / ML / AI',n:38,clr:'#059669',bg:'#ecfdf5'},
  {icon:'☁️',name:'DevOps / Cloud',n:31,clr:'#f59e0b',bg:'#fffbeb'},
  {icon:'🖥️',name:'Full-Stack / .NET',n:29,clr:'#8b5cf6',bg:'#f5f3ff'},
  {icon:'📊',name:'Data / Analytics',n:24,clr:'#0891b2',bg:'#ecfeff'},
  {icon:'📱',name:'Mobile / Flutter',n:19,clr:'#f97316',bg:'#fff7ed'},
  {icon:'🔐',name:'Security / Infra',n:16,clr:'#dc2626',bg:'#fef2f2'},
  {icon:'🎨',name:'UI/UX / Design',n:22,clr:'#db2777',bg:'#fdf4ff'},
];

const SKILLS=['All','React','Python','Node.js','AWS','Docker','TypeScript','ML','Kubernetes','Angular','Java','Flutter','GraphQL'];

const PHOTOS=[
  'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=1600&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80',
];

// ── Stars ───────────────────────────────────────────────────
const Stars=({r,s=11}:{r:number,s?:number})=>(
  <span style={{display:'inline-flex',gap:1}}>
    {[1,2,3,4,5].map(i=>(
      <svg key={i} width={s} height={s} fill={i<=Math.round(r)?'#f59e0b':'#e5e7eb'} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </span>
);

// ── Animated counter ────────────────────────────────────────
const Cnt=({end,pre='',suf=''}:{end:number,pre?:string,suf?:string})=>{
  const[v,setV]=useState(0);const r=useRef(false);
  useEffect(()=>{if(r.current)return;r.current=true;let c=0,f=0;const t=setInterval(()=>{f++;c=Math.min(c+end/50,end);setV(Math.floor(c));if(f>=50)clearInterval(t);},25);return()=>clearInterval(t);},[end]);
  return<>{pre}{v.toLocaleString()}{suf}</>;
};

// ── Expert Card — LARGE, rich ───────────────────────────────
const ECard=({e,onClick}:{e:any,onClick:()=>void})=>{
  const[h,sH]=useState(false);
  const C=['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed','#0e7490','#b45309'];
  const c=C[e.aliasName.charCodeAt(0)%C.length];
  const ini=e.aliasName.split(' ').map((w:string)=>w[0]).join('');
  const cur=e.currency==='INR'?'₹':'$';
  return(
    <div onClick={onClick} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)}
      style={{maxWidth:280,width:'100%',margin:'0 auto',background:'#fff',border:`1.5px solid ${h?'#c7d2fe':'#f1f5f9'}`,borderRadius:20,overflow:'hidden',cursor:'pointer',transition:'all .2s',boxShadow:h?'0 20px 60px rgba(79,70,229,0.12)':'0 2px 8px rgba(0,0,0,0.04)',transform:h?'translateY(-5px)':'none',display:'flex',flexDirection:'column'}}>
      {/* Colored header */}
      <div style={{height:8,background:`linear-gradient(90deg,${c},${c}88)`}}/>
      <div style={{padding:'20px 20px 16px',flex:1,display:'flex',flexDirection:'column'}}>
        {/* Top row: avatar + rate */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
          <div style={{position:'relative'}}>
            <div style={{width:56,height:56,borderRadius:18,background:`linear-gradient(135deg,${c},${c}bb)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:20,color:'#fff',boxShadow:`0 4px 14px ${c}40`}}>
              {ini}
            </div>
            {e.available&&<div style={{position:'absolute',bottom:-2,right:-2,width:14,height:14,borderRadius:'50%',background:'#22c55e',border:'2.5px solid #fff',boxShadow:'0 0 8px rgba(34,197,94,0.5)'}}/>}
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:22,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',lineHeight:1}}>{cur}{e.rate}</div>
            <div style={{fontSize:11,color:'#94a3b8',fontWeight:500}}>/hr</div>
          </div>
        </div>
        {/* Name + role */}
        <div style={{marginBottom:10}}>
          <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:3,flexWrap:'wrap'}}>
            <span style={{fontWeight:800,fontSize:15,color:'#0f172a',letterSpacing:'-0.01em'}}>{e.aliasName}</span>
            {e.available
              ?<span style={{fontSize:10,fontWeight:700,color:'#16a34a',background:'#f0fdf4',border:'1px solid #bbf7d0',padding:'2px 8px',borderRadius:100}}>● Available</span>
              :<span style={{fontSize:10,fontWeight:700,color:'#d97706',background:'#fffbeb',border:'1px solid #fde68a',padding:'2px 8px',borderRadius:100}}>Limited</span>
            }
          </div>
          <div style={{fontSize:13,color:'#64748b',fontWeight:500,marginBottom:2}}>{e.role}</div>
          <div style={{fontSize:11,color:'#94a3b8'}}>from {e.company}</div>
        </div>
        {/* Rating row */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:12}}>
          <Stars r={e.rating}/>
          <span style={{fontSize:12,fontWeight:700,color:'#374151'}}>{e.rating}</span>
          <span style={{fontSize:11,color:'#9ca3af'}}>({e.reviews} reviews)</span>
          <span style={{fontSize:11,color:'#9ca3af',marginLeft:'auto'}}>{e.exp}yr exp</span>
        </div>
        {/* Bio */}
        <p style={{fontSize:12,color:'#64748b',lineHeight:1.6,marginBottom:12,flex:1}}>{e.bio}</p>
        {/* Skills */}
        <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
          {e.skills.slice(0,3).map((s:string)=>(
            <span key={s} style={{fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:8,background:'#f8fafc',color:'#475569',border:'1px solid #e2e8f0'}}>{s}</span>
          ))}
          {e.skills.length>3&&<span style={{fontSize:11,color:c,fontWeight:700}}>+{e.skills.length-3}</span>}
        </div>
        {/* Footer */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid #f8fafc'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:11,color:'#9ca3af'}}>
            <span style={{display:'flex',alignItems:'center',gap:3}}><CheckCircle size={10} style={{color:'#22c55e'}}/>{e.projects} done</span>
            <span>·</span>
            <span style={{display:'flex',alignItems:'center',gap:3}}><Clock size={10}/>~{20+e.exp*2}m</span>
          </div>
          <div style={{fontSize:11,fontWeight:800,color:c,background:`${c}12`,padding:'5px 12px',borderRadius:10,border:`1px solid ${c}25`}}>View profile →</div>
        </div>
      </div>
    </div>
  );
};

// ── Expert Modal ────────────────────────────────────────────
const Modal=({e,onClose,auth,role,nav}:{e:any,onClose:()=>void,auth:boolean,role?:string,nav:any})=>{
  const[v,sV]=useState<'p'|'q'|'h'>(e._v||'p');
  const[tab,sT]=useState<'a'|'s'|'r'>('a');
  const[topic,sTopic]=useState('');
  const[plat,sPlat]=useState('zoom');
  const[rf,sRf]=useState({type:'consultation',bt:'hourly',cur:'USD',mn:'',mx:'',dt:'',desc:''});
  const bk=useBookQuickSupport();
  const cr=useCreateRequest();
  const C=['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
  const c=C[e.aliasName.charCodeAt(0)%C.length];
  const ini=e.aliasName.split(' ').map((w:string)=>w[0]).join('');
  const cur=e.currency==='INR'?'₹':'$';
  const guard=(t:'q'|'h')=>{
    if(auth&&role==='freelancer'){toast.error('Log in as a client to hire.',{icon:'🚫'});return false;}
    if(!auth){localStorage.setItem('pendingAction',JSON.stringify({type:t==='q'?'quickSupport':'requestDemo',expert:e,pendingView:t}));nav('/login?returnTo=/&role=client');onClose();return false;}
    return true;
  };
  return(
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:9999,background:'rgba(15,23,42,0.8)',backdropFilter:'blur(8px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div onClick={ev=>ev.stopPropagation()} style={{background:'#fff',width:'100%',maxWidth:580,maxHeight:'92vh',overflowY:'auto',borderRadius:'28px 28px 0 0',boxShadow:'0 -30px 80px rgba(0,0,0,0.3)',animation:'su .3s cubic-bezier(.16,1,.3,1)'}}>

        {v==='p'&&<>
          {/* Banner */}
          <div style={{height:160,background:`linear-gradient(135deg,${c}ee,${c}88)`,borderRadius:'28px 28px 0 0',position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.12) 1px,transparent 1px)',backgroundSize:'18px 18px'}}/>
            <div style={{position:'absolute',bottom:-40,left:-40,width:160,height:160,borderRadius:'50%',background:'rgba(255,255,255,0.07)'}}/>
            <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,borderRadius:'50%',background:'rgba(0,0,0,0.1)'}}/>
            <button onClick={onClose} style={{position:'absolute',top:16,right:16,width:38,height:38,borderRadius:'50%',background:'rgba(0,0,0,0.2)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}}><X size={17}/></button>
          </div>
          {/* Identity */}
          <div style={{padding:'0 28px 0'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginTop:-44,marginBottom:16}}>
              <div style={{position:'relative'}}>
                <div style={{width:88,height:88,borderRadius:24,background:`linear-gradient(135deg,${c},${c}aa)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:32,color:'#fff',border:'4px solid #fff',boxShadow:`0 8px 24px ${c}50`}}>{ini}</div>
                {e.available&&<div style={{position:'absolute',bottom:-2,right:-2,width:20,height:20,borderRadius:'50%',background:'#22c55e',border:'3px solid #fff',boxShadow:'0 0 10px rgba(34,197,94,0.6)'}}/>}
              </div>
              <div style={{textAlign:'right',paddingBottom:4}}>
                <div style={{fontSize:36,fontWeight:900,color:'#0f172a',letterSpacing:'-0.04em',lineHeight:1}}>{cur}{e.rate}<span style={{fontSize:14,fontWeight:400,color:'#94a3b8'}}>/hr</span></div>
                <div style={{fontSize:12,fontWeight:700,color:e.available?'#16a34a':'#d97706',marginTop:4,display:'flex',alignItems:'center',gap:5,justifyContent:'flex-end'}}>
                  <span style={{width:8,height:8,borderRadius:'50%',background:e.available?'#22c55e':'#f59e0b'}}/>
                  {e.available?'Available now':'Limited slots'}
                </div>
              </div>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:5,flexWrap:'wrap'}}>
                <span style={{fontSize:24,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em'}}>{e.aliasName}</span>
                <span style={{fontSize:11,fontWeight:700,background:'#f1f5f9',color:'#64748b',border:'1px solid #e2e8f0',padding:'3px 10px',borderRadius:100}}>ALIAS</span>
              </div>
              <div style={{fontSize:14,color:'#64748b',fontWeight:500,marginBottom:8}}>{e.role} · from {e.company}</div>
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:5}}><Stars r={e.rating}/><span style={{fontSize:13,fontWeight:700,color:'#374151'}}>{e.rating}</span><span style={{fontSize:12,color:'#9ca3af'}}>({e.reviews})</span></div>
                <span style={{fontSize:12,fontWeight:700,color:c,background:`${c}15`,padding:'4px 12px',borderRadius:100}}>Trust score: {70+e.aliasName.length}/100</span>
              </div>
            </div>
          </div>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',margin:'0 28px 20px',border:'1px solid #f1f5f9',borderRadius:16,overflow:'hidden'}}>
            {[{l:'Experience',v:`${e.exp}yr`},{l:'Projects',v:e.projects},{l:'Response',v:'~25m'},{l:'Repeat hire',v:'88%'}].map((s,i)=>(
              <div key={i} style={{padding:'14px 10px',textAlign:'center',borderRight:i<3?'1px solid #f1f5f9':'none',background:i%2?'#fafafa':'#fff'}}>
                <div style={{fontSize:18,fontWeight:900,color:'#0f172a',letterSpacing:'-0.02em'}}>{s.v}</div>
                <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div style={{display:'flex',margin:'0 28px 16px',background:'#f8fafc',borderRadius:14,padding:4}}>
            {[['a','About'],['s','Skills'],['r','Reviews']].map(([k,lbl])=>(
              <button key={k} onClick={()=>sT(k as any)} style={{flex:1,padding:'10px 0',borderRadius:10,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,background:tab===k?'#fff':'transparent',color:tab===k?'#0f172a':'#94a3b8',boxShadow:tab===k?'0 1px 8px rgba(0,0,0,0.08)':'none',transition:'all .2s'}}>{lbl}</button>
            ))}
          </div>
          <div style={{padding:'0 28px',minHeight:140}}>
            {tab==='a'&&<>
              <p style={{fontSize:14,color:'#475569',lineHeight:1.75,marginBottom:16}}>{e.bio}</p>
              <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
                {[{i:<MapPin size={12}/>,v:'India'},{i:<Clock size={12}/>,v:'IST (+5:30)'},{i:<Shield size={12}/>,v:'ID Verified'}].map((m,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontWeight:600,color:'#475569',background:'#f8fafc',border:'1px solid #e2e8f0',padding:'6px 14px',borderRadius:100}}>
                    <span style={{color:'#94a3b8'}}>{m.i}</span>{m.v}
                  </div>
                ))}
              </div>
              <div style={{background:'linear-gradient(135deg,#eff6ff,#ecfdf5)',border:'1px solid #bfdbfe',borderRadius:16,padding:'14px 18px',display:'flex',gap:12,alignItems:'flex-start'}}>
                <Lock size={15} style={{color:'#3b82f6',flexShrink:0,marginTop:1}}/>
                <span style={{fontSize:12,color:'#1e40af',lineHeight:1.65}}><strong>100% identity safe.</strong> Clients only see the alias name. Real name & current employer are never revealed — not even to WorkSupport360 clients.</span>
              </div>
            </>}
            {tab==='s'&&<div style={{display:'flex',flexWrap:'wrap',gap:10}}>
              {e.skills.map((s:string)=>(
                <span key={s} style={{padding:'9px 18px',borderRadius:12,fontSize:13,fontWeight:700,color:'#fff',background:`linear-gradient(135deg,${c},${c}cc)`}}>{s}</span>
              ))}
            </div>}
            {tab==='r'&&<div style={{display:'flex',flexDirection:'column',gap:10}}>
              {['Delivered on time, exceptional quality. Best freelancer we hired.','Production crisis at 11pm — fixed it in 35 minutes. Lifesaver.','Deep expertise. Code was clean and well documented. Highly recommend.'].map((t,i)=>(
                <div key={i} style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:16,padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>Client {String.fromCharCode(65+i)}</span>
                    <Stars r={5-Math.floor(i/3)}/>
                  </div>
                  <p style={{fontSize:12,color:'#64748b',fontStyle:'italic',margin:0}}>"{t}"</p>
                </div>
              ))}
            </div>}
          </div>
          {/* CTA */}
          <div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid #f1f5f9',padding:'18px 28px 22px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
              <button onClick={()=>{if(!guard('q'))return;sV('q');}} style={{padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,#f97316,#ef4444)`,color:'#fff',fontSize:14,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 6px 20px rgba(249,115,22,0.35)',transition:'all .2s'}}>
                <Zap size={16}/> Quick 1-hr call
              </button>
              <button onClick={()=>{if(!guard('h'))return;sV('h');}} style={{padding:'16px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${c},${c}cc)`,color:'#fff',fontSize:14,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 6px 20px ${c}40`,transition:'all .2s'}}>
                <Briefcase size={16}/> Hire for project
              </button>
            </div>
            <p style={{textAlign:'center',fontSize:11,color:'#94a3b8',margin:0}}>No payment upfront · Admin confirms within 4 hours · Escrow protected</p>
          </div>
        </>}

        {v==='q'&&<>
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'20px 24px 16px',borderBottom:'1px solid #f1f5f9'}}>
            <button onClick={()=>sV('p')} style={{width:38,height:38,borderRadius:12,background:'#f8fafc',border:'1px solid #f1f5f9',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronRight size={16} style={{transform:'rotate(180deg)',color:'#64748b'}}/></button>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:16,color:'#0f172a'}}>Quick 1-hr session</div><div style={{fontSize:12,color:'#94a3b8'}}>with {e.aliasName} · {cur}{e.rate}/hr</div></div>
            <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,#f97316,#ef4444)`,display:'flex',alignItems:'center',justifyContent:'center'}}><Zap size={16} color="#fff"/></div>
          </div>
          <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
            <div style={{background:'#fff7ed',border:'1px solid #fed7aa',borderRadius:14,padding:'14px 16px'}}>
              <div style={{fontSize:11,fontWeight:800,color:'#c2410c',letterSpacing:'.06em',marginBottom:5}}>⚡ HOW IT WORKS</div>
              <div style={{fontSize:13,color:'#9a3412',lineHeight:1.65}}>Book now → Expert joins your Zoom/Meet in <strong>~30 minutes</strong> → 1-hour live session to debug, review, architect, or consult together.</div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>WHAT DO YOU NEED HELP WITH? *</label>
              <textarea rows={3} value={topic} onChange={ev=>sTopic(ev.target.value)} placeholder="e.g. React useEffect infinite loop affecting prod, need to fix in 2 hours…" style={{width:'100%',padding:'13px 15px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:13,resize:'none',outline:'none',fontFamily:'inherit',boxSizing:'border-box',background:'#fafafa',transition:'border .2s'}} onFocus={ev=>ev.target.style.borderColor='#f97316'} onBlur={ev=>ev.target.style.borderColor='#e2e8f0'}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>PLATFORM</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[['zoom','Zoom'],['meet','Google Meet'],['teams','MS Teams']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>sPlat(val)} style={{padding:'12px',borderRadius:12,border:`2px solid ${plat===val?'#f97316':'#e2e8f0'}`,background:plat===val?'#fff7ed':'#fff',color:plat===val?'#c2410c':'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer'}}>{lbl}</button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[{l:'Session rate',v:`${cur}${e.rate}/hr`},{l:'Platform fee (20%)',v:`${cur}${Math.round(e.rate*.2)}`}].map(s=>(
                <div key={s.l} style={{padding:'14px',background:'#f8fafc',borderRadius:14,border:'1px solid #f1f5f9'}}>
                  <div style={{fontSize:11,color:'#9ca3af',marginBottom:3}}>{s.l}</div>
                  <div style={{fontWeight:900,fontSize:17,color:'#0f172a'}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:'0 24px 24px'}}>
            <button onClick={async()=>{if(!topic.trim()){toast.error('Describe your problem');return;}await bk.mutateAsync({freelancerId:e.id,topic,platform:plat});onClose();}} disabled={bk.isPending} style={{width:'100%',padding:'17px',borderRadius:18,border:'none',cursor:'pointer',background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',fontSize:15,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 6px 20px rgba(249,115,22,0.35)',opacity:bk.isPending?.6:1}}>
              {bk.isPending?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>Booking…</>:<><Zap size={15}/>Confirm — expert joins in ~30 min</>}
            </button>
          </div>
        </>}

        {v==='h'&&<>
          <div style={{display:'flex',alignItems:'center',gap:12,padding:'20px 24px 16px',borderBottom:'1px solid #f1f5f9'}}>
            <button onClick={()=>sV('p')} style={{width:38,height:38,borderRadius:12,background:'#f8fafc',border:'1px solid #f1f5f9',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}><ChevronRight size={16} style={{transform:'rotate(180deg)',color:'#64748b'}}/></button>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:16,color:'#0f172a'}}>Hire for a project</div><div style={{fontSize:12,color:'#94a3b8'}}>with {e.aliasName} · {cur}{e.rate}/hr</div></div>
            <div style={{width:38,height:38,borderRadius:12,background:`linear-gradient(135deg,${c},${c}cc)`,display:'flex',alignItems:'center',justifyContent:'center'}}><Briefcase size={16} color="#fff"/></div>
          </div>
          <div style={{padding:24,display:'flex',flexDirection:'column',gap:18}}>
            <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:14,padding:'14px 16px'}}>
              <div style={{fontSize:11,fontWeight:800,color:'#1d4ed8',letterSpacing:'.06em',marginBottom:5}}>📋 WHAT HAPPENS NEXT</div>
              <div style={{fontSize:13,color:'#1e40af',lineHeight:1.65}}>Submit → Admin schedules a <strong>45-min video call</strong> within 4 hours → You interview the expert → Approve → Project starts with escrow protection.</div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>ENGAGEMENT TYPE</label>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {[['consultation','Consultation'],['demo','Demo'],['project','Full Project']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>sRf(f=>({...f,type:val}))} style={{padding:'11px',borderRadius:12,border:`2px solid ${rf.type===val?c:'#e2e8f0'}`,background:rf.type===val?`${c}12`:'#fff',color:rf.type===val?c:'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer'}}>{lbl}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>BUDGET</label>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                {[['hourly','Hourly'],['fixed','Fixed price']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>sRf(f=>({...f,bt:val}))} style={{flex:1,padding:'11px',borderRadius:12,border:`2px solid ${rf.bt===val?'#0f172a':'#e2e8f0'}`,background:rf.bt===val?'#0f172a':'#fff',color:rf.bt===val?'#fff':'#94a3b8',fontSize:13,fontWeight:700,cursor:'pointer'}}>{lbl}</button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'80px 1fr 1fr',gap:8}}>
                <select value={rf.cur} onChange={ev=>sRf(f=>({...f,cur:ev.target.value}))} style={{padding:'10px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:13,outline:'none',fontFamily:'inherit',background:'#fff'}}>
                  <option>USD</option><option>INR</option><option>EUR</option>
                </select>
                <input type="number" value={rf.mn} onChange={ev=>sRf(f=>({...f,mn:ev.target.value}))} placeholder="Min" style={{padding:'10px 13px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                <input type="number" value={rf.mx} onChange={ev=>sRf(f=>({...f,mx:ev.target.value}))} placeholder="Max" style={{padding:'10px 13px',border:'1.5px solid #e2e8f0',borderRadius:12,fontSize:13,outline:'none',fontFamily:'inherit'}}/>
              </div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:6}}>Expert current rate: {cur}{e.rate}/hr</div>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>PREFERRED CALL DATE & TIME *</label>
              <input type="datetime-local" value={rf.dt} onChange={ev=>sRf(f=>({...f,dt:ev.target.value}))} style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:13,outline:'none',fontFamily:'inherit',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>PROJECT DESCRIPTION *</label>
              <textarea rows={3} value={rf.desc} onChange={ev=>sRf(f=>({...f,desc:ev.target.value}))} placeholder="Tech stack, what you need, team size, deadline…" style={{width:'100%',padding:'13px 15px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:13,resize:'none',outline:'none',fontFamily:'inherit',boxSizing:'border-box',background:'#fafafa'}}/>
            </div>
          </div>
          <div style={{padding:'0 24px 24px'}}>
            <button onClick={async()=>{if(!rf.desc||!rf.dt){toast.error('Fill description and preferred date');return;}await cr.mutateAsync({freelancerId:e.id,sessionType:rf.type,preferredDateTime:new Date(rf.dt).toISOString(),durationMinutes:45,budgetMin:parseFloat(rf.mn||'0'),budgetMax:parseFloat(rf.mx||'0'),budgetType:rf.bt,currency:rf.cur,description:rf.desc});onClose();}} disabled={cr.isPending} style={{width:'100%',padding:'17px',borderRadius:18,border:'none',cursor:'pointer',background:`linear-gradient(135deg,${c},${c}cc)`,color:'#fff',fontSize:15,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:`0 6px 20px ${c}40`,opacity:cr.isPending?.6:1}}>
              {cr.isPending?<><Loader2 size={15} style={{animation:'spin 1s linear infinite'}}/>Submitting…</>:<><Briefcase size={15}/>Submit request — confirms in 4 hrs</>}
            </button>
            <p style={{textAlign:'center',fontSize:11,color:'#9ca3af',marginTop:8,marginBottom:0}}>Free to request · No commitment · Cancel anytime</p>
          </div>
        </>}
      </div>
    </div>
  );
};


const FaqRow=({f,def}:{f:any,def?:boolean})=>{
  const[op,sOp]=useState(def||false);
  return(
    <div style={{background:'#fff',border:`1px solid ${op?'#c7d2fe':'#f1f5f9'}`,borderRadius:18,overflow:'hidden',transition:'all .2s'}}>
      <button onClick={()=>sOp(!op)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 22px',background:'transparent',border:'none',cursor:'pointer',textAlign:'left',gap:12}}>
        <span style={{fontSize:15,fontWeight:700,color:op?'#3730a3':'#1e293b'}}>{f.question}</span>
        <ChevronDown size={18} style={{color:'#94a3b8',transform:op?'rotate(180deg)':'none',transition:'transform .2s',flexShrink:0}}/>
      </button>
      {op&&<div style={{padding:'0 22px 18px',fontSize:14,color:'#64748b',lineHeight:1.75,borderTop:'1px solid #f8fafc',paddingTop:14}}>{f.answer}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════
const HomePage:React.FC=()=>{
  const navigate=useNavigate();
  const{isAuthenticated,user}=useAuthStore();
  const[hs,sHs]=useState('');
  const[sf,sSf]=useState('');
  const[pg,sPg]=useState(1);
  const[fq,sFq]=useState('general');
  const[sel,sSel]=useState<any>(null);
  const[contact,sContact]=useState({name:'',email:'',reason:'general',message:''});
  const[sending,sSending]=useState(false);
  const[slide,sSlide]=useState(0);

  const{data:stats}=usePublicStats();
  const{data:faqs=[]}=useFaqs(fq);
  const{data:settings}=usePublicSettings();
  const{data:fd,isLoading:fl}=useFeaturedFreelancers({page:pg,pageSize:12,skill:sf||undefined});
  const{data:qe=[]}=useAvailableQuickSupport();

  const experts=fd?.items?.length>0?fd.items:EXPERTS.slice((pg-1)*12,pg*12);
  const total=fd?.total??EXPERTS.length;
  const pages=fd?.totalPages??Math.ceil(EXPERTS.length/12);
  const dash=user?.role==='admin'?'/admin':user?.role==='freelancer'?'/freelancer':'/client';

  useEffect(()=>{
    const l=document.createElement('link');l.href=GF;l.rel='stylesheet';document.head.appendChild(l);
    const s=document.createElement('style');
    s.textContent=`*{font-family:'Inter',system-ui,sans-serif;box-sizing:border-box}
@keyframes su{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:translateY(0)}}
@keyframes fu{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes tick{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes float3{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.fu{animation:fu .6s cubic-bezier(.16,1,.3,1) both}
input::placeholder,textarea::placeholder{color:#94a3b8}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}
.hp-hero-grid{display:grid;grid-template-columns:1fr 500px;gap:64px;align-items:center;}
.hp-hero-right{position:relative;height:500px;display:flex;align-items:center;justify-content:center;}
.hp-4col{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}
.hp-3col{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.hp-form-grid{display:grid;grid-template-columns:380px 1fr;gap:40px;align-items:flex-start;}
@media(max-width:1100px){.hp-hero-grid,.hp-4col,.hp-3col,.hp-form-grid{grid-template-columns:1fr!important;}.hp-hero-right{display:none!important;}.hp-form-grid{gap:24px!important;}.hp-4col{gap:16px!important;}.hp-3col{gap:16px!important;}}
@media(max-width:720px){.hp-hero-grid{gap:28px!important;}.hp-form-grid{padding:0!important;}.hp-hero-grid input{width:100%!important;}.hp-4col,.hp-3col{gap:14px!important;}}`;
    document.head.appendChild(s);
    const iv=setInterval(()=>sSlide(i=>(i+1)%PHOTOS.length),5000);
    return()=>{try{document.head.removeChild(l);document.head.removeChild(s);}catch{}clearInterval(iv);};
  },[]);

  useEffect(()=>{
    if(!isAuthenticated)return;
    const raw=localStorage.getItem('pendingAction');
    if(!raw)return;
    try{const p=JSON.parse(raw);localStorage.removeItem('pendingAction');setTimeout(()=>sSel({...p.expert,_v:p.pendingView||'p'}),600);}catch{localStorage.removeItem('pendingAction');}
  },[isAuthenticated]);

  const go=()=>{if(hs.trim()){sSf(hs);sPg(1);document.getElementById('experts')?.scrollIntoView({behavior:'smooth'});}};
  const submit=async(ev:React.FormEvent)=>{ev.preventDefault();if(!contact.name||!contact.email||!contact.message){toast.error('Fill all required fields');return;}sSending(true);try{await publicApi.contact(contact);toast.success("We'll respond within 4 hours!");sContact({name:'',email:'',reason:'general',message:''});}catch{toast.error('Failed');}finally{sSending(false);}};

  return(
    <div style={{minHeight:'100vh',background:'#fff',overflowX:'hidden'}}>

      {/* ═══ NAV ═══ */}
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:200,height:64,display:'flex',alignItems:'center',padding:'0 32px',background:'rgba(255,255,255,0.96)',backdropFilter:'blur(20px)',borderBottom:'1px solid #f1f5f9',boxShadow:'0 1px 0 #f1f5f9'}}>
        <div style={{maxWidth:1320,width:'100%',margin:'0 auto',display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>navigate('/')} style={{display:'flex',alignItems:'center',gap:10,background:'none',border:'none',cursor:'pointer',marginRight:12,padding:0}}>
            <div style={{width:36,height:36,borderRadius:11,background:'linear-gradient(135deg,#f97316,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:12,color:'#fff',boxShadow:'0 4px 14px rgba(249,115,22,0.4)'}}>WS</div>
            <span style={{fontWeight:900,fontSize:19,color:'#0f172a',letterSpacing:'-0.03em'}}>Work<span style={{color:'#f97316'}}>Support</span><span style={{fontWeight:300,color:'#cbd5e1'}}>360</span></span>
          </button>
          {/* inline search */}
          <div style={{flex:1,maxWidth:340,display:'flex',alignItems:'center',background:'#f8fafc',border:'1.5px solid #f1f5f9',borderRadius:12,padding:'0 14px',gap:10,height:38}}>
            <Search size={14} style={{color:'#94a3b8',flexShrink:0}}/>
            <input value={hs} onChange={ev=>sHs(ev.target.value)} onKeyDown={ev=>ev.key==='Enter'&&go()} placeholder="Search skills…" style={{flex:1,border:'none',outline:'none',background:'transparent',fontSize:13,color:'#374151'}}/>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:2,marginLeft:8}}>
            {[{l:'Find Experts',h:'#experts'},{l:'⚡ Quick Help',h:'#quick',o:true},{l:'How it works',h:'#how'},{l:'FAQ',h:'#faq'}].map(n=>(
              <a key={n.l} href={n.h} style={{padding:'7px 13px',borderRadius:9,fontSize:13,fontWeight:600,color:n.o?'#f97316':'#475569',textDecoration:'none',transition:'all .15s',background:'transparent'}}
                onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.background=n.o?'#fff7ed':'#f8fafc';}} onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.background='transparent';}}>{n.l}</a>
            ))}
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
            {isAuthenticated
              ?<button onClick={()=>navigate(dash)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 20px',borderRadius:12,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',boxShadow:'0 4px 14px rgba(249,115,22,0.3)'}}><LayoutDashboard size={14}/>Dashboard</button>
              :<><button onClick={()=>navigate('/login')} style={{padding:'8px 18px',borderRadius:12,background:'#fff',color:'#374151',border:'1.5px solid #e2e8f0',fontSize:13,fontWeight:600,cursor:'pointer'}}>Log in</button>
                <button onClick={()=>navigate('/register')} style={{padding:'8px 20px',borderRadius:12,background:'#0f172a',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer'}}>Join free →</button>
              </>
            }
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <section style={{paddingTop:64,background:'#fff',position:'relative',overflow:'hidden'}}>
        {/* Photo background strip */}
        <div style={{position:'absolute',right:0,top:64,width:'45%',height:'100%',zIndex:0,overflow:'hidden'}}>
          {PHOTOS.map((p,i)=>(
            <img key={i} src={p} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:i===slide?0.18:0,transition:'opacity 1.2s'}}/>
          ))}
          <div style={{position:'absolute',inset:0,background:'linear-gradient(90deg,#fff 0%,transparent 40%)'}}/>
        </div>

        <div style={{maxWidth:1320,margin:'0 auto',padding:'72px 32px 60px',position:'relative',zIndex:1}}>
          <div className="hp-hero-grid" style={{display:'grid',gridTemplateColumns:'1fr 500px',gap:64,alignItems:'center'}}>
            <div>
              <div className="fu" style={{display:'inline-flex',alignItems:'center',gap:8,background:'#eff6ff',border:'1.5px solid #bfdbfe',borderRadius:100,padding:'7px 18px',marginBottom:28}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:'#4f46e5',display:'inline-block',boxShadow:'0 0 10px rgba(79,70,229,0.6)'}}/>
                <span style={{fontSize:12,fontWeight:700,color:'#3730a3',letterSpacing:'0.04em'}}>India's #1 identity-safe tech talent platform</span>
              </div>

              <h1 className="fu" style={{animationDelay:'.08s',fontSize:'clamp(2.8rem,4.5vw,4rem)',fontWeight:900,lineHeight:1.06,letterSpacing:'-0.04em',color:'#0f172a',margin:'0 0 22px'}}>
                Hire verified MNC<br/>
                <span style={{background:'linear-gradient(135deg,#f97316,#ef4444)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',display:'inline-block'}}>
                  engineers
                </span>{' '}
                <span style={{color:'#0f172a'}}>in</span>{' '}
                <span style={{color:'#f97316'}}>4 hours</span>
              </h1>

              <p className="fu" style={{animationDelay:'.15s',fontSize:18,color:'#64748b',lineHeight:1.7,marginBottom:36,maxWidth:520}}>
                Senior engineers from{' '}
                <strong style={{color:'#1e293b',fontWeight:700}}>Infosys, TCS, Wipro, HCL</strong>{' '}
                work under a privacy alias. Employer never notified. Enterprise talent, freelance speed.
              </p>

              {/* Search */}
              <div className="fu" style={{animationDelay:'.2s',display:'flex',background:'#fff',borderRadius:18,boxShadow:'0 4px 32px rgba(0,0,0,0.12),0 0 0 1.5px #e2e8f0',marginBottom:22,maxWidth:540,overflow:'hidden'}}>
                <div style={{flex:1,display:'flex',alignItems:'center',gap:12,padding:'0 22px'}}>
                  <Search size={18} style={{color:'#94a3b8',flexShrink:0}}/>
                  <input value={hs} onChange={ev=>sHs(ev.target.value)} onKeyDown={ev=>ev.key==='Enter'&&go()} placeholder='"React developer", "Python ML", "DevOps AWS"…' style={{flex:1,border:'none',outline:'none',fontSize:15,padding:'18px 0',background:'transparent',color:'#0f172a'}}/>
                </div>
                <button onClick={go} style={{padding:'0 32px',background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:15,fontWeight:800,cursor:'pointer',flexShrink:0,transition:'opacity .2s'}}
                  onMouseEnter={ev=>(ev.currentTarget as HTMLElement).style.opacity='.85'} onMouseLeave={ev=>(ev.currentTarget as HTMLElement).style.opacity='1'}>
                  Search
                </button>
              </div>

              {/* Skill chips */}
              <div className="fu" style={{animationDelay:'.26s',display:'flex',flexWrap:'wrap',gap:8,marginBottom:40}}>
                <span style={{fontSize:12,color:'#94a3b8',fontWeight:600,alignSelf:'center'}}>Popular:</span>
                {['React','Python','Node.js','AWS','Docker','TypeScript','ML','K8s'].map(s=>(
                  <button key={s} onClick={()=>{sSf(s);sHs(s);document.getElementById('experts')?.scrollIntoView({behavior:'smooth'});}} style={{padding:'7px 16px',borderRadius:100,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:12,fontWeight:600,color:'#475569',cursor:'pointer',transition:'all .15s'}}
                    onMouseEnter={ev=>{(ev.target as HTMLElement).style.borderColor='#f97316';(ev.target as HTMLElement).style.color='#f97316';(ev.target as HTMLElement).style.background='#fff7ed';}}
                    onMouseLeave={ev=>{(ev.target as HTMLElement).style.borderColor='#e2e8f0';(ev.target as HTMLElement).style.color='#475569';(ev.target as HTMLElement).style.background='#fff';}}>
                    {s}
                  </button>
                ))}
              </div>

              {/* CTAs */}
              <div className="fu" style={{animationDelay:'.3s',display:'flex',flexWrap:'wrap',gap:14}}>
                {isAuthenticated
                  ?<button onClick={()=>navigate(dash)} style={{display:'flex',alignItems:'center',gap:10,padding:'16px 36px',borderRadius:18,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 28px rgba(249,115,22,0.38)',transition:'all .2s'}}
                    onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.transform='translateY(-2px)';}} onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.transform='none';}}>
                    <LayoutDashboard size={18}/> My Dashboard
                  </button>
                  :<>
                    <button onClick={()=>navigate('/register')} style={{display:'flex',alignItems:'center',gap:10,padding:'16px 36px',borderRadius:18,background:'linear-gradient(135deg,#0f172a,#1e3a5f)',color:'#fff',border:'none',fontSize:16,fontWeight:800,cursor:'pointer',boxShadow:'0 8px 28px rgba(15,23,42,0.28)',transition:'all .2s'}}
                      onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.transform='translateY(-2px)';(ev.currentTarget as HTMLElement).style.boxShadow='0 14px 40px rgba(15,23,42,0.35)';}} onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.transform='none';(ev.currentTarget as HTMLElement).style.boxShadow='0 8px 28px rgba(15,23,42,0.28)';}}>
                      Start hiring free <ArrowRight size={18}/>
                    </button>
                    <a href="#quick" style={{display:'flex',alignItems:'center',gap:10,padding:'16px 30px',borderRadius:18,border:'2px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:16,fontWeight:700,textDecoration:'none',transition:'all .15s'}}
                      onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.borderColor='#f97316';(ev.currentTarget as HTMLElement).style.color='#f97316';}} onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.borderColor='#e2e8f0';(ev.currentTarget as HTMLElement).style.color='#374151';}}>
                      <Zap size={18} style={{color:'#f97316'}}/> Quick 30-min help
                    </a>
                  </>
                }
              </div>

              {/* Social proof */}
              <div className="fu" style={{animationDelay:'.36s',display:'flex',alignItems:'center',gap:16,marginTop:32}}>
                <div style={{display:'flex'}}>
                  {['I','T','W','H'].map((l,i)=>(
                    <div key={i} style={{width:32,height:32,borderRadius:'50%',background:`hsl(${210+i*30},70%,55%)`,border:'2.5px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',marginLeft:i>0?-8:0}}>{l}</div>
                  ))}
                </div>
                <div>
                  <div style={{display:'flex',gap:1,marginBottom:2}}>{[1,2,3,4,5].map(i=><span key={i} style={{color:'#f59e0b',fontSize:14}}>★</span>)}</div>
                  <div style={{fontSize:12,color:'#64748b'}}><strong style={{color:'#1e293b'}}>500+ companies</strong> hired via WorkSupport360</div>
                </div>
              </div>
            </div>

            {/* RIGHT — Floating cards */}
            <div className="hp-hero-right" style={{position:'relative',height:500,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {/* Main expert card */}
              <div style={{position:'absolute',width:280,background:'#fff',borderRadius:24,boxShadow:'0 28px 80px rgba(0,0,0,0.16)',border:'1.5px solid #f1f5f9',padding:'22px',animation:'float1 5s ease-in-out infinite',zIndex:3}}>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                  <div style={{width:52,height:52,borderRadius:18,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:20,color:'#fff',position:'relative'}}>
                    RS
                    <div style={{position:'absolute',bottom:-3,right:-3,width:14,height:14,borderRadius:'50%',background:'#22c55e',border:'2.5px solid #fff'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:800,fontSize:15,color:'#0f172a'}}>Rahul S.</div>
                    <div style={{fontSize:12,color:'#64748b'}}>Sr. React Developer</div>
                    <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
                      <Stars r={4.9} s={10}/>
                      <span style={{fontSize:11,fontWeight:700,color:'#374151'}}>4.9</span>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontWeight:900,fontSize:20,color:'#0f172a'}}>$35</div>
                    <div style={{fontSize:10,color:'#94a3b8'}}>/hr</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                  {['React','Node.js','AWS'].map(s=><span key={s} style={{fontSize:11,fontWeight:700,padding:'4px 10px',borderRadius:8,background:'#eff6ff',color:'#4f46e5'}}>{s}</span>)}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <button style={{padding:'10px',borderRadius:12,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:12,fontWeight:700,cursor:'pointer'}}>⚡ Quick</button>
                  <button style={{padding:'10px',borderRadius:12,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',color:'#fff',border:'none',fontSize:12,fontWeight:700,cursor:'pointer'}}>Hire →</button>
                </div>
              </div>

              {/* Card 2 */}
              <div style={{position:'absolute',top:'5%',right:'-8%',width:200,background:'#fff',borderRadius:20,boxShadow:'0 16px 48px rgba(0,0,0,0.1)',border:'1.5px solid #f1f5f9',padding:'16px',animation:'float2 7s ease-in-out infinite',animationDelay:'1s',zIndex:2}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:14,background:'linear-gradient(135deg,#059669,#0891b2)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,color:'#fff'}}>AM</div>
                  <div><div style={{fontWeight:700,fontSize:13,color:'#0f172a'}}>Arjun M.</div><div style={{fontSize:11,color:'#64748b'}}>DevOps Lead</div></div>
                </div>
                <div style={{fontWeight:900,fontSize:16,color:'#0f172a',marginBottom:6}}>$28<span style={{fontSize:10,fontWeight:400,color:'#9ca3af'}}>/hr</span></div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{['K8s','Docker','AWS'].map(s=><span key={s} style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:7,background:'#ecfdf5',color:'#059669'}}>{s}</span>)}</div>
              </div>

              {/* Card 3 */}
              <div style={{position:'absolute',bottom:'8%',left:'-5%',width:200,background:'#fff',borderRadius:20,boxShadow:'0 16px 48px rgba(0,0,0,0.1)',border:'1.5px solid #f1f5f9',padding:'16px',animation:'float3 6s ease-in-out infinite',animationDelay:'2s',zIndex:2}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                  <div style={{width:40,height:40,borderRadius:14,background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:15,color:'#fff'}}>PK</div>
                  <div><div style={{fontWeight:700,fontSize:13,color:'#0f172a'}}>Priya K.</div><div style={{fontSize:11,color:'#64748b'}}>ML Engineer</div></div>
                </div>
                <div style={{fontWeight:900,fontSize:16,color:'#0f172a',marginBottom:6}}>₹2800<span style={{fontSize:10,fontWeight:400,color:'#9ca3af'}}>/hr</span></div>
                <div style={{display:'flex',gap:4}}>{['Python','ML'].map(s=><span key={s} style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:7,background:'#fffbeb',color:'#d97706'}}>{s}</span>)}</div>
              </div>

              {/* Stat badges */}
              <div style={{position:'absolute',top:'18%',left:'2%',background:'#0f172a',color:'#fff',borderRadius:16,padding:'12px 18px',fontWeight:800,fontSize:14,boxShadow:'0 8px 28px rgba(15,23,42,0.35)',animation:'float2 8s ease-in-out infinite',zIndex:4}}>
                <Cnt end={stats?.totalFreelancers??1240} suf="+"/> <span style={{fontSize:11,opacity:.6,fontWeight:400}}>experts</span>
              </div>
              <div style={{position:'absolute',bottom:'22%',right:'-2%',background:'#22c55e',color:'#fff',borderRadius:16,padding:'12px 18px',fontWeight:800,fontSize:14,boxShadow:'0 8px 28px rgba(34,197,94,0.35)',animation:'float1 9s ease-in-out infinite',animationDelay:'1.5s',zIndex:4}}>
                {stats?.avgRating??4.9}★ <span style={{fontSize:11,opacity:.85,fontWeight:400}}>rated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{background:'#0f172a'}}>
          <div className="hp-4col" style={{maxWidth:1320,margin:'0 auto',padding:'0 32px',display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
            {[
              {v:stats?.totalFreelancers??1240,s:'+',l:'Verified experts',p:'',ic:<Users size={20}/>},
              {v:stats?.completedProjects??580,s:'+',l:'Projects completed',p:'',ic:<CheckCircle size={20}/>},
              {v:Math.round((stats?.totalPaidOut??2400000)/1000),s:'K',l:'Paid to experts',p:'$',ic:<DollarSign size={20}/>},
              {v:stats?.avgRating??4.9,l:'Platform rating',suf:'★',raw:true,ic:<Award size={20}/>},
            ].map((s,i)=>(
              <div key={i} style={{padding:'28px 24px',borderRight:i<3?'1px solid rgba(255,255,255,0.06)':'none',display:'flex',alignItems:'center',gap:16}}>
                <div style={{width:48,height:48,borderRadius:14,background:'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',color:'#f97316',flexShrink:0}}>{s.ic}</div>
                <div>
                  <div style={{fontSize:28,fontWeight:900,color:'#fff',letterSpacing:'-0.04em',lineHeight:1}}>
                    {s.raw?`${s.v}${s.suf}`:<Cnt end={s.v as number} pre={s.p} suf={s.s}/>}
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:4,fontWeight:500}}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company ticker */}
        <div style={{background:'#f8fafc',borderTop:'1px solid #f1f5f9',overflow:'hidden',padding:'14px 0'}}>
          <div style={{display:'flex',gap:0,animation:'tick 22s linear infinite',width:'max-content'}}>
            {[...['Infosys','TCS','Wipro','HCL','Cognizant','Capgemini','Accenture','IBM','Tech Mahindra','Mphasis','Oracle','SAP','Cisco'],...['Infosys','TCS','Wipro','HCL','Cognizant','Capgemini','Accenture','IBM','Tech Mahindra','Mphasis','Oracle','SAP','Cisco']].map((c,i)=>(
              <span key={i} style={{fontSize:13,fontWeight:700,color:'#9ca3af',whiteSpace:'nowrap',padding:'0 28px',letterSpacing:'0.04em',textTransform:'uppercase'}}>
                {c} <span style={{color:'#e2e8f0',marginLeft:28}}>·</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section style={{padding:'80px 32px',background:'#fff'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:40,flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'#4f46e5',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Browse by category</div>
              <h2 style={{fontSize:38,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 8px'}}>Find the right expert</h2>
              <p style={{fontSize:16,color:'#64748b',margin:0}}>1,200+ verified MNC professionals across 8 specialisations</p>
            </div>
            <a href="#experts" style={{fontSize:14,fontWeight:700,color:'#4f46e5',textDecoration:'none',display:'flex',alignItems:'center',gap:5}}>View all experts <ChevronRight size={16}/></a>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16}}>
            {CATS.map((cat)=>(
              <button key={cat.name} onClick={()=>{sSf(cat.name.split('/')[0].trim());document.getElementById('experts')?.scrollIntoView({behavior:'smooth'});}}
                style={{background:'#fff',border:`2px solid ${cat.clr}30`,borderRadius:22,padding:'28px 24px',textAlign:'left',cursor:'pointer',transition:'all .22s',position:'relative',overflow:'hidden'}}
                onMouseEnter={ev=>{const el=ev.currentTarget;el.style.background=cat.bg;el.style.borderColor=cat.clr;el.style.transform='translateY(-5px)';el.style.boxShadow=`0 20px 56px ${cat.clr}22`;}}
                onMouseLeave={ev=>{const el=ev.currentTarget;el.style.background='#fff';el.style.borderColor=`${cat.clr}30`;el.style.transform='none';el.style.boxShadow='none';}}>
                <div style={{position:'absolute',top:-16,right:-16,width:80,height:80,borderRadius:'50%',background:`${cat.clr}08`,transition:'all .22s'}}/>
                <div style={{fontSize:38,marginBottom:16,lineHeight:1}}>{cat.icon}</div>
                <div style={{fontWeight:800,fontSize:16,color:'#0f172a',marginBottom:5,letterSpacing:'-0.01em'}}>{cat.name}</div>
                <div style={{fontSize:13,fontWeight:700,color:cat.clr}}>{cat.n} experts available</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BROWSE EXPERTS — LARGE GRID ═══ */}
      <section id="experts" style={{padding:'0 32px 80px',background:'#f8fafc'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{padding:'64px 0 36px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:12,fontWeight:800,color:'#4f46e5',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10}}>Verified professionals</div>
              <h2 style={{fontSize:36,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 6px'}}>Browse {total.toLocaleString()}+ experts</h2>
              <p style={{fontSize:14,color:'#94a3b8',margin:0}}>All ID-verified · Employer identity always protected · No direct hire rules</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{position:'relative'}}>
                <Search size={14} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#94a3b8'}}/>
                <input value={hs} onChange={ev=>{sHs(ev.target.value);sSf(ev.target.value);sPg(1);}} placeholder="Search skills, role…" style={{paddingLeft:38,paddingRight:16,paddingTop:10,paddingBottom:10,border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:13,outline:'none',background:'#fff',width:220,color:'#374151'}}/>
              </div>
            </div>
          </div>

          {/* Filter chips */}
          <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:32}}>
            {SKILLS.map(s=>{
              const active=(s==='All'&&!sf)||(s===sf);
              return(
                <button key={s} onClick={()=>{sSf(s==='All'?'':s);sHs(s==='All'?'':s);sPg(1);}}
                  style={{padding:'9px 20px',borderRadius:100,border:`1.5px solid ${active?'transparent':'#e2e8f0'}`,background:active?'#0f172a':'#fff',color:active?'#fff':'#64748b',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                  {s}
                </button>
              );
            })}
          </div>

          {/* EXPERT GRID — 4 columns, large cards */}
          {fl?(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
              {Array.from({length:12}).map((_,i)=>(
                <div key={i} style={{background:'#fff',borderRadius:20,height:320,animation:`fu .5s ease both`,animationDelay:`${i*.04}s`}}/>
              ))}
            </div>
          ):(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
              {experts.map((e:any,i:number)=>(
                <div key={e.id} style={{animation:`fu .5s cubic-bezier(.16,1,.3,1) both`,animationDelay:`${Math.min(i,11)*.05}s`}}>
                  <ECard e={e} onClick={()=>sSel(e)}/>
                </div>
              ))}
              {experts.length===0&&(
                <div style={{gridColumn:'1/-1',textAlign:'center',padding:'64px',background:'#fff',borderRadius:20,border:'1px solid #f1f5f9'}}>
                  <Search size={44} style={{color:'#e2e8f0',margin:'0 auto 14px'}}/>
                  <div style={{fontWeight:600,color:'#94a3b8',marginBottom:10}}>No experts found for "{hs}"</div>
                  <button onClick={()=>{sSf('');sHs('');sPg(1);}} style={{fontSize:13,color:'#4f46e5',fontWeight:700,background:'none',border:'none',cursor:'pointer'}}>Clear filters</button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {pages>1&&(
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:40}}>
              <button onClick={()=>sPg(p=>Math.max(1,p-1))} disabled={pg===1} style={{padding:'10px 20px',borderRadius:14,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,opacity:pg===1?.4:1}}>
                <ChevronLeft size={15}/>Prev
              </button>
              {Array.from({length:Math.min(pages,7)},(_,i)=>(
                <button key={i+1} onClick={()=>sPg(i+1)} style={{width:42,height:42,borderRadius:12,border:'1.5px solid',borderColor:pg===i+1?'transparent':'#e2e8f0',background:pg===i+1?'#0f172a':'#fff',color:pg===i+1?'#fff':'#64748b',fontSize:14,fontWeight:800,cursor:'pointer',transition:'all .15s'}}>
                  {i+1}
                </button>
              ))}
              <button onClick={()=>sPg(p=>Math.min(pages,p+1))} disabled={pg===pages} style={{padding:'10px 20px',borderRadius:14,border:'1.5px solid #e2e8f0',background:'#fff',color:'#374151',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:6,opacity:pg===pages?.4:1}}>
                Next<ChevronRight size={15}/>
              </button>
            </div>
          )}
          <div style={{textAlign:'center',marginTop:12,fontSize:12,color:'#9ca3af'}}>Showing {Math.min((pg-1)*12+1,total)}–{Math.min(pg*12,total)} of {total} experts</div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{padding:'80px 32px',background:'#fff'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:12,fontWeight:800,color:'#4f46e5',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Simple process</div>
            <h2 style={{fontSize:38,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 12px'}}>Hire in hours, not weeks</h2>
            <p style={{fontSize:16,color:'#64748b',maxWidth:440,margin:'0 auto'}}>Admin-coordinated. Escrow-protected. No cold outreach required.</p>
          </div>
          <div className="hp-4col" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,position:'relative'}}>
            <div style={{position:'absolute',top:40,left:'12.5%',right:'12.5%',height:2,background:'linear-gradient(90deg,transparent 0%,#e2e8f0 10%,#e2e8f0 90%,transparent 100%)'}}/>
            {[
              {n:'01',e:'🔍',t:'Browse & filter',d:'Search 1,200+ verified experts by skill, rate, experience, and real-time availability.',c:'#4f46e5'},
              {n:'02',e:'📋',t:'Submit request',d:'Fill your project details. Admin schedules a 45-min video call within 4 hours.',c:'#f97316'},
              {n:'03',e:'✅',t:'Interview & approve',d:'Meet the expert. Agree on scope. Escrow activated — funds secured until you approve.',c:'#059669'},
              {n:'04',e:'💳',t:'Track & pay safely',d:'Weekly timesheets you approve → auto-invoice → pay via UPI/bank/wire transfer.',c:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{textAlign:'center',position:'relative',zIndex:1}}>
                <div style={{width:80,height:80,borderRadius:24,background:'#fff',border:'2px solid #f1f5f9',boxShadow:'0 4px 20px rgba(0,0,0,0.07)',margin:'0 auto 22px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,position:'relative',transition:'all .2s'}}
                  onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.boxShadow=`0 12px 36px ${s.c}25`;(ev.currentTarget as HTMLElement).style.borderColor=`${s.c}40`;}}
                  onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(0,0,0,0.07)';(ev.currentTarget as HTMLElement).style.borderColor='#f1f5f9';}}>
                  {s.e}
                  <span style={{position:'absolute',top:-10,right:-10,width:28,height:28,borderRadius:'50%',background:s.c,color:'#fff',fontSize:11,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 12px ${s.c}50`}}>{s.n}</span>
                </div>
                <div style={{fontWeight:800,fontSize:17,color:'#0f172a',marginBottom:10,letterSpacing:'-0.01em'}}>{s.t}</div>
                <div style={{fontSize:13,color:'#64748b',lineHeight:1.65,maxWidth:220,margin:'0 auto'}}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:12,marginTop:52}}>
            {[{e:'🔒',t:'Employer never notified'},{e:'🛡️',t:'Escrow protection'},{e:'⚡',t:'30-min Quick Support'},{e:'📋',t:'Admin coordinated'},{e:'🧾',t:'GST-compliant invoices'},{e:'⏱️',t:'On-time delivery guarantee'}].map(f=>(
              <div key={f.t} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:100,fontSize:13,fontWeight:600,color:'#374151'}}>
                <span>{f.e}</span>{f.t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ QUICK SUPPORT ═══ */}
      <section id="quick" style={{padding:'80px 32px',background:'linear-gradient(160deg,#fff7ed,#fffbf5)'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:44,flexWrap:'wrap',gap:20}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:14}}>
                <div style={{width:56,height:56,borderRadius:20,background:'linear-gradient(135deg,#f97316,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 10px 28px rgba(249,115,22,0.38)'}}>
                  <Zap size={26} color="#fff"/>
                </div>
                <div>
                  <h2 style={{fontSize:28,fontWeight:900,color:'#0f172a',letterSpacing:'-0.02em',margin:0}}>Quick Support</h2>
                  <p style={{fontSize:13,color:'#94a3b8',margin:0}}>Expert on a call in under 30 minutes</p>
                </div>
              </div>
              <p style={{fontSize:16,color:'#475569',maxWidth:500,lineHeight:1.7}}>Production down at midnight? Critical bug before launch? Pick an available expert — they join your Zoom/Meet in <strong style={{color:'#c2410c'}}>30 minutes</strong>.</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:'12px 20px',background:'#f0fdf4',border:'2px solid #86efac',borderRadius:16,fontSize:14,fontWeight:700,color:'#15803d'}}>
              <span style={{width:11,height:11,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 8px rgba(34,197,94,0.6)',display:'inline-block',animation:'float1 2s ease-in-out infinite'}}/>
              {(qe as any[]).length>0?(qe as any[]).length:EXPERTS.filter(e=>e.available).length} experts live right now
            </div>
          </div>
          {/* QS Grid — larger cards */}
          <div className="hp-4col" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {((qe as any[]).length>0?(qe as any[]):EXPERTS.filter(e=>e.available)).slice(0,8).map((e:any)=>{
              const C=['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
              const c=C[e.aliasName.charCodeAt(0)%C.length];
              const cur=e.currency==='INR'?'₹':'$';
              const ini=e.aliasName.split(' ').map((w:string)=>w[0]).join('');
              return(
                <div key={e.id} onClick={()=>sSel({...e,_v:'q'})}
                  style={{background:'#fff',borderRadius:20,border:'2px solid #fed7aa',padding:'20px',cursor:'pointer',transition:'all .22s'}}
                  onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.transform='translateY(-4px)';(ev.currentTarget as HTMLElement).style.boxShadow='0 16px 48px rgba(249,115,22,0.15)';(ev.currentTarget as HTMLElement).style.borderColor='#f97316';}}
                  onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.transform='none';(ev.currentTarget as HTMLElement).style.boxShadow='none';(ev.currentTarget as HTMLElement).style.borderColor='#fed7aa';}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                    <div style={{width:46,height:46,borderRadius:16,background:`linear-gradient(135deg,${c},${c}bb)`,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:17,color:'#fff',flexShrink:0,position:'relative'}}>
                      {ini}
                      <div style={{position:'absolute',bottom:-2,right:-2,width:12,height:12,borderRadius:'50%',background:'#22c55e',border:'2px solid #fff'}}/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:14,color:'#0f172a',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.aliasName}</div>
                      <div style={{fontSize:11,color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.role}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}}>
                    {e.skills.slice(0,2).map((s:string)=><span key={s} style={{fontSize:10,fontWeight:700,padding:'3px 9px',borderRadius:8,background:'#fff7ed',color:'#c2410c',border:'1px solid #fed7aa'}}>{s}</span>)}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{fontWeight:900,fontSize:16,color:'#0f172a'}}>{cur}{e.rate}<span style={{fontSize:10,fontWeight:400,color:'#9ca3af'}}>/hr</span></span>
                    <span style={{fontSize:11,color:'#9ca3af',display:'flex',alignItems:'center',gap:3}}><Clock size={10}/>~30min</span>
                  </div>
                  <button onClick={ev=>{ev.stopPropagation();sSel({...e,_v:'q'});}} style={{width:'100%',padding:'11px',borderRadius:14,background:'linear-gradient(135deg,#f97316,#ef4444)',color:'#fff',border:'none',fontSize:13,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,boxShadow:'0 4px 14px rgba(249,115,22,0.3)',transition:'opacity .15s'}}
                    onMouseEnter={ev=>(ev.currentTarget as HTMLElement).style.opacity='.85'} onMouseLeave={ev=>(ev.currentTarget as HTMLElement).style.opacity='1'}>
                    <Zap size={14}/>Book now · 1 hr session
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{padding:'80px 32px',background:'#0f172a'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div style={{fontSize:12,fontWeight:800,color:'#f97316',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Client stories</div>
            <h2 style={{fontSize:38,fontWeight:900,color:'#fff',letterSpacing:'-0.03em',margin:'0 0 10px'}}>Trusted by 500+ companies</h2>
            <p style={{fontSize:16,color:'rgba(255,255,255,0.45)',margin:0}}>Real results from real clients across India, UK, Singapore & UAE</p>
          </div>
          <div className="hp-3col" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {[
              {q:'Found a React expert from TCS in 4 hours. Built our entire dashboard in 3 weeks. Incredible quality. Best investment we ever made.',n:'Prashant K.',c:'Fintech startup · Mumbai',r:5,tag:'Hired React Dev',saved:'3 months saved'},
              {q:"The alias system is genius. Got a senior Infosys architect who wouldn't publicly freelance. Deep enterprise experience. Saved us over $50K.",n:'Sarah M.',c:'SaaS company · London, UK',r:5,tag:'Enterprise hire',saved:'$50K saved'},
              {q:'Production down Sunday night. Quick Support saved us. Expert joined Zoom in 25 minutes, fixed our Kubernetes issue in 40 minutes. Absolutely lifesaving.',n:'Raj P.',c:'E-commerce · Singapore',r:5,tag:'Crisis resolved',saved:'Launch saved'},
            ].map((t,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:24,padding:'32px',transition:'all .22s',cursor:'default'}}
                onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.08)';(ev.currentTarget as HTMLElement).style.transform='translateY(-4px)';(ev.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.18)';}}
                onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)';(ev.currentTarget as HTMLElement).style.transform='none';(ev.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)';}}>
                <div style={{display:'flex',gap:2,marginBottom:18}}>{[1,2,3,4,5].map(s=><span key={s} style={{color:'#f59e0b',fontSize:18}}>★</span>)}</div>
                <p style={{fontSize:15,color:'rgba(255,255,255,0.75)',lineHeight:1.75,marginBottom:24}}>"{t.q}"</p>
                <div style={{display:'flex',gap:8,marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,color:'#4ade80',background:'rgba(74,222,128,0.15)',border:'1px solid rgba(74,222,128,0.25)',borderRadius:100,padding:'5px 14px',display:'flex',alignItems:'center',gap:5}}>
                    <CheckCircle size={11}/>  {t.tag}
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.25)',borderRadius:100,padding:'5px 14px'}}>
                    🏆 {t.saved}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:12,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{width:42,height:42,borderRadius:14,background:'linear-gradient(135deg,#4f46e5,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:16,color:'#fff',flexShrink:0}}>{t.n[0]}</div>
                  <div><div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{t.n}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{t.c}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{padding:'80px 32px',background:'#f8fafc'}}>
        <div style={{maxWidth:800,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:44}}>
            <div style={{fontSize:12,fontWeight:800,color:'#4f46e5',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Got questions?</div>
            <h2 style={{fontSize:38,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 10px'}}>Frequently asked</h2>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:8,marginBottom:28}}>
            {['general','payments','freelancer','client','privacy'].map(cat=>(
              <button key={cat} onClick={()=>sFq(cat)} style={{padding:'9px 20px',borderRadius:100,border:`1.5px solid ${fq===cat?'transparent':'#e2e8f0'}`,background:fq===cat?'#0f172a':'#fff',color:fq===cat?'#fff':'#64748b',fontSize:13,fontWeight:700,cursor:'pointer',textTransform:'capitalize',transition:'all .15s'}}>{cat}</button>
            ))}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {(faqs.length>0?faqs:[
              {id:'1',question:'What is WorkSupport360?',answer:"India's first identity-safe freelancer marketplace. Senior MNC engineers work under a privacy alias. Clients get enterprise-grade talent; freelancers get extra income without their employer knowing."},
              {id:'2',question:'How quickly can I hire an expert?',answer:'Admin schedules a 45-min video call within 4 hours of your request. After you approve the expert, the project starts within 24 hours. Escrow is activated immediately.'},
              {id:'3',question:'Is it truly safe for freelancers?',answer:"100% safe. Clients only see your alias name (e.g. 'Rahul S.'). Your real name, current employer, and LinkedIn are never revealed — not even to WorkSupport360 clients."},
              {id:'4',question:'How does payment work?',answer:'Freelancer submits weekly timesheets → you approve → invoice auto-generated → admin sends bank details → you pay within 7 days → freelancer gets payout in 3 days. GST-compliant invoices for Indian businesses.'},
              {id:'5',question:'What is the platform commission?',answer:'WorkSupport360 earns 15% commission on PAYG/Starter plan, 12% on Growth plan, and 10% on Enterprise plan. Quick Support sessions have a 20% flat fee. All transparent, no hidden charges.'},
            ]).map((f:any,fi:number)=><FaqRow key={f.id} f={f} def={fi===0}/>)}
          </div>
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" style={{padding:'80px 32px',background:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:52}}>
            <div style={{fontSize:12,fontWeight:800,color:'#4f46e5',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12}}>Get in touch</div>
            <h2 style={{fontSize:38,fontWeight:900,color:'#0f172a',letterSpacing:'-0.03em',margin:'0 0 10px'}}>We respond in 4 hours</h2>
            <p style={{fontSize:16,color:'#64748b',margin:0}}>Enterprise inquiry, partnership, or just a question? We're here.</p>
          </div>
          <div className="hp-form-grid" style={{display:'grid',gridTemplateColumns:'380px 1fr',gap:40,alignItems:'flex-start'}}>
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {[{e:'📧',t:'Email us',v:'help@worksupport360.com',h:'mailto:help@worksupport360.com'},{e:'💬',t:'WhatsApp',v:'+91-9441363687',h:'https://wa.me/919441363687'},{e:'📅',t:'Book a call',v:'Schedule on Calendly',h:'#'}].map(c=>(
                <a key={c.t} href={c.h} style={{display:'flex',alignItems:'center',gap:18,padding:'20px 22px',background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:20,textDecoration:'none',transition:'all .2s'}}
                  onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.background='#eff6ff';(ev.currentTarget as HTMLElement).style.borderColor='#bfdbfe';(ev.currentTarget as HTMLElement).style.transform='translateX(5px)';}}
                  onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.background='#f8fafc';(ev.currentTarget as HTMLElement).style.borderColor='#f1f5f9';(ev.currentTarget as HTMLElement).style.transform='none';}}>
                  <div style={{width:52,height:52,borderRadius:18,background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{c.e}</div>
                  <div><div style={{fontWeight:700,fontSize:15,color:'#0f172a',marginBottom:2}}>{c.t}</div><div style={{fontSize:13,color:'#64748b'}}>{c.v}</div></div>
                </a>
              ))}
            </div>
            <form onSubmit={submit} style={{background:'#f8fafc',borderRadius:24,padding:'36px',border:'1px solid #f1f5f9',display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div><label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>NAME *</label><input value={contact.name} onChange={ev=>sContact({...contact,name:ev.target.value})} placeholder="Full name" style={{width:'100%',padding:'13px 15px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:14,outline:'none',fontFamily:'inherit',boxSizing:'border-box',background:'#fff',transition:'border .15s'}} onFocus={ev=>ev.target.style.borderColor='#4f46e5'} onBlur={ev=>ev.target.style.borderColor='#e2e8f0'}/></div>
                <div><label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>EMAIL *</label><input type="email" value={contact.email} onChange={ev=>sContact({...contact,email:ev.target.value})} placeholder="you@company.com" style={{width:'100%',padding:'13px 15px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:14,outline:'none',fontFamily:'inherit',boxSizing:'border-box',background:'#fff',transition:'border .15s'}} onFocus={ev=>ev.target.style.borderColor='#4f46e5'} onBlur={ev=>ev.target.style.borderColor='#e2e8f0'}/></div>
              </div>
              <div><label style={{fontSize:11,fontWeight:800,color:'#64748b',letterSpacing:'.06em',display:'block',marginBottom:8}}>MESSAGE *</label><textarea rows={4} value={contact.message} onChange={ev=>sContact({...contact,message:ev.target.value})} placeholder="Tell us about your project, team size, timeline, and what kind of help you need…" style={{width:'100%',padding:'13px 15px',border:'1.5px solid #e2e8f0',borderRadius:14,fontSize:14,outline:'none',resize:'none',fontFamily:'inherit',boxSizing:'border-box',background:'#fff',transition:'border .15s'}} onFocus={ev=>ev.target.style.borderColor='#4f46e5'} onBlur={ev=>ev.target.style.borderColor='#e2e8f0'}/></div>
              <button type="submit" disabled={sending} style={{padding:'16px',borderRadius:18,background:'linear-gradient(135deg,#0f172a,#1e3a5f)',color:'#fff',border:'none',fontSize:15,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 6px 24px rgba(15,23,42,0.25)',opacity:sending?.6:1,transition:'all .15s'}}
                onMouseEnter={ev=>{(ev.currentTarget as HTMLElement).style.transform='translateY(-1px)';}} onMouseLeave={ev=>{(ev.currentTarget as HTMLElement).style.transform='none';}}>
                {sending?'Sending…':<><Send size={16}/>Send message — we reply within 4 hours</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{background:'#0f172a',padding:'60px 32px 32px'}}>
        <div style={{maxWidth:1320,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'280px repeat(3,1fr)',gap:48,marginBottom:48,paddingBottom:48,borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <div style={{width:38,height:38,borderRadius:12,background:'linear-gradient(135deg,#f97316,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:13,color:'#fff',boxShadow:'0 4px 14px rgba(249,115,22,0.4)'}}>WS</div>
                <span style={{fontWeight:900,fontSize:18,color:'#fff',letterSpacing:'-0.03em'}}>Work<span style={{color:'#f97316'}}>Support</span><span style={{fontWeight:300,opacity:.3}}>360</span></span>
              </div>
              <p style={{fontSize:13,color:'rgba(255,255,255,0.4)',lineHeight:1.7,marginBottom:14}}>India's first identity-safe freelancer marketplace. Enterprise MNC talent, alias-protected privacy, admin-coordinated projects.</p>
              <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>help@worksupport360.com<br/>WhatsApp: +91-9441363687</div>
            </div>
            {[
              {t:'Platform',l:['Browse Experts','Quick Support','How it works','For freelancers','Pricing & plans']},
              {t:'Company',l:['About us','Blog','Privacy policy','Terms of service','Contact us']},
              {t:'Support',l:['Help center / FAQ','Email support','WhatsApp us','Report an issue','Dispute resolution']},
            ].map(col=>(
              <div key={col.t}>
                <div style={{fontWeight:800,fontSize:12,color:'rgba(255,255,255,0.4)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:18}}>{col.t}</div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {col.l.map(l=>(
                    <span key={l} style={{fontSize:13,color:'rgba(255,255,255,0.45)',cursor:'pointer',transition:'color .15s'}}
                      onMouseEnter={ev=>(ev.target as HTMLElement).style.color='rgba(255,255,255,0.85)'}
                      onMouseLeave={ev=>(ev.target as HTMLElement).style.color='rgba(255,255,255,0.45)'}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.2)'}}>© 2025 WorkSupport360 Pvt. Ltd. All rights reserved. Employer identity always protected.</div>
            <div style={{display:'flex',gap:24}}>
              {[['Terms','/terms'],['Privacy','/privacy'],['Cookies','#']].map(([l,h])=>(
                <a key={l} href={h} style={{fontSize:12,color:'rgba(255,255,255,0.3)',textDecoration:'none',transition:'color .15s'}}
                  onMouseEnter={ev=>(ev.target as HTMLElement).style.color='rgba(255,255,255,0.7)'}
                  onMouseLeave={ev=>(ev.target as HTMLElement).style.color='rgba(255,255,255,0.3)'}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {sel&&<Modal e={sel} onClose={()=>sSel(null)} auth={isAuthenticated} role={user?.role} nav={navigate}/>}
      <SupportChatWidget/>
    </div>
  );
};

export default HomePage;
