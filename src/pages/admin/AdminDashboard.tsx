import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, FolderOpen, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap, ArrowRight } from 'lucide-react';
import { useAdminStats, useRequests, useProjects, useInvoices } from '../../hooks/useApi';
import { StatCard, StatusBadge } from '../../components/common';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats } = useAdminStats();
  const { data: requests = [] } = useRequests('pending');
  const { data: projects = [] } = useProjects('active');
  const { data: overdueInvoices = [] } = useInvoices('overdue');
  const { data: pendingInvoices = [] } = useInvoices('pending');

  const pendingRequests = requests.slice(0, 5);
  const activeProjects = projects.slice(0, 5);
  const urgentInvoices = [...overdueInvoices, ...pendingInvoices].slice(0, 5);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">WorkSupport360 platform overview</p>
        </div>
      </div>

      {/* ─── ALERT STRIP ─── */}
      {requests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-500 shrink-0"/>
            <div>
              <div className="font-bold text-amber-900">{requests.length} pending request{requests.length > 1 ? 's' : ''} need attention</div>
              <div className="text-sm text-amber-700">Schedule meetings within 4 hours of request</div>
            </div>
          </div>
          <button onClick={() => navigate('/admin/requests')} className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold">
            Review now <ArrowRight size={14}/>
          </button>
        </div>
      )}

      {overdueInvoices.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-500 shrink-0"/>
            <div>
              <div className="font-bold text-red-900">{overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''}</div>
              <div className="text-sm text-red-700">Send payment reminders to clients</div>
            </div>
          </div>
          <button onClick={() => navigate('/admin/invoices')} className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold">
            View invoices <ArrowRight size={14}/>
          </button>
        </div>
      )}

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue this month" value={`$${stats?.totalRevenue?.toLocaleString() ?? 0}`} delta="Commission earned" deltaType="up" icon={<DollarSign size={18}/>} color="text-green-600"/>
        <StatCard label="Active projects" value={stats?.activeProjects ?? 0} delta="Currently running" deltaType="up" icon={<FolderOpen size={18}/>} color="text-blue-600"/>
        <StatCard label="Pending requests" value={stats?.pendingRequests ?? 0} delta="Need scheduling" deltaType={stats?.pendingRequests > 0 ? 'warn' : 'up'} icon={<Clock size={18}/>} color="text-amber-600"/>
        <StatCard label="Platform commission" value={`$${stats?.platformCommission?.toLocaleString() ?? 0}`} delta="This month" deltaType="up" icon={<TrendingUp size={18}/>} color="text-purple-600"/>
        <StatCard label="Total freelancers" value={stats?.totalFreelancers ?? 0} delta="Registered" deltaType="up" icon={<Users size={18}/>} color="text-indigo-600"/>
        <StatCard label="Total clients" value={stats?.totalClients ?? 0} delta="Registered" deltaType="up" icon={<Users size={18}/>} color="text-teal-600"/>
        <StatCard label="Avg expert rating" value={`${stats?.avgRating ?? 0}★`} delta="Platform average" deltaType="up" icon={<CheckCircle size={18}/>} color="text-amber-500"/>
        <StatCard label="Pending payouts" value={stats?.pendingPayouts ?? 0} delta={`$${stats?.pendingInvoiceAmount?.toLocaleString() ?? 0} pending`} deltaType={stats?.pendingPayouts > 0 ? 'warn' : 'up'} icon={<DollarSign size={18}/>} color="text-orange-500"/>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: '📋', label: 'Pending requests', count: requests.length, path: '/admin/requests', color: 'bg-amber-50 border-amber-200 text-amber-700' },
          { icon: '📁', label: 'Create project', count: null, path: '/admin/projects', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
          { icon: '🧾', label: 'Invoices', count: pendingInvoices.length, path: '/admin/invoices', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { icon: '💸', label: 'Pending payouts', count: stats?.pendingPayouts ?? 0, path: '/admin/payments', color: 'bg-green-50 border-green-200 text-green-700' },
        ].map(a => (
          <button key={a.label} onClick={() => navigate(a.path)} className={`flex flex-col items-center p-4 rounded-2xl border-2 hover:shadow-md transition-all ${a.color}`}>
            <span className="text-2xl mb-1">{a.icon}</span>
            <span className="font-bold text-sm">{a.label}</span>
            {a.count !== null && <span className="text-lg font-black">{a.count}</span>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Pending requests */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-gray-900">Pending requests</div>
            <button onClick={() => navigate('/admin/requests')} className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
          </div>
          {pendingRequests.length === 0 ? <div className="text-center py-6 text-gray-400 text-sm">No pending requests 🎉</div> : (
            <div className="space-y-3">
              {pendingRequests.map((r: any) => (
                <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-900 truncate">{r.clientName}</div>
                    <div className="text-xs text-gray-500 truncate">{r.freelancerName} · {r.sessionType}</div>
                  </div>
                  <button onClick={() => navigate('/admin/requests')} className="shrink-0 text-xs bg-amber-500 text-white px-2.5 py-1.5 rounded-lg font-bold hover:bg-amber-600">Schedule</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active projects */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-gray-900">Active projects</div>
            <button onClick={() => navigate('/admin/projects')} className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
          </div>
          {activeProjects.length === 0 ? <div className="text-center py-6 text-gray-400 text-sm">No active projects</div> : (
            <div className="space-y-3">
              {activeProjects.map((p: any) => (
                <div key={p.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm text-gray-900 truncate flex-1">{p.name}</div>
                    <StatusBadge status={p.status}/>
                  </div>
                  <div className="text-xs text-gray-500 mb-1.5">{p.clientName} · {p.freelancerAlias}</div>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }}/>
                  </div>
                  {p.pendingAmount > 0 && (
                    <div className="text-xs text-red-600 font-bold mt-1">⚠ ${p.pendingAmount?.toLocaleString()} pending payment</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Urgent invoices */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-gray-900">Payment alerts</div>
            <button onClick={() => navigate('/admin/invoices')} className="text-xs text-indigo-600 font-bold hover:underline">View all →</button>
          </div>
          {urgentInvoices.length === 0 ? <div className="text-center py-6 text-gray-400 text-sm">No payment alerts 🎉</div> : (
            <div className="space-y-3">
              {urgentInvoices.map((inv: any) => (
                <div key={inv.id} className={`p-3 rounded-xl border ${inv.status === 'overdue' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="font-semibold text-sm text-gray-900">{inv.invoiceNumber}</div>
                    <StatusBadge status={inv.status}/>
                  </div>
                  <div className="text-xs text-gray-500">{inv.clientName}</div>
                  <div className="text-sm font-black text-gray-900 mt-1">{inv.currency === 'INR' ? '₹' : '$'}{inv.total?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
