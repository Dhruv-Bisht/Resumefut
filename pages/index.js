import { useRef, useState } from 'react';
import Header from '../components/Header';
import AttributesPanel from '../components/AttributesPanel';
import ScoutingMetrics from '../components/ScoutingMetrics';
import PlayerCard from '../components/PlayerCard';
import { extractPdfText } from '../lib/extractPdfText';
import { COUNTRIES } from '../lib/countries';

export default function Home() {
  const [mode, setMode] = useState('pdf'); // 'pdf' | 'paste'
  const [pastedText, setPastedText] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [status, setStatus] = useState('idle'); // idle | reading | scoring | done | error
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [photo, setPhoto] = useState('');
  const [flag, setFlag] = useState('');

  const extractedTextRef = useRef('');
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);
    setError('');
    setStatus('reading');
    try {
      const text = await extractPdfText(file);
      extractedTextRef.current = text;
      setStatus('idle');
    } catch (err) {
      console.error(err);
      setError("Couldn't read that PDF. Try a different file or paste your resume text instead.");
      setStatus('error');
    }
  }

  async function handleGenerate() {
    const text = mode === 'pdf' ? extractedTextRef.current : pastedText;

    if (!text || text.trim().length < 30) {
      setError(
        mode === 'pdf'
          ? 'Upload a resume PDF first.'
          : 'Paste more of your resume — a few bullet points isn\u2019t enough to scout.'
      );
      return;
    }

    setError('');
    setStatus('scoring');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setCard(data.card);
      setDisplayName(data.card.name);
      setStatus('done');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong scoring that resume.');
      setStatus('error');
    }
  }

  async function handleDownload() {
    if (!cardRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, backgroundColor: '#0b0e14' });
    const link = document.createElement('a');
    link.download = `${displayName.replace(/\s+/g, '-').toLowerCase() || 'resumefut'}-card.png`;
    link.href = dataUrl;
    link.click();
  }

  function shareUrl(kind) {
    const text = `I just got scouted by ResumeFUT — ${displayName} rated ${card.overall} OVR as ${card.position}.`;
    if (kind === 'x') {
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    }
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
    extractedTextRef.current = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (card) {
    return (
      <div className="min-h-screen bg-ink text-[#e7e9ee] font-body">
        <Header onBack={reset} />

        <main className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          {/* rating badge + name + tags */}
          <div className="flex flex-col md:flex-row md:items-start gap-6 mb-10">
            <div className="w-20 h-20 rounded-xl bg-panel border border-hairline flex flex-col items-center justify-center shrink-0">
              <span className="font-display font-bold text-2xl leading-none">{card.overall}</span>
              <span className="text-[9px] tracking-[0.15em] text-[#9aa0b0] mt-1">
                {card.tier.toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              {editingName ? (
                <input
                  autoFocus
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.toUpperCase())}
                  onBlur={() => setEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
                  className="font-display font-bold text-3xl md:text-4xl tracking-wide bg-transparent border-b border-gold/60 focus:outline-none w-full"
                />
              ) : (
                <h1
                  className="font-display font-bold text-3xl md:text-4xl tracking-wide truncate cursor-text"
                  title="Click to edit"
                  onClick={() => setEditingName(true)}
                >
                  {displayName}
                  <span className="text-[#565c6b] text-base align-middle ml-3 font-body font-normal">
                    edit ✎
                  </span>
                </h1>
              )}

              <div className="flex flex-wrap items-center gap-2.5 mt-3 text-sm">
                {flag && <span className="text-lg leading-none">{flag}</span>}
                <span className="bg-gold text-[#20180a] font-semibold px-2 py-0.5 rounded">
                  {card.position}
                </span>
                <span className="text-[#c7cbd6]">{card.archetype}</span>
                <span className="text-[#565c6b]">·</span>
                <span className="text-[#9aa0b0]">{card.positionLabel}</span>
              </div>

              <p className="mt-3 text-sm text-[#9aa0b0]">
                <span className="font-semibold tracking-wide text-[#c7cbd6]">
                  {card.style}
                </span>{' '}
                — {card.tagline}
              </p>
            </div>
          </div>

          {/* three column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-6 items-start">
            <AttributesPanel card={card} />

            <div className="flex flex-col items-center">
              <PlayerCard card={{ ...card, name: displayName, photo, flag }} cardRef={cardRef} />
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-gold text-[#20180a] font-display font-semibold tracking-wide px-6 py-2.5 rounded-md"
                >
                  ⭳ Download
                </button>
                <a
                  href={shareUrl('x')}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6] hover:border-gold/60 transition"
                  aria-label="Share on X"
                >
                  𝕏
                </a>
                <a
                  href={shareUrl('linkedin')}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-hairline rounded-md text-[#c7cbd6] hover:border-gold/60 transition"
                  aria-label="Share on LinkedIn"
                >
                  in
                </a>
              </div>
            </div>

            <ScoutingMetrics card={card} />
          </div>
        </main>

        <footer className="max-w-6xl mx-auto px-6 md:px-10 pb-10 text-center text-xs text-[#565c6b]">
          Ratings are heuristic, for-fun approximations — not a real assessment of your worth.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-[#e7e9ee] font-body relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 pitch-glow" />

      <div className="relative">
        <Header />

        <main className="max-w-5xl mx-auto px-6 md:px-10 pt-16 pb-24">
          <div className="text-center max-w-lg mx-auto mb-14">
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-wide">
              RESUME<span className="text-gold">FUT</span>
            </h1>
            <p className="mt-3 text-sm tracking-[0.15em] text-[#9aa0b0] uppercase">
              Your resume, scouted
            </p>
            <p className="mt-6 text-[#b7bcc9] text-[15px] leading-relaxed">
              Upload a resume PDF or paste your experience and get scouted like a
              player card — rating, position, playstyles, the works. Scored
              entirely by a local, open-source heuristic engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-8 items-start max-w-3xl mx-auto">
            <div className="bg-panel border border-hairline rounded-lg p-6 jersey-texture">
              <div className="flex gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setMode('pdf')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                    mode === 'pdf'
                      ? 'bg-signal text-white'
                      : 'bg-ink border border-hairline text-[#9aa0b0]'
                  }`}
                >
                  Upload PDF
                </button>
                <button
                  type="button"
                  onClick={() => setMode('paste')}
                  className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                    mode === 'paste'
                      ? 'bg-signal text-white'
                      : 'bg-ink border border-hairline text-[#9aa0b0]'
                  }`}
                >
                  Paste text
                </button>
              </div>

              {mode === 'pdf' ? (
                <div>
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-hairline rounded-md py-10 cursor-pointer hover:border-gold/50 transition">
                    <span className="text-2xl" aria-hidden="true">📄</span>
                    <span className="text-sm text-[#c7cbd6]">
                      {fileLabel || 'Click to choose a resume PDF'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFile}
                      className="hidden"
                    />
                  </label>
                  {status === 'reading' && (
                    <p className="text-xs text-[#9aa0b0] mt-2">Reading {fileLabel}…</p>
                  )}
                  {status !== 'reading' && fileLabel && (
                    <p className="text-xs text-[#6fbf73] mt-2">Loaded {fileLabel}</p>
                  )}
                </div>
              ) : (
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={9}
                  placeholder="Paste your resume text here — experience, skills, education…"
                  className="w-full bg-ink border border-hairline rounded-md px-3 py-2.5 text-sm text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal"
                />
              )}

              {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

              <div className="flex gap-3 mt-5">
                <label className="flex-1 flex items-center gap-2 border border-hairline rounded-md px-3 py-2.5 cursor-pointer hover:border-gold/50 transition">
                  <span className="text-base" aria-hidden="true">🖼️</span>
                  <span className="text-xs text-[#9aa0b0] truncate">
                    {photo ? 'Photo added ✓' : 'Add a photo (optional)'}
                  </span>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="hidden"
                  />
                </label>

                <select
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="flex-1 bg-ink border border-hairline rounded-md px-2 py-2.5 text-xs text-[#c7cbd6] focus:outline-none focus:ring-2 focus:ring-signal"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code || 'none'} value={c.flag}>
                      {c.flag ? `${c.flag} ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={status === 'reading' || status === 'scoring'}
                className="w-full mt-5 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50"
              >
                {status === 'scoring' ? 'Scouting…' : 'Generate my card'}
              </button>
              <p className="text-xs text-[#565c6b] mt-3 text-center">
                Your name is pulled straight from the resume — you can edit it after.
              </p>
            </div>

            {/* ghost card preview teaser, desktop only */}
            <div className="hidden md:flex flex-col items-center justify-center h-full">
              <div className="card-shield w-[180px] h-[250px] border border-hairline/70 border-dashed bg-panel/40 flex items-center justify-center">
                <span className="text-4xl text-[#3a3f4d]" aria-hidden="true">
                  ?
                </span>
              </div>
              <p className="text-xs text-[#565c6b] mt-3 text-center">
                Your card appears here
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-6 text-center">
            <a
              href="/derby"
              className="inline-flex items-center gap-2 text-sm text-[#c7cbd6] border border-hairline rounded-full px-5 py-2.5 hover:border-gold/60 transition"
            >
              ⚔️ Or battle two resumes in Derby Mode
            </a>
          </div>

          <section id="how-it-works" className="max-w-3xl mx-auto mt-24 scroll-mt-20">
            <h2 className="font-display font-bold text-2xl tracking-wide mb-6 text-center">
              How it works
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ['EXP', 'Experience', 'Tenure & seniority language'],
                ['SKL', 'Skills', 'Breadth of listed tools & skills'],
                ['LED', 'Leadership', 'Management & ownership language'],
                ['IMP', 'Impact', 'Quantified, results-driven bullets'],
                ['EDU', 'Education', 'Degrees & certifications'],
                ['VER', 'Versatility', 'Range of industries touched'],
              ].map(([code, label, desc]) => (
                <div key={code} className="bg-panel border border-hairline rounded-lg p-4">
                  <div className="font-display font-bold text-gold">{code}</div>
                  <div className="text-[#c7cbd6] font-medium mt-1">{label}</div>
                  <div className="text-[#6b7180] text-xs mt-1">{desc}</div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#565c6b] mt-6 text-center max-w-md mx-auto">
              Everything runs on a local, keyword-based engine — no AI calls, no
              third-party APIs, and your resume text never leaves this app's own
              server. Ratings are a fun approximation, not a real evaluation.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
