import { Trophy, Zap, Calendar, Clock } from 'lucide-react';

function RecordCard({ icon: Icon, label, value, sub, color = 'text-neon-primary' }) {
  return (
    <div className="card p-4 flex flex-col gap-2 hover:-translate-y-1 transition-transform duration-300">
      <div className={`${color}`}><Icon size={20} /></div>
      <p className="text-xs text-white/50 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-white/40">{sub}</p>}
    </div>
  );
}

export default function LeaderboardSection({ records }) {
  if (!records) return null;
  return (
    <div className="card p-4">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Trophy size={18} className="text-neon-primary" /> Personal Records</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <RecordCard icon={Zap} label="Longest Session" value={`${records.longestSession}h`} sub={records.longestSessionDate ? new Date(records.longestSessionDate).toLocaleDateString() : ''} color="text-neon-primary" />
        <RecordCard icon={Clock} label="Most Hours in a Day" value={`${records.bestDay}h`} sub={records.bestDayDate ? new Date(records.bestDayDate).toLocaleDateString() : ''} color="text-neon-secondary" />
        <RecordCard icon={Calendar} label="Best Week" value={`${records.bestWeek}h`} sub={records.bestWeekRange || ''} color="text-yellow-400" />
        <RecordCard icon={Trophy} label="All-Time Total" value={`${records.allTimeTotal}h`} color="text-neon-warning" />
      </div>
    </div>
  );
}
