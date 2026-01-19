import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface DustParticle {
  x: number;
  y: number;
  z: number; // Depth factor (0.33, 0.66, 1.0) for 3 layers
  size: number;
  vx: number;
  vy: number;
  baseAlpha: number;
  phase: number;
}

const Hero: React.FC = () => {
  // --- STATE ---
  const [bootStep, setBootStep] = useState(0); 
  // 0: Void
  // 1: Atmosphere (Particles start drifting)
  // 2: IMPACT (Flash + Text Slam)
  // 3: 3.0 Ignition (Flicker)
  // 4: Perpetual State (Looping Lights)
  // 5: UI Reveal (Buttons/Text)
  
  const [btnOffset, setBtnOffset] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 }); // Use ref for performance in canvas loop

  // --- PARALLAX INPUT TRACKING ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position -1 to 1
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current = { x, y };
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // --- CINEMATIC BOOT SEQUENCE ---
  useEffect(() => {
    const timeline = [
        setTimeout(() => setBootStep(1), 500),   // 1. Atmosphere
        setTimeout(() => setBootStep(2), 1500),  // 2. BOOM: Text Slam + Flash
        setTimeout(() => setBootStep(3), 2200),  // 3. "3.0" Flicker Ignition
        setTimeout(() => setBootStep(4), 2800),  // 4. Perpetual Light Loop Starts
        setTimeout(() => setBootStep(5), 3200),  // 5. UI Fade In
    ];
    return () => timeline.forEach(clearTimeout);
  }, []);

  // --- SPACE DUST CANVAS ENGINE (MULTI-LAYER) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationId: number;

    // Create Dust Particles with distinct layers
    const particles: DustParticle[] = [];
    const particleCount = window.innerWidth < 768 ? 200 : 450; 

    for (let i = 0; i < particleCount; i++) {
      // Assign to one of 3 layers: Background (0.33), Mid (0.66), Foreground (1.0)
      const layerRandom = Math.random();
      let z = 1.0; 
      if (layerRandom < 0.5) z = 0.33; // 50% background
      else if (layerRandom < 0.8) z = 0.66; // 30% mid
      else z = 1.0; // 20% foreground

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: z, // Store depth
        size: (Math.random() * 1.5 + 0.5) * z, // Size scales with depth
        vx: (Math.random() - 0.5) * 0.2 * z,   // Speed scales with depth
        vy: (Math.random() - 0.5) * 0.2 * z,
        baseAlpha: Math.random() * 0.4 + 0.1, 
        phase: Math.random() * Math.PI * 2 
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const time = Date.now() * 0.001;
      const { x: mouseX, y: mouseY } = mouseRef.current;

      particles.forEach(p => {
        // 1. Linear Drift (Inertia)
        p.x += p.vx;
        p.y += p.vy;

        // 2. Organic Float (Sine Wave turbulence)
        // Scaled by Z for depth illusion (far things float less)
        const floatX = Math.sin(time + p.phase) * 0.3 * p.z;
        const floatY = Math.cos(time + p.phase) * 0.3 * p.z;

        // 3. Mouse Parallax (Max 8px shift)
        // Foreground shifts most, background shifts least.
        // Inverted movement for standard parallax feel.
        const parallaxX = -mouseX * 8 * p.z;
        const parallaxY = -mouseY * 8 * p.z;

        // 4. Screen Wrap (Virtual Coordinates)
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // 5. Draw
        // Calculate final render position
        const drawX = p.x + floatX + parallaxX;
        const drawY = p.y + floatY + parallaxY;

        ctx.fillStyle = `rgba(220, 220, 220, ${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- BUTTON MAGNETIC EFFECT ---
  const handleBtnMouseMove = (e: React.MouseEvent) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setBtnOffset({ x: x * 0.15, y: y * 0.15 }); 
  };
  
  const handleBtnLeave = () => {
    setBtnOffset({ x: 0, y: 0 });
  };

  return (
    <section 
      id="hero" 
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black perspective-1000"
    >
        {/* --- LAYER 0: THE DEEP VOID --- */}
        {/* Pitch black base */}
        <div className="absolute inset-0 bg-black z-0 pointer-events-none"></div>

        {/* --- LAYER 1: SPACE DUST (Canvas) --- */}
        {/* 
            Draws multi-layer particles.
        */}
        <canvas 
            ref={canvasRef}
            className={`absolute inset-0 z-0 transition-opacity duration-2000 ${bootStep >= 1 ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* --- LAYER 2: THE SPOTLIGHT (The Igniter) --- */}
        {/* 
            This layer moves back and forth. 
            mix-blend-mode: 'color-dodge' interacts with the dim particles on Layer 1.
        */}
        <div className={`absolute inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-1000 ${bootStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spotlight-sweep origin-center mix-blend-color-dodge">
                {/* The Beam Shape */}
                <div className="absolute top-0 left-[40%] w-[20%] h-full bg-gradient-to-r from-transparent via-[#ccff00] to-transparent skew-x-[-25deg] blur-[60px] opacity-40"></div>
                <div className="absolute top-0 left-[48%] w-[4%] h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-[-25deg] blur-[20px] opacity-80"></div>
            </div>
        </div>
        
        {/* --- LAYER 2.5: IMPACT FLASH (Cinematic Effect) --- */}
        {/* Flashes white exactly when text slams in */}
        <div 
            className={`absolute inset-0 bg-white pointer-events-none z-20 mix-blend-overlay transition-opacity duration-[50ms] ease-out
            ${bootStep === 2 ? 'opacity-40' : 'opacity-0'}`}
        ></div>


        {/* --- LAYER 3: CONTENT --- */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-7xl mx-auto px-6 mt-4">
            
            {/* 1. SYSTEM LABEL (UPDATED: Bigger, Lightbulb Flicker) */}
            <div className={`flex items-center gap-4 mb-16 transition-all duration-1000 ${bootStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="relative">
                    {/* Hard Core - Flickers erratic */}
                    <div className="w-3 h-3 bg-regilio-green rounded-full animate-bulb-flicker"></div>
                    {/* Soft Glow - Flickers slightly less */}
                    <div className="absolute inset-0 bg-regilio-green rounded-full blur-[8px] animate-bulb-flicker opacity-60"></div>
                </div>
                <span className="font-mono text-xs md:text-sm tracking-[0.5em] text-neutral-400 uppercase animate-text-flicker-subtle">
                    System Ready
                </span>
            </div>

            {/* 2. MAIN TITLE - MOVIE TRAILER REVEAL */}
            <div className="relative mb-8 select-none perspective-500">
                 <h1 className="relative flex items-center justify-center font-sans">
                    
                    {/* "REGILIO" */}
                    <div className="relative">
                        {/* 
                           ANIMATION LOGIC:
                           Start: Scale 2.0, Opacity 0, Blur 20px (Invisible)
                           Step 2 (Impact): Slam to Scale 1.0, Blur 0px, Opacity 100 instantly with bounce.
                        */}
                        <span 
                            className={`block text-[13vw] md:text-[160px] leading-[0.8] font-black tracking-tighter text-[#eaeaea]
                                transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                                ${bootStep >= 2 ? 'scale-100 opacity-100 blur-0 translate-z-0' : 'scale-[2.0] opacity-0 blur-xl translate-z-[100px]'}
                            `}
                        >
                            REGILIO
                        </span>
                        
                        {/* Perpetual Neon Sweep (Fades in after impact) */}
                        <span 
                            className={`absolute inset-0 text-[13vw] md:text-[160px] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-transparent via-[#ccff00] to-transparent bg-[length:200%_auto]
                                ${bootStep >= 4 ? 'animate-shine-infinite opacity-100' : 'opacity-0'}
                            `}
                            aria-hidden="true"
                        >
                            REGILIO
                        </span>
                    </div>

                    {/* "3.0" */}
                    <div className="relative ml-4 md:ml-8">
                         {/* Base Text - Appears slightly after REGILIO */}
                         <span 
                            className={`block text-[13vw] md:text-[160px] leading-[0.8] font-black tracking-tighter text-[#eaeaea]
                                transition-all duration-[600ms] ease-out delay-100
                                ${bootStep >= 2 ? 'translate-x-0 opacity-100 blur-0' : 'translate-x-12 opacity-0 blur-lg'}
                            `}
                        >
                            3.0
                        </span>

                        {/* Neon Ignition - Flickers On later */}
                        <span 
                             className={`absolute inset-0 text-[13vw] md:text-[160px] leading-[0.8] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#ccff00] to-transparent
                                ${bootStep >= 3 ? 'animate-flicker-on opacity-100' : 'opacity-0'}
                             `}
                             style={{ filter: 'drop-shadow(0 0 30px rgba(204,255,0,0.6))' }}
                        >
                            3.0
                        </span>
                    </div>

                 </h1>
            </div>

            {/* 3. SUBTITLES & UI (Cascading Fade) */}
            <div className={`transition-all duration-1000 ease-out flex flex-col items-center gap-6 ${bootStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                 <h2 className="text-white/90 font-bold tracking-[0.2em] uppercase text-sm md:text-2xl drop-shadow-md">
                     The Evolved Version of a Boxing Legend
                 </h2>
                 <p className="text-neutral-400 font-mono text-xs md:text-base leading-relaxed tracking-wide max-w-2xl">
                     The algorithm of a champion. Experience the evolution of a<br className="hidden md:block"/>
                     legacy engineered for the future.
                 </p>
            </div>

            {/* 4. BUTTONS */}
            <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 mt-12 transition-all duration-1000 delay-200 ease-out ${bootStep >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <button
                    ref={btnRef}
                    onMouseMove={handleBtnMouseMove}
                    onMouseLeave={handleBtnLeave}
                    className="group relative"
                    style={{ 
                        transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
                        transition: 'transform 0.1s ease-out' 
                    }}
                >
                    {/* Passive Glow (Always on, pulsing) */}
                    <div className="absolute -inset-3 bg-regilio-green/30 rounded-lg blur-xl opacity-60 animate-pulse-slow"></div>

                    <div className="relative bg-[#ccff00] hover:bg-white text-black px-8 py-4 font-bold uppercase tracking-widest text-xs flex items-center gap-3 transition-colors duration-300 overflow-hidden">
                        
                        {/* Passive Sheen Animation (Loops continuously) */}
                        <div className="absolute top-0 left-[-150%] w-[100%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-20deg] animate-sheen-loop"></div>

                        <span className="relative z-10">Enter Experience</span>
                        <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </button>

                <button className="group relative text-neutral-500 hover:text-white transition-colors duration-300 text-xs font-mono uppercase tracking-[0.2em] py-2">
                    View Data
                    <span className="absolute bottom-0 left-0 h-[1px] bg-regilio-green w-0 group-hover:w-full transition-all duration-500 ease-out"></span>
                </button>
            </div>

        </div>

        {/* --- ANIMATIONS --- */}
        <style>{`
            /* Spotlight Sweep - The beam that ignites particles */
            @keyframes spotlight-sweep {
                0% { transform: translateX(-40%) skewX(10deg); }
                50% { transform: translateX(40%) skewX(-10deg); }
                100% { transform: translateX(-40%) skewX(10deg); }
            }
            .animate-spotlight-sweep {
                animation: spotlight-sweep 15s ease-in-out infinite;
            }

            /* Perpetual Shine Text */
            @keyframes shine-infinite {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
            }
            .animate-shine-infinite {
                animation: shine-infinite 4s linear infinite;
            }

            /* Neon Flicker Ignition */
            @keyframes flicker-on {
                0% { opacity: 0; }
                5% { opacity: 1; }
                10% { opacity: 0; }
                15% { opacity: 0.5; }
                20% { opacity: 0; }
                40% { opacity: 1; }
                45% { opacity: 0.2; }
                50% { opacity: 1; }
                100% { opacity: 1; }
            }
            .animate-flicker-on {
                animation: flicker-on 0.8s linear forwards;
            }

            /* Erratic Old Lightbulb Flicker (High Contrast) */
            @keyframes bulb-flicker {
                0%, 100% { opacity: 1; }
                3% { opacity: 0.2; }
                6% { opacity: 1; }
                7% { opacity: 0.1; }
                8% { opacity: 1; }
                9% { opacity: 1; }
                10% { opacity: 0.1; }
                11% { opacity: 0.5; }
                20% { opacity: 1; }
                40% { opacity: 1; }
                41% { opacity: 0.4; }
                42% { opacity: 1; }
                60% { opacity: 1; }
                62% { opacity: 0.2; }
                64% { opacity: 1; }
            }
            .animate-bulb-flicker {
                animation: bulb-flicker 4s steps(1, end) infinite;
            }

            /* Subtle Text Flicker (Low Contrast) */
            @keyframes text-flicker-subtle {
                0%, 100% { opacity: 0.8; }
                35% { opacity: 0.8; }
                36% { opacity: 0.4; }
                37% { opacity: 0.8; }
                70% { opacity: 0.8; }
                71% { opacity: 0.6; }
                72% { opacity: 0.8; }
            }
            .animate-text-flicker-subtle {
                animation: text-flicker-subtle 4s linear infinite;
            }

            /* Passive Button Sheen Loop */
            @keyframes sheen-loop {
                0% { left: -150%; }
                40% { left: 150%; }
                100% { left: 150%; } /* Pause */
            }
            .animate-sheen-loop {
                animation: sheen-loop 3s cubic-bezier(0.19, 1, 0.22, 1) infinite;
            }
        `}</style>
    </section>
  );
};

export default Hero;