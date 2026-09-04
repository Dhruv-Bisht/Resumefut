import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import AttributesPanel from '../components/AttributesPanel';
import ScoutingMetrics from '../components/ScoutingMetrics';
import PlayerCard from '../components/PlayerCard';
import ResumeUploader from '../components/ResumeUploader';
import { extractPdfText } from '../lib/extractPdfText';
import Footer from '../components/Footer';

const LOCAL_COUNT_KEY = 'resumefut_cards_rated';

const SAMPLE_CARDS = [
  { name: 'INOVATOR', overall: 96, position: 'ST', archetype: 'THE ICON', tier: 'goldtier', statList: [{ key: 'exp', label: 'EXP', value: 98 }, { key: 'skl', label: 'SKL', value: 96 }, { key: 'led', label: 'LED', value: 92 }, { key: 'imp', label: 'IMP', value: 97 }, { key: 'edu', label: 'EDU', value: 91 }, { key: 'ver', label: 'VER', value: 88 }], photo: '/assets/face-1.png', flag: '🇺🇸' },
  { name: 'ENGINEER', overall: 89, position: 'CAM', archetype: 'THE SPECIALIST', tier: 'goldtier', statList: [{ key: 'exp', label: 'EXP', value: 82 }, { key: 'skl', label: 'SKL', value: 94 }, { key: 'led', label: 'LED', value: 78 }, { key: 'imp', label: 'IMP', value: 91 }, { key: 'edu', label: 'EDU', value: 88 }, { key: 'ver', label: 'VER', value: 86 }], photo: '/assets/face-2.png', flag: '🇮🇳' },
  { name: 'BUILDER', overall: 84, position: 'CDM', archetype: 'THE CLOSER', tier: 'goldtier', statList: [{ key: 'exp', label: 'EXP', value: 76 }, { key: 'skl', label: 'SKL', value: 87 }, { key: 'led', label: 'LED', value: 83 }, { key: 'imp', label: 'IMP', value: 90 }, { key: 'edu', label: 'EDU', value: 79 }, { key: 'ver', label: 'VER', value: 81 }], photo: '/assets/face-3.png', flag: '🇬🇧' },
];

function readLocalCardCount() {
  if (typeof window === 'undefined') return 0;
  const value = Number.parseInt(window.localStorage.getItem(LOCAL_COUNT_KEY) || '0', 10);
  return Number.isFinite(value) ? value : 0;
}

