import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Eye, Edit2, Trash2, Search, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { requirementsApi } from '../../services/endpoints';
import { StatusBadge, SectionCard } from '../../components/common';

const STATUS_TABS = [
  { v: 'all',      l: 'All',      col: '#374151' },
  { v: 'pending',  l: 'Pending',  col: '#d97706' },
  { v: 'open',     l: 'Live',     col: '#059669' },
  { v: 'allocated',l: 'Assigned', col: '#7c3aed' },
  { v: 'rejected', l: 'Rejected', col: '#dc2626' },
];

const AdminRequirements: React.FC = () => {
  const qc = useQueryClient();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-requirements-all'],
    queryFn: () => requirementsApi.getAll().then((r: any) => r.data?.items ?? r.data ?? []),
  });

  const allReqs = (Array.isArray(data) ? data : []) as any[];

  const filtered = allReqs.filter(r => {
    const matchTab = tab === 'all' || r.status === tab;
    const matchSearch = !search ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.skillsRequired?.toLowerCase().includes(search.toLowerCase()) ||
      r.companyName?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const update = async (id: string, payload: any, msg: string) => {
    try {
      await requirementsApi.update(id, payload);
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ['admin-requirements-all'] });
      qc.invalidateQueries({ queryKey: ['admin-requirements'] });
      refetch();
    } catch { toast.error('Action failed'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this requirement? This cannot be undone.')) return;
    try {
      await requirementsApi.remove(id);
      toast.success('Requirement deleted');
      qc.invalidateQueries({ queryKey: ['admin-requirements-all'] });
      refetch();
    } catch { toast.error('Delete failed'); }
  };

  const counts = STATUS_TABS.reduce((acc, t) => ({
    ...acc,
    [t.v]: t.v === 'all' ? allReqs.length : allReqs.filter(r => r.status === t.v).length,
  }), {} as Record<string, number>);

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Requirements</h1>
          <p className="text-sm text-gray-500">Review, approve, and manage client-posted requirements</p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
          <RefreshCw size={14}/> Refresh
        </button>
      </div>

      {/* Pending alert */}
      {counts['pending'] > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="text-amber-500 text-xl">⚠️</span>
          <div>
            <div className="font-bold text-amber-900">{counts['pending']} requirement{counts['pending'] > 1 ? 's' : ''} waiting for approval</div>
            <div className="text-sm text-amber-700">Approve to make them live on the freelancer job board. Client emails will be sent automatically.</div>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map(t => (
          <button key={t.v} onClick={() => setTab(t.v)}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${tab === t.v ? 'text-white border-transparent' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
            style={tab === t.v ? { background: t.col, borderColor: t.col } : {}}>
            {t.l} {counts[t.v] > 0 && <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === t.v ? 'bg-white bg-opacity-25' : 'bg-gray-100'}`}>{counts[t.v]}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, skill, or company…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
      </div>

      {/* Requirements list */}
      <SectionCard>
        {isLoading ? (
          <div className="flex justify-center py-12 text-gray-400">Loading requirements…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-4xl mb-3">📋</div>
            <div className="font-bold text-gray-700 mb-1">No requirements {tab !== 'all' ? `with status "${tab}"` : 'yet'}</div>
            <div className="text-sm text-gray-400">Requirements posted by clients will appear here</div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req: any) => {
              const isExp = expanded === req.id;
              const statusColor: Record<string, string> = {
                pending: '#d97706', open: '#059669', allocated: '#7c3aed',
                rejected: '#dc2626', closed: '#64748b',
              };
              const col = statusColor[req.status] || '#374151';

              return (
                <div key={req.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-sm transition-all">
                  {/* Header row */}
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Status dot */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                        style={{ background: `${col}15` }}>
                        {req.status === 'pending' ? '⏳' : req.status === 'open' ? '🟢' : req.status === 'allocated' ? '✅' : req.status === 'rejected' ? '❌' : '📋'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-black text-gray-900">{req.title}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${col}15`, color: col }}>
                            {req.status === 'open' ? 'Live on board' : req.status}
                          </span>
                          {req.urgency === 'urgent' && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">🔥 URGENT</span>}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {req.companyName || 'Client'} · {req.contactName || ''} · Posted {req.createdAt ? new Date(req.createdAt).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                          <span>🛠 <strong>{req.skillsRequired}</strong></span>
                          <span>⏱ {req.hoursPerEngagement} hrs</span>
                          <span>💰 {req.currency}{req.budgetMin}–{req.currency}{req.budgetMax}/hr</span>
                          <span>🌐 {req.workMode}</span>
                          <span>👥 {req.freelancerCount} freelancer{req.freelancerCount > 1 ? 's' : ''}</span>
                          {req.duration && <span>📆 {req.duration} {req.durationType}</span>}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {req.status === 'pending' && (<>
                          <button onClick={() => update(req.id, { status: 'open' }, '✅ Approved! Now live on freelancer job board. Client email sent.')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold">
                            <Check size={12}/> Approve
                          </button>
                          <button onClick={() => update(req.id, { status: 'rejected' }, 'Requirement rejected')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold">
                            <X size={12}/> Reject
                          </button>
                        </>)}
                        {req.status === 'open' && (
                          <button onClick={() => update(req.id, { status: 'closed' }, 'Requirement closed')}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold">
                            Close
                          </button>
                        )}
                        <button onClick={() => setExpanded(isExp ? null : req.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          {isExp ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                        <button onClick={() => remove(req.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExp && (
                    <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                      {req.description && (
                        <div>
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Description</div>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.description}</p>
                        </div>
                      )}
                      {req.preferredStartDate && (
                        <div className="text-sm text-gray-600">📅 Preferred start: <strong>{req.preferredStartDate}</strong></div>
                      )}
                      {req.adminNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
                          <strong>Admin notes:</strong> {req.adminNotes}
                        </div>
                      )}
                      {/* Admin notes editor */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Add / Edit Admin Notes</div>
                        <div className="flex gap-2">
                          <input
                            value={editId === req.id ? editNotes : (req.adminNotes || '')}
                            onChange={e => { setEditId(req.id); setEditNotes(e.target.value); }}
                            onFocus={() => { setEditId(req.id); setEditNotes(req.adminNotes || ''); }}
                            placeholder="Add internal notes about this requirement…"
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                          <button
                            onClick={() => update(req.id, { adminNotes: editNotes }, 'Notes saved')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminRequirements;
