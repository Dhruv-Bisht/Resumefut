function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#9aa0b0] mb-5">
      <span className="w-4 h-px bg-[#9aa0b0]" />
      {children}
    </div>
  );
}

function MetricRow({ label, rawLabel, score }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-[#c7cbd6]">{label}</span>
        <span className="text-sm text-[#6b7180]">
          {rawLabel} <span className="text-[#e7e9ee] font-semibold ml-1">{score}</span>
        </span>
      </div>
      <div className="h-1.5 bg-hairline rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoutingMetrics({ card }) {
  return (
    <div className="bg-panel border border-hairline rounded-lg p-5">
      <SectionLabel>SCOUTING METRICS</SectionLabel>
      {card.metrics.map((m) => (
        <MetricRow key={m.key} label={m.label} rawLabel={m.rawLabel} score={m.score} />
      ))}
    </div>
  );
}
