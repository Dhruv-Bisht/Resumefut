import { useState } from 'react';

const GITHUB_URL = 'https://github.com/Dhruv-Bisht/Resumefut';

const NAV_LINKS = [
  ['About', '/about'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
];

export default function Header({ onBack, githubStars }) {
<<<<<<< HEAD
  const [menuOpen, setMenuOpen] = useState(false);

=======
>>>>>>> 04ed909a3289644389fdf556a8b8c3a31b1b0601
  return (
    <header className="relative border-b border-hairline bg-[#0b0e14]/60 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 md:px-8 py-3.5">
        <div className="flex items-center gap-3 min-w-0 z-10">
          {onBack && (
            <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition shrink-0" aria-label="Go back">
              <span aria-hidden="true">←</span><span className="hidden sm:inline">Back</span>
            </button>
          )}
          <a href="/" className="font-display font-bold text-base sm:text-lg tracking-wide shrink-0">RESUME<span className="text-gold">FUT</span></a>
        </div>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 lg:gap-6" aria-label="Main navigation">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} className="text-sm lg:text-[15px] font-medium text-[#aeb4c1] hover:text-[#e7e9ee] transition whitespace-nowrap">{label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 z-10">
          {githubStars !== undefined && (
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm bg-panel border border-hairline rounded-full px-2.5 sm:px-4 py-2 hover:border-gold/60 hover:-translate-y-0.5 transition" aria-label="Open ResumeFUT on GitHub and star the repository">
              <span aria-hidden="true">◉</span>
              <span className="hidden sm:inline">Star on GitHub</span>
              <span className="text-gold">★</span>
              <span className="text-[#9aa0b0]">{githubStars === null ? '—' : githubStars.toLocaleString()}</span>
            </a>
          )}
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="md:hidden w-10 h-10 rounded-lg border border-hairline bg-panel text-[#c7cbd6] flex items-center justify-center text-lg" aria-label="Toggle navigation" aria-expanded={menuOpen}>
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

<<<<<<< HEAD
      {menuOpen && (
        <nav className="md:hidden px-4 pb-4 pt-1 grid grid-cols-2 gap-2" aria-label="Mobile navigation">
          {NAV_LINKS.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg border border-hairline bg-panel/80 px-3 py-2.5 text-sm text-[#c7cbd6] hover:text-white hover:border-gold/50 transition text-center">{label}</a>
          ))}
        </nav>
      )}
=======
      <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 lg:gap-6" aria-label="Main navigation">
        {NAV_LINKS.map(([label, href]) => <a key={href} href={href} className="text-sm lg:text-[15px] font-medium text-[#aeb4c1] hover:text-[#e7e9ee] transition whitespace-nowrap">{label}</a>)}
      </nav>

      <div className="flex items-center gap-3 md:gap-4 shrink-0 z-10">
        {githubStars !== undefined && <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs md:text-sm bg-panel border border-hairline rounded-full px-3 md:px-4 py-2 hover:border-gold/60 hover:-translate-y-0.5 transition" aria-label="Open ResumeFUT on GitHub and star the repository"><span aria-hidden="true">◉</span><span>Star on GitHub</span><span className="text-gold">★</span><span className="text-[#9aa0b0]">{githubStars === null ? '—' : githubStars.toLocaleString()}</span></a>}
      </div>
>>>>>>> 04ed909a3289644389fdf556a8b8c3a31b1b0601
    </header>
  );
}
