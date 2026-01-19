import React, { useEffect, useState, useRef } from 'react';

interface LoaderProps {
  onComplete: () => void;
}

const TOTAL_DURATION = 3000; // 3 Seconds for 3-2-1 Countdown

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>(0);
  
  // Terminal log messages mapped to progress
  const bootMessages = [
    "INITIALIZING_KERNEL...",
    "MOUNTING_FILESYSTEM...",
    "LOADING_ASSETS...",
    "DECRYPTING_DATA_STREAM...",
    "OPTIMIZING_NEURAL_NET...",
    "CONNECTING_TO_HOST...",
    "BYPASSING_SECURITY...",
    "SYSTEM_READY"
  ];

  useEffect(() => {
    const animate = (time: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = time;
      }

      const elapsed = time - startTimeRef.current;
      const remaining = Math.max(0, TOTAL_DURATION - elapsed);
      
      setTimeLeft(remaining);

      if (remaining > 0) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we hit exactly 0 visual state
        setTimeLeft(0);
        setTimeout(onComplete, 200); // Short buffer before unmounting
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [onComplete]);

  // Calculations for display
  const progress = Math.min(100, ((TOTAL_DURATION - timeLeft) / TOTAL_DURATION) * 100);
  
  // Precise Countdown: Just Seconds (3, 2, 1)
  const secs = Math.ceil(timeLeft / 1000);
  const formattedTime = secs.toString().padStart(2, '0');
  
  // Active Log Logic
  const logIndex = Math.min(
    bootMessages.length - 1, 
    Math.floor((progress / 100) * (bootMessages.length - 1))
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden cursor-none text-white selection:bg-regilio-green selection:text-black">
       {/* --- BACKGROUND LAYER --- */}
       {/* Tech Grid */}
       <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] opacity-20 pointer-events-none"></div>
       {/* Vignette */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] pointer-events-none"></div>

       {/* --- CENTRAL CONTENT --- */}
       <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center">
           
           {/* Top Label */}
           <h2 className="text-regilio-green font-mono text-lg md:text-2xl font-bold tracking-[0.3em] mb-4 uppercase animate-pulse">
               Page Loading In
           </h2>

           {/* HUGE COUNTDOWN TIMER (SECONDS ONLY) */}
           <div className="relative mb-16 flex items-center justify-center">
               <h1 className="text-[20vw] md:text-[220px] font-black leading-none tracking-tighter tabular-nums text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]">
                   {formattedTime}
               </h1>
               
               {/* Glitch Overlay Effect */}
               <h1 className="absolute inset-0 text-center text-[20vw] md:text-[220px] font-black leading-none tracking-tighter tabular-nums text-regilio-green opacity-40 animate-glitch-skew mix-blend-screen pointer-events-none">
                   {formattedTime}
               </h1>
           </div>

           {/* PROMINENT PROGRESS BAR */}
           <div className="w-full relative group">
               {/* Heavy Bar Container */}
               <div className="w-full h-8 md:h-10 bg-[#111] border-2 border-neutral-700 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.6)] rounded-sm">
                   
                   {/* Internal Grid Texture */}
                   <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_2px,rgba(0,0,0,0.8)_2px)] bg-[size:20px_100%] z-20 pointer-events-none opacity-50"></div>

                   {/* Solid Green Fill */}
                   <div 
                     className="absolute top-0 left-0 h-full bg-regilio-green shadow-[0_0_60px_#ccff00] transition-all duration-75 ease-linear z-10"
                     style={{ width: `${progress}%` }}
                   ></div>
                   
                   {/* Bright Scanning Head */}
                   <div 
                        className="absolute top-0 h-full w-40 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 mix-blend-overlay transition-all duration-75 ease-linear z-30"
                        style={{ left: `${progress}%`, transform: 'translateX(-50%)' }}
                   ></div>
               </div>

               {/* Log Output & Stats */}
               <div className="flex justify-between items-start mt-4 font-mono text-xs md:text-sm uppercase tracking-widest text-neutral-500">
                   <div className="flex flex-col gap-1">
                       <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-regilio-green rounded-full animate-pulse"></span>
                            <span className="text-white">{bootMessages[logIndex]}</span>
                       </div>
                   </div>
                   <div className="text-right text-regilio-green font-bold">
                       {Math.floor(progress)}%
                   </div>
               </div>
           </div>
       </div>

       {/* --- CSS FOR GLITCH ANIMATION --- */}
       <style>{`
        @keyframes glitch-skew {
          0% { transform: skew(0deg); clip-path: inset(0 0 0 0); }
          20% { transform: skew(-2deg); clip-path: inset(10% 0 30% 0); }
          40% { transform: skew(2deg); clip-path: inset(50% 0 10% 0); }
          60% { transform: skew(-1deg); clip-path: inset(20% 0 60% 0); }
          80% { transform: skew(1deg); clip-path: inset(80% 0 5% 0); }
          100% { transform: skew(0deg); clip-path: inset(0 0 0 0); }
        }
        .animate-glitch-skew {
          animation: glitch-skew 2s infinite linear alternate-reverse;
        }
       `}</style>
    </div>
  );
}

export default Loader;