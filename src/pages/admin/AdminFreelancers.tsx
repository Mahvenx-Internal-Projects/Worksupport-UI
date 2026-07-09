import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Search, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { SectionCard } from '../../components/common';

const AdminFreelancers: React.FC = () => {
  const qc = useQueryClient();
  const [tab, setTab]       = useState<'pending' | 'verified' | 'all'>('pending');
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-freelancers', tab],
    queryFn: () => {
      const params = tab === 'pending' ? '?verified=false' : tab === 'verified' ? '?verified=true' : '';
      return tab === 'pending'
        ? api.get('/admin/freelancer-approvals/pending').then(r => r.data?.items ?? [])
        : api.get(`/admin/freelancer-approvals${params}`).then(r => r.data?.items ?? []);
    },
  });

  const freelancers = (Array.isArray(data) ? data : []) as any[];
  const filtered = freelancers.filter(f =>
    !search ||
    f.userName?.toLowerCase().includes(search.toLowerCase()) ||
    f.currentRole?.toLowerCase().includes(search.toLowerCase()) ||
    f.aliasName?.toLowerCase().includes(search.toLowerCase()) ||
    f.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const verify = async (id: string, approved: boolean) => {
    let reason = '';
    if (!approved) {
      const r = window.prompt('Reason for rejection (optional):');
      if (r === null) return;
      reason = r;
    }
    try {
      await api.patch(`/admin/freelancer-approvals/${id}/approve`, JSON.stringify({ approved, reason }), { headers: { 'Content-Type': 'application/json' } });
      toast.success(approved ? '✅ Approved! Email sent to freelancer.' : 'Rejected');
      qc.invalidateQueries({ queryKey: ['admin-freelancers'] });
      refetch();
    } catch { toast.error('Action failed'); }
  };

  const tabs = [
    { v: 'pending',  l: '⏳ Pending',  count: tab === 'pending'  ? filtered.length : undefined },
    { v: 'verified', l: '✅ Verified',  count: tab === 'verified' ? filtered.length : undefined },
    { v: 'all',      l: '👥 All',       count: tab === 'all'      ? filtered.length : undefined },
  ];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Freelancer Approvals</h1>
          <p className="text-sm text-gray-500">Approve freelancers to make them visible to clients on the homepage</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4">
        <div className="font-bold text-blue-900 mb-1">How freelancer approval works</div>
        <div className="text-sm text-blue-700 space-y-1">
          <div>1️⃣ Freelancer registers → profile created with <strong>IsVerified = false</strong> (not visible to clients)</div>
          <div>2️⃣ Admin reviews profile here → clicks <strong>Approve</strong></div>
          <div>3️⃣ Freelancer gets email: <em>"Your profile is LIVE — clients can now see you as {'{alias}'}"</em></div>
          <div>4️⃣ Freelancer appears on homepage Browse Experts + can be matched to requirements</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.v} onClick={() => setTab(t.v as any)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${tab === t.v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, alias, or skill…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>

      <SectionCard>
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading freelancers…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">👨‍💻</div>
            <div className="font-bold text-gray-700 mb-1">No freelancers {tab === 'pending' ? 'pending approval' : 'found'}</div>
            <div className="text-sm text-gray-400">New registrations will appear here</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((fl: any) => (
              <div key={fl.id} className="border border-gray-100 rounded-2xl p-5 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                    {fl.userName?.[0]?.toUpperCase() || 'F'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-black text-gray-900">{fl.userName}</span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                        alias: {fl.aliasName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${fl.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {fl.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {fl.currentRole} · <span className="text-gray-400">{fl.currentCompany} 🔒</span> · {fl.totalExp} yrs exp
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                      <span>💰 {fl.currency}{fl.hourlyRate}/hr</span>
                      <span>📧 {fl.userEmail}</span>
                      {fl.userMobile && <span>📱 {fl.userMobile}</span>}
                      <span>📅 Joined {fl.createdAt ? new Date(fl.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</span>
                    </div>

                    {fl.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {fl.skills.map((s: string) => (
                          <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">{s}</span>
                        ))}
                      </div>
                    )}

                    {fl.bio && <p className="text-xs text-gray-400 line-clamp-2">{fl.bio.replace(/\[PHOTO:[^\]]+\]/g, '').replace(/\[Support:[^\]]+\]/g, '')}</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {!fl.isVerified ? (
                      <>
                        <button onClick={() => verify(fl.id, true)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold whitespace-nowrap">
                          <Check size={12}/> Approve & Notify
                        </button>
                        <button onClick={() => verify(fl.id, false)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold">
                          <X size={12}/> Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => verify(fl.id, false)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-xs font-bold">
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminFreelancers;
