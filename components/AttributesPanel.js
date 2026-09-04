import Tooltip from './Tooltip';

function Stars({ count, total = 5 }) {
  return (
    <div className="flex gap-1" aria-label={`${count} out of ${total} stars`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={i < count ? 'text-gold' : 'text-[#3a3f4d]'}>
          ★
        </span>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] text-[#9aa0b0] mb-4">
      <span className="w-4 h-px bg-[#9aa0b0]" />
      {children}
    </div>
  );
}

const ATTRIBUTE_HELP = {
  skillMoves: 'How deep the resume goes on named skills and tools — more distinct, current skills means more stars.',
  weakFoot: "Versatility — how comfortable this person looks operating outside their core lane, across industries.",
  workRate: "Leadership / Impact, side by side — how much of the resume reads as managing others vs. driving measurable results.",
  style: 'A one-word summary of the strongest stat category on the card.',
};

export default function AttributesPanel({ card }) {
  const { attributes, playstyles, style } = card;

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-panel border border-hairline rounded-lg p-5">
        <SectionLabel>ATTRIBUTES</SectionLabel>

        <div className="flex items-center justify-between py-2.5 border-b border-hairline/70">
          <Tooltip text={ATTRIBUTE_HELP.skillMoves}>
            <span className="text-sm text-[#c7cbd6]">Skill moves</span>
          </Tooltip>
          <Stars count={attributes.skillMoves} />
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-hairline/70">
          <Tooltip text={ATTRIBUTE_HELP.weakFoot}>
            <span className="text-sm text-[#c7cbd6]">Weak foot</span>
          </Tooltip>
          <Stars count={attributes.weakFoot} />
        </div>
        <div className="flex items-center justify-between py-2.5 border-b border-hairline/70">
          <Tooltip text={ATTRIBUTE_HELP.workRate}>
            <span className="text-sm text-[#c7cbd6]">Work rate</span>
          </Tooltip>
          <span className="text-sm font-semibold tracking-wide">{attributes.workRate}</span>
        </div>
        <div className="flex items-center justify-between py-2.5">
          <Tooltip text={ATTRIBUTE_HELP.style}>
            <span className="text-sm text-[#c7cbd6]">Style</span>
          </Tooltip>
          <span className="text-sm font-semibold tracking-wide">{style}</span>
        </div>
      </div>

      {playstyles.length > 0 && (
        <div className="bg-panel border border-hairline rounded-lg p-5">
          <SectionLabel>PLAYSTYLES</SectionLabel>
          <div className="flex flex-col gap-3">
            {playstyles.map((p) => (
              <div key={p.name} className="flex items-center gap-2.5 text-sm">
                <span className="text-gold" aria-hidden="true">★</span>
                {p.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
