import React from 'react';
import { Loader2 } from 'lucide-react';

// ---- Avatar ----
export const Avatar: React.FC<{ name: string; size?: 'sm' | 'md' | 'lg' | 'xl'; color?: string }> = ({ name, size = 'md', color }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700'];
  const colorClass = color || colors[name.charCodeAt(0) % colors.length];
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  return <div className={`${sizes[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold shrink-0`}>{initials}</div>;
};

// ---- Badge ----
type BadgeVariant = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple' | 'orange';
export const Badge: React.FC<{ variant?: BadgeVariant; children: React.ReactNode; dot?: boolean }> = ({ variant = 'gray', children, dot }) => {
  const styles: Record<BadgeVariant, string> = {
    blue: 'bg-blue-50 text-blue-700 border border-blue-100',
    green: 'bg-green-50 text-green-700 border border-green-100',
    amber: 'bg-amber-50 text-amber-700 border border-amber-100',
    red: 'bg-red-50 text-red-700 border border-red-100',
    gray: 'bg-gray-100 text-gray-600',
    purple: 'bg-purple-50 text-purple-700 border border-purple-100',
    orange: 'bg-orange-50 text-orange-700 border border-orange-100',
  };
  const dotColors: Record<BadgeVariant, string> = { blue: 'bg-blue-500', green: 'bg-green-500', amber: 'bg-amber-400', red: 'bg-red-500', gray: 'bg-gray-400', purple: 'bg-purple-500', orange: 'bg-orange-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

// ---- Status Badge ----
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Pending', variant: 'amber' },
    scheduled: { label: 'Scheduled', variant: 'blue' },
    approved: { label: 'Approved', variant: 'green' },
    rejected: { label: 'Rejected', variant: 'red' },
    completed: { label: 'Completed', variant: 'green' },
    active: { label: 'Active', variant: 'blue' },
    paused: { label: 'Paused', variant: 'amber' },
    cancelled: { label: 'Cancelled', variant: 'red' },
    paid: { label: 'Paid', variant: 'green' },
    overdue: { label: 'Overdue', variant: 'red' },
    processing: { label: 'Processing', variant: 'blue' },
    draft: { label: 'Draft', variant: 'gray' },
    submitted: { label: 'Submitted', variant: 'purple' },
    in_progress: { label: 'In Progress', variant: 'blue' },
    upcoming: { label: 'Upcoming', variant: 'blue' },
  };
  const cfg = map[status] || { label: status, variant: 'gray' as BadgeVariant };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
};

// ---- Stat Card ----
export const StatCard: React.FC<{ label: string; value: string | number; delta?: string; deltaType?: 'up' | 'down' | 'warn'; icon?: React.ReactNode; color?: string }> =
  ({ label, value, delta, deltaType = 'up', icon, color = 'text-blue-600' }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon && <div className={`${color} opacity-70`}>{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {delta && (
        <div className={`text-xs flex items-center gap-1 ${deltaType === 'up' ? 'text-green-600' : deltaType === 'warn' ? 'text-amber-600' : 'text-red-600'}`}>
          <span>{deltaType === 'up' ? '↑' : deltaType === 'warn' ? '⚠' : '↓'}</span>
          <span>{delta}</span>
        </div>
      )}
    </div>
  );

// ---- Progress Bar ----
export const ProgressBar: React.FC<{ value: number; max?: number; color?: string }> = ({ value, max = 100, color = 'bg-blue-600' }) => (
  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
    <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min((value / max) * 100, 100)}%` }} />
  </div>
);

// ---- Trust Ring ----
export const TrustRing: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = ({ score, size = 'md' }) => {
  const color = score >= 90 ? 'border-green-500 text-green-600' : score >= 75 ? 'border-blue-500 text-blue-600' : 'border-amber-500 text-amber-600';
  const sizes = { sm: 'w-10 h-10 text-xs border-2', md: 'w-14 h-14 text-sm border-2', lg: 'w-18 h-18 text-base border-[3px]' };
  return (
    <div className={`${sizes[size]} ${color} rounded-full flex flex-col items-center justify-center shrink-0`}>
      <span className="font-semibold leading-none">{score}</span>
      <span className="text-gray-400 leading-none" style={{ fontSize: '9px' }}>trust</span>
    </div>
  );
};

// ---- Spinner ----
export const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => <Loader2 size={size} className="animate-spin text-blue-600" />;

// ---- Empty State ----
export const EmptyState: React.FC<{ icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-14 text-center">
    {icon && <div className="text-gray-300 mb-3">{icon}</div>}
    <div className="text-gray-700 font-medium mb-1">{title}</div>
    {description && <div className="text-sm text-gray-400 mb-4 max-w-xs">{description}</div>}
    {action}
  </div>
);

// ---- Modal ----
export const Modal: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' }> =
  ({ open, onClose, title, children, size = 'md' }) => {
    if (!open) return null;
    const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" onClick={onClose}>
        <div className={`bg-white rounded-2xl shadow-xl w-full ${widths[size]} animate-slide-up`} onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none">&times;</button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    );
  };

// ---- Skeleton ----
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded ${className}`} />
);

// ---- Availability Grid ----
export const AvailabilityGrid: React.FC<{ availability: Record<string, { available: boolean; startTime: string; endTime: string }> }> = ({ availability }) => {
  const days = [
    { key: 'monday', label: 'Mon' }, { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' }, { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' }, { key: 'saturday', label: 'Sat' }, { key: 'sunday', label: 'Sun' },
  ];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map(d => {
        const slot = availability[d.key];
        return (
          <div key={d.key} className={`text-center p-2 rounded-lg border ${slot?.available ? 'border-blue-200 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
            <div className="text-xs text-gray-500 mb-1">{d.label}</div>
            {slot?.available ? (
              <div className="text-xs font-medium text-blue-700">{slot.startTime}–{slot.endTime}</div>
            ) : (
              <div className="text-xs text-gray-400">Off</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---- Rating Stars ----
export const Stars: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`${size === 'sm' ? 'text-xs' : 'text-sm'} ${i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
    ))}
    <span className={`ml-1 text-gray-500 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{rating.toFixed(1)}</span>
  </div>
);

// ---- Tabs ----
export const Tabs: React.FC<{ tabs: { id: string; label: string; count?: number }[]; active: string; onChange: (id: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
    {tabs.map(t => (
      <button key={t.id} onClick={() => onChange(t.id)}
        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${active === t.id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
        {t.label}
        {t.count !== undefined && (
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === t.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>{t.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ---- Section Card ----
export const SectionCard: React.FC<{ title?: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }> =
  ({ title, subtitle, action, children, className = '' }) => (
    <div className={`bg-white border border-gray-100 rounded-xl ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            {title && <div className="font-semibold text-gray-900 text-sm">{title}</div>}
            {subtitle && <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
