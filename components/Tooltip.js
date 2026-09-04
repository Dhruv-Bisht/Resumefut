export default function Tooltip({ text, children }) {
  return (
    <span className="relative inline-flex items-center group">
      {children}
      <span className="ml-1.5 w-3.5 h-3.5 shrink-0 rounded-full border border-[#565c6b] text-[9px] leading-none text-[#9aa0b0] flex items-center justify-center cursor-help select-none">
        i
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 rounded-md bg-[#1b1f2a] border border-hairline px-3 py-2 text-xs leading-snug text-[#c7cbd6] opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition duration-150 z-20"
      >
        {text}
      </span>
    </span>
  );
}
