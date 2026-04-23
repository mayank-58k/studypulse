export default function ProgressRing({ value = 0, target = 1, size = 110, strokeWidth = 10, color = '#00ff88' }) {
  const percent = Math.min(100, Math.round(((value || 0) / (target || 1)) * 100));
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={center} cy={center} r={radius} stroke="#252840" strokeWidth={strokeWidth} fill="none" />
      <circle
        cx={center} cy={center} r={radius}
        stroke={color} strokeWidth={strokeWidth} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
      <text x={center} y={center + 5} textAnchor="middle" fontSize="16" fill="white" fontFamily="JetBrains Mono">{percent}%</text>
    </svg>
  );
}
