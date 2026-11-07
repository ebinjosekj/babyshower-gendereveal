export const Ornament = ({ className, dark }: { className?: string; dark?: boolean }) => (
  <div className={`relative flex items-center justify-center gap-3 overflow-hidden ${className ?? ''}`} aria-hidden="true">
    <span className="orn-glint ambient absolute left-1/2 top-1/2 h-px w-10 -translate-y-1/2 bg-gradient-to-r from-transparent via-white to-transparent" />
    <span className={`h-px w-14 bg-gradient-to-r from-transparent ${dark ? 'to-sun/70' : 'to-gold'}`} />
    <span className="ambient h-1.5 w-1.5 rotate-45 bg-sun" style={{ animation: 'heartThump 2.4s ease-in-out infinite' }} />
    <span className={`h-px w-14 bg-gradient-to-l from-transparent ${dark ? 'to-sun/70' : 'to-gold'}`} />
  </div>
);
