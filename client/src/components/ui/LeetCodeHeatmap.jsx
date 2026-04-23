import { useState } from 'react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getColor(count) {
  if (!count) return '#252840';
  if (count <= 2) return '#00ff8833';
  if (count <= 4) return '#00ff8866';
  return '#00ff88';
}

export default function LeetCodeHeatmap({ data = {} }) {
  const [tooltip, setTooltip] = useState(null);

  // Build 365-day array starting from 52 weeks ago (start on Sunday)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Adjust to previous Sunday
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks = [];
  let current = new Date(startDate);
  while (current <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10);
      const isFuture = current > today;
      week.push({ date: dateStr, count: isFuture ? null : (data[dateStr] || 0), isFuture });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels
  const monthLabels = [];
  weeks.forEach((week, wIdx) => {
    const firstOfMonth = week.find(d => d.date.slice(8, 10) === '01');
    if (firstOfMonth) {
      const monthName = new Date(firstOfMonth.date).toLocaleDateString('en-US', { month: 'short' });
      monthLabels.push({ wIdx, label: monthName });
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex gap-1 relative">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 pt-5">
          {DAY_LABELS.map(d => (
            <div key={d} className="h-3 text-[9px] text-white/30 w-6 flex items-center">{d}</div>
          ))}
        </div>
        <div>
          {/* Month labels */}
          <div className="flex gap-1 mb-1 h-4">
            {weeks.map((_, wIdx) => {
              const ml = monthLabels.find(m => m.wIdx === wIdx);
              return <div key={wIdx} className="w-3 text-[9px] text-white/40">{ml ? ml.label : ''}</div>;
            })}
          </div>
          {/* Grid */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day) => (
                  <div
                    key={day.date}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-opacity hover:opacity-80 relative"
                    style={{ backgroundColor: day.isFuture ? 'transparent' : getColor(day.count) }}
                    onMouseEnter={() => !day.isFuture && setTooltip(day)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {tooltip && (
        <div className="mt-2 text-xs text-white/70 bg-navy-700 rounded-lg px-3 py-2 inline-block">
          {tooltip.date} — {tooltip.count} session{tooltip.count !== 1 ? 's' : ''}
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs text-white/50">
        <span>Less</span>
        {[0, 1, 3, 5].map(c => (
          <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(c) }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
