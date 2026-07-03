import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const SKILLS = ['React','Angular','Vue.js','Node.js','Python','Django','FastAPI','Java','Spring Boot','.NET','C#','Go','Rust','Docker','Kubernetes','AWS','Azure','GCP','Terraform','TypeScript','GraphQL','React Native','Flutter','iOS','Android','Machine Learning','TensorFlow','Data Science','Power BI','Selenium','Cypress','Kafka','Elasticsearch','Linux','DevOps','CI/CD','Blockchain','Solidity'];

const STEPS = ['Describe Need','Skills & Exp','Budget','Work Mode','Review & Submit'];

type Form = {
  title:string; jobDescription:string; openPositions:string;
  requiredSkills:string[];
  experienceMin:string; experienceMax:string;
  engagementType:string; budgetType:string;
  budgetMin:string; budgetMax:string; currency:string;
  hourlyRate:string; monthlyRate:string; noticePeriod:string;
  workMode:string; hybridDays:string; location:string; workTimings:string;
  notes:string; clientPhone:string;
};

const inp = {
  width:'100%' as const, padding:'13px 16px',
  border:'1.5px solid #e2e8f0', borderRadius:14,
  fontSize:14, outline:'none' as const,
  fontFamily:'inherit', transition:'border .15s',
  background:'#fff', color:'#0f172a',
  boxSizing:'border-box' as const,
};
const F=(e:any)=>e.target.style.borderColor='#6366f1';
const B=(e:any)=>e.target.style.borderColor='#e2e8f0';

// BIG text area — freelancer.in style
const BigArea=({value,onChange,placeholder,rows=6}:{value:string,onChange:(v:string)=>void,placeholder:string,rows?:number})=>(
  <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder}
    style={{...inp,resize:'vertical' as const,lineHeight:1.75,fontSize:15,padding:'18px 20px',borderRadius:16,minHeight:rows*32,background:'#fafafa'}}
    onFocus={F} onBlur={B}/>
);

