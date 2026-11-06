export const Ornament = ({ className, dark }: { className?: string; dark?: boolean }) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ''}`} aria-hidden="true">
    <span className={`h-px w-14 bg-gradient-to-r from-transparent ${dark ? 'to-sun/70' : 'to-gold'}`} />
    <span className="h-1.5 w-1.5 rotate-45 bg-sun" />
    <span className={`h-px w-14 bg-gradient-to-l from-transparent ${dark ? 'to-sun/70' : 'to-gold'}`} />
  </div>
);
