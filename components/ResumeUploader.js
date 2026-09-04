import { useRef, useState } from 'react';
import { extractPdfTextWithMetadata } from '../lib/extractPdfText';
import { validateResumeText } from '../lib/resumeValidation';

export default function ResumeUploader({ title, compact = false, onChange }) {
  const [mode, setMode] = useState('pdf');
  const [pastedText, setPastedText] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function publishText(text, options = {}) {
    const validation = validateResumeText(text, options);
    if (!validation.valid) {
      setError(validation.message);
      onChange?.({ text: '', valid: false });
      return false;
    }
    setError('');
    onChange?.({ text, valid: true, pageCount: options.pageCount ?? null });
    return true;
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);
    setError('');
    setReading(true);
    try {
      const result = await extractPdfTextWithMetadata(file);
      if (!publishText(result.text, { pageCount: result.pageCount })) return;
    } catch (err) {
      console.error(err);
      setError(err?.code === 'TOO_MANY_PAGES' ? err.message : "Couldn't read that PDF — try another resume PDF or paste the text instead.");
      onChange?.({ text: '', valid: false });
    } finally {
      setReading(false);
      e.target.value = '';
    }
  }

  function handlePasteChange(e) {
    const text = e.target.value;
    setPastedText(text);
    if (!text.trim()) {
      setError('');
      onChange?.({ text: '', valid: false });
      return;
    }
    publishText(text);
  }

  return (
    <div className={`bg-panel border border-hairline rounded-lg ${compact ? 'p-4' : 'p-6'}`}>
      {title && <div className="font-display font-semibold text-sm tracking-wide text-[#c7cbd6] mb-4">{title}</div>}
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => { setMode('pdf'); setError(''); }} className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${mode === 'pdf' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Upload PDF</button>
        <button type="button" onClick={() => { setMode('paste'); setError(''); }} className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${mode === 'paste' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Paste text</button>
      </div>
      {mode === 'pdf' ? (
        <div>
          <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-hairline rounded-md py-6 cursor-pointer hover:border-gold/50 transition">
            <span className="text-xl" aria-hidden="true">📄</span>
            <span className="text-xs text-[#c7cbd6] text-center px-2">{fileLabel || 'Click to choose a resume PDF'}</span>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {reading && <p className="text-xs text-[#9aa0b0] mt-2">Reading {fileLabel}…</p>}
          {!reading && fileLabel && !error && <p className="text-xs text-[#6fbf73] mt-2">Resume accepted: {fileLabel}</p>}
        </div>
      ) : (
        <textarea value={pastedText} onChange={handlePasteChange} rows={compact ? 6 : 9} placeholder="Paste resume text…" className="w-full bg-ink border border-hairline rounded-md px-3 py-2 text-xs text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal" />
      )}
      <div className="mt-4 rounded-md border border-hairline/70 bg-ink/60 p-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-gold mb-1.5">Resume format</p>
        <p className="text-[11px] leading-relaxed text-[#7f8797]">Upload a standard resume of <strong className="text-[#c7cbd6]">3 pages or fewer</strong>. ResumeFUT checks document structure and rejects books, reports, exam/admit cards and other non-resume PDFs.</p>
      </div>
      {error && <p className="text-xs text-red-400 mt-3 leading-relaxed">{error}</p>}
    </div>
  );
}