const PostRequirement:React.FC=()=>{
  const navigate=useNavigate();
  const[sp]=useSearchParams();
  const reqType=sp.get('type')||'requirement';
  const[step,setStep]=useState(0);
  const[loading,setLoading]=useState(false);
  const[aiLoading,setAiLoading]=useState(false);
  const[aiPrompt,setAiPrompt]=useState('');
  const[showAi,setShowAi]=useState(false);
  const[form,setForm]=useState<Form>({
    title:'',jobDescription:'',openPositions:'1',
    requiredSkills:[],
    experienceMin:'',experienceMax:'',
    engagementType:reqType==='job_support'?'job_support':reqType==='dedicated'?'dedicated':'freelance',
    budgetType:'hourly',
    budgetMin:'',budgetMax:'',currency:'USD',
    hourlyRate:'',monthlyRate:'',noticePeriod:'',
    workMode:'remote',hybridDays:'3',
    location:'',workTimings:'',
    notes:'',clientPhone:'',
  });

  const set=(k:keyof Form,v:any)=>setForm(f=>({...f,[k]:v}));
  const toggleSkill=(s:string)=>set('requiredSkills',form.requiredSkills.includes(s)?form.requiredSkills.filter(x=>x!==s):[...form.requiredSkills,s]);
  const cur=form.currency==='INR'?'₹':form.currency==='EUR'?'€':'$';

  // AI JD generation using Anthropic API
  const generateJD=async()=>{
    if(!aiPrompt.trim()){toast.error('Describe what you need first');return;}
    setAiLoading(true);
    try{
      const res=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:1000,
          messages:[{
            role:'user',
            content:`Generate a professional job description for this requirement: "${aiPrompt}"
            
Format as:
**Role Overview:** [2-3 sentences]

**Key Responsibilities:**
• [responsibility 1]
• [responsibility 2]
• [responsibility 3]
• [responsibility 4]
• [responsibility 5]

**Required Skills:**
• [skill 1]
• [skill 2]
• [skill 3]

**Nice to Have:**
• [optional skill]

**About the Engagement:**
[1-2 sentences about work style, team, etc.]

Keep it professional and concise. Focus on what the candidate will do, not requirements they must have.`
          }]
        })
      });
      const data=await res.json();
      const text=data.content?.[0]?.text||'';
      if(text){
        set('jobDescription',text);
        // Extract title suggestion
        if(!form.title){
          const titleMatch=text.match(/(?:for|as a|as an|position:|role:)\s+([A-Z][^.]+)/i);
          if(titleMatch)set('title',titleMatch[1].slice(0,60).trim());
        }
        setShowAi(false);
        toast.success('JD generated! Review and edit as needed.');
      }
    }catch{
      toast.error('AI generation failed. Please write manually.');
    }finally{setAiLoading(false);}
  };

  // Scroll left panel to top on step change
  useEffect(()=>{
    const panel=document.getElementById('pr-left-panel');
    if(panel)panel.scrollTo({top:0,behavior:'smooth'});
    else window.scrollTo({top:0,behavior:'smooth'});
  },[step]);

  const canNext=()=>{
    if(step===0)return form.title.trim().length>3&&form.jobDescription.trim().length>30;
    if(step===2)return !!form.budgetMin&&!!form.budgetMax;
    return true;
  };

  const submit=async()=>{
    setLoading(true);
    try{
      await api.post('/requirements',{
        title:form.title,
        jobDescription:form.jobDescription,
        requiredSkills:form.requiredSkills.join(', '),
        experienceMin:form.experienceMin,experienceMax:form.experienceMax,
        budgetType:form.budgetType,
        budgetMin:parseFloat(form.budgetMin||'0'),
        budgetMax:parseFloat(form.budgetMax||'0'),
        currency:form.currency,
        engagementType:form.engagementType,
        workMode:form.workMode,
        hybridDaysPerWeek:form.workMode==='hybrid'?parseInt(form.hybridDays):undefined,
        location:form.location,workTimings:form.workTimings,
        openPositions:parseInt(form.openPositions)||1,
        notes:(form.notes||'')+(form.noticePeriod?`\nNotice period: ${form.noticePeriod}`:'')+(form.clientPhone?`\nClient phone: ${form.clientPhone}`:''),
      });
      toast.success('✅ Requirement posted! Admin will review and assign experts within 4 hours.',{duration:6000});
      navigate('/client');
    }catch(e:any){
      toast.error(e?.response?.data?.message||'Failed to post requirement');
    }finally{setLoading(false);}
  };

  const pageTitle={
    job_support:'Request Job Support',
    dedicated:'Get a Dedicated Expert',
    requirement:'Post a Requirement',
    freelance:'Post a Project',
  }[reqType]||'Post a Requirement';

  const bgImages=[
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80', // team working
    'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=900&q=80', // meeting
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80', // office
    'https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&q=80', // laptop
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=80', // collaboration
  ];

  return(
    <div style={{minHeight:'100vh',display:'grid',gridTemplateColumns:'1fr 1fr',fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`*{box-sizing:border-box}input::placeholder,textarea::placeholder{color:#94a3b8}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}@keyframes spin{to{transform:rotate(360deg)}}.fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}`}</style>

      {/* ── LEFT: Form side ── */}
      <div id='pr-left-panel' style={{overflowY:'auto',background:'#fff',display:'flex',flexDirection:'column'}}>
        {/* Top bar */}
        <div style={{position:'sticky',top:0,background:'rgba(255,255,255,0.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid #f1f5f9',padding:'14px 40px',display:'flex',alignItems:'center',justifyContent:'space-between',zIndex:50}}>
          <button onClick={()=>step>0?setStep(s=>s-1):navigate('/client')} style={{display:'flex',alignItems:'center',gap:7,fontSize:13,fontWeight:600,color:'#64748b',background:'none',border:'none',cursor:'pointer'}}>
            <ArrowLeft size={15}/> {step>0?'Back':'Cancel'}
          </button>
          {/* Step dots */}
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            {STEPS.map((_,i)=>(
              <React.Fragment key={i}>
                <div style={{width:i===step?24:8,height:8,borderRadius:4,background:i<step?'#22c55e':i===step?'#6366f1':'#e2e8f0',transition:'all .3s'}}/>
              </React.Fragment>
            ))}
          </div>
          <div style={{fontSize:12,color:'#94a3b8',fontWeight:600}}>{step+1}/{STEPS.length}</div>
        </div>

        <div style={{flex:1,padding:'40px 40px 80px'}}>
          <div className="fu">
            {/* Step label */}
            <div style={{fontSize:11,fontWeight:800,color:'#6366f1',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>{STEPS[step]}</div>

            {/* ── STEP 0: Describe ── */}
            {step===0&&(<>
              <h1 style={{fontSize:'clamp(2rem,4vw,3.2rem)',fontWeight:900,lineHeight:1.05,letterSpacing:'-0.04em',color:'#0f172a',margin:'0 0 12px'}}>
                Tell us what you<br/><span style={{color:'#6366f1'}}>need done.</span>
              </h1>
              <p style={{fontSize:15,color:'#64748b',marginBottom:32,lineHeight:1.6}}>We'll guide you. The more detail, the better the match.</p>

              {/* Title */}
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Requirement title *</label>
                <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder='e.g. "Senior React Developer for FinTech Dashboard — 3 months"' style={{...inp,fontSize:16,fontWeight:600,padding:'15px 18px',borderRadius:16}} onFocus={F} onBlur={B}/>
              </div>

              {/* AI JD Generator */}
              <div style={{marginBottom:16}}>
                {!showAi?(
                  <button onClick={()=>setShowAi(true)} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 20px',borderRadius:12,border:'1.5px dashed #6366f1',background:'#f5f3ff',color:'#4338ca',fontSize:13,fontWeight:700,cursor:'pointer',width:'100%',justifyContent:'center',marginBottom:12,transition:'all .15s'}}
                    onMouseEnter={ev=>(ev.currentTarget as HTMLElement).style.background='#ede9fe'}
                    onMouseLeave={ev=>(ev.currentTarget as HTMLElement).style.background='#f5f3ff'}>
                    <Sparkles size={16}/> ✨ Generate JD with AI — describe in plain text
                  </button>
                ):(
                  <div style={{background:'#f5f3ff',border:'1.5px solid #c4b5fd',borderRadius:16,padding:'16px',marginBottom:12}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#4338ca',marginBottom:10,display:'flex',alignItems:'center',gap:6}}><Sparkles size={14}/>AI JD Generator</div>
                    <textarea value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} rows={3}
                      placeholder='Describe in plain words: "I need a React developer to build a financial dashboard with charts and real-time data. 3 months project. Mid-senior level."'
                      style={{...inp,background:'#fff',borderColor:'#c4b5fd',resize:'none' as const,marginBottom:10}} onFocus={F} onBlur={B}/>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={generateJD} disabled={aiLoading} style={{flex:1,padding:'10px',borderRadius:12,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'#fff',border:'none',fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,opacity:aiLoading?.6:1}}>
                        {aiLoading?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>Generating…</>:<><Sparkles size={14}/>Generate JD</>}
                      </button>
                      <button onClick={()=>setShowAi(false)} style={{padding:'10px 16px',borderRadius:12,background:'#fff',border:'1.5px solid #c4b5fd',color:'#7c3aed',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>

              {/* JD textarea */}
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Job Description *</label>
                <BigArea value={form.jobDescription} onChange={v=>set('jobDescription',v)} rows={10}
                  placeholder={`Enter a few bullet points or a full description:\n\n• What will this expert work on?\n• What tech stack / tools?\n• Key deliverables?\n• Team structure?\n• Domain knowledge required?\n\nPress Ctrl+Enter to continue`}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:6,fontSize:11}}>
                  <span style={{color:form.jobDescription.length<50?'#f97316':form.jobDescription.length<100?'#f59e0b':'#10b981',fontWeight:600}}>
                    {form.jobDescription.length<50?'⚠ Add more detail for better matching':form.jobDescription.length<100?'Getting there — add a bit more':'✓ Great detail!'}
                  </span>
                  <span style={{color:'#94a3b8'}}>{form.jobDescription.length} chars</span>
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Number of positions</label>
                <div style={{display:'flex',gap:8}}>
                  {['1','2','3','4','5','More'].map(n=>(
                    <button key={n} type="button" onClick={()=>set('openPositions',n==='More'?'6':n)}
                      style={{flex:1,padding:'11px 0',borderRadius:12,border:`2px solid ${form.openPositions===(n==='More'?'6':n)?'#6366f1':'#e2e8f0'}`,background:form.openPositions===(n==='More'?'6':n)?'#eff6ff':'#fff',color:form.openPositions===(n==='More'?'6':n)?'#4338ca':'#64748b',fontSize:14,fontWeight:700,cursor:'pointer',transition:'all .15s'}}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Your phone (optional — for quick contact)</label>
                <input value={form.clientPhone} onChange={e=>set('clientPhone',e.target.value)} placeholder="+91-9876543210" style={inp} onFocus={F} onBlur={B}/>
              </div>
            </>)}

            {/* ── STEP 1: Skills & Experience ── */}
            {step===1&&(<>
              <h2 style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:900,lineHeight:1.1,letterSpacing:'-0.03em',color:'#0f172a',margin:'0 0 8px'}}>Skills & Experience</h2>
              <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Select what matters most. We'll match based on these.</p>

              <div style={{marginBottom:28}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>Required skills</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {SKILLS.map(s=>{const sel=form.requiredSkills.includes(s);return(
                    <button key={s} type="button" onClick={()=>toggleSkill(s)}
                      style={{padding:'8px 16px',borderRadius:10,fontSize:13,fontWeight:600,cursor:'pointer',border:'1.5px solid',transition:'all .15s',background:sel?'#0f172a':'#fff',color:sel?'#fff':'#64748b',borderColor:sel?'#0f172a':'#e2e8f0'}}>
                      {sel&&<Check size={10} style={{display:'inline',marginRight:5}}/>}{s}
                    </button>
                  );})}
                </div>
                {form.requiredSkills.length>0&&<div style={{marginTop:10,padding:'8px 14px',background:'#f0fdf4',border:'1px solid #86efac',borderRadius:10,fontSize:12,color:'#15803d',fontWeight:600}}>✅ {form.requiredSkills.length} selected: {form.requiredSkills.slice(0,4).join(', ')}{form.requiredSkills.length>4?` +${form.requiredSkills.length-4} more`:''}</div>}
              </div>

              <div style={{marginBottom:28}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>Experience range</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr',gap:12,alignItems:'center'}}>
                  <div>
                    <div style={{fontSize:11,color:'#94a3b8',marginBottom:6}}>Minimum years</div>
                    <select value={form.experienceMin} onChange={e=>set('experienceMin',e.target.value)} style={{...inp}}>
                      <option value="">Any experience</option>
                      {['1','2','3','4','5','6','7','8','10','12','15'].map(y=><option key={y}>{y} yr</option>)}
                    </select>
                  </div>
                  <span style={{color:'#94a3b8',fontSize:16,paddingTop:20}}>→</span>
                  <div>
                    <div style={{fontSize:11,color:'#94a3b8',marginBottom:6}}>Maximum years</div>
                    <select value={form.experienceMax} onChange={e=>set('experienceMax',e.target.value)} style={{...inp}}>
                      <option value="">No limit</option>
                      {['3','5','7','8','10','12','15','20'].map(y=><option key={y}>{y} yr</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{marginBottom:28}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>Engagement type</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {[
                    ['freelance','🧑‍💻 Freelance','Flexible, project-based'],
                    ['full_time','👔 Full-Time Hire','Dedicated, ongoing'],
                    ['job_support','🆘 Job Support','Help with my current work'],
                    ['dedicated','🎯 Dedicated Resource','Long-term exclusive'],
                  ].map(([v,l,d])=>(
                    <button key={v} type="button" onClick={()=>set('engagementType',v)}
                      style={{padding:'14px',borderRadius:14,border:`2px solid ${form.engagementType===v?'#6366f1':'#e2e8f0'}`,background:form.engagementType===v?'#eff6ff':'#fff',cursor:'pointer',textAlign:'left' as const,transition:'all .15s'}}>
                      <div style={{fontSize:14,fontWeight:800,color:form.engagementType===v?'#3730a3':'#374151',marginBottom:3}}>{l}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{d}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Notice period (if applicable)</label>
                <select value={form.noticePeriod} onChange={e=>set('noticePeriod',e.target.value)} style={{...inp}}>
                  <option value="">Not applicable</option>
                  {['Immediate','15 days','1 month','2 months','3 months','Negotiable'].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </>)}

            {/* ── STEP 2: Budget ── */}
            {step===2&&(<>
              <h2 style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:900,lineHeight:1.1,letterSpacing:'-0.03em',color:'#0f172a',margin:'0 0 8px'}}>Budget & Rate</h2>
              <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Set your budget range. Experts can negotiate.</p>

              <div style={{marginBottom:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>Budget type</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                  {[['hourly','⏱ Hourly','Per hour'],['fixed_monthly','📅 Monthly','Per month'],['fixed','📦 Fixed','Total project']].map(([v,l,d])=>(
                    <button key={v} type="button" onClick={()=>set('budgetType',v)}
                      style={{padding:'14px 10px',borderRadius:14,border:`2px solid ${form.budgetType===v?'#f97316':'#e2e8f0'}`,background:form.budgetType===v?'#fff7ed':'#fff',cursor:'pointer',textAlign:'center' as const,transition:'all .15s'}}>
                      <div style={{fontSize:20,marginBottom:5}}>{l.split(' ')[0]}</div>
                      <div style={{fontSize:13,fontWeight:700,color:form.budgetType===v?'#c2410c':'#374151'}}>{l.split(' ').slice(1).join(' ')}</div>
                      <div style={{fontSize:10,color:'#94a3b8',marginTop:2}}>{d}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{marginBottom:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>
                  Budget range * ({form.budgetType==='hourly'?`${cur}/hr`:form.budgetType==='fixed_monthly'?`${cur}/month`:`${cur} total`})
                </label>
                <div style={{display:'grid',gridTemplateColumns:'90px 1fr auto 1fr',gap:10,alignItems:'center'}}>
                  <select value={form.currency} onChange={e=>set('currency',e.target.value)} style={{...inp,padding:'13px 8px'}}>
                    <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
                  </select>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontWeight:700,color:'#94a3b8',fontSize:14}}>{cur}</span>
                    <input type="number" value={form.budgetMin} onChange={e=>set('budgetMin',e.target.value)} placeholder="Min" style={{...inp,paddingLeft:28}} onFocus={F} onBlur={B}/>
                  </div>
                  <span style={{color:'#94a3b8',fontSize:16,textAlign:'center' as const}}>–</span>
                  <div style={{position:'relative'}}>
                    <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontWeight:700,color:'#94a3b8',fontSize:14}}>{cur}</span>
                    <input type="number" value={form.budgetMax} onChange={e=>set('budgetMax',e.target.value)} placeholder="Max" style={{...inp,paddingLeft:28}} onFocus={F} onBlur={B}/>
                  </div>
                </div>
                {form.budgetMin&&form.budgetMax&&<div style={{marginTop:8,fontSize:13,color:'#059669',fontWeight:600}}>Range: {cur}{parseFloat(form.budgetMin).toLocaleString()} – {cur}{parseFloat(form.budgetMax).toLocaleString()} {form.budgetType==='hourly'?'/hr':form.budgetType==='fixed_monthly'?'/month':' total'}</div>}
              </div>

              {form.budgetType==='hourly'&&<div style={{marginBottom:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Expected daily/weekly hours</label>
                <select value={form.hourlyRate} onChange={e=>set('hourlyRate',e.target.value)} style={{...inp}}>
                  <option value="">Flexible</option>
                  {['2 hr/day','4 hr/day','6 hr/day','8 hr/day (full-time)','10-15 hr/week','20 hr/week'].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>}

              {form.budgetType==='fixed_monthly'&&<div style={{marginBottom:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Duration (months)</label>
                <div style={{display:'flex',gap:8}}>
                  {['1','2','3','6','12','Open-ended'].map(m=>(
                    <button key={m} type="button" onClick={()=>set('monthlyRate',m)}
                      style={{flex:1,padding:'10px 0',borderRadius:11,border:`2px solid ${form.monthlyRate===m?'#f97316':'#e2e8f0'}`,background:form.monthlyRate===m?'#fff7ed':'#fff',color:form.monthlyRate===m?'#c2410c':'#64748b',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                      {m==='Open-ended'?'∞':m+' mo'}
                    </button>
                  ))}
                </div>
              </div>}
            </>)}

            {/* ── STEP 3: Work Mode ── */}
            {step===3&&(<>
              <h2 style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:900,lineHeight:1.1,letterSpacing:'-0.03em',color:'#0f172a',margin:'0 0 8px'}}>Work Mode & Timings</h2>
              <p style={{fontSize:14,color:'#64748b',marginBottom:32}}>Where and when will this expert work?</p>

              <div style={{marginBottom:24}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:12,textTransform:'uppercase'}}>Work mode</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                  {[['remote','🏠','Remote','Work from anywhere'],['hybrid','🔀','Hybrid','Mix of remote + office'],['onsite','🏢','On-site','From office only']].map(([v,em,l,d])=>(
                    <button key={v} type="button" onClick={()=>set('workMode',v)}
                      style={{padding:'18px 10px',borderRadius:16,border:`2px solid ${form.workMode===v?'#6366f1':'#e2e8f0'}`,background:form.workMode===v?'#eff6ff':'#fff',cursor:'pointer',textAlign:'center' as const,transition:'all .15s'}}>
                      <div style={{fontSize:28,marginBottom:8}}>{em}</div>
                      <div style={{fontSize:13,fontWeight:800,color:form.workMode===v?'#3730a3':'#374151',marginBottom:3}}>{l}</div>
                      <div style={{fontSize:11,color:'#94a3b8'}}>{d}</div>
                    </button>
                  ))}
                </div>
              </div>

              {form.workMode==='hybrid'&&<div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:10,textTransform:'uppercase'}}>Days in office per week</label>
                <div style={{display:'flex',gap:8}}>
                  {['1','2','3','4','5'].map(d=>(
                    <button key={d} type="button" onClick={()=>set('hybridDays',d)}
                      style={{flex:1,padding:'12px 0',borderRadius:12,border:`2px solid ${form.hybridDays===d?'#6366f1':'#e2e8f0'}`,background:form.hybridDays===d?'#eff6ff':'#fff',color:form.hybridDays===d?'#4338ca':'#64748b',fontSize:14,fontWeight:700,cursor:'pointer'}}>
                      {d}d
                    </button>
                  ))}
                </div>
              </div>}

              {form.workMode!=='remote'&&<div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Office location / city</label>
                <input value={form.location} onChange={e=>set('location',e.target.value)} placeholder="e.g. Hyderabad, Telangana or full address" style={inp} onFocus={F} onBlur={B}/>
              </div>}

              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Work timings / timezone</label>
                <input value={form.workTimings} onChange={e=>set('workTimings',e.target.value)} placeholder="e.g. 9am–6pm IST, Mon–Fri or Flexible hours" style={inp} onFocus={F} onBlur={B}/>
              </div>

              <div>
                <label style={{fontSize:12,fontWeight:700,color:'#475569',letterSpacing:'0.04em',display:'block',marginBottom:8,textTransform:'uppercase'}}>Additional notes</label>
                <BigArea rows={4} value={form.notes} onChange={v=>set('notes',v)} placeholder="NDA required? Specific tools? Interview process? Start date? Any other details admin should know..."/>
              </div>
            </>)}

            {/* ── STEP 4: Review ── */}
            {step===4&&(<>
              <h2 style={{fontSize:'clamp(1.8rem,3vw,2.6rem)',fontWeight:900,lineHeight:1.1,letterSpacing:'-0.03em',color:'#0f172a',margin:'0 0 8px'}}>Review & Submit</h2>
              <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>Everything looks good? Submit and we'll get back to you in 4 hours.</p>

              <div style={{background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:18,padding:'20px',marginBottom:20,display:'flex',flexDirection:'column',gap:10}}>
                {[
                  {l:'📋 Title',v:form.title},
                  {l:'👥 Positions',v:`${form.openPositions} opening(s)`},
                  {l:'🛠 Skills',v:form.requiredSkills.length>0?form.requiredSkills.join(', '):'Not specified'},
                  {l:'⭐ Experience',v:form.experienceMin||form.experienceMax?`${form.experienceMin||'Any'} – ${form.experienceMax||'∞'} years`:'Not specified'},
                  {l:'🤝 Engagement',v:form.engagementType.replace('_',' ')},
                  {l:'💰 Budget',v:form.budgetMin&&form.budgetMax?`${cur}${form.budgetMin} – ${cur}${form.budgetMax} (${form.budgetType})`:'Not set'},
                  {l:'🏢 Work mode',v:form.workMode==='hybrid'?`Hybrid (${form.hybridDays} days/week)`:form.workMode},
                  {l:'📍 Location',v:form.location||'Remote'},
                  {l:'🕐 Timings',v:form.workTimings||'Flexible'},
                ].map(r=>(
                  <div key={r.l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #f1f5f9',fontSize:13}}>
                    <span style={{color:'#64748b',fontWeight:500}}>{r.l}</span>
                    <span style={{color:'#0f172a',fontWeight:600,maxWidth:260,textAlign:'right' as const,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.v}</span>
                  </div>
                ))}
              </div>

              <div style={{background:'#f0fdf4',border:'1px solid #86efac',borderRadius:14,padding:'16px',marginBottom:20,fontSize:13,color:'#15803d',lineHeight:1.7}}>
                <strong>🔒 What happens next:</strong><br/>
                1. Admin reviews within 4 hours<br/>
                2. Best-matched experts get your JD via email + portal<br/>
                3. Expert confirms interest → admin sets up meeting<br/>
                4. You meet, approve → project starts with escrow
              </div>
            </>)}

            {/* Nav buttons */}
            <div style={{display:'flex',gap:12,marginTop:32}}>
              {step>0&&<button type="button" onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:'15px',borderRadius:16,border:'1.5px solid #e2e8f0',background:'#fff',fontSize:14,fontWeight:700,color:'#374151',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><ArrowLeft size={16}/>Back</button>}
              {step<STEPS.length-1
                ?<button type="button" onClick={()=>canNext()?setStep(s=>s+1):toast.error('Fill required fields')}
                  style={{flex:1,padding:'15px',borderRadius:16,border:'none',background:canNext()?'linear-gradient(135deg,#6366f1,#8b5cf6)':'#e2e8f0',fontSize:14,fontWeight:800,color:canNext()?'#fff':'#94a3b8',cursor:canNext()?'pointer':'not-allowed',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:canNext()?'0 6px 20px rgba(99,102,241,0.3)':'none',transition:'all .2s'}}>
                  Continue <ArrowRight size={16}/>
                </button>
                :<button type="button" onClick={submit} disabled={loading}
                  style={{flex:1,padding:'15px',borderRadius:16,border:'none',background:loading?'#e2e8f0':'linear-gradient(135deg,#059669,#047857)',fontSize:14,fontWeight:800,color:loading?'#94a3b8':'#fff',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:loading?'none':'0 6px 20px rgba(5,150,105,0.35)',transition:'all .2s'}}>
                  {loading?<><div style={{width:16,height:16,borderRadius:'50%',border:'2.5px solid #94a3b8',borderTopColor:'#fff',animation:'spin 1s linear infinite'}}/> Posting…</>:<>🚀 Submit Requirement</>}
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Dynamic visual side ── */}
      <div style={{position:'sticky',top:0,height:'100vh',overflow:'hidden',background:'#0f172a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:40}}>
        <div style={{position:'absolute',inset:0,background:'linear-gradient(160deg,#0f172a 0%,#1e1b4b 40%,#312e81 75%,#4c1d95 100%)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(ellipse 80% 60% at 60% 30%, rgba(249,115,22,0.2) 0%, transparent 60%)'}}/>
        <div style={{position:'absolute',inset:0,backgroundImage:'radial-gradient(circle,rgba(255,255,255,0.04) 1.5px,transparent 1.5px)',backgroundSize:'24px 24px'}}/>

        {/* Step-based content */}
        <div style={{position:'relative',zIndex:1,textAlign:'center',maxWidth:400}}>
          {[
            {title:'Tell us what you need.',sub:'Be as specific as possible. Our AI can help generate a professional JD from a simple description.',emoji:'📋',color:'#6366f1'},
            {title:'Skills & experience matter.',sub:'The right match comes from precise requirements. Select all the skills that matter for your project.',emoji:'🎯',color:'#8b5cf6'},
            {title:'Fair budget. Better matches.',sub:'Set a realistic range. Experts can negotiate — you\'ll always decide before committing.',emoji:'💰',color:'#f97316'},
            {title:'Work the way you want.',sub:'Remote, hybrid, or office — we find experts who fit your working style and timezone.',emoji:'🏢',color:'#10b981'},
            {title:'Ready to find your expert?',sub:'Admin reviews your requirement and assigns the best-matched MNC expert within 4 hours.',emoji:'🚀',color:'#22c55e'},
          ].map((s,i)=>(
            <div key={i} style={{display:step===i?'block':'none',animation:'fadeUp .4s ease'}}>
              <div style={{fontSize:72,marginBottom:24}}>{s.emoji}</div>
              <h2 style={{fontSize:32,fontWeight:900,color:'#fff',letterSpacing:'-0.03em',lineHeight:1.1,marginBottom:16}}>{s.title}</h2>
              <p style={{fontSize:16,color:'rgba(255,255,255,0.55)',lineHeight:1.75}}>{s.sub}</p>
              <div style={{marginTop:32,display:'flex',justifyContent:'center',gap:8}}>
                {STEPS.map((_,j)=>(
                  <div key={j} style={{width:j===i?24:8,height:8,borderRadius:4,background:j<i?'#22c55e':j===i?s.color:'rgba(255,255,255,0.15)',transition:'all .3s'}}/>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostRequirement;