function Modal({ title, children, onClose, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${wide ? 'max-w-3xl' : 'max-w-xl'} w-full max-h-[90vh] overflow-y-auto bg-[#11151e] border border-hairline rounded-2xl shadow-2xl`}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-[#11151e]/95 backdrop-blur border-b border-hairline">
          <h2 className="font-display font-bold tracking-wide text-lg">{title}</h2>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full border border-hairline text-[#9aa0b0] hover:text-white hover:border-gold/50 transition" aria-label="Close">×</button>
        </div>
        <div className="p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}

function HowItWorksModal({ onClose }) {
  const signals = [
    ['EXP', 'Experience', 'Years, roles, tenure and seniority language.'],
    ['SKL', 'Skills', 'Tools, technologies, problem-solving breadth and linked coding activity.'],
    ['LED', 'Leadership', 'Ownership, mentoring, management and public GitHub reach.'],
    ['IMP', 'Impact', 'Quantified achievements, results, repository stars and competitive coding signal.'],
    ['EDU', 'Education', 'Degrees, certifications and academic credentials.'],
    ['VER', 'Versatility', 'Different industries, roles and technical areas represented.'],
  ];

  return (
    <Modal title="THE SCOUT'S EYE" onClose={onClose} wide>
      <div className="space-y-8">
        <div>
          <p className="font-display font-bold text-2xl tracking-wide">WE DON'T JUST RATE YOU. <span className="text-gold">WE READ YOU.</span></p>
          <p className="mt-3 text-[#aeb4c1] leading-relaxed">Six signals are read from your resume and weighed against each other to find your shape. That shape becomes your card — so two people with similar numbers can still walk out with completely different players.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-panel border border-hairline rounded-xl p-5">
            <p className="text-xs tracking-[0.2em] text-gold">MEASURED AGAINST YOU</p>
            <h3 className="font-display font-bold text-xl mt-2">Your own curve, not the world's.</h3>
            <p className="text-sm text-[#8f96a5] mt-2 leading-relaxed">Each stat is weighed against the rest of your profile, so a high one marks where you stand out and a low one shows where you don't.</p>
          </div>
          <div className="bg-panel border border-hairline rounded-xl p-5">
            <p className="text-xs tracking-[0.2em] text-gold">EVERY CARD HAS A SHAPE</p>
            <h3 className="font-display font-bold text-xl mt-2">Nobody's elite at everything.</h3>
            <p className="text-sm text-[#8f96a5] mt-2 leading-relaxed">Your strongest signals push your archetype forward while your weaker areas pull it back. The card tells the story your stats create.</p>
          </div>
          <div className="bg-panel border border-hairline rounded-xl p-5">
            <p className="text-xs tracking-[0.2em] text-gold">THE 90s ARE EARNED</p>
            <h3 className="font-display font-bold text-xl mt-2">A strong profile needs a track record.</h3>
            <p className="text-sm text-[#8f96a5] mt-2 leading-relaxed">Legendary territory is reserved for profiles with enough depth across the signals. One flashy line does not decide the whole card.</p>
          </div>
          <div className="bg-panel border border-hairline rounded-xl p-5">
            <p className="text-xs tracking-[0.2em] text-gold">LINKED PROFILES</p>
            <h3 className="font-display font-bold text-xl mt-2">Your resume can point to the tape.</h3>
            <p className="text-sm text-[#8f96a5] mt-2 leading-relaxed">If your resume contains public GitHub or LeetCode links, those profiles become additional model features. Repository activity, stars, followers, account age, solved problems and public ranking can all influence the final card.</p>
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.2em] text-gold mb-3">WHAT FEEDS THE SIX</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {signals.map(([code, label, desc]) => <div key={code} className="bg-ink border border-hairline rounded-lg p-4"><div className="font-display font-bold text-gold">{code}</div><div className="font-semibold text-[#d7dae2] mt-1">{label}</div><div className="text-xs text-[#747b8a] mt-1 leading-relaxed">{desc}</div></div>)}
          </div>
        </div>
        <div className="border-t border-hairline pt-5">
          <p className="text-xs tracking-[0.2em] text-gold">THE LADDER</p>
          <p className="font-display font-bold text-xl mt-2">BRONZE → SILVER → GOLD → IN-FORM → TOTY → ICON</p>
          <p className="text-sm text-[#8f96a5] mt-2">Your tier, position and archetype are generated from the profile signals the scouting engine finds.</p>
        </div>
      </div>
    </Modal>
  );
}

function UploadModal({ onClose, onGenerate, loading, error, onResumeChange }) {
  return (
    <Modal title="BUILD YOUR CARD" onClose={onClose}>
      <p className="text-sm text-[#9aa0b0] mb-5">Upload a resume PDF or paste the text. If the resume contains public GitHub or LeetCode links, those profiles can add extra scouting signal.</p>
      <ResumeUploader onChange={onResumeChange} />
      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      <button type="button" onClick={onGenerate} disabled={loading} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3.5 rounded-lg disabled:opacity-50">{loading ? 'Scouting…' : 'Generate my card →'}</button>
    </Modal>
  );
}

export default function Home() {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [photo, setPhoto] = useState('');
  const [flag, setFlag] = useState('');
  const [cardsRated, setCardsRated] = useState(0);
  const [githubStars, setGithubStars] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [resumePageCount, setResumePageCount] = useState(null);
  const [derbyOpen, setDerbyOpen] = useState(false);
  const [derbyOpponent, setDerbyOpponent] = useState(null);
  const [derbyStatus, setDerbyStatus] = useState('idle');
  const [derbyError, setDerbyError] = useState('');
  const [derbyBattleStarted, setDerbyBattleStarted] = useState(false);

  const cardRef = useRef(null);
  const derbyResultRef = useRef(null);

  useEffect(() => {
    setCardsRated(readLocalCardCount());
    fetch('https://api.github.com/repos/Dhruv-Bisht/Resumefut', { headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data && typeof data.stargazers_count === 'number') setGithubStars(data.stargazers_count); })
      .catch(() => {});
  }, []);

  function recordCardRated() {
    const next = readLocalCardCount() + 1;
    if (typeof window !== 'undefined') window.localStorage.setItem(LOCAL_COUNT_KEY, String(next));
    setCardsRated(next);
  }

  async function scoreResume(text, pageCount = null) {
    const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, pageCount }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data.card;
  }

  async function handleGenerate() {
    if (!resumeText || resumeText.trim().length < 30) {
      setError('Add your resume first — upload a PDF or paste more text.');
      return;
    }
    setError('');
    setStatus('scoring');
    try {
      const nextCard = await scoreResume(resumeText, resumePageCount);
      setCard(nextCard);
      setDisplayName(nextCard.name);
      setUploadOpen(false);
      setStatus('done');
      recordCardRated();
    } catch (err) {
      setError(err.message || 'Something went wrong scoring that resume.');
      setStatus('error');
    }
  }

  async function handleDerbyDownload() {
    if (!derbyResultRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(derbyResultRef.current, { pixelRatio: 2, cacheBust: true, backgroundColor: '#0b0e14', filter: (node) => !node?.dataset?.captureControl });
    const link = document.createElement('a');
    const winner = battle?.overallWinner === 'b' ? derbyOpponent?.card?.name : displayName;
    link.download = `${(winner || 'resumefut').replace(/\s+/g, '-').toLowerCase()}-derby-result.png`;
    link.href = dataUrl;
    link.click();
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#0b0e14', filter: (node) => !node?.dataset?.cardControl });
    const link = document.createElement('a');
    link.download = `${displayName.replace(/\s+/g, '-').toLowerCase() || 'resumefut'}-card.png`;
    link.href = dataUrl;
    link.click();
  }

  function shareUrl(kind) {
    const text = `I just got scouted by ResumeFUT — ${displayName} rated ${card.overall} OVR as ${card.position}.`;
    if (kind === 'x') return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://resumefut.vercel.app')}`;
  }

  function reset() {
    setCard(null); setStatus('idle'); setError(''); setDisplayName(''); setPhoto(''); setFlag(''); setResumeText(''); setResumePageCount(null); setDerbyOpen(false); setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false);
  }

  async function runDerby() {
    if (!derbyOpponent?.text || derbyOpponent.text.trim().length < 30) { setDerbyError('Add the opponent resume first.'); return; }
    setDerbyError(''); setDerbyStatus('scoring');
    try {
      const opponent = await scoreResume(derbyOpponent.text, derbyOpponent.pageCount);
      opponent.photo = derbyOpponent.photo; opponent.flag = derbyOpponent.flag;
      setDerbyOpponent({ ...derbyOpponent, card: opponent }); setDerbyStatus('ready'); setDerbyBattleStarted(false); recordCardRated();
    } catch (err) { setDerbyError(err.message || 'Could not scout the opponent.'); setDerbyStatus('error'); }
  }

  function decideDerby(cardA, cardB) {
    let winsA = 0; let winsB = 0;
    const rows = cardA.statList.map((a, index) => { const b = cardB.statList[index]; const winner = a.value > b.value ? 'a' : b.value > a.value ? 'b' : null; if (winner === 'a') winsA += 1; if (winner === 'b') winsB += 1; return { ...a, b: b.value, winner }; });
    const overallWinner = winsA > winsB ? 'a' : winsB > winsA ? 'b' : cardA.overall > cardB.overall ? 'a' : cardB.overall > cardA.overall ? 'b' : null;
    return { rows, winsA, winsB, overallWinner };
  }

  const battle = derbyOpponent?.card ? decideDerby({ ...card, name: displayName, photo, flag }, derbyOpponent.card) : null;

  if (card) {
    return (
      <div className="min-h-screen text-[#e7e9ee] font-body">
        <Header onBack={reset} githubStars={githubStars} />
        <main className="max-w-6xl mx-auto px-5 md:px-8 py-3 md:py-4">
          {!derbyOpen && <div className="flex flex-col md:flex-row md:items-start gap-4 mb-2"><div className="w-16 h-16 rounded-xl bg-panel border border-hairline flex flex-col items-center justify-center shrink-0"><span className="font-display font-bold text-xl leading-none">{card.overall}</span><span className="text-[8px] tracking-[0.15em] text-[#9aa0b0] mt-1">{card.tier.toUpperCase()}</span></div><div className="flex-1 min-w-0">{editingName ? <input autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value.toUpperCase())} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} className="font-display font-bold text-2xl md:text-3xl tracking-wide bg-transparent border-b border-gold/60 focus:outline-none w-full" /> : <h1 className="font-display font-bold text-2xl md:text-3xl tracking-wide truncate cursor-text" title="Click to edit" onClick={() => setEditingName(true)}>{displayName}<span className="text-[#565c6b] text-sm align-middle ml-2 font-body font-normal">edit ✎</span></h1>}<div className="flex flex-wrap items-center gap-2 mt-2 text-sm"><span className="bg-gold text-[#20180a] font-semibold px-2 py-0.5 rounded">{card.position}</span><span className="text-[#c7cbd6]">{card.archetype}</span><span className="text-[#565c6b]">·</span><span className="text-[#9aa0b0]">{card.positionLabel}</span>{card.sources?.github && <span className="text-[#6fbf73]">GitHub linked</span>}{card.sources?.leetcode && <span className="text-[#6fbf73]">LeetCode linked</span>}</div><p className="mt-2 text-xs text-[#9aa0b0]"><span className="font-semibold tracking-wide text-[#c7cbd6]">{card.style}</span> — {card.tagline}</p></div></div>}

<<<<<<< HEAD
          {derbyOpen ? <section className="py-1"><div className="text-center max-w-xl mx-auto mb-6"><p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73] mb-2">Your card stays locked in</p><h1 className="font-display font-bold text-3xl tracking-wide">DERBY <span className="text-gold">MODE</span></h1><p className="mt-2 text-[#9aa0b0] text-sm">Keep your card on the pitch, scout an opponent, then customize their photo and nationality before the battle.</p></div>{!derbyOpponent?.card ? <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start max-w-4xl mx-auto"><div className="flex justify-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div><ResumeUploader title="Opponent resume" compact onChange={(payload) => { setDerbyOpponent((prev) => ({ ...(prev || {}), ...payload })); setDerbyError(''); }} />{derbyError && <p className="text-sm text-red-400 mt-3">{derbyError}</p>}<button type="button" onClick={runDerby} disabled={derbyStatus === 'scoring' || !derbyOpponent?.text} className="w-full mt-4 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50">{derbyStatus === 'scoring' ? 'Scouting opponent…' : 'Scout opponent →'}</button><button type="button" onClick={() => setDerbyOpen(false)} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Cancel</button></div></div> : !derbyBattleStarted ? <div className="max-w-5xl mx-auto"><div className="text-center mb-5"><p className="text-xs uppercase tracking-[0.18em] text-[#6fbf73]">Opponent scouted</p><h2 className="font-display font-bold text-2xl tracking-wide mt-1">CUSTOMIZE THE OPPONENT CARD</h2><p className="text-sm text-[#9aa0b0] mt-1">Add a small photo and nationality. Both will stay on the card during the derby.</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-6"><div><PlayerCard card={{ ...derbyOpponent.card, photo: derbyOpponent.card.photo || '', flag: derbyOpponent.card.flag || '' }} editable onPhotoChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, photo: value } }))} onFlagChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, flag: value } }))} /></div><div className="w-full max-w-sm bg-panel border border-hairline rounded-xl p-5"><div className="text-xs uppercase tracking-[0.16em] text-gold">Card identity</div><p className="text-sm text-[#c7cbd6] mt-2">Customize the opponent before the battle. These controls are also available directly on the card.</p><div className="grid grid-cols-2 gap-2 mt-4"><button type="button" onClick={() => document.querySelector('[data-derby-photo-input]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">📷 Add photo</button><button type="button" onClick={() => document.querySelector('[data-derby-nation-button]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">🌐 Nationality</button></div><button type="button" onClick={() => setDerbyBattleStarted(true)} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md">⚔️ Battle this card</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Choose another resume</button></div></div></div>  : <div ref={derbyResultRef} className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-hairline bg-[#0b0e14]"><div className="p-4 md:p-7"><div className="text-center mb-4"><h2 className="font-display font-bold text-2xl tracking-wide">{battle?.overallWinner === 'a' ? <><span className="text-gold">{displayName}</span> wins</> : battle?.overallWinner === 'b' ? <><span className="text-gold">{derbyOpponent.card.name}</span> wins</> : "IT'S A DRAW"}</h2><p className="text-sm text-[#9aa0b0] mt-1">{battle?.winsA} categories to {battle?.winsB}</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-0 mb-5"><div className={battle?.overallWinner === 'a' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div className="font-display font-bold text-2xl text-[#565c6b] px-2">VS</div><div className={battle?.overallWinner === 'b' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={derbyOpponent.card} /></div></div><div className="max-w-xl mx-auto bg-panel/90 border border-hairline rounded-lg p-5">{battle?.rows.map((row) => <div key={row.key} className="flex items-center justify-between py-2 border-b border-hairline/60 last:border-0"><span className={`w-12 text-lg font-display font-bold ${row.winner === 'a' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.value}</span><span className="text-xs text-[#9aa0b0] tracking-wide">{row.label}</span><span className={`w-12 text-lg font-display font-bold text-right ${row.winner === 'b' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.b}</span></div>)}<div className="flex items-center justify-between py-2 mt-1 border-t border-hairline"><span className="w-12 text-xl font-display font-bold">{card.overall}</span><span className="text-xs tracking-[0.15em] text-[#9aa0b0]">OVERALL</span><span className="w-12 text-xl font-display font-bold text-right">{derbyOpponent.card.overall}</span></div></div><div className="text-center mt-5"><button type="button" data-capture-control="true" onClick={handleDerbyDownload} className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">⭳ Download Derby Result</button><div className="mt-2"><button type="button" onClick={() => { setDerbyBattleStarted(false); }} className="border border-gold/50 text-gold font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Edit opponent identity</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="ml-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Battle another resume</button></div></div></div></div>}</section> : <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_270px] gap-4 items-start"><AttributesPanel card={card} /><div className="flex flex-col items-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={cardRef} editable onPhotoChange={setPhoto} onFlagChange={setFlag} /><div className="flex flex-wrap items-center justify-center gap-2 mt-2"><button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2 rounded-md">⭳ Download</button><button type="button" onClick={() => setDerbyOpen(true)} className="flex items-center gap-2 border border-gold/60 text-gold font-display font-semibold tracking-wide px-4 py-2 rounded-md">⚔️ Derby Mode</button><a href={shareUrl('x')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">𝕏</a><a href={shareUrl('linkedin')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">in</a></div></div><ScoutingMetrics card={card} /></div>}
=======
<<<<<<< HEAD
          {derbyOpen ? <section className="py-1"><div className="text-center max-w-xl mx-auto mb-6"><p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73] mb-2">Your card stays locked in</p><h1 className="font-display font-bold text-3xl tracking-wide">DERBY <span className="text-gold">MODE</span></h1><p className="mt-2 text-[#9aa0b0] text-sm">Keep your card on the pitch, scout an opponent, then customize their photo and nationality before the battle.</p></div>{!derbyOpponent?.card ? <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start max-w-4xl mx-auto"><div className="flex justify-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div><ResumeUploader title="Opponent resume" compact onChange={(payload) => { setDerbyOpponent((prev) => ({ ...(prev || {}), ...payload })); setDerbyError(''); }} />{derbyError && <p className="text-sm text-red-400 mt-3">{derbyError}</p>}<button type="button" onClick={runDerby} disabled={derbyStatus === 'scoring' || !derbyOpponent?.text} className="w-full mt-4 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50">{derbyStatus === 'scoring' ? 'Scouting opponent…' : 'Scout opponent →'}</button><button type="button" onClick={() => setDerbyOpen(false)} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Cancel</button></div></div> : !derbyBattleStarted ? <div className="max-w-5xl mx-auto"><div className="text-center mb-5"><p className="text-xs uppercase tracking-[0.18em] text-[#6fbf73]">Opponent scouted</p><h2 className="font-display font-bold text-2xl tracking-wide mt-1">CUSTOMIZE THE OPPONENT CARD</h2><p className="text-sm text-[#9aa0b0] mt-1">Add a small photo and nationality. Both will stay on the card during the derby.</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-6"><div><PlayerCard card={{ ...derbyOpponent.card, photo: derbyOpponent.card.photo || '', flag: derbyOpponent.card.flag || '' }} editable onPhotoChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, photo: value } }))} onFlagChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, flag: value } }))} /></div><div className="w-full max-w-sm bg-panel border border-hairline rounded-xl p-5"><div className="text-xs uppercase tracking-[0.16em] text-gold">Card identity</div><p className="text-sm text-[#c7cbd6] mt-2">Customize the opponent before the battle. These controls are also available directly on the card.</p><div className="grid grid-cols-2 gap-2 mt-4"><button type="button" onClick={() => document.querySelector('[data-derby-photo-input]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">📷 Add photo</button><button type="button" onClick={() => document.querySelector('[data-derby-nation-button]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">🌐 Nationality</button></div><button type="button" onClick={() => setDerbyBattleStarted(true)} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md">⚔️ Battle this card</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Choose another resume</button></div></div></div>  : <div ref={derbyResultRef} className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-hairline" style={{ background: 'transparent' }}><div className="p-4 md:p-7"><div className="text-center mb-4"><h2 className="font-display font-bold text-2xl tracking-wide">{battle?.overallWinner === 'a' ? <><span className="text-gold">{displayName}</span> wins</> : battle?.overallWinner === 'b' ? <><span className="text-gold">{derbyOpponent.card.name}</span> wins</> : "IT'S A DRAW"}</h2><p className="text-sm text-[#9aa0b0] mt-1">{battle?.winsA} categories to {battle?.winsB}</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-0 mb-5"><div className={battle?.overallWinner === 'a' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div className="font-display font-bold text-2xl text-[#565c6b] px-2">VS</div><div className={battle?.overallWinner === 'b' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={derbyOpponent.card} /></div></div><div className="max-w-xl mx-auto bg-panel/90 border border-hairline rounded-lg p-5">{battle?.rows.map((row) => <div key={row.key} className="flex items-center justify-between py-2 border-b border-hairline/60 last:border-0"><span className={`w-12 text-lg font-display font-bold ${row.winner === 'a' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.value}</span><span className="text-xs text-[#9aa0b0] tracking-wide">{row.label}</span><span className={`w-12 text-lg font-display font-bold text-right ${row.winner === 'b' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.b}</span></div>)}<div className="flex items-center justify-between py-2 mt-1 border-t border-hairline"><span className="w-12 text-xl font-display font-bold">{card.overall}</span><span className="text-xs tracking-[0.15em] text-[#9aa0b0]">OVERALL</span><span className="w-12 text-xl font-display font-bold text-right">{derbyOpponent.card.overall}</span></div></div><div className="text-center mt-5"><button type="button" data-capture-control="true" onClick={handleDerbyDownload} className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">⭳ Download Derby Result</button><div className="mt-2"><button type="button" onClick={() => { setDerbyBattleStarted(false); }} className="border border-gold/50 text-gold font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Edit opponent identity</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="ml-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Battle another resume</button></div></div></div></div>}</section> : <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_270px] gap-4 items-start"><AttributesPanel card={card} /><div className="flex flex-col items-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={cardRef} editable onPhotoChange={setPhoto} onFlagChange={setFlag} /><div className="flex flex-wrap items-center justify-center gap-2 mt-2"><button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2 rounded-md">⭳ Download</button><button type="button" onClick={() => setDerbyOpen(true)} className="flex items-center gap-2 border border-gold/60 text-gold font-display font-semibold tracking-wide px-4 py-2 rounded-md">⚔️ Derby Mode</button><a href={shareUrl('x')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">𝕏</a><a href={shareUrl('linkedin')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">in</a></div></div><ScoutingMetrics card={card} /></div>}
=======
          {derbyOpen ? <section className="py-1"><div className="text-center max-w-xl mx-auto mb-6"><p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73] mb-2">Your card stays locked in</p><h1 className="font-display font-bold text-3xl tracking-wide">DERBY <span className="text-gold">MODE</span></h1><p className="mt-2 text-[#9aa0b0] text-sm">Keep your card on the pitch, scout an opponent, then customize their photo and nationality before the battle.</p></div>{!derbyOpponent?.card ? <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start max-w-4xl mx-auto"><div className="flex justify-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div><ResumeUploader title="Opponent resume" compact onChange={(payload) => { setDerbyOpponent((prev) => ({ ...(prev || {}), ...payload })); setDerbyError(''); }} />{derbyError && <p className="text-sm text-red-400 mt-3">{derbyError}</p>}<button type="button" onClick={runDerby} disabled={derbyStatus === 'scoring' || !derbyOpponent?.text} className="w-full mt-4 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50">{derbyStatus === 'scoring' ? 'Scouting opponent…' : 'Scout opponent →'}</button><button type="button" onClick={() => setDerbyOpen(false)} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Cancel</button></div></div> : !derbyBattleStarted ? <div className="max-w-5xl mx-auto"><div className="text-center mb-5"><p className="text-xs uppercase tracking-[0.18em] text-[#6fbf73]">Opponent scouted</p><h2 className="font-display font-bold text-2xl tracking-wide mt-1">CUSTOMIZE THE OPPONENT CARD</h2><p className="text-sm text-[#9aa0b0] mt-1">Add a small photo and nationality. Both will stay on the card during the derby.</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-6"><div><PlayerCard card={{ ...derbyOpponent.card, photo: derbyOpponent.card.photo || '', flag: derbyOpponent.card.flag || '' }} editable onPhotoChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, photo: value } }))} onFlagChange={(value) => setDerbyOpponent((prev) => ({ ...prev, card: { ...prev.card, flag: value } }))} /></div><div className="w-full max-w-sm bg-panel border border-hairline rounded-xl p-5"><div className="text-xs uppercase tracking-[0.16em] text-gold">Card identity</div><p className="text-sm text-[#c7cbd6] mt-2">Customize the opponent before the battle. These controls are also available directly on the card.</p><div className="grid grid-cols-2 gap-2 mt-4"><button type="button" onClick={() => document.querySelector('[data-derby-photo-input]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">📷 Add photo</button><button type="button" onClick={() => document.querySelector('[data-derby-nation-button]')?.click()} className="border border-hairline rounded-md px-3 py-2 text-sm text-[#c7cbd6] hover:border-gold/60">🌐 Nationality</button></div><button type="button" onClick={() => setDerbyBattleStarted(true)} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md">⚔️ Battle this card</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="w-full mt-2 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Choose another resume</button></div></div></div>  : <div ref={derbyResultRef} className="max-w-5xl mx-auto rounded-2xl overflow-hidden border border-hairline" style={{ backgroundImage: "linear-gradient(180deg, rgba(11,14,20,0.72), rgba(11,14,20,0.88)), url('/football-background.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="p-4 md:p-7"><div className="text-center mb-4"><h2 className="font-display font-bold text-2xl tracking-wide">{battle?.overallWinner === 'a' ? <><span className="text-gold">{displayName}</span> wins</> : battle?.overallWinner === 'b' ? <><span className="text-gold">{derbyOpponent.card.name}</span> wins</> : "IT'S A DRAW"}</h2><p className="text-sm text-[#9aa0b0] mt-1">{battle?.winsA} categories to {battle?.winsB}</p></div><div className="flex flex-col lg:flex-row items-center justify-center gap-0 mb-5"><div className={battle?.overallWinner === 'a' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={{ ...card, name: displayName, photo, flag }} /></div><div className="font-display font-bold text-2xl text-[#565c6b] px-2">VS</div><div className={battle?.overallWinner === 'b' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={derbyOpponent.card} /></div></div><div className="max-w-xl mx-auto bg-panel/90 border border-hairline rounded-lg p-5">{battle?.rows.map((row) => <div key={row.key} className="flex items-center justify-between py-2 border-b border-hairline/60 last:border-0"><span className={`w-12 text-lg font-display font-bold ${row.winner === 'a' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.value}</span><span className="text-xs text-[#9aa0b0] tracking-wide">{row.label}</span><span className={`w-12 text-lg font-display font-bold text-right ${row.winner === 'b' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.b}</span></div>)}<div className="flex items-center justify-between py-2 mt-1 border-t border-hairline"><span className="w-12 text-xl font-display font-bold">{card.overall}</span><span className="text-xs tracking-[0.15em] text-[#9aa0b0]">OVERALL</span><span className="w-12 text-xl font-display font-bold text-right">{derbyOpponent.card.overall}</span></div></div><div className="text-center mt-5"><button type="button" data-capture-control="true" onClick={handleDerbyDownload} className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">⭳ Download Derby Result</button><div className="mt-2"><button type="button" onClick={() => { setDerbyBattleStarted(false); }} className="border border-gold/50 text-gold font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Edit opponent identity</button><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); setDerbyBattleStarted(false); }} className="ml-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2.5 rounded-md">Battle another resume</button></div></div></div></div>}</section> : <div className="grid grid-cols-1 lg:grid-cols-[230px_1fr_270px] gap-4 items-start"><AttributesPanel card={card} /><div className="flex flex-col items-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={cardRef} editable onPhotoChange={setPhoto} onFlagChange={setFlag} /><div className="flex flex-wrap items-center justify-center gap-2 mt-2"><button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-5 py-2 rounded-md">⭳ Download</button><button type="button" onClick={() => setDerbyOpen(true)} className="flex items-center gap-2 border border-gold/60 text-gold font-display font-semibold tracking-wide px-4 py-2 rounded-md">⚔️ Derby Mode</button><a href={shareUrl('x')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">𝕏</a><a href={shareUrl('linkedin')} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6]">in</a></div></div><ScoutingMetrics card={card} /></div>}
>>>>>>> 8848d4d1c01421ae3c0cc40bb5c4b700fdda5970
>>>>>>> f80ce7196b19acaba2852c543cb0c195439b5831
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e7e9ee] font-body relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 pitch-glow" />
      <div className="relative">
        <Header githubStars={githubStars} />
        <main className="max-w-6xl mx-auto px-5 md:px-8 pt-4 md:pt-6 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-[0.88fr_1.12fr] gap-4 lg:gap-0 items-center min-h-[500px] lg:min-h-[525px]">
            <section className="max-w-xl z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-4 py-2 text-xs tracking-[0.18em] uppercase text-[#c7cbd6]"><span className="text-gold">RESUME</span> × <span className="text-[#6fbf73]">WORLD CUP</span></div>
              <h1 className="mt-5 font-display font-bold text-6xl md:text-8xl leading-[0.86] tracking-wide">GET<br />SCOUTED<span className="text-gold">.</span></h1>
              <p className="mt-5 text-lg md:text-xl text-[#d5d8e0] leading-relaxed max-w-lg">Your resume, turned into a World-Cup-style player card rated out of 99.</p>
              <button type="button" onClick={() => { setError(''); setUploadOpen(true); }} className="mt-6 w-full max-w-xl bg-panel border border-hairline rounded-2xl p-2 flex items-center gap-2 shadow-2xl shadow-black/20 text-left hover:border-gold/40 transition group"><span className="flex-1 px-4 text-sm md:text-base text-[#9aa0b0] font-mono"><span className="text-[#596173]">▣</span> resume.pdf or paste text</span><span className="bg-signal text-white font-display font-semibold tracking-wide px-7 py-3.5 rounded-xl group-hover:brightness-110 transition">SCOUT →</span></button>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#7f8595]"><span className="text-[#6fbf73]">●</span><span className="font-display text-lg text-[#e7e9ee]">{cardsRated.toLocaleString()}</span><span>cards rated</span></div>
            </section>

            <section className="relative h-[470px] hidden lg:block" aria-label="Sample ResumeFUT cards">
              <div className="absolute inset-0 flex items-center justify-center -translate-y-5">
                <div className="absolute w-[430px] h-[330px] rounded-full bg-gold/10 blur-3xl" />
                {SAMPLE_CARDS.map((sample, index) => <div key={sample.name} className={`absolute transition-transform duration-500 hover:z-30 hover:scale-105 ${index === 0 ? 'z-20 rotate-[-8deg] translate-x-[-150px]' : index === 1 ? 'z-10 translate-x-0 translate-y-[-18px]' : 'z-0 rotate-[8deg] translate-x-[150px]'}`}><PlayerCard card={sample} /></div>)}
              </div>
            </section>
          </div>
        </main>
        <Footer />
      </div>

      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} onGenerate={handleGenerate} loading={status === 'scoring'} error={error} onResumeChange={(payload) => { setResumeText(payload?.text || ''); setResumePageCount(payload?.pageCount ?? null); setError(''); }} />}
    </div>
  );
}
