import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Upload, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { requirementsApi } from '../../services/endpoints';

const inp: React.CSSProperties = {
  width:'100%', padding:'11px 14px', border:'1.5px solid #e2e8f0',
  borderRadius:11, fontSize:14, outline:'none', fontFamily:'inherit',
  background:'#fff', color:'#0f172a', transition:'border .15s', boxSizing:'border-box',
};
const lbl: React.CSSProperties = {
  fontSize:12, fontWeight:700, color:'#374151', display:'block',
  marginBottom:7, textTransform:'uppercase', letterSpacing:'0.04em',
};
const onF = (e: any) => e.target.style.borderColor = '#3b82f6';
const onB = (e: any) => e.target.style.borderColor = '#e2e8f0';

export default function PostRequirementPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: '',
    skillset: '',
    hours: '',
    freelancerCount: '1',
    budgetMin: '',
    budgetMax: '',
    currency: 'INR',
    duration: '',
    durationType: 'months',
    workMode: 'remote',
    jd: '',
    companyName: user?.name || '',
    contactName: user?.name || '',
    urgency: 'normal',
    startDate: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.skillset || !form.hours || !form.budgetMin) {
      toast.error('Please fill all required fields'); return;
    }
    setSubmitting(true);
    try {
      await requirementsApi.create({
        title: form.title || `${form.skillset} Requirement`,
        skillsRequired: form.skillset,
        hoursPerEngagement: form.hours,
        freelancerCount: parseInt(form.freelancerCount),
        budgetMin: parseFloat(form.budgetMin),
        budgetMax: parseFloat(form.budgetMax || form.budgetMin),
        currency: form.currency,
        duration: form.duration,
        durationType: form.durationType,
        workMode: form.workMode,
        description: form.jd,
        companyName: form.companyName,
        contactName: form.contactName,
        urgency: form.urgency,
        preferredStartDate: form.startDate,
        status: 'pending',
      });
      setSubmitted(true);
    } catch (err: any) {
      // Fallback to contact API if requirements endpoint not ready
      try {
        const { publicApi } = await import('../../services/endpoints');
        await publicApi.contact({
          name: form.contactName || user?.name || 'Client',
          email: user?.email || 'client@ws360.com',
          reason: 'post_requirement',
          message: `REQUIREMENT POSTED\nTitle: ${form.title}\nSkillsRequired: ${form.skillset}\nHours: ${form.hours}\nFreelancers: ${form.freelancerCount}\nBudget: ${form.currency}${form.budgetMin}–${form.currency}${form.budgetMax}\nDuration: ${form.duration} ${form.durationType}\nMode: ${form.workMode}\nUrgency: ${form.urgency}\nStart: ${form.startDate}\nJD: ${form.jd}`,
        });
        setSubmitted(true);
      } catch {
        toast.error('Failed to submit. Please try again.');
      }
    }
    setSubmitting(false);
  };





  if (!isAuthenticated) { navigate('/login?returnTo=/post-requirement'); return null; }
  if (user?.role === 'freelancer') { navigate('/'); return null; }

  if (submitted) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#f8fafc,#eff6ff)', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ background:'#fff', borderRadius:24, padding:'52px 44px', maxWidth:560, width:'100%', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:36, boxShadow:'0 8px 24px rgba(34,197,94,0.3)' }}>✓</div>
        <h2 style={{ fontWeight:900, fontSize:26, color:'#0f172a', margin:'0 0 10px', letterSpacing:'-0.03em' }}>Requirement Submitted! 🎉</h2>
        <p style={{ fontSize:15, color:'#475569', lineHeight:1.75, margin:'0 0 8px' }}>
          A confirmation email has been sent to your registered email address.
        </p>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.7, margin:'0 0 28px' }}>
          Our admin team will review your requirement and post it to the freelancer job board within <strong>4 hours</strong>. You'll receive updates via email at every step.
        </p>

        <div style={{ background:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:18, padding:'20px', marginBottom:28, textAlign:'left' }}>
          <div style={{ fontSize:12, fontWeight:800, color:'#374151', marginBottom:14, textTransform:'uppercase', letterSpacing:'0.06em' }}>What happens next</div>
          {[
            {n:'1', t:'Admin reviews your requirement', d:'We verify and approve within 2 hours', col:'#3b82f6'},
            {n:'2', t:'Posted to freelancer job board', d:'Visible to all verified IT professionals', col:'#7c3aed'},
            {n:'3', t:'Freelancers apply', d:'Qualified experts submit applications within 24 hrs', col:'#059669'},
            {n:'4', t:'Admin assigns best match', d:'You get matched and session is scheduled', col:'#22c55e'},
          ].map(s => (
            <div key={s.n} style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:s.col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>{s.n}</div>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>{s.t}</div>
                <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={() => { setSubmitted(false); setForm(f => ({ ...f, title:'', skillset:'', jd:'', budgetMin:'', budgetMax:'', duration:'' })); }} style={{ flex:1, padding:'13px', borderRadius:13, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(5,150,105,0.35)' }}>
            Post Another Requirement
          </button>
          <button onClick={() => navigate('/client')} style={{ flex:1, padding:'13px', borderRadius:13, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, fontWeight:600, color:'#374151', cursor:'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#f8fafc', fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}`}</style>

      {/* Nav */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #f1f5f9', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 8px rgba(0,0,0,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:14, fontWeight:600 }}>
          <ArrowLeft size={16}/> Back to home
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#1e3a5f,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:'#fff' }}>WS</div>
          <span style={{ fontWeight:800, fontSize:15, color:'#0f172a' }}>WorkSupport <span style={{ color:'#3b82f6' }}>360</span></span>
        </div>
        <button onClick={() => navigate('/client')} style={{ padding:'8px 18px', borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', fontSize:13, fontWeight:600, color:'#374151', cursor:'pointer' }}>
          My Dashboard
        </button>
      </nav>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'36px 24px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom:28 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:100, background:'#eff6ff', border:'1px solid #bfdbfe', marginBottom:12 }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#1d4ed8' }}>📋 For Clients</span>
          </div>
          <h1 style={{ fontWeight:900, fontSize:28, color:'#0f172a', letterSpacing:'-0.04em', margin:'0 0 8px' }}>Post a Requirement</h1>
          <p style={{ fontSize:15, color:'#64748b', margin:0 }}>Admin reviews and assigns a verified MNC expert within 4 hours. Email confirmation sent immediately.</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

          {/* Requirement title */}
          <div style={{ background:'#fff', borderRadius:18, padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:16 }}>Basic Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={lbl}>Requirement Title</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. React Developer for Dashboard Bug Fix" style={inp} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <label style={lbl}>Skillset / Technology Required <span style={{ color:'#ef4444' }}>*</span></label>
                <input value={form.skillset} onChange={e => set('skillset', e.target.value)} placeholder="e.g. React.js, TypeScript, Node.js, AWS" style={inp} onFocus={onF} onBlur={onB}/>
                <div style={{ fontSize:11, color:'#94a3b8', marginTop:4 }}>Be specific — e.g. "React 18 + TypeScript + REST APIs"</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Urgency</label>
                  <div style={{ display:'flex', gap:8 }}>
                    {[{v:'urgent', l:'🔥 Urgent', note:'Same day'}, {v:'normal', l:'⚡ Normal', note:'2–3 days'}, {v:'planned', l:'📅 Planned', note:'This week'}].map(u => (
                      <button key={u.v} type="button" onClick={() => set('urgency', u.v)}
                        style={{ flex:1, padding:'9px 6px', borderRadius:10, border:`1.5px solid ${form.urgency===u.v?'#3b82f6':'#e2e8f0'}`, background:form.urgency===u.v?'#eff6ff':'#fff', color:form.urgency===u.v?'#1d4ed8':'#374151', fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'center' as const }}>
                        <div>{u.l}</div>
                        <div style={{ fontSize:10, color:form.urgency===u.v?'#3b82f6':'#94a3b8' }}>{u.note}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Preferred Start Date</label>
                  <input type="date" value={form.startDate} min={new Date().toISOString().split('T')[0]} onChange={e => set('startDate', e.target.value)} style={inp} onFocus={onF} onBlur={onB}/>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement details */}
          <div style={{ background:'#fff', borderRadius:18, padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:16 }}>Engagement Details</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div>
                  <label style={lbl}>Hours per engagement <span style={{ color:'#ef4444' }}>*</span></label>
                  <select value={form.hours} onChange={e => set('hours', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
                    <option value="">Select…</option>
                    <option value="1">1 hour — Quick fix / review</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours — Half day</option>
                    <option value="8">8 hours — Full day</option>
                    <option value="20">~20 hrs/week — Part time</option>
                    <option value="40">40 hrs/week — Full time</option>
                    <option value="custom">Custom (describe in JD)</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Number of freelancers</label>
                  <select value={form.freelancerCount} onChange={e => set('freelancerCount', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
                    {['1','2','3','4','5','5+'].map(n => <option key={n} value={n}>{n} {n==='1'?'freelancer':'freelancers'}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Budget Range (per hour) <span style={{ color:'#ef4444' }}>*</span></label>
                <div style={{ display:'grid', gridTemplateColumns:'90px 1fr auto 1fr', gap:10, alignItems:'center' }}>
                  <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
                    <option>INR</option><option>USD</option><option>EUR</option><option>GBP</option>
                  </select>
                  <input type="number" value={form.budgetMin} onChange={e => set('budgetMin', e.target.value)} placeholder="Min" style={inp} onFocus={onF} onBlur={onB}/>
                  <span style={{ color:'#94a3b8', fontSize:13, textAlign:'center' as const }}>to</span>
                  <input type="number" value={form.budgetMax} onChange={e => set('budgetMax', e.target.value)} placeholder="Max" style={inp} onFocus={onF} onBlur={onB}/>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 120px', gap:10 }}>
                <div>
                  <label style={lbl}>Total Engagement Duration</label>
                  <input type="number" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3" style={inp} onFocus={onF} onBlur={onB}/>
                </div>
                <div>
                  <label style={lbl}>Period</label>
                  <select value={form.durationType} onChange={e => set('durationType', e.target.value)} style={{ ...inp, cursor:'pointer' }} onFocus={onF} onBlur={onB}>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>Work Mode</label>
                <div style={{ display:'flex', gap:10 }}>
                  {[{v:'remote',l:'🌐 Remote / Virtual'},{v:'hybrid',l:'🏢 Hybrid'},{v:'onsite',l:'📍 On-site'}].map(m => (
                    <button key={m.v} type="button" onClick={() => set('workMode', m.v)}
                      style={{ flex:1, padding:'11px', borderRadius:11, border:`1.5px solid ${form.workMode===m.v?'#3b82f6':'#e2e8f0'}`, background:form.workMode===m.v?'#eff6ff':'#fff', color:form.workMode===m.v?'#1d4ed8':'#374151', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                      {m.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* JD section */}
          <div style={{ background:'#fff', borderRadius:18, padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:16 }}>Job Description</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={lbl}>Describe the requirement in detail</label>
                <textarea value={form.jd} onChange={e => set('jd', e.target.value)} rows={6}
                  placeholder="Include:&#10;• What needs to be built / fixed / reviewed&#10;• Current tech stack and environment&#10;• Expected deliverables and quality bar&#10;• Any specific experience or certifications required&#10;• Access, tools, or context they will need"
                  style={{ ...inp, resize:'vertical', lineHeight:1.65 }} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <label style={lbl}>Upload JD File (optional)</label>
                <div style={{ border:'2px dashed #e2e8f0', borderRadius:12, padding:'20px', textAlign:'center', cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='#3b82f6';e.currentTarget.style.background='#f8fbff';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='transparent';}}>
                  <input type="file" accept=".pdf,.doc,.docx,.txt" id="jd-upload"
                    onChange={e => setJdFile(e.target.files?.[0] || null)}
                    style={{ display:'none' }}/>
                  <label htmlFor="jd-upload" style={{ cursor:'pointer' }}>
                    {jdFile ? (
                      <div>
                        <div style={{ fontSize:24, marginBottom:6 }}>📄</div>
                        <div style={{ fontWeight:700, fontSize:14, color:'#059669' }}>{jdFile.name}</div>
                        <div style={{ fontSize:12, color:'#94a3b8' }}>Click to change</div>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} color="#94a3b8" style={{ margin:'0 auto 8px' }}/>
                        <div style={{ fontSize:13, fontWeight:600, color:'#374151' }}>Drop PDF or Word file here</div>
                        <div style={{ fontSize:12, color:'#94a3b8' }}>or click to browse · PDF, DOC, DOCX, TXT</div>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Company info */}
          <div style={{ background:'#fff', borderRadius:18, padding:'22px', border:'1px solid #f1f5f9', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ fontWeight:800, fontSize:15, color:'#0f172a', marginBottom:16 }}>Your Details</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={lbl}>Company name</label>
                <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="ABC Technologies Pvt Ltd" style={inp} onFocus={onF} onBlur={onB}/>
              </div>
              <div>
                <label style={lbl}>Contact person name</label>
                <input value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Your full name" style={inp} onFocus={onF} onBlur={onB}/>
              </div>
            </div>
          </div>

          {/* Notice + Submit */}
          <div style={{ background:'#f0fdf4', border:'1.5px solid #86efac', borderRadius:14, padding:'14px 18px', fontSize:13, color:'#15803d', lineHeight:1.65 }}>
            ✅ <strong>After submitting:</strong> Admin reviews and approves within 4 hours → Posted to freelancer job board → Qualified freelancers apply → Admin assigns the best match → You receive email updates at every step.
          </div>

          <button onClick={handleSubmit} disabled={submitting || !form.skillset || !form.hours || !form.budgetMin}
            style={{ padding:'16px', borderRadius:14, background:submitting||!form.skillset||!form.hours||!form.budgetMin?'#f1f5f9':'linear-gradient(135deg,#059669,#10b981)', color:submitting||!form.skillset||!form.hours||!form.budgetMin?'#94a3b8':'#fff', border:'none', fontSize:16, fontWeight:700, cursor:submitting||!form.skillset||!form.hours||!form.budgetMin?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:9, boxShadow:submitting||!form.skillset||!form.hours||!form.budgetMin?'none':'0 6px 20px rgba(5,150,105,0.35)' }}>
            <Send size={17}/> {submitting ? '⏳ Submitting…' : '📋 Submit Requirement'}
          </button>
        </div>
      </div>
    </div>
  );
}
