import React, { useEffect, useRef, useState } from 'react';
import { Fingerprint, Target, Heart, Zap } from 'lucide-react';
import BackgroundMarquee from './BackgroundMarquee';

interface PillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  isVisible: boolean;
  index: number;
}

const PillarCard: React.FC<PillarProps> = ({ icon, title, description, delay, isVisible, index }) => (
  <div 
    className={`relative flex flex-col items-center text-center transition-all duration-1000 ease-[cubic-bezier(0.19,1,0.22,1)] transform-gpu p-6 rounded-2xl
    ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90'}`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    {/* Animated Card Background & Border (The Button Look) */}
    <div 
        className="absolute inset-0 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm -z-10 animate-neon-wave"
        style={{ animationDelay: `${index * 1.5}s` }} // Staggered wave delay
    ></div>

    {/* Floating Content Wrapper */}
    <div 
        className="flex flex-col items-center animate-float"
        style={{ animationDelay: `${index * 0.5}s` }}
    >
        {/* Icon Container with Glow Effect */}
        <div className="relative mb-5">
            {/* Animated Glow behind icon */}
            <div 
                className="absolute inset-0 bg-regilio-green/30 rounded-full blur-2xl animate-pulse" 
                style={{ animationDelay: `${index * 1.5}s` }}
            ></div>
            
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#111] border border-white/10 flex items-center justify-center group-hover:border-regilio-green/50 transition-all duration-500 shadow-2xl">
                <div className="text-white group-hover:text-regilio-green transition-colors duration-500 transform">
                {icon}
                </div>
            </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight group-hover:text-regilio-green transition-colors duration-300">
        {title}
        </h3>
        
        <p className="text-sm md:text-base text-neutral-400 font-sans leading-relaxed max-w-[260px] mx-auto opacity-90">
        {description}
        </p>
    </div>
  </div>
);

const VisionSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillarsRef = useRef<HTMLDivElement>(null);
  
  const [isQuoteVisible, setIsQuoteVisible] = useState(false);
  const [isPillarsVisible, setIsPillarsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // --- Observers ---
  useEffect(() => {
    // Quote Observer
    const quoteObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsQuoteVisible(true);
      },
      { threshold: 0.3 }
    );

    // Pillars Observer
    const pillarsObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsPillarsVisible(true);
      },
      { threshold: 0.2 } // Trigger a bit earlier
    );

    if (containerRef.current) quoteObserver.observe(containerRef.current);
    if (pillarsRef.current) pillarsObserver.observe(pillarsRef.current);

    return () => {
      quoteObserver.disconnect();
      pillarsObserver.disconnect();
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative w-full min-h-screen py-24 flex flex-col justify-center items-center overflow-hidden bg-transparent z-20"
    >
      <BackgroundMarquee text="VISION" />

      {/* Inject styles for animations */}
      <style>{`
        /* Physical Float Animation */
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }

        /* Neon Light Wave Animation */
        @keyframes neonWave {
            0%, 100% {
                box-shadow: 0 0 0px rgba(204,255,0,0);
                border-color: rgba(255,255,255,0.05);
                background-color: rgba(10,10,10,0.6);
            }
            50% {
                box-shadow: 0 0 40px rgba(204,255,0,0.25);
                border-color: rgba(204,255,0,0.6);
                background-color: rgba(15,15,15,0.9);
            }
        }
        .animate-neon-wave {
            animation: neonWave 4.5s ease-in-out infinite;
        }
      `}</style>

      {/* 
        Connector Beams 
        Visual vertical lines that appear to descend from the previous section and continue to the next 
        fading out at extremes to avoid hard cuts.
      */}
      <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-t from-white/10 to-transparent"></div>
      </div>

      {/* Ambient Fog/Glow - Smoother Fade In/Out */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[600px] md:h-[600px] bg-regilio-green/5 blur-[120px] rounded-full pointer-events-none transition-all duration-1000 ease-in-out ${isHovering ? 'scale-150 opacity-25' : 'scale-100 opacity-15'}`}></div>
      
      {/* Top & Bottom Gradient Vignettes for Soft Transitions */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/0 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/0 via-transparent to-transparent pointer-events-none"></div>

      <div className="relative z-20 w-full max-w-7xl px-6 flex flex-col items-center justify-between h-full gap-10 md:gap-14">
        
        {/* TOP SECTION: Header & Text */}
        <div className="flex flex-col items-center text-center w-full">
            
            {/* Header */}
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 animate-fade-up">
                Vision & Mission
            </h1>

            {/* Quote Block */}
            <div className="max-w-4xl mx-auto space-y-1 md:space-y-2 font-sans font-medium tracking-tight">
                {/* Line 1 */}
                <div className="overflow-hidden">
                    <h2 
                    className={`text-lg md:text-2xl lg:text-3xl text-neutral-500 transition-all duration-1000 ease-out delay-100 transform-gpu
                    ${isQuoteVisible ? 'translate-y-0 opacity-100 blur-0 scale-100' : 'translate-y-8 opacity-0 blur-sm scale-95'}`}
                    >
                    "In the ring, I learned greatness isn't raw power—
                    </h2>
                </div>

                {/* Line 2 */}
                <div className="overflow-hidden">
                    <h2 
                    className={`text-lg md:text-2xl lg:text-3xl text-neutral-500 transition-all duration-1000 ease-out delay-300 transform-gpu
                    ${isQuoteVisible ? 'translate-y-0 opacity-100 blur-0 scale-100' : 'translate-y-8 opacity-0 blur-sm scale-95'}`}
                    >
                    it's precision, adaptation, and potential.
                    </h2>
                </div>

                {/* Line 3 (Emphasis) */}
                <div className="overflow-hidden pt-2">
                    <div 
                        className={`inline-block transition-all duration-1000 ease-out delay-500 transform-gpu
                        ${isQuoteVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}
                    >
                         <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-regilio-green via-white to-regilio-green">
                            Technology should do the same."
                        </h2>
                    </div>
                </div>
            </div>

            {/* Signature Block */}
            <div 
                className={`mt-6 transition-all duration-1000 delay-700 ${isQuoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
                <div className="inline-block bg-white/5 border border-white/10 px-6 py-2 backdrop-blur-sm">
                    <span className="text-sm md:text-base text-regilio-green font-mono tracking-widest uppercase">— Regilio Tuur</span>
                </div>
            </div>

            {/* Subtle Interactive Element (Between text and pillars) */}
            <div 
                className={`mt-6 transition-all duration-1000 delay-[900ms] ${isQuoteVisible ? 'opacity-100' : 'opacity-0'}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <div className="relative group cursor-pointer p-4">
                    <Fingerprint 
                        className={`w-8 h-8 text-neutral-700 transition-all duration-500 ${isHovering ? 'text-regilio-green scale-110' : ''}`} 
                        strokeWidth={1}
                    />
                </div>
            </div>
        </div>

        {/* BOTTOM SECTION: Three Pillars - Compacted Spacing */}
        <div 
            ref={pillarsRef}
            className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 pt-4 pb-0"
        >
            <PillarCard 
                icon={<Target strokeWidth={1} className="w-10 h-10 md:w-12 md:h-12" />}
                title="Precision"
                description="Every detail matters. Progress is measurable."
                isVisible={isPillarsVisible}
                delay={0}
                index={0}
            />
            <PillarCard 
                icon={<Heart strokeWidth={1} className="w-10 h-10 md:w-12 md:h-12" />}
                title="Passion"
                description="True innovation comes from lived experience and relentless pursuit."
                isVisible={isPillarsVisible}
                delay={200}
                index={1}
            />
            <PillarCard 
                icon={<Zap strokeWidth={1} className="w-10 h-10 md:w-12 md:h-12" />}
                title="Performance"
                description="Technology should amplify human potential, not just record it."
                isVisible={isPillarsVisible}
                delay={400}
                index={2}
            />
        </div>

      </div>
    </section>
  );
};

export default VisionSection;