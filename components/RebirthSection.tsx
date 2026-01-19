import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, Activity, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';

const RebirthSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Animation States
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  // Interaction States
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Refs for animation frame loop
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const progressRef = useRef<number>(0); // Keep track of current progress for resume/decay logic

  // --- 1. ENTRY/EXIT OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setIsLeaving(false);
        } else {
          // If we scroll past the bottom, trigger exit fade
          if (entry.boundingClientRect.top < 0) {
            setIsLeaving(true);
          } else {
            // Scrolling back up above usually resets or stays idle
            // We keep it visible if just peeking, but here we enforce strict entry
          }
        }
      },
      { threshold: 0.4 } // Wait until 40% visible to trigger the "Eclipse"
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- 2. HOLD INTERACTION LOGIC ---
  
  // Easing function for smooth fill
  const easeOutQuad = (t: number) => t * (2 - t);

  const startHold = () => {
    if (isUnlocked) return;
    setIsHolding(true);
    startTimeRef.current = performance.now();
    
    // We start from current progress (allows pausing/resuming if desired, but mostly 0)
    const startProgress = progressRef.current;
    
    cancelAnimationFrame(requestRef.current);
    
    const duration = 1200; // 1.2s to unlock

    const animate = (time: number) => {
      const elapsed = time - startTimeRef.current;
      const linearProgress = Math.min(elapsed / duration, 1);
      
      // Calculate new percentage (0-100)
      // If we want resume behavior: startProgress + (100 - startProgress) * ease(linearProgress)
      // But for "Reset on release" behavior, usually linear fill from 0 is cleaner visually.
      // Let's implement smooth fill from current spot.
      const target = 100;
      const distance = target - startProgress;
      const current = startProgress + (distance * easeOutQuad(linearProgress));
      
      setProgress(current);
      progressRef.current = current;

      if (linearProgress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Completed
        completeUnlock();
      }
    };
    
    requestRef.current = requestAnimationFrame(animate);
  };

  const endHold = () => {
    if (isUnlocked) return;
    setIsHolding(false);
    cancelAnimationFrame(requestRef.current);
    
    // Smoothly decay back to 0
    const decay = () => {
      if (progressRef.current <= 0.5) {
        setProgress(0);
        progressRef.current = 0;
        return;
      }

      // Decay speed
      progressRef.current -= 3; 
      setProgress(progressRef.current);
      requestRef.current = requestAnimationFrame(decay);
    };
    
    decay();
  };

  const completeUnlock = () => {
    setIsUnlocked(true);
    setIsHolding(false);
    setProgress(100);
    // Optional: Trigger global state update or analytics here
  };

  // Accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !isHolding && !isUnlocked) {
      e.preventDefault();
      startHold();
    }
  };
  const handleKeyUp = (e: React.KeyboardEvent) => {
    if ((e.code === 'Space' || e.code === 'Enter') && !isUnlocked) {
      e.preventDefault();
      endHold();
    }
  };

  // reset for demo purposes if needed
  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsUnlocked(false);
    setProgress(0);
    progressRef.current = 0;
  };

  return (
    <section 
      ref={containerRef}
      id="rebirth"
      className="relative w-full min-h-screen flex items-center justify-center py-24 overflow-hidden z-30 bg-[#040404]"
      aria-label="Rebirth Section"
    >
      {/* --- BACKGROUND AMBIENCE --- */}
      {/* Deep space void + subtle grid from global styles, adding local vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#040404_100%)] pointer-events-none z-0"></div>
      
      <div className="max-w-[1400px] w-full mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* --- LEFT COLUMN: NARRATIVE (Fades in) --- */}
        <div className={`flex flex-col gap-8 transition-all duration-1000 delay-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}>
            
            {/* Header Group */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-500 ${isUnlocked ? 'bg-regilio-green shadow-[0_0_8px_#ccff00]' : 'bg-neutral-600'}`}></span>
                    <span className="text-regilio-green font-mono text-xs tracking-[0.3em] uppercase opacity-80">
                        {isUnlocked ? '01 / 01 — Protocol_Active' : '00 / 00 — Rebirth_Protocol'}
                    </span>
                </div>
                
                <h2 className="text-5xl md:text-8xl font-black text-[#F2F2F2] tracking-tighter uppercase leading-[0.9] mb-6">
                    The<br/>Return
                </h2>
                <h3 className="text-xl md:text-2xl text-white font-medium tracking-tight">
                    10 years offline. One decision to rebuild.
                </h3>
            </div>

            {/* Body Copy */}
            <div className="border-l-2 border-white/10 pl-6 py-1">
                <p className="text-[rgba(242,242,242,0.65)] font-sans text-lg leading-relaxed max-w-md">
                    No spotlight. No noise. Only work.<br/>
                    <span className="text-white">Now the system reconnects.</span>
                </p>
            </div>

            {/* CTA Row */}
            <div className={`flex flex-col sm:flex-row gap-6 mt-4 transition-opacity duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                <button className="group relative bg-regilio-green text-black px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors duration-300 overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                        {isUnlocked ? 'Enter System' : 'Locked'}
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 bg-white/50 transform -translate-x-full group-hover:animate-[shine_0.5s_linear]"></div>
                </button>
                
                <button className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] hover:text-white transition-colors text-left flex items-center gap-2">
                    <Activity className="w-3 h-3" />
                    View Reset Log
                </button>
            </div>
        </div>

        {/* --- RIGHT COLUMN: THE PURITY CHAMBER (Eclipse Transition) --- */}
        <div className="relative w-full aspect-square md:aspect-[4/5] lg:aspect-square flex items-center justify-center perspective-1000">
            
            {/* 
               ECLIPSE REVEAL CONTAINER 
               This container handles the "Aperture" opening effect.
               It clips the inner white panel.
            */}
            <div 
                className={`
                    relative w-full h-full transition-all duration-[1.8s] ease-[cubic-bezier(0.16,1,0.3,1)]
                    ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                    ${isLeaving ? 'opacity-30 blur-sm scale-95' : ''}
                `}
                style={{
                    // The magic reveal: Circle expands from 0% to 150% radius
                    clipPath: isVisible ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
                    willChange: 'clip-path'
                }}
            >
                {/* 
                   THE PANEL VISUAL
                   Premium white look: Gradient, Noise, Inner Border, Shadow 
                */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#ffffff] to-[#f0f0f0] rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    
                    {/* Noise Texture Overlay */}
                    <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
                    
                    {/* Inner 1px Border Highlight */}
                    <div className="absolute inset-0 border border-white/50 pointer-events-none z-20 mix-blend-overlay"></div>
                    <div className="absolute inset-[1px] border border-black/5 pointer-events-none z-20"></div>

                    {/* Ambient Glow Spill (Internal) */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-regilio-green/5 blur-[100px] rounded-full pointer-events-none transition-opacity duration-1000 ${isUnlocked ? 'opacity-100' : 'opacity-0'}`}></div>

                    {/* --- PANEL UI CONTENT --- */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-between text-[#111] z-10">
                        
                        {/* Top Status Bar */}
                        <div className="flex justify-between items-start font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                            <span>Reboot_Core_01</span>
                            <div className="flex items-center gap-2">
                                <span className={`transition-colors duration-300 ${isUnlocked ? 'text-regilio-green font-bold' : 'text-neutral-500'}`}>
                                    {isUnlocked ? 'SIGNAL_LOCKED' : 'SYNCHRONIZING...'}
                                </span>
                                <div className={`w-1.5 h-1.5 rounded-full ${isUnlocked ? 'bg-regilio-green shadow-[0_0_5px_#ccff00]' : 'bg-neutral-300 animate-pulse'}`}></div>
                            </div>
                        </div>

                        {/* --- CENTER INTERACTION CORE --- */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
                            
                            {/* Interactive Zone */}
                            <div 
                                className="relative w-64 h-64 md:w-72 md:h-72 cursor-pointer select-none group outline-none"
                                onMouseDown={startHold}
                                onMouseUp={endHold}
                                onMouseLeave={endHold}
                                onTouchStart={(e) => { e.preventDefault(); startHold(); }}
                                onTouchEnd={(e) => { e.preventDefault(); endHold(); }}
                                onKeyDown={handleKeyDown}
                                onKeyUp={handleKeyUp}
                                role="button"
                                tabIndex={0}
                                aria-label={isUnlocked ? "System Online" : "Press and hold to connect"}
                            >
                                {/* 1. Progress Ring (SVG) */}
                                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                                    {/* Background Track */}
                                    <circle 
                                        cx="50%" cy="50%" r="46%" 
                                        fill="none" 
                                        stroke="#e5e5e5" 
                                        strokeWidth="1" 
                                    />
                                    {/* Animated Fill */}
                                    <circle 
                                        cx="50%" cy="50%" r="46%" 
                                        fill="none" 
                                        stroke="#ccff00" 
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        pathLength="100"
                                        strokeDasharray="100"
                                        strokeDashoffset={100 - progress}
                                        className="transition-all duration-75 ease-linear"
                                        style={{ filter: 'drop-shadow(0 0 4px rgba(204,255,0,0.5))' }}
                                    />
                                </svg>

                                {/* 2. Rotating Detail Rings (Ambient) */}
                                <div className={`absolute inset-0 rounded-full border border-dashed border-neutral-300 pointer-events-none transition-all duration-[2000ms]
                                    ${isUnlocked ? 'opacity-0 scale-110' : 'opacity-30 scale-100 animate-[spin_60s_linear_infinite]'}
                                `}></div>

                                {/* 3. The Central Core */}
                                <div className={`absolute inset-[15%] bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center transition-all duration-500 ease-out
                                    ${isHolding && !isUnlocked ? 'scale-95 shadow-inner' : 'scale-100'}
                                    ${isUnlocked ? 'shadow-[0_0_60px_rgba(204,255,0,0.4)]' : ''}
                                `}>
                                    {/* Pulse Effect when holding */}
                                    <div className={`absolute inset-0 rounded-full bg-regilio-green/10 transition-transform duration-1000 ${isHolding && !isUnlocked ? 'scale-125 opacity-100' : 'scale-100 opacity-0'}`}></div>

                                    {/* Icon State Switch */}
                                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                                        {isUnlocked ? (
                                            <div className="animate-fade-up flex flex-col items-center">
                                                <CheckCircle2 className="w-10 h-10 text-regilio-green mb-2 drop-shadow-sm" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-800">System<br/>Online</span>
                                                
                                                {/* Reset Logic (Hidden micro interaction) */}
                                                <button 
                                                    onClick={handleReset}
                                                    className="mt-6 text-[9px] text-neutral-300 hover:text-red-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                    title="Reset System"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Reset
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`transition-all duration-300 flex flex-col items-center ${isHolding ? 'scale-90 opacity-50' : 'scale-100 opacity-100'}`}>
                                                <Lock className="w-8 h-8 text-neutral-300 mb-3 group-hover:text-neutral-800 transition-colors" />
                                                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400 group-hover:text-neutral-600">
                                                    Hold to<br/>Connect
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Metadata */}
                        <div className="flex justify-between items-end border-t border-black/5 pt-4">
                            <div className="font-mono text-[9px] text-neutral-400 uppercase tracking-widest leading-relaxed">
                                Sys_Ver: 3.0.1<br/>
                                <span className={isUnlocked ? 'text-regilio-green' : ''}>Status: {isUnlocked ? 'Active' : 'Standby'}</span>
                            </div>
                            
                            {/* Decorative Barcode-ish lines */}
                            <div className="flex gap-1 h-3 items-end opacity-20">
                                <div className="w-[1px] h-full bg-black"></div>
                                <div className="w-[1px] h-2 bg-black"></div>
                                <div className="w-[1px] h-full bg-black"></div>
                                <div className="w-[2px] h-1 bg-black"></div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* --- EXTERNAL GLOW SPILL (Outside Eclipse) --- */}
                {/* This glow appears BEHIND the panel but is revealed by the same clip-path if we put it inside, 
                    OR we can make it part of the 'Eclipse' by placing it in the clipped container. 
                    Let's place a faint white glow behind the panel inside this container. */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-white blur-[80px] -z-10 opacity-20"></div>

            </div>
        </div>

      </div>
    </section>
  );
};

export default RebirthSection;