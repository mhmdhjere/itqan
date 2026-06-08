export function MasteryRing({
  percent,
  trend,
  size = 120,
}: {
  percent: number;
  trend: number;
  size?: number;
}) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const trendLabel =
    trend > 0 ? `+${trend}%` : trend < 0 ? `${trend}%` : "—";
  const trendColor =
    trend > 0
      ? "text-emerald-600"
      : trend < 0
        ? "text-red-600"
        : "text-muted";

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-stone-100"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-accent transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-accent">{percent}%</span>
          <span className="text-xs text-muted">mastery</span>
        </div>
      </div>
      <p className={`mt-2 text-sm font-medium ${trendColor}`}>
        {trend !== 0 ? `${trendLabel} trend` : "No trend yet"}
      </p>
    </div>
  );
}
