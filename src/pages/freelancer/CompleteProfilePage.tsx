import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Lock, Plus, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const skillOptions = ['React','Node.js','AWS','Python','TypeScript','Docker','Kubernetes','SQL','MongoDB','GraphQL','Vue.js','Java','.NET','Go','Power BI','TensorFlow'];

// This page shows when a freelancer logs in via Google but hasn't completed their profile yet
const CompleteProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [form, setForm] = useState({
    currentRole: '', currentCompany: '', totalExp: '', freelanceExp: '',
    hourlyRate: '', currency: 'USD', country: 'India', timezone: 'IST (UTC+5:30)', bio: '',
    skills: [] as string[],
    availability: Object.fromEntries(days.map(d => [d, { available: false, startTime: '18:00', endTime: '22:00' }]))
  });

  const toggleSkill = (s: string) =>
    setForm(f => ({ ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s] }));

  const toggleDay = (d: string) =>
    setForm(f => ({ ...f, availability: { ...f.availability, [d]: { ...f.availability[d], available: !f.availability[d].available } } }));

  const handleSave = async () => {
    if (!form.currentRole) { toast.error('Please enter your job title'); return; }
    if (!form.currentCompany) { toast.error('Please enter your current company'); return; }
    setSaving(true);
    try {
      const availability = days.map(d => ({
        dayOfWeek:   d,
        isAvailable: form.availability[d].available,
        startTime:   form.availability[d].startTime || undefined,
        endTime:     form.availability[d].endTime   || undefined,
      }));

      await api.post('/auth/complete-profile', {
        currentRole:    form.currentRole,
        currentCompany: form.currentCompany,
        totalExp:       parseInt(form.totalExp || '0'),
        freelanceExp:   parseInt(form.freelanceExp || '0'),
        hourlyRate:     parseFloat(form.hourlyRate || '0'),
        currency:       form.currency,
        country:        form.country,
        timezone:       form.timezone,
        bio:            form.bio,
        skills:         form.skills,
        availability,
      });

      toast.success('Profile saved! Admin will verify your identity shortly. Your profile will go live after verification.', { duration: 6000 });
      navigate('/freelancer');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-2xl font-bold mb-1" style={{ color: '#1a1a2e' }}>
            Work<span style={{ color: '#f97316' }}>Support</span>360
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-4 mb-1">Complete your freelancer profile</h1>
          <p className="text-sm text-gray-500">
            Hi <strong>{user?.name}</strong>! You signed in with Google. Fill in your professional details to go live on the platform.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex gap-3 mb-6">
          <Lock size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Your current company is 100% private.</strong> Clients only see your alias name. Your employer will never know you're freelancing here.
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm space-y-5">

          {/* Job & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Your job title *</label>
              <input value={form.currentRole} onChange={e => setForm({ ...form, currentRole: e.target.value })}
                placeholder="e.g. Senior Software Engineer"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Current company * <span className="text-red-400">🔒 Private</span>
              </label>
              <input value={form.currentCompany} onChange={e => setForm({ ...form, currentCompany: e.target.value })}
                placeholder="e.g. Infosys, TCS, Wipro..."
                className="w-full px-3 py-2.5 border border-red-100 bg-red-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
            </div>
          </div>

          {/* Experience & Rate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Total exp (yrs)</label>
              <input type="number" min="0" max="40" value={form.totalExp} onChange={e => setForm({ ...form, totalExp: e.target.value })}
                placeholder="8"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Freelance exp (yrs)</label>
              <input type="number" min="0" max="20" value={form.freelanceExp} onChange={e => setForm({ ...form, freelanceExp: e.target.value })}
                placeholder="2"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Currency</label>
              <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option>USD</option><option>INR</option><option>EUR</option><option>GBP</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Hourly rate</label>
              <input type="number" min="0" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                placeholder="35"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Country & Timezone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Country</label>
              <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option>India</option><option>USA</option><option>Singapore</option><option>UK</option><option>UAE</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Timezone</label>
              <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
                <option>IST (UTC+5:30)</option>
                <option>UTC</option>
                <option>EST (UTC-5)</option>
                <option>SGT (UTC+8)</option>
                <option>GMT (UTC+0)</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">Bio (shown on your profile)</label>
            <textarea rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
              placeholder="Briefly describe your expertise, what kinds of projects you enjoy, and your communication style..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {/* Skills */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Skills</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skillOptions.map(s => (
                <button key={s} type="button" onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${form.skills.includes(s) ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                  style={form.skills.includes(s) ? { background: '#1a1a2e' } : {}}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                onKeyDown={e => { if (e.key === 'Enter' && newSkill.trim()) { toggleSkill(newSkill.trim()); setNewSkill(''); } }} />
              <button type="button" onClick={() => { if (newSkill.trim()) { toggleSkill(newSkill.trim()); setNewSkill(''); } }}
                className="px-3 py-2 rounded-xl text-white text-sm font-bold" style={{ background: '#1a1a2e' }}>
                <Plus size={15} />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: '#1a1a2e' }}>
                    {s}
                    <button onClick={() => toggleSkill(s)} className="opacity-60 hover:opacity-100 leading-none">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-3">
              Weekly availability
              <span className="ml-2 text-orange-500 font-semibold normal-case text-xs">
                ⚡ Toggle ON days to appear in Quick Support
              </span>
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d, i) => (
                <div key={d} className="text-center">
                  <div className="text-xs text-gray-400 mb-1.5 font-medium">{dayLabels[i]}</div>
                  <button type="button" onClick={() => toggleDay(d)}
                    className={`w-full py-2 rounded-xl border-2 text-xs font-bold transition-all
                      ${form.availability[d].available ? 'text-white border-transparent' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}
                    style={form.availability[d].available ? { background: '#f97316' } : {}}>
                    {form.availability[d].available ? 'On' : 'Off'}
                  </button>
                  {form.availability[d].available && (
                    <div className="mt-1.5 space-y-1">
                      <input type="time" value={form.availability[d].startTime}
                        onChange={e => setForm(f => ({ ...f, availability: { ...f.availability, [d]: { ...f.availability[d], startTime: e.target.value } } }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-1 py-1 focus:outline-none" />
                      <input type="time" value={form.availability[d].endTime}
                        onChange={e => setForm(f => ({ ...f, availability: { ...f.availability, [d]: { ...f.availability[d], endTime: e.target.value } } }))}
                        className="w-full text-xs border border-gray-200 rounded-lg px-1 py-1 focus:outline-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Days marked <strong>On</strong> = you appear in Quick Support section. Clients can book a 1-hour session with you on those days.
            </p>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800">
            <strong>What happens next:</strong>
            <ul className="mt-2 space-y-1 text-xs list-disc list-inside text-amber-700">
              <li>Your profile is saved immediately</li>
              <li>Admin verifies your identity (within 24 hours)</li>
              <li>Once verified — you appear in Browse Experts and Quick Support</li>
              <li>Clients can start requesting demos and booking sessions</li>
            </ul>
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            {saving
              ? <><Loader2 size={16} className="animate-spin" />Saving profile...</>
              : <><Check size={16} />Save profile &amp; go to dashboard <ArrowRight size={15} /></>
            }
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          You can update these details anytime from your dashboard → My Profile
        </p>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
