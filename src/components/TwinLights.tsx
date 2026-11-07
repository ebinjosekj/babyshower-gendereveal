// Two small lights, one soft blue and one soft pink, circling each other. A wink at the reveal; it says nothing about the answer.
export default function TwinLights({ caption = 'Boy or girl? Only a little time will tell.', className = '' }: { caption?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative h-24 w-24" aria-hidden="true">
        <span className="absolute inset-1 rounded-full border border-white/15" />
        <span className="ambient absolute inset-1 rounded-full border border-sun/50" style={{ animation: 'tickRing 3s ease-out infinite' }} />
        <span className="ambient absolute inset-0" style={{ animation: 'orbit 8s linear infinite' }}>
          <span className="absolute left-[-5px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%,#E8F4FF,#7FB6E6 60%,#2C5F8F)', boxShadow: '0 0 18px 5px rgba(127,182,230,.65)' }} />
          <span className="absolute right-[-5px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%,#FFE8F1,#F2A6C0 60%,#9C3E65)', boxShadow: '0 0 18px 5px rgba(242,166,192,.65)' }} />
        </span>
        <span className="ambient absolute left-1/2 top-1/2 h-2 w-2 -ml-1 -mt-1 rotate-45 bg-sun" style={{ animation: 'heartThump 2.4s ease-in-out infinite' }} />
      </div>
      <p className="mt-4 font-display text-xl font-light italic text-ivory [text-shadow:0_2px_20px_rgba(0,0,0,.8)] sm:text-2xl">{caption}</p>
    </div>
  );
}
