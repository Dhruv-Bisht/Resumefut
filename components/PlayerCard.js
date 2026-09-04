import { useEffect, useRef, useState } from 'react';
import { COUNTRIES } from '../lib/countries';

const TIER_LABELS = { bronze: 'BRONZE', silver: 'SILVER', goldtier: 'GOLD', ultimate: 'ULTIMATE' };
const TIER_TEXT_CLASS = { bronze: 'text-[#3a2410]', silver: 'text-[#20242c]', goldtier: 'text-[#3a2a05]', ultimate: 'text-[#f2edff]' };

function initialsFrom(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function PlayerCard({ card, cardRef, editable = false, onPhotoChange, onFlagChange }) {
  const { name, overall, position, archetype, tier, statList, photo, flag } = card;
  const textClass = TIER_TEXT_CLASS[tier] || TIER_TEXT_CLASS.silver;
  const photoInputRef = useRef(null);
  const nationButtonRef = useRef(null);
  const [nationOpen, setNationOpen] = useState(false);
  const [nationSearch, setNationSearch] = useState('');
  const [menuStyle, setMenuStyle] = useState({});

  useEffect(() => {
    if (!nationOpen) return undefined;
    const update = () => {
      const rect = nationButtonRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuStyle({ left: `${Math.max(8, rect.left - 6)}px`, top: `${rect.bottom + 8}px` });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [nationOpen]);

  const filteredCountries = COUNTRIES.filter((country) => `${country.name} ${country.code}`.toLowerCase().includes(nationSearch.trim().toLowerCase()));

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPhotoChange?.(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function chooseNation(country) {
    onFlagChange?.(country.flag);
    setNationSearch('');
    setNationOpen(false);
  }

  return (
    <div ref={cardRef} className="inline-block px-4 py-5" style={{ background: 'transparent' }}>
      <div className={`card-shield card-tier-${tier} w-[260px] h-[365px] md:w-[270px] md:h-[380px] relative flex flex-col items-center pt-7 px-5`}>
        <div className={`absolute left-5 top-6 text-left ${textClass}`}>
          <div className="font-display font-bold text-4xl leading-none text-shadow-soft">{overall}</div>
          <div className="font-display font-semibold text-base tracking-wide mt-1 border-t border-current/40 pt-1 w-10">{position}</div>
        </div>

        <div className={`absolute right-5 top-6 text-right ${textClass}`}>
          <div className="font-body text-[9px] font-semibold tracking-[0.2em] opacity-80">{TIER_LABELS[tier]}</div>
        </div>

        <div className="mt-5 mb-1 w-[112px] h-[112px] rounded-full bg-black/15 flex items-center justify-center overflow-visible relative border border-black/10">
          <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
            {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <span className={`font-display font-bold text-3xl ${textClass}`}>{initialsFrom(name)}</span>}
          </div>

          {editable && (
            <>
              <button type="button" data-card-control="true" onClick={() => photoInputRef.current?.click()} className="absolute -right-2 bottom-0 w-7 h-7 rounded-full bg-[#0b0e14] border border-white/30 shadow-lg flex items-center justify-center text-xs hover:scale-105 transition" title="Add or change photo" aria-label="Add or change photo">📷</button>
              <input ref={photoInputRef} data-card-control="true" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />

              <button ref={nationButtonRef} type="button" data-card-control="true" onClick={() => setNationOpen((open) => !open)} className="absolute -left-2 bottom-[-2px] w-7 h-7 rounded-full bg-[#0b0e14] border border-white/30 shadow-lg flex items-center justify-center text-sm hover:scale-105 transition" title="Choose nationality" aria-label="Choose nationality">
                {flag || '🌐'}
              </button>
            </>
          )}
        </div>

        {flag && <div className={`absolute left-5 top-[112px] text-base leading-none ${textClass}`} title="Nationality">{flag}</div>}

        <div className={`w-full text-center mt-2 ${textClass}`}>
          <div className="font-display font-bold text-lg tracking-wide truncate px-2 text-shadow-soft">{name}</div>
          <div className="h-px bg-current/30 mx-7 mt-1.5 mb-2.5" />
        </div>

        <div className={`grid grid-cols-2 gap-x-5 gap-y-1 ${textClass}`}>
          {statList.map((s) => <div key={s.key} className="flex items-baseline gap-1.5"><span className="font-display font-bold text-base w-7 text-right">{s.value}</span><span className="font-body text-[10px] tracking-wide opacity-80">{s.label}</span></div>)}
        </div>
      </div>

      <div className="text-center mt-2"><div className="font-display font-semibold text-base tracking-wide text-gold">{archetype}</div></div>

      {editable && nationOpen && (
        <div data-card-control="true" className="fixed z-[100] w-[280px] rounded-xl bg-[#151a24] text-[#e7e9ee] border border-[#3a4150] shadow-2xl shadow-black/50 p-2" style={menuStyle}>
          <input autoFocus value={nationSearch} onChange={(e) => setNationSearch(e.target.value)} placeholder="Search nationality..." className="w-full h-9 rounded-md bg-[#0b0e14] text-[#e7e9ee] placeholder:text-[#697181] border border-[#3a4150] px-3 text-sm outline-none focus:ring-2 focus:ring-[#e3bd4a]" />
          <div className="mt-2 max-h-64 overflow-y-auto pr-1">
            {filteredCountries.map((country) => (
              <button key={country.code || 'none'} type="button" onClick={() => chooseNation(country)} className="w-full flex items-center gap-3 rounded-md px-2.5 py-2 text-left hover:bg-[#232936] transition">
                <span className="text-lg w-7 shrink-0">{country.flag || '—'}</span><span className="text-sm">{country.name}</span>
              </button>
            ))}
            {!filteredCountries.length && <div className="px-2.5 py-4 text-sm text-[#8f96a5]">No nationality found.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
