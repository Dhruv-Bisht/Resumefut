const GITHUB_URL = 'https://github.com/Dhruv-Bisht/Resumefut';

export default function Header({ onBack, githubStars }) {
  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-hairline">
      <div className="flex items-center gap-4">
        {onBack && (
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition">
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <a href="/" className="font-display font-bold text-lg tracking-wide">RESUME<span className="text-gold">FUT</span></a>
      </div>

      <div className="flex items-center gap-4">
        <a href="#how-it-works" className="hidden sm:inline text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition">how it works ↗</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm bg-panel border border-hairline rounded-full px-4 py-2 hover:border-gold/60 hover:-translate-y-0.5 transition" aria-label="Open ResumeFUT on GitHub and star the repository">
          <span aria-hidden="true">◉</span>
          <span>Star on GitHub</span>
          <span className="text-gold">★</span>
          <span className="text-[#9aa0b0]">{githubStars === null ? '—' : githubStars.toLocaleString()}</span>
        </a>
      </div>
    </header>
  );
}
