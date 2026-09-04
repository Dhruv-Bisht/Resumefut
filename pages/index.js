import { useRef, useState } from 'react';
import PlayerCard from '../components/PlayerCard';
import { extractPdfText } from '../lib/extractPdfText';

export default function Home() {
  const [mode, setMode] = useState('pdf'); // 'pdf' | 'paste'
  const [name, setName] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [status, setStatus] = useState('idle'); // idle | reading | scoring | done | error
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);

  const extractedTextRef = useRef('');
  const cardRef = useRef(null);
  const fileInputRef = useRef(null);

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
    if (!name.trim()) {
      setError('Add your name so the card knows who it belongs to.');
      return;
    }

    setError('');
    setStatus('scoring');
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setCard(data.card);
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
    link.download = `${name.replace(/\s+/g, '-').toLowerCase() || 'resumefut'}-card.png`;
    link.href = dataUrl;
    link.click();
  }

  function reset() {
    setCard(null);
    setStatus('idle');
    setError('');
    setPastedText('');
    setFileLabel('');
    extractedTextRef.current = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="min-h-screen bg-ink text-[#e7e9ee] font-body">
      <header className="max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="font-display font-bold text-4xl tracking-wide">
          RESUME<span className="text-gold">FUT</span>
        </h1>
        <p className="mt-3 text-sm tracking-[0.15em] text-[#9aa0b0] uppercase">
          Your resume, scouted
        </p>
        <p className="mt-6 text-[#b7bcc9] text-[15px] leading-relaxed max-w-md mx-auto">
          Upload a resume PDF or paste your experience. Every stat is scored locally
          by a fully open-source, keyword-based engine — nothing is sent to a
          third-party AI.
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        {!card && (
          <div className="bg-panel border border-hairline rounded-lg p-6">
            <label className="block text-sm text-[#b7bcc9] mb-2">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jordan Alvarez"
              className="w-full bg-ink border border-hairline rounded-md px-3 py-2 mb-6 text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal"
            />

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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFile}
                  className="block w-full text-sm text-[#9aa0b0] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-signal file:text-white file:text-sm file:font-medium"
                />
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
                rows={8}
                placeholder="Paste your resume text here — experience, skills, education…"
                className="w-full bg-ink border border-hairline rounded-md px-3 py-2 text-sm text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal"
              />
            )}

            {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={status === 'reading' || status === 'scoring'}
              className="w-full mt-6 bg-gold text-[#20180a] font-display font-semibold tracking-wide py-3 rounded-md disabled:opacity-50"
            >
              {status === 'scoring' ? 'Scouting\u2026' : 'Generate my card'}
            </button>
          </div>
        )}

        {card && (
          <div className="flex flex-col items-center">
            <PlayerCard card={card} cardRef={cardRef} />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleDownload}
                className="bg-gold text-[#20180a] font-display font-semibold tracking-wide px-6 py-2.5 rounded-md"
              >
                Download PNG
              </button>
              <button
                type="button"
                onClick={reset}
                className="border border-hairline text-[#b7bcc9] font-medium px-6 py-2.5 rounded-md"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-6 pb-10 text-center text-xs text-[#565c6b]">
        Open source — ratings are heuristic and just for fun, not a real assessment of your worth.
      </footer>
    </div>
  );
}
