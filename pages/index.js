import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import AttributesPanel from '../components/AttributesPanel';
import ScoutingMetrics from '../components/ScoutingMetrics';
import PlayerCard from '../components/PlayerCard';
import ResumeUploader from '../components/ResumeUploader';
import { extractPdfText } from '../lib/extractPdfText';

const LOCAL_COUNT_KEY = 'resumefut_cards_rated';

const SAMPLE_CARDS = [
  {
    name: 'TORVALDS', overall: 96, position: 'ST', archetype: 'THE ICON', tier: 'goldtier',
    statList: [{ key: 'exp', label: 'EXP', value: 98 }, { key: 'skl', label: 'SKL', value: 96 }, { key: 'led', label: 'LED', value: 92 }, { key: 'imp', label: 'IMP', value: 97 }, { key: 'edu', label: 'EDU', value: 91 }, { key: 'ver', label: 'VER', value: 88 }], photo: '', flag: '🇺🇸',
  },
  {
    name: 'ENGINEER', overall: 89, position: 'CAM', archetype: 'THE SPECIALIST', tier: 'goldtier',
    statList: [{ key: 'exp', label: 'EXP', value: 82 }, { key: 'skl', label: 'SKL', value: 94 }, { key: 'led', label: 'LED', value: 78 }, { key: 'imp', label: 'IMP', value: 91 }, { key: 'edu', label: 'EDU', value: 88 }, { key: 'ver', label: 'VER', value: 86 }], photo: '', flag: '🇮🇳',
  },
  {
    name: 'BUILDER', overall: 84, position: 'CDM', archetype: 'THE CLOSER', tier: 'goldtier',
    statList: [{ key: 'exp', label: 'EXP', value: 76 }, { key: 'skl', label: 'SKL', value: 87 }, { key: 'led', label: 'LED', value: 83 }, { key: 'imp', label: 'IMP', value: 90 }, { key: 'edu', label: 'EDU', value: 79 }, { key: 'ver', label: 'VER', value: 81 }], photo: '', flag: '🇬🇧',
  },
];

function readLocalCardCount() {
  if (typeof window === 'undefined') return 0;
  const value = Number.parseInt(window.localStorage.getItem(LOCAL_COUNT_KEY) || '0', 10);
  return Number.isFinite(value) ? value : 0;
}

