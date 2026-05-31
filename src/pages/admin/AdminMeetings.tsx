import React, { useState } from 'react';
import { Calendar, Video, Check, X, Clock } from 'lucide-react';
import { SectionCard, StatusBadge, Avatar, Modal } from '../../components/common';

const meetings = [
  { id: 'm1', client: 'ABC Corp', freelancer: 'Rahul S.', type: 'Demo session', date: '2025-06-15', time: '7:00 PM IST', platform: 'Zoom', rate: '$32/hr', status: 'upcoming', link: 'https://zoom.us/j/123456' },
  { id: 'm2', client: 'XYZ Ltd', freelancer: 'Priya K.', type: 'Interview', date: '2025-06-16', time: '8:00 PM IST', platform: 'Google Meet', rate: '₹2,500/hr', status: 'upcoming', link: 'https://meet.google.com/abc-def' },
  { id: 'm3', client: 'TechSol', freelancer: 'Arjun M.', type: 'Quick support', date: '2025-06-10', time: '9:00 PM IST', platform: 'Zoom', rate: '$28/hr', status: 'completed', link: '' },
];

const AdminMeetings: React.FC = () => {
  const [outcome, setOutcome] = useState<{id:string;val:string}|null>(null);
  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Meetings</h1><p className="text-sm text-gray-500 mt-0.5">All scheduled and completed sessions</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-2">
        {[['Upcoming','2','bg-blue-50 text-blue-700'],['Completed','1','bg-green-50 text-green-700'],['No-show / Cancelled','0','bg-red-50 text-red-600']].map(([l,v,c])=>(
          <div key={l} className={`rounded-xl px-5 py-4 border ${c} border-opacity-60`}><div className="text-2xl font-bold">{v}</div><div className="text-sm">{l}</div></div>
        ))}
      </div>
      <div className="space-y-4">
        {meetings.map(m => (
          <SectionCard key={m.id} title={`${m.client} ↔ ${m.freelancer}`} subtitle={`${m.type} · ${m.rate}`} action={<StatusBadge status={m.status}/>}>
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2 text-gray-600 text-sm"><Calendar size={15}/>{m.date}</div>
              <div className="flex items-center gap-2 text-gray-600 text-sm"><Clock size={15}/>{m.time}</div>
              <div className="flex items-center gap-2 text-gray-600 text-sm"><Video size={15}/>{m.platform}</div>
            </div>
            {m.status === 'upcoming' && (
              <div className="flex gap-2">
                <a href={m.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800"><Video size={14}/>Join meeting</a>
                <button onClick={()=>setOutcome({id:m.id,val:'approved'})} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700"><Check size={14}/>Mark completed</button>
                <button onClick={()=>setOutcome({id:m.id,val:'rejected'})} className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-50"><X size={14}/>Cancel</button>
              </div>
            )}
            {m.status === 'completed' && (
              <div className="flex gap-2">
                <button className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800">Approve project start</button>
                <button className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50">View notes</button>
              </div>
            )}
          </SectionCard>
        ))}
      </div>
      <Modal open={!!outcome} onClose={()=>setOutcome(null)} title="Meeting outcome" size="sm">
        <div className="space-y-3">
          <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Outcome</label>
            <select defaultValue={outcome?.val} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none">
              <option value="approved">Client approved — start project</option>
              <option value="rejected">Client not interested</option>
              <option value="pending_decision">Pending client decision</option>
            </select>
          </div>
          <div><label className="text-xs font-medium text-gray-500 block mb-1.5">Notes (optional)</label><textarea rows={2} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none resize-none"/></div>
          <button onClick={()=>{setOutcome(null);alert('Outcome saved. Notifications sent to client and freelancer.');}} className="w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800">Save outcome</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminMeetings;
