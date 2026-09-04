import { useRef, useState } from 'react';
import { extractPdfText } from '../lib/extractPdfText';

export default function ResumeUploader({ title, compact = false, onChange }) {
  const [mode, setMode] = useState('pdf');
  const [pastedText, setPastedText] = useState('');
  const [fileLabel, setFileLabel] = useState('');
  const [reading, setReading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const pdfTextRef = useRef('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileLabel(file.name);
    setError('');
    setReading(true);
    try {
      const text = await extractPdfText(file);
      pdfTextRef.current = text;
      onChange?.({ text });
    } catch (err) {
      console.error(err);
      setError("Couldn't read that PDF — try pasting the text instead.");
    } finally {
      setReading(false);
    }
  }

  function handlePasteChange(e) {
    const text = e.target.value;
    setPastedText(text);
    onChange?.({ text });
  }

  return (
    <div className={`bg-panel border border-hairline rounded-lg ${compact ? 'p-4' : 'p-6'}`}>
      {title && <div className="font-display font-semibold text-sm tracking-wide text-[#c7cbd6] mb-4">{title}</div>}
      <div className="flex gap-2 mb-4">
        <button type="button" onClick={() => setMode('pdf')} className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${mode === 'pdf' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Upload PDF</button>
        <button type="button" onClick={() => setMode('paste')} className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${mode === 'paste' ? 'bg-signal text-white' : 'bg-ink border border-hairline text-[#9aa0b0]'}`}>Paste text</button>
      </div>
      {mode === 'pdf' ? (
        <div>
          <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-hairline rounded-md py-6 cursor-pointer hover:border-gold/50 transition">
            <span className="text-xl" aria-hidden="true">📄</span>
            <span className="text-xs text-[#c7cbd6] text-center px-2">{fileLabel || 'Click to choose a resume PDF'}</span>
            <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
          </label>
          {reading && <p className="text-xs text-[#9aa0b0] mt-2">Reading {fileLabel}…</p>}
          {!reading && fileLabel && <p className="text-xs text-[#6fbf73] mt-2">Loaded {fileLabel}</p>}
        </div>
      ) : (
        <textarea value={pastedText} onChange={handlePasteChange} rows={compact ? 6 : 9} placeholder="Paste resume text…" className="w-full bg-ink border border-hairline rounded-md px-3 py-2 text-xs text-[#e7e9ee] placeholder:text-[#565c6b] focus:outline-none focus:ring-2 focus:ring-signal" />
      )}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
