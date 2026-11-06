import { Spark } from '../world';

export const Ornament = ({ className, dark }: { className?: string; dark?: boolean }) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ''}`} aria-hidden="true">
    <span className={`h-px w-12 bg-gradient-to-r from-transparent ${dark ? 'to-champagne' : 'to-gold'}`} />
    <Spark className="h-4 w-4" />
    <span className={`h-px w-12 bg-gradient-to-l from-transparent ${dark ? 'to-champagne' : 'to-gold'}`} />
  </div>
);
