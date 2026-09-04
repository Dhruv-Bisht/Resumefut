const LINKEDIN_URL = 'https://www.linkedin.com/in/dhruv-bisht-90907a348';
const GITFUT_URL = 'https://gitfut.com/';
const LEETFUT_URL = 'https://leetfut-one.vercel.app/';

export default function Footer() {
  return (
    <footer className="relative flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-5 md:px-8 py-5 border-t border-hairline bg-[#0b0e14]/55 backdrop-blur-md text-xs text-[#6f7686] min-h-[58px]">
      <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-[#e7e9ee] transition whitespace-nowrap order-1 sm:order-none">
        <span>Built by</span>
        <span className="font-display font-semibold text-[#c7cbd6]">@DhruvBisht</span>
        <span aria-hidden="true">↗</span>
      </a>
      <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 gap-y-1 text-center sm:text-right">
        <span>Inspired by</span>
        <a href={GITFUT_URL} target="_blank" rel="noreferrer" className="text-[#c7cbd6] hover:text-white transition">GitFut</a>
        <span>·</span>
        <a href={LEETFUT_URL} target="_blank" rel="noreferrer" className="text-[#c7cbd6] hover:text-white transition">LeetFut</a>
      </div>
    </footer>
  );
}
