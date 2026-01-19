import React, { useRef, useState, useEffect } from 'react';
import BackgroundMarquee from './BackgroundMarquee';

const RadicalDecisionSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const sectionHeight = rect.height;

      // sticky logic: progress 0 = Section top hits viewport top (Sticky Lock starts)
      // progress 1 = Section bottom hits viewport bottom (Sticky Lock ends)
      const rawProgress = -rect.top / (sectionHeight - viewportHeight);
      
      const p = Math.max(0, Math.min(1, rawProgress));
      setProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- ANIMATION TIMELINE HELPERS ---

  const mapRange = (start: number, end: number, value: number) => {
    return Math.max(0, Math.min(1, (value - start) / (end - start)));
  };

  const easeInExpo = (x: number): number => {
    return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
  };

  // --- PHASE 0: ENTERING THE VOID (0% - 15%) ---
  const voidOpacity = mapRange(0.0, 0.15, progress);

  // --- PHASE 1: THE IGNITION SEQUENCE (15% - 40%) ---
  
  // 1.1 Anamorphic Flare
  const flareProgress = mapRange(0.15, 0.25, progress);
  const flareWidth = flareProgress * 150; 
  const flareOpacity = mapRange(0.15, 0.20, progress) - mapRange(0.25, 0.35, progress);

  // 1.2 Main Supernova (The sphere)
  const lightProgress = mapRange(0.20, 0.40, progress);
  const easedLight = easeInExpo(lightProgress);
  const scaleValue = easedLight * 150; 
  
  // 1.3 The Flash (Impact Frame)
  const flashOpacity = mapRange(0.38, 0.40, progress) - mapRange(0.40, 0.45, progress);

  // 1.4 Background Fill (Solid White takeover)
  const bgOpacity = mapRange(0.38, 0.40, progress);

  // --- PHASE 2: THE IDENTITY REVEAL (35% - 60%) ---
  // "REGILIO 3.0" Text Sequence
  const identityIn = mapRange(0.35, 0.45, progress);
  const identityOut = mapRange(0.50, 0.60, progress);
  const identityOpacity = identityIn - identityOut; 
  
  // Text Animation
  const textBlur = (1 - identityIn) * 40; 
  const textScale = 2 - (identityIn * 1); 
  const textSpacing = (1 - identityIn) * 2; 

  // --- PHASE 3: THE NARRATIVE CONTENT (60% - 100%) ---
  const contentProgress = mapRange(0.6, 1.0, progress);

  const block1Opacity = mapRange(0.0, 0.2, contentProgress);
  const block1Y = 100 - (mapRange(0.0, 0.2, contentProgress) * 100); 

  const block2Opacity = mapRange(0.2, 0.5, contentProgress);
  const block2Y = 100 - (mapRange(0.2, 0.5, contentProgress) * 100);

  const block3Opacity = mapRange(0.5, 0.8, contentProgress);
  const block3Y = 100 - (mapRange(0.5, 0.8, contentProgress) * 100);

  return (
    <section 
      ref={sectionRef} 
      id="radical-decision"
      className="relative w-full h-[450vh] bg-transparent"
    >
      <style>{`
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-2deg); }
          40% { transform: skew(2deg); }
          60% { transform: skew(-1deg); }
          80% { transform: skew(1deg); }
          100% { transform: skew(0deg); }
        }
        .animate-glitch-skew {
          animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        }
        @keyframes text-flicker {
          0% { opacity: 0.1; }
          2% { opacity: 1; }
          8% { opacity: 0.1; }
          9% { opacity: 1; }
          12% { opacity: 0.1; }
          20% { opacity: 1; }
          25% { opacity: 1; }
          30% { opacity: 0.1; }
          70% { opacity: 1; }
          72% { opacity: 0.2; }
          77% { opacity: 0.9; }
          100% { opacity: 1; }
        }
        .animate-text-flicker {
            animation: text-flicker 2s linear infinite;
        }
      `}</style>

      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex items-center justify-center">
        
        {/* =========================================
            LAYER 0: TOP GRADIENT (Seamless Blend)
           ========================================= */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#050505] via-[#050505]/80 to-transparent z-10 pointer-events-none transition-opacity duration-500"
             style={{ opacity: 1 - voidOpacity }} 
        ></div>

        {/* =========================================
            LAYER 1: THE VOID (Base - Solid Black)
           ========================================= */}
        <div 
            className="absolute inset-0 bg-[#050505] z-0"
            style={{ opacity: voidOpacity }} 
        ></div>

        {/* =========================================
            LAYER 2: THE IGNITION (Cinematic Light)
           ========================================= */}
        
        {/* 2.1 Anamorphic Flare */}
        <div 
            className="absolute z-10 h-[2px] bg-white shadow-[0_0_20px_10px_rgba(255,255,255,0.8)] mix-blend-screen pointer-events-none"
            style={{
                width: `${flareWidth}vw`,
                opacity: flareOpacity,
                transform: 'scaleY(1)',
            }}
        ></div>
        <div 
            className="absolute z-10 h-[200px] w-[2px] bg-white/20 blur-xl mix-blend-screen pointer-events-none"
             style={{
                opacity: flareOpacity,
                transform: 'scaleX(1) rotate(0deg)',
            }}
        ></div>

        {/* 2.2 The Supernova (Main Expansion) */}
        <div 
            className="absolute z-10 rounded-full pointer-events-none mix-blend-screen"
            style={{
                width: '10vw',
                height: '10vw',
                background: 'radial-gradient(circle, #FFFFFF 20%, #CCCCCC 60%, transparent 100%)', 
                transform: `scale(${scaleValue})`,
                opacity: 1, 
                willChange: 'transform',
                boxShadow: '0 0 150px 80px rgba(255,255,255,0.8)'
            }}
        ></div>
        
        {/* 2.3 The Flash (Impact Frame) */}
        <div 
            className="absolute inset-0 bg-white z-20 pointer-events-none mix-blend-overlay"
            style={{ opacity: flashOpacity * 3 }} 
        ></div>

        {/* 2.4 The Aftermath (Solid White Background) */}
        <div 
            className="absolute inset-0 bg-[#FAFAFA] z-10 pointer-events-none"
            style={{ opacity: bgOpacity }}
        >
             {/* Subtle paper/noise texture on white to avoid flat look */}
             <div className="absolute inset-0 bg-noise opacity-50 mix-blend-multiply"></div>

             {/* Marquee for the white background state - using DECISION */}
             <BackgroundMarquee text="DECISION" opacity="opacity-[0.05]" className="text-black" />
        </div>

        {/* =========================================
            LAYER 3: THE IDENTITY ("REGILIO 3.0") - MONOCHROME MODE
           ========================================= */}
        <div 
            className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none overflow-visible"
            style={{
                opacity: identityOpacity,
                transform: `scale(${textScale})`,
                filter: `blur(${textBlur}px)`,
                letterSpacing: `${textSpacing}em`
            }}
        >
            <div className="relative">
                {/* Main Text - Solid Black */}
                <h1 className="text-[12vw] md:text-[160px] font-black tracking-tighter leading-none text-black relative z-10 drop-shadow-sm">
                    REGILIO
                </h1>
                
                {/* Glitch Echoes - Greyscale */}
                <h1 className="absolute top-0 left-0 text-[12vw] md:text-[160px] font-black tracking-tighter leading-none text-neutral-400 opacity-60 z-0 animate-glitch-skew mix-blend-multiply" style={{ transform: 'translate(-4px, 0)' }}>
                    REGILIO
                </h1>
                 <h1 className="absolute top-0 left-0 text-[12vw] md:text-[160px] font-black tracking-tighter leading-none text-neutral-600 opacity-60 z-0 animate-glitch-skew mix-blend-multiply" style={{ animationDirection: 'reverse', transform: 'translate(4px, 0)' }}>
                    REGILIO
                </h1>
            </div>

            <div className="flex items-center gap-6 md:gap-10 mt-4 md:mt-8">
                {/* BARS - Left (Black) */}
                <div 
                    className="h-[4px] md:h-[6px] w-0 md:w-32 bg-black animate-[expand_0.5s_ease-out_forwards]" 
                    style={{ width: `${identityIn * 140}px` }}
                ></div>
                
                {/* 3.0 Text - Clean Black (No Shadow) */}
                <span className="relative z-10 text-5xl md:text-7xl font-mono font-bold text-black tracking-widest animate-text-flicker">
                    3.0
                </span>
                
                {/* BARS - Right */}
                <div 
                    className="h-[4px] md:h-[6px] w-0 md:w-32 bg-black animate-[expand_0.5s_ease-out_forwards]" 
                    style={{ width: `${identityIn * 140}px` }}
                ></div>
            </div>
            
            {/* UPDATED SUBTITLE: The Rebirth of a Legend */}
            <div className="mt-12 md:mt-16 relative">
                 <p className="relative z-10 font-mono text-black text-xl md:text-3xl font-bold tracking-[0.2em] uppercase animate-pulse">
                    The Rebirth of a Legend
                </p>
            </div>
        </div>

        {/* =========================================
            LAYER 4: THE NARRATIVE CONTENT (Monochrome Mode)
           ========================================= */}
        <div className="relative z-40 max-w-6xl w-full px-6 md:px-12 flex flex-col gap-24 pt-[10vh]">
            
            {/* Block 1: The Title */}
            <div 
                style={{ opacity: block1Opacity, transform: `translateY(${block1Y}px)` }}
                className="text-center md:text-left relative"
            >
                {/* Large Background Typography - Light Grey */}
                <span className="absolute -top-32 -left-20 text-[200px] font-black text-neutral-100 -z-10 select-none hidden md:block opacity-60">
                    SHIFT
                </span>

                <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                    <span className="w-2 h-2 bg-black rounded-full shadow-[0_0_5px_rgba(0,0,0,0.2)]"></span>
                    <span className="text-black font-mono text-xs tracking-[0.4em] uppercase font-bold">
                        New Protocol
                    </span>
                </div>
                
                <h2 className="text-6xl md:text-9xl font-black text-black tracking-tighter uppercase leading-[0.85] mb-10">
                    The Radical<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-neutral-500">Decision</span>
                </h2>

                <p className="text-2xl md:text-3xl font-sans font-medium leading-relaxed text-[#111] max-w-3xl">
                    In 2014, with new offers on the table—book, film, and television—Regilio stepped out of the public eye. Not to disappear. <span className="text-white font-black bg-black px-1">To evolve.</span>
                </p>
            </div>

            {/* Content Split Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32">
                
                {/* Block 2 */}
                <div 
                    style={{ opacity: block2Opacity, transform: `translateY(${block2Y}px)` }}
                    className="relative pl-8 border-l-4 border-neutral-200 group hover:border-black transition-colors duration-500"
                >
                    <div className="absolute top-0 left-[-4px] w-1 h-0 bg-black group-hover:h-full transition-all duration-700 ease-out"></div>
                    
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-neutral-500 group-hover:text-black transition-colors">
                        01 // The Outsider Feeling
                    </h3>
                    <p className="text-xl font-sans leading-relaxed text-neutral-800 group-hover:text-black transition-colors">
                        A private moment reshaped his direction: a closed-circle seminar built around one question—where the puck is going. In that room, surrounded by a new language, Regilio felt the outsider feeling again—not weakness, but fuel. The kind of moment that reminds you there’s still more to learn. And one inspiration became a constant reference: Steve Jobs—design as identity, simplicity as power, and thinking years ahead before the world catches up.
                    </p>
                </div>

                {/* Block 3 */}
                <div 
                    style={{ opacity: block3Opacity, transform: `translateY(${block3Y}px)` }}
                    className="relative pl-8 border-l-4 border-neutral-200 group hover:border-black transition-colors duration-500"
                >
                    <div className="absolute top-0 left-[-4px] w-1 h-0 bg-black group-hover:h-full transition-all duration-700 ease-out"></div>
                    
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] mb-6 text-neutral-500 group-hover:text-black transition-colors">
                        02 // The Evolution Begins
                    </h3>
                    <p className="text-xl font-sans leading-relaxed text-neutral-800 group-hover:text-black transition-colors">
                        Instead of stepping back, he leaned in. Regilio immersed himself in technology—learning the language of innovation and applying the same discipline that made him a champion in the ring. And with his eye for style and detail, he brought something rare to the process: creative instinct, shaped by years of self-expression beyond the sport.
                    </p>
                </div>
            </div>

            {/* Bottom Decoration for White Page */}
            <div 
                style={{ opacity: block3Opacity }} 
                className="absolute -bottom-48 right-0 pointer-events-none select-none overflow-hidden"
            >
                 <div className="text-[15vw] leading-none font-black text-neutral-100 opacity-80">
                    3.0
                 </div>
            </div>

        </div>

      </div>
    </section>
  );
};

export default RadicalDecisionSection;