const TIER_LABELS = {
  bronze: 'BRONZE',
  silver: 'SILVER',
  goldtier: 'GOLD',
  ultimate: 'ULTIMATE',
};

const TIER_TEXT_CLASS = {
  bronze: 'text-[#3a2410]',
  silver: 'text-[#20242c]',
  goldtier: 'text-[#3a2a05]',
  ultimate: 'text-[#f2edff]',
};

function initialsFrom(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerCard({ card, cardRef }) {
  const { name, overall, position, archetype, tier, statList, photo, flag } = card;
  const textClass = TIER_TEXT_CLASS[tier] || TIER_TEXT_CLASS.silver;

  return (
    <div ref={cardRef} className="inline-block px-6 py-8" style={{ background: 'transparent' }}>
      <div
        className={`card-shield card-tier-${tier} w-[300px] h-[420px] relative flex flex-col items-center pt-8 px-6`}
      >
        {/* rating + position + nationality */}
        <div className={`absolute left-6 top-7 text-left ${textClass}`}>
          <div className="font-display font-bold text-5xl leading-none text-shadow-soft">
            {overall}
          </div>
          <div className="font-display font-semibold text-lg tracking-wide mt-1 border-t border-current/40 pt-1 w-12">
            {position}
          </div>
          {flag && (
            <div className="text-xl mt-1.5 leading-none" title="Nationality">
              {flag}
            </div>
          )}
        </div>

        {/* tier badge */}
        <div className={`absolute right-6 top-7 text-right ${textClass}`}>
          <div className="font-body text-[10px] font-semibold tracking-[0.2em] opacity-80">
            {TIER_LABELS[tier]}
          </div>
        </div>

        {/* photo / monogram */}
        <div className="mt-6 mb-2 w-32 h-32 rounded-full bg-black/15 flex items-center justify-center overflow-hidden">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className={`font-display font-bold text-4xl ${textClass}`}>
              {initialsFrom(name)}
            </span>
          )}
        </div>

        {/* name */}
        <div className={`w-full text-center mt-2 ${textClass}`}>
          <div className="font-display font-bold text-xl tracking-wide truncate px-2 text-shadow-soft">
            {name}
          </div>
          <div className="h-px bg-current/30 mx-8 mt-2 mb-3" />
        </div>

        {/* stats */}
        <div className={`grid grid-cols-2 gap-x-6 gap-y-1.5 ${textClass}`}>
          {statList.map((s) => (
            <div key={s.key} className="flex items-baseline gap-2">
              <span className="font-display font-bold text-lg w-7 text-right">{s.value}</span>
              <span className="font-body text-xs tracking-wide opacity-80">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-4">
        <div className="font-display font-semibold text-lg tracking-wide text-gold">
          {archetype}
        </div>
      </div>
    </div>
  );
}
