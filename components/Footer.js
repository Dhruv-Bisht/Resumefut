const LINKEDIN_URL = 'https://www.linkedin.com/in/dhruv-bisht-90907a348';

export default function Footer() {
  return (
    <footer className="px-5 md:px-8 py-6 border-t border-hairline text-center text-xs text-[#6f7686]">
      <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#e7e9ee] transition">
        <span>Built by</span>
        <span className="font-display font-semibold text-[#c7cbd6]">@DhruvBisht</span>
        <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}