export default function Home() {
  const [mode, setMode] = useState('pdf');
  const [pastedText, setPastedText] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [photo, setPhoto] = useState('');
  const [flag, setFlag] = useState('');
  const [cardsRated, setCardsRated] = useState(0);
  const [githubStars, setGithubStars] = useState(null);
  const [derbyOpen, setDerbyOpen] = useState(false);
  const [derbyOpponent, setDerbyOpponent] = useState(null);
  const [derbyStatus, setDerbyStatus] = useState('idle');
  const [derbyError, setDerbyError] = useState('');

  const extractedTextRef = useRef('');
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCardsRated(readLocalCardCount());
    fetch(`https://api.github.com/repos/Dhruv-Bisht/Resumefut`, {
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.stargazers_count === 'number') setGithubStars(data.stargazers_count);
      })
      .catch(() => {});
  }, []);

  function recordCardRated() {
    const next = readLocalCardCount() + 1;
    if (typeof window !== 'undefined') window.localStorage.setItem(LOCAL_COUNT_KEY, String(next));
    setCardsRated(next);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);
    setError('');
    setStatus('reading');
    try {
      extractedTextRef.current = await extractPdfText(file);
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setError("Couldn't read that PDF. Try a different file or paste your resume text instead.");
      setStatus('error');
    }
  }

  async function scoreResume(text) {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Something went wrong.');
    return data.card;
  }

  async function handleGenerate() {
    const text = mode === 'pdf' ? extractedTextRef.current : pastedText;
    if (!text || text.trim().length < 30) {
      setError(mode === 'pdf' ? 'Upload a resume PDF first.' : 'Paste more of your resume — a few bullet points isn\'t enough to scout.');
      return;
    }
    setError('');
    setStatus('scoring');
    try {
      const nextCard = await scoreResume(text);
      setCard(nextCard);
      setDisplayName(nextCard.name);
      setStatus('done');
      recordCardRated();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong scoring that resume.');
      setStatus('error');
    }
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
    setCard(null);
    setStatus('idle');
    setError('');
    setPastedText('');
    setFileLabel('');
    setDisplayName('');
    setPhoto('');
    setFlag('');
    setDerbyOpen(false);
    setDerbyOpponent(null);
    setDerbyStatus('idle');
    setDerbyError('');
    extractedTextRef.current = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleOpponentChange(payload) {
    setDerbyOpponent(payload);
  }

  async function runDerby() {
    if (!derbyOpponent?.text || derbyOpponent.text.trim().length < 30) {
      setDerbyError('Add the opponent resume first.');
      return;
    }
    setDerbyError('');
    setDerbyStatus('scoring');
    try {
      const opponent = await scoreResume(derbyOpponent.text);
      opponent.photo = derbyOpponent.photo;
      opponent.flag = derbyOpponent.flag;
      setDerbyOpponent({ ...derbyOpponent, card: opponent });
      setDerbyStatus('done');
      recordCardRated();
    } catch (err) {
      setDerbyError(err.message || 'Could not scout the opponent.');
      setDerbyStatus('error');
    }
  }

  function decideDerby(cardA, cardB) {
    let winsA = 0;
    let winsB = 0;
    const rows = cardA.statList.map((a, index) => {
      const b = cardB.statList[index];
      const winner = a.value > b.value ? 'a' : b.value > a.value ? 'b' : null;
      if (winner === 'a') winsA += 1;
      if (winner === 'b') winsB += 1;
      return { ...a, b: b.value, winner };
    });
    const overallWinner = winsA > winsB ? 'a' : winsB > winsA ? 'b' : cardA.overall > cardB.overall ? 'a' : cardB.overall > cardA.overall ? 'b' : null;
    return { rows, winsA, winsB, overallWinner };
  }

  const battle = derbyOpponent?.card ? decideDerby({ ...card, name: displayName, photo, flag }, derbyOpponent.card) : null;

  if (card) {
    return (
      <div className="min-h-screen bg-ink text-[#e7e9ee] font-body">
        <Header onBack={reset} githubStars={githubStars} />
        <main className="max-w-6xl mx-auto px-6 md:px-10 py-8">
          {!derbyOpen && (
            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
              <div className="w-20 h-20 rounded-xl bg-panel border border-hairline flex flex-col items-center justify-center shrink-0">
                <span className="font-display font-bold text-2xl leading-none">{card.overall}</span>
                <span className="text-[9px] tracking-[0.15em] text-[#9aa0b0] mt-1">{card.tier.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                {editingName ? (
                  <input autoFocus value={displayName} onChange={(e) => setDisplayName(e.target.value.toUpperCase())} onBlur={() => setEditingName(false)} onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)} className="font-display font-bold text-3xl md:text-4xl tracking-wide bg-transparent border-b border-gold/60 focus:outline-none w-full" />
                ) : (
                  <h1 className="font-display font-bold text-3xl md:text-4xl tracking-wide truncate cursor-text" title="Click to edit" onClick={() => setEditingName(true)}>
                    {displayName}<span className="text-[#565c6b] text-base align-middle ml-3 font-body font-normal">edit ✎</span>
                  </h1>
                )}
                <div className="flex flex-wrap items-center gap-2.5 mt-3 text-sm">
                  {flag && <span className="text-lg leading-none">{flag}</span>}
                  <span className="bg-gold text-[#20180a] font-semibold px-2 py-0.5 rounded">{card.position}</span>
                  <span className="text-[#c7cbd6]">{card.archetype}</span><span className="text-[#565c6b]">·</span><span className="text-[#9aa0b0]">{card.positionLabel}</span>
                </div>
                <p className="mt-3 text-sm text-[#9aa0b0]"><span className="font-semibold tracking-wide text-[#c7cbd6]">{card.style}</span> — {card.tagline}</p>
              </div>
            </div>
          )}

          {derbyOpen ? (
            <section className="py-2">
              <div className="text-center max-w-xl mx-auto mb-8">
                <p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73] mb-2">Your card stays locked in</p>
                <h1 className="font-display font-bold text-4xl tracking-wide">DERBY <span className="text-gold">MODE</span></h1>
                <p className="mt-3 text-[#9aa0b0] text-sm">Keep your card on the pitch and enter one opponent resume.</p>
              </div>
              {!derbyOpponent?.card ? (
                <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start max-w-5xl mx-auto">
                  <div className="flex justify-center"><PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={null} /></div>
                  <div>
                    <ResumeUploader title="Opponent" compact onChange={handleOpponentChange} />
                    {derbyError && <p className="text-sm text-red-400 mt-4">{derbyError}</p>}
                    <button type="button" onClick={runDerby} disabled={derbyStatus === 'scoring'} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50">
                      {derbyStatus === 'scoring' ? 'Scouting opponent…' : '⚔️ Battle this card'}
                    </button>
                    <button type="button" onClick={() => setDerbyOpen(false)} className="w-full mt-3 border border-hairline text-[#c7cbd6] font-medium py-2.5 rounded-md">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="max-w-6xl mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="font-display font-bold text-3xl tracking-wide">{battle?.overallWinner === 'a' ? <><span className="text-gold">{displayName}</span> wins</> : battle?.overallWinner === 'b' ? <><span className="text-gold">{derbyOpponent.card.name}</span> wins</> : "IT'S A DRAW"}</h2>
                    <p className="text-sm text-[#9aa0b0] mt-2">{battle?.winsA} categories to {battle?.winsB}</p>
                  </div>
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-2 mb-8">
                    <div className={battle?.overallWinner === 'a' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={null} /></div>
                    <div className="font-display font-bold text-3xl text-[#565c6b] px-4">VS</div>
                    <div className={battle?.overallWinner === 'b' ? 'scale-105 transition' : 'opacity-80 transition'}><PlayerCard card={derbyOpponent.card} cardRef={null} /></div>
                  </div>
                  <div className="max-w-2xl mx-auto bg-panel border border-hairline rounded-lg p-6">
                    {battle?.rows.map((row) => <div key={row.key} className="flex items-center justify-between py-2.5 border-b border-hairline/60 last:border-0"><span className={`w-16 text-lg font-display font-bold ${row.winner === 'a' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.value}</span><span className="text-xs text-[#9aa0b0] tracking-wide">{row.label}</span><span className={`w-16 text-lg font-display font-bold text-right ${row.winner === 'b' ? 'text-gold' : 'text-[#c7cbd6]'}`}>{row.b}</span></div>)}
                    <div className="flex items-center justify-between py-3 mt-2 border-t border-hairline"><span className="w-16 text-xl font-display font-bold">{card.overall}</span><span className="text-xs tracking-[0.15em] text-[#9aa0b0]">OVERALL</span><span className="w-16 text-xl font-display font-bold text-right">{derbyOpponent.card.overall}</span></div>
                  </div>
                  <div className="text-center mt-8"><button type="button" onClick={() => { setDerbyOpponent(null); setDerbyStatus('idle'); setDerbyError(''); }} className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-6 py-2.5 rounded-md">Battle another resume</button></div>
                </div>
              )}
            </section>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6 items-start">
                <AttributesPanel card={card} />
                <div className="flex flex-col items-center">
                  <PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={cardRef} editable onPhotoChange={setPhoto} onFlagChange={setFlag} />
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
                    <button type="button" onClick={handleDownload} className="flex items-center gap-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-6 py-2.5 rounded-md">⭳ Download</button>
                    <button type="button" onClick={() => setDerbyOpen(true)} className="flex items-center gap-2 border border-gold/60 text-gold font-display font-semibold tracking-wide px-5 py-2.5 rounded-md hover:bg-gold/10 transition">⚔️ Derby Mode</button>
                    <a href={shareUrl('x')} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6] hover:border-gold/60 transition" aria-label="Share on X">𝕏</a>
                    <a href={shareUrl('linkedin')} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6] hover:border-gold/60 transition" aria-label="Share on LinkedIn">in</a>
                  </div>
                </div>
                <ScoutingMetrics card={card} />
              </div>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-[#e7e9ee] font-body relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 pitch-glow" />
      <div className="relative">
        <Header githubStars={githubStars} />
        <main className="max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-4 items-center min-h-[610px]">
            <section className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-panel/70 px-4 py-2 text-xs tracking-[0.18em] uppercase text-[#c7cbd6]">
                <span className="text-gold">RESUME</span> × <span className="text-[#6fbf73]">WORLD CUP</span>
              </div>
              <h1 className="mt-6 font-display font-bold text-6xl md:text-8xl leading-[0.86] tracking-wide">GET<br />SCOUTED<span className="text-gold">.</span></h1>
              <p className="mt-7 text-lg md:text-xl text-[#d5d8e0] leading-relaxed max-w-lg">Your resume, turned into a World-Cup-style player card rated out of 99.</p>
              <div className="mt-8 max-w-xl">
                <div className="bg-panel border border-hairline rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl shadow-black/20">
                  <div className="flex-1 flex items-center px-4">
                    <span className="text-[#565c6b] mr-2">▣</span>
                    <span className="text-[#9aa0b0] text-sm font-mono">resume.pdf or paste text</span>
                  </div>
                  <button type="button" onClick={() => document.getElementById('scout-form')?.scrollIntoView({ behavior: 'smooth' })} className="bg-signal text-white font-display font-semibold tracking-wide px-8 py-3.5 rounded-xl hover:brightness-110 transition">SCOUT →</button>
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-[#7f8595]">
                  <span className="text-[#6fbf73]">●</span><span className="font-display text-lg text-[#e7e9ee]">{cardsRated.toLocaleString()}</span><span>cards rated on this browser</span><span className="text-[#3c4250]">|</span><a href="#how-it-works" className="hover:text-[#e7e9ee] transition">how it works ↗</a>
                </div>
              </div>
            </section>

            <section className="relative h-[560px] hidden lg:block" aria-label="Sample ResumeFUT cards">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-[520px] h-[420px] rounded-full bg-gold/10 blur-3xl" />
                {SAMPLE_CARDS.map((sample, index) => (
                  <div key={sample.name} className={`absolute transition-transform duration-500 hover:z-30 hover:scale-105 ${index === 0 ? 'z-20 rotate-[-9deg] translate-x-[-170px]' : index === 1 ? 'z-10 translate-x-0 translate-y-[-20px]' : 'z-0 rotate-[9deg] translate-x-[170px]'}`}>
                    <PlayerCard card={sample} cardRef={null} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section id="scout-form" className="max-w-4xl mx-auto pt-10 scroll-mt-8">
            <div className="text-center mb-8"><p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73]">01 · Submit your resume</p><h2 className="font-display font-bold text-3xl md:text-4xl tracking-wide mt-2">BUILD YOUR CARD</h2><p className="mt-3 text-sm text-[#9aa0b0]">Upload a PDF or paste the text. Your card is generated from the resume content.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-start">
              <div className="bg-panel border border-hairline rounded-2xl p-6 jersey-texture">
                <div className="flex gap-2 mb-5">
                  <button type="button" onClick={() => setMode('pdf')} className={`flex-1 rounded-md py-2 text-sm font-medium transition ${mode === 'pdf' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Upload PDF</button>
                  <button type="button" onClick={() => setMode('paste')} className={`flex-1 rounded-md py-2 text-sm font-medium transition ${mode === 'paste' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Paste text</button>
                </div>
                {mode === 'pdf' ? <div><label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-hairline rounded-md py-10 cursor-pointer hover:border-gold/50 transition"><span className="text-2xl" aria-hidden="true">📄</span><span className="text-sm text-[#c7cbd6]">{fileLabel || 'Click to choose a resume PDF'}</span><input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" /></label>{status === 'reading' && <p className="text-xs text-[#9aa0b0] mt-2">Reading {fileLabel}…</p>}{status !== 'reading' && fileLabel && <p className="text-xs text-[#6fbf73] mt-2">Loaded {fileLabel}</p>}</div> : <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} rows={9} placeholder="Paste your resume text here — experience, skills, education…" className="w-full bg-ink border border-hairline rounded-md px-3 py-2.5 text-sm text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal" />}
                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                <button type="button" onClick={handleGenerate} disabled={status === 'reading' || status === 'scoring'} className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50">{status === 'scoring' ? 'Scouting…' : 'Generate my card'}</button>
              </div>
              <div className="hidden md:flex flex-col items-center justify-center h-full"><div className="card-shield w-[180px] h-[250px] border border-hairline/70 border-dashed bg-panel/40 flex items-center justify-center"><span className="text-4xl text-[#3a3f4d]">?</span></div><p className="text-xs text-[#565c6b] mt-3 text-center">Your card appears after scouting</p></div>
            </div>
          </section>

          <section id="how-it-works" className="max-w-4xl mx-auto mt-24 scroll-mt-20">
            <div className="text-center mb-7"><p className="text-xs tracking-[0.2em] uppercase text-[#6fbf73]">02 · The scouting report</p><h2 className="font-display font-bold text-3xl tracking-wide mt-2">HOW IT WORKS</h2></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[['EXP','Experience','Tenure & seniority language'],['SKL','Skills','Breadth of listed tools & skills'],['LED','Leadership','Management & ownership language'],['IMP','Impact','Quantified, results-driven bullets'],['EDU','Education','Degrees & certifications'],['VER','Versatility','Range of industries touched']].map(([code,label,desc]) => <div key={code} className="bg-panel border border-hairline rounded-xl p-4 hover:border-gold/40 transition"><div className="font-display font-bold text-gold">{code}</div><div className="text-[#c7cbd6] font-medium mt-1">{label}</div><div className="text-[#6b7180] text-xs mt-1">{desc}</div></div>)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
