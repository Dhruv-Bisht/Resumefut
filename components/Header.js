const GITHUB_URL = 'https://github.com/Dhruv-Bisht/Resumefut';

const NAV_LINKS = [
  ['About', '/about'],
  ['FAQ', '/faq'],
  ['Contact', '/contact'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
];

export default function Header({ onBack, githubStars, onHowItWorks }) {
  return (
    <header className="relative flex items-center justify-between gap-4 px-5 md:px-8 py-3.5 border-b border-hairline">
      <div className="flex items-center gap-4 min-w-0 z-10">
        {onBack && <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition shrink-0"><span aria-hidden="true">←</span> Back</button>}
        <a href="/" className="font-display font-bold text-lg tracking-wide shrink-0">RESUME<span className="text-gold">FUT</span></a>
      </div>

      <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-5 lg:gap-6" aria-label="Main navigation">
        {NAV_LINKS.map(([label, href]) => <a key={href} href={href} className="text-sm lg:text-[15px] font-medium text-[#aeb4c1] hover:text-[#e7e9ee] transition whitespace-nowrap">{label}</a>)}
      </nav>

      <div className="flex items-center gap-3 md:gap-4 shrink-0 z-10">
        {onHowItWorks && <button type="button" onClick={onHowItWorks} className="hidden sm:inline text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition">how it works ↗</button>}
        {githubStars !== undefined && <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs md:text-sm bg-panel border border-hairline rounded-full px-3 md:px-4 py-2 hover:border-gold/60 hover:-translate-y-0.5 transition" aria-label="Open ResumeFUT on GitHub and star the repository"><span aria-hidden="true">◉</span><span>Star on GitHub</span><span className="text-gold">★</span><span className="text-[#9aa0b0]">{githubStars === null ? '—' : githubStars.toLocaleString()}</span></a>}
      </div>
    </header>
  );
}
