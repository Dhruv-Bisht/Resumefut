const GITHUB_URL = 'https://github.com/your-username/resumefut';

export default function Header({ onBack }) {
  return (
    <header className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-hairline">
      <div className="flex items-center gap-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition"
          >
            <span aria-hidden="true">←</span> Back
          </button>
        )}
        <span className="font-display font-bold text-lg tracking-wide">
          RESUME<span className="text-gold">FUT</span>
        </span>
      </div>

      <div className="flex items-center gap-5">
        <a
          href="#how-it-works"
          className="hidden sm:inline text-sm text-[#9aa0b0] hover:text-[#e7e9ee] transition"
        >
          how it works ↗
        </a>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-sm bg-panel border border-hairline rounded-full px-4 py-1.5 hover:border-gold/60 transition"
        >
          Star on GitHub <span className="text-gold">★</span>
        </a>
      </div>
    </header>
  );
}
