function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#9aa0b0] mb-4">
      <span className="w-4 h-px bg-[#9aa0b0]" />
      {children}
    </div>
  );
}

function MetricRow({ label, rawLabel, score, last }) {
  return (
    <div className={`${last ? '' : 'pb-4 mb-4 border-b border-hairline/60'}`}>
      <div className="grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="min-w-0">
          <div className="text-sm font-medium text-[#d7dae2]">{label}</div>
          <div className="text-[11px] text-[#737b8b] mt-1 leading-snug break-words">{rawLabel}</div>
        </div>
        <div className="text-2xl font-display font-bold text-[#e7e9ee] leading-none tabular-nums">{score}</div>
      </div>
      <div className="h-1.5 bg-hairline rounded-full overflow-hidden mt-2.5">
        <div className="h-full bg-gold rounded-full" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function ScoutingMetrics({ card }) {
  return (
    <div className="bg-panel border border-hairline rounded-lg p-5">
      <SectionLabel>SCOUTING METRICS</SectionLabel>
      <div>
        {card.metrics.map((m, index) => (
          <MetricRow key={m.key} label={m.label} rawLabel={m.rawLabel} score={m.score} last={index === card.metrics.length - 1} />
        ))}
      </div>
    </div>
  );
}
