import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Save, Plus, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { freelancerApi } from '../../services/endpoints';
import { api } from '../../services/api';
import { ENV } from '../../config/env';
import { useAuthStore } from '../../store/authStore';

const SKILLS = ['React','Angular','Vue','Node.js','Python','Java','C#','.NET','AWS','Azure','GCP','Docker','Kubernetes','Flutter','React Native','TypeScript','PostgreSQL','MySQL','MongoDB','Redis','GraphQL','REST APIs','DevOps','CI/CD','Terraform','Spring Boot','Django','FastAPI','Kafka','Elasticsearch'];

export default function CompleteProfilePage() {
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const { user }   = useAuthStore();
  const fileRef    = useRef<HTMLInputElement>(null);

  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-freelancer-profile-edit'],
    queryFn: async () => {
      const r = await freelancerApi.getMe();
      return r.data;
    },
    staleTime: 0, // always fresh
  });

  // Form state — pre-filled from existing profile
  const [photo,       setPhoto]       = useState<File|null>(null);
  const [photoPreview,setPhotoPreview]= useState<string|null>(null);
  const [currentRole, setCurrentRole] = useState('');
  const [bio,         setBio]         = useState('');
  const [hourlyRate,  setHourlyRate]  = useState('');
  const [currency,    setCurrency]    = useState('INR');
  const [timezone,    setTimezone]    = useState('IST (UTC+5:30)');
  const [totalExp,    setTotalExp]    = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState('');
  const [projects,    setProjects]    = useState<any[]>([]);
  const [addingProj,  setAddingProj]  = useState(false);
  const [proj,        setProj]        = useState({ title:'', role:'', tech:'', desc:'', outcome:'', url:'', type:'freelance' });
  const [saving,      setSaving]      = useState(false);

  // Pre-fill from existing profile
  useEffect(() => {
    if (!existing) return;
    console.log('Profile data:', existing); // debug

    setCurrentRole(existing.currentRole || existing.CurrentRole || '');
    const rawBio = existing.bio || existing.Bio || existing.bioDescription || '';
    setBio(rawBio.replace(/\[PHOTO:[^\]]*\]/g,'').replace(/\[Support:[^\]]*\]/g,'').trim());
    setHourlyRate(String(existing.hourlyRate || existing.HourlyRate || ''));
    setCurrency(existing.currency || existing.Currency || 'INR');
    setTimezone(existing.timezone || existing.Timezone || 'IST (UTC+5:30)');
    setTotalExp(String(existing.totalExp || existing.TotalExp || existing.experienceYears || ''));

    // Skills — handle both array of strings and array of objects
    const rawSkills = existing.skills || existing.Skills || existing.primarySkills || [];
    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      setSelectedSkills(rawSkills.map((s:any) => typeof s === 'string' ? s : (s.skill || s.Skill || s.name || s)));
    } else if (typeof rawSkills === 'string' && rawSkills) {
      setSelectedSkills(rawSkills.split(',').map((s:string) => s.trim()).filter(Boolean));
    }

    // Portfolio projects
    const rawProjects = existing.portfolioProjects || existing.PortfolioProjects || [];
    if (rawProjects.length > 0) setProjects(rawProjects);

    // Photo from Bio prefix OR photoUrl field
    const photoFromBio = rawBio.match(/\[PHOTO:([^\]]+)\]/)?.[1];
    const photoUrl = photoFromBio || existing.photoUrl || existing.PhotoUrl || null;
    if (photoUrl) setPhotoPreview(photoUrl);
  }, [existing]);

  const toggleSkill = (s: string) => setSelectedSkills(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const handleSave = async () => {
    if (!currentRole || !hourlyRate) { toast.error('Fill job title and hourly rate'); return; }
    setSaving(true);
    try {
      // 1. Upload new photo if selected
      let newPhotoUrl = photoPreview?.startsWith('http') ? photoPreview : null;
      if (photo) {
        const fd = new FormData();
        fd.append('file', photo);
        const token = localStorage.getItem('accessToken');
        const res = await fetch(`${ENV.API_URL}/api/upload/profile-photo`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd,
        });
        const data = await res.json();
        if (data.url) newPhotoUrl = data.url;
      }

      // 2. Update profile
      await freelancerApi.updateMe({
        currentRole,
        bio: newPhotoUrl ? `[PHOTO:${newPhotoUrl}]${bio}` : bio,
        hourlyRate: parseFloat(hourlyRate),
        currency,
        timezone,
        totalExp: parseInt(totalExp) || 0,
        skills: selectedSkills,
      });

      // 3. Save new portfolio projects
      for (const p of projects.filter(p => !p.id)) {
        await api.post('/freelancers/me/projects', p);
      }

      qc.invalidateQueries({ queryKey: ['my-freelancer-profile'] });
      toast.success('Profile updated! ✅');
      navigate('/freelancer/profile');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-400 bg-white transition-colors";

  if (isLoading) return (
    <div className="flex justify-center items-center h-48 text-gray-400">Loading your profile…</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Edit Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Updates reflect on your public alias profile visible to clients</p>
        </div>
        <button onClick={() => navigate('/freelancer/profile')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
      </div>

      {/* Photo */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Profile Photo</h3>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-content-center">
              {photoPreview
                ? <img src={photoPreview} alt="profile" className="w-full h-full object-cover"/>
                : <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">{user?.name?.[0]?.toUpperCase()}</div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
              <Camera size={13} color="white"/>
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
              const f = e.target.files?.[0];
              if (f) { setPhoto(f); const r = new FileReader(); r.onload = ev => setPhotoPreview(ev.target?.result as string); r.readAsDataURL(f); }
            }}/>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Upload profile photo</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG · Max 2MB · Shown as your avatar</p>
            {photoPreview && <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="text-xs text-red-500 mt-1">Remove photo</button>}
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900">Professional Info</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Job Title *</label>
            <input value={currentRole} onChange={e => setCurrentRole(e.target.value)} className={inp} placeholder="e.g. Senior React Developer"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Experience (years)</label>
            <input type="number" value={totalExp} onChange={e => setTotalExp(e.target.value)} className={inp} placeholder="e.g. 8"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Timezone</label>
            <select value={timezone} onChange={e => setTimezone(e.target.value)} className={inp}>
              {['IST (UTC+5:30)','PST (UTC-8)','EST (UTC-5)','GMT (UTC+0)','CET (UTC+1)','SGT (UTC+8)','AEST (UTC+10)'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Hourly Rate *</label>
            <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} className={inp} placeholder="e.g. 800"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className={inp}>
              {['INR','USD','EUR','GBP','SGD','AED'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Professional Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className={inp + " resize-none"}
              placeholder="Brief intro shown to clients — highlight expertise, not identity"/>
            <div className="flex justify-end mt-1"><span className={`text-xs ${bio.length > 480 ? 'text-red-400' : 'text-gray-400'}`}>{bio.length}/500</span></div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Skills <span className="text-sm font-normal text-gray-400">({selectedSkills.length} selected)</span></h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {SKILLS.map(s => (
            <button key={s} type="button" onClick={() => toggleSkill(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${selectedSkills.includes(s) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              {selectedSkills.includes(s) ? '✓ ' : ''}{s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={customSkill} onChange={e => setCustomSkill(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && customSkill.trim()) { toggleSkill(customSkill.trim()); setCustomSkill(''); }}}
            placeholder="Add custom skill…" className={inp + " flex-1"}/>
          <button onClick={() => { if(customSkill.trim()){toggleSkill(customSkill.trim());setCustomSkill('');}}}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold">Add</button>
        </div>
        {selectedSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedSkills.filter(s => !SKILLS.includes(s)).map(s => (
              <span key={s} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-600 text-white border-2 border-blue-600 flex items-center gap-1">
                ✓ {s} <button onClick={() => toggleSkill(s)} className="ml-1 opacity-70 hover:opacity-100"><X size={10}/></button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Portfolio Projects */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Portfolio Projects <span className="text-sm font-normal text-gray-400">({projects.length})</span></h3>
          <button onClick={() => setAddingProj(true)} className="flex items-center gap-1 text-sm text-blue-600 font-semibold hover:underline">
            <Plus size={14}/> Add project
          </button>
        </div>

        {projects.map((p, i) => (
          <div key={i} className="border border-gray-100 rounded-xl p-4 mb-3 relative">
            <button onClick={() => setProjects(ps => ps.filter((_,j) => j!==i))}
              className="absolute top-3 right-3 text-gray-300 hover:text-red-400"><X size={14}/></button>
            <div className="font-bold text-gray-900 text-sm">{p.title}</div>
            <div className="text-xs text-gray-500">{p.role} · {p.projectType || p.type}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {(p.techStack || p.tech || '').split(',').filter(Boolean).map((t:string) => (
                <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.trim()}</span>
              ))}
            </div>
          </div>
        ))}

        {addingProj && (
          <div className="border-2 border-blue-100 rounded-xl p-4 bg-blue-50/30 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Title *</label>
                <input value={proj.title} onChange={e => setProj(p=>({...p,title:e.target.value}))} className={inp} placeholder="e.g. E-commerce Platform"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Your Role *</label>
                <input value={proj.role} onChange={e => setProj(p=>({...p,role:e.target.value}))} className={inp} placeholder="e.g. Backend Developer"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Type</label>
                <select value={proj.type} onChange={e => setProj(p=>({...p,type:e.target.value}))} className={inp}>
                  <option value="freelance">Freelance</option>
                  <option value="employment">Employment</option>
                  <option value="personal">Personal / Open Source</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Tech Stack *</label>
                <input value={proj.tech} onChange={e => setProj(p=>({...p,tech:e.target.value}))} className={inp} placeholder="React, Node.js, PostgreSQL, AWS"/>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Description</label>
                <textarea value={proj.desc} onChange={e => setProj(p=>({...p,desc:e.target.value}))} rows={2} className={inp + " resize-none"} placeholder="What did you build?"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Outcome</label>
                <input value={proj.outcome} onChange={e => setProj(p=>({...p,outcome:e.target.value}))} className={inp} placeholder="e.g. Reduced load time 40%"/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">Live URL</label>
                <input value={proj.url} onChange={e => setProj(p=>({...p,url:e.target.value}))} className={inp} placeholder="https://..."/>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                if (!proj.title || !proj.role || !proj.tech) { toast.error('Fill title, role and tech'); return; }
                setProjects(ps => [...ps, { ...proj, techStack: proj.tech, projectType: proj.type, isPublic: true }]);
                setProj({ title:'', role:'', tech:'', desc:'', outcome:'', url:'', type:'freelance' });
                setAddingProj(false);
              }} className="flex-1 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold">✅ Save Project</button>
              <button onClick={() => setAddingProj(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg,#1e3a5f,#3b82f6)', boxShadow: '0 6px 24px rgba(30,58,95,0.35)' }}>
        {saving ? '⏳ Saving…' : <><Save size={18}/> Save Profile Changes</>}
      </button>
    </div>
  );
}
