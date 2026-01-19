import React, { useRef, useState, useEffect } from 'react';
import { Upload, Film, Volume2, VolumeX } from 'lucide-react';
import BackgroundMarquee from './BackgroundMarquee';

// --- Persistence Layer (Shared Logic) ---
const DB_NAME = 'RegilioStoryDB';
const STORE_NAME = 'uploaded_assets';

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open(DB_NAME, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
};

const saveAsset = async (id: string, file: File) => {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(file, id);
  } catch (err) {
    console.error("Failed to save asset:", err);
  }
};

const loadAssets = async (): Promise<Record<string, string>> => {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const assets: Record<string, string> = {};
      
      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          assets[cursor.key as string] = URL.createObjectURL(cursor.value);
          cursor.continue();
        } else {
          resolve(assets);
        }
      };
    });
  } catch (err) {
    console.error("Failed to load assets:", err);
    return {};
  }
};
// -------------------------------------

const DisciplineVideoSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasAutoplayed, setHasAutoplayed] = useState(false);

  // 1. Load Assets on Mount Only
  useEffect(() => {
    loadAssets().then((assets) => {
      if (assets['DISCIPLINE_VIDEO_MAIN']) {
        setVideoSrc(assets['DISCIPLINE_VIDEO_MAIN']);
      }
    });
  }, []);

  // 2. Intersection Observer for Animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 3. Safe Autoplay Logic
  useEffect(() => {
    // Only attempt to play if:
    // - The section is visible
    // - We have a video source
    // - We haven't already autoplayed it once
    // - The ref is attached
    if (isVisible && videoSrc && !hasAutoplayed && videoRef.current) {
        
        // Browser policy requires mute for autoplay
        if (!videoRef.current.muted) {
            videoRef.current.muted = true;
            setIsMuted(true);
        }

        const playPromise = videoRef.current.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    setIsPlaying(true);
                    setHasAutoplayed(true);
                })
                .catch((error) => {
                    // Gracefully handle block (e.g. low power mode, explicit block)
                    console.warn("Autoplay prevented by browser policy:", error);
                    // Mark as played to stop trying
                    setHasAutoplayed(true);
                });
        }
    }
  }, [isVisible, videoSrc, hasAutoplayed]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      saveAsset('DISCIPLINE_VIDEO_MAIN', file);
      // Reset states for new video
      setIsPlaying(false); 
      setHasAutoplayed(false); // Allow autoplay to trigger again for new video
    }
  };

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!videoRef.current || !videoSrc) return;

    try {
      if (videoRef.current.paused) {
        await videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Playback interaction failed:", err);
      setIsPlaying(!videoRef.current.paused);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Video automatically stops at last frame if loop={false}
  };

  return (
    <section 
      ref={containerRef} 
      className="relative w-full py-24 bg-transparent z-20 overflow-hidden"
    >
      <BackgroundMarquee text="DISCIPLINE" />

      <style>{`
        .animate-dash {
          stroke-dashoffset: 0;
          animation: dash 4s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[60vh] bg-regilio-green/5 blur-[150px] pointer-events-none opacity-40"></div>

      {/* Header - Constrained to Grid */}
      <div className="max-w-[1400px] mx-auto px-6 mb-12 md:mb-16">
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
               <div className="w-12 h-[1px] bg-regilio-green"></div>
               <span className="text-regilio-green font-mono text-xs tracking-[0.4em] uppercase">Visual Manifesto</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">
               The Art of Discipline
            </h2>
          </div>
          
          <div className={`hidden md:block text-right transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
             <div className="text-neutral-500 font-mono text-xs tracking-widest uppercase mb-1">Format: 16:9 Cinema</div>
             <div className="text-neutral-500 font-mono text-xs tracking-widest uppercase">Auto-Sequence // Hold Final</div>
          </div>
        </div>
      </div>

      {/* Video Placeholder Container - Standard Widescreen (16:9) */}
      <div 
        className={`relative w-full aspect-video bg-[#0a0a0a] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
          transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
          {/* Neon Green Spinning Line Frame */}
          <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none overflow-visible mix-blend-screen">
             <rect 
                x="0" y="0" width="100%" height="100%" 
                fill="none" 
                stroke="#ccff00" 
                strokeWidth="2" 
                pathLength="100"
                strokeDasharray="25 75"
                strokeLinecap="square"
                className="animate-dash"
                vectorEffect="non-scaling-stroke"
             />
             {/* Subtle Glow Layer behind the line */}
             <rect 
                x="0" y="0" width="100%" height="100%" 
                fill="none" 
                stroke="#ccff00" 
                strokeWidth="4" 
                strokeOpacity="0.4"
                pathLength="100"
                strokeDasharray="25 75"
                strokeLinecap="square"
                className="animate-dash blur-[4px]"
                vectorEffect="non-scaling-stroke"
             />
          </svg>

          {/* Main Content Area */}
          <div className="absolute inset-0 z-0 bg-black">
             {videoSrc ? (
                // VIDEO LOADED STATE
                <div className="w-full h-full relative">
                   <video 
                     ref={videoRef}
                     src={videoSrc}
                     // UPDATED: object-contain to ensure video is fully visible in container
                     className="w-full h-full object-contain" 
                     playsInline
                     muted={isMuted}
                     onEnded={handleVideoEnded}
                     loop={false}
                   />
                   
                   {/* Custom Play/Pause Overlay - Invisible to user but functional */}
                   <div 
                     className="absolute inset-0 z-10 cursor-pointer"
                     onClick={togglePlay}
                   >
                   </div>

                   {/* Controls (Mute & Upload) */}
                   <div className={`absolute top-6 right-6 z-20 flex gap-4 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                      {/* Mute Toggle */}
                      <button 
                        onClick={toggleMute}
                        className="bg-black/80 hover:bg-white hover:text-black text-white border border-white/10 p-2 rounded-full backdrop-blur-md transition-all"
                      >
                         {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      {/* Upload Button */}
                      <label className="cursor-pointer bg-black/80 hover:bg-regilio-green hover:text-black text-white border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md transition-all">
                          <input 
                              type="file" 
                              className="hidden" 
                              accept="video/*"
                              onChange={handleUpload}
                          />
                          <Upload className="w-4 h-4" />
                          <span className="text-[10px] font-mono tracking-widest uppercase">Change Video</span>
                      </label>
                   </div>
                </div>
             ) : (
                // EMPTY STATE
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center relative group/placeholder bg-[#0c0c0c] hover:bg-[#0f0f0f] transition-colors">
                    <input 
                       type="file" 
                       className="hidden" 
                       accept="video/*"
                       onChange={handleUpload}
                    />
                    
                    {/* Placeholder Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-20 pointer-events-none"></div>
                    
                    {/* Horizontal Cinema Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between py-8 opacity-10 pointer-events-none">
                         <div className="w-full h-[1px] bg-regilio-green/50"></div>
                         <div className="w-full h-[1px] bg-regilio-green/50"></div>
                    </div>

                    {/* Center Icon */}
                    <div className="relative z-10 w-24 h-24 mb-6">
                        <div className="absolute inset-0 bg-regilio-green/5 rounded-full blur-xl group-hover/placeholder:bg-regilio-green/10 transition-colors"></div>
                        <div className="relative w-full h-full border border-neutral-700 rounded-full flex items-center justify-center group-hover/placeholder:scale-110 group-hover/placeholder:border-regilio-green transition-all duration-500">
                           <Film className="w-8 h-8 text-neutral-500 group-hover/placeholder:text-regilio-green transition-colors" />
                        </div>
                    </div>

                    <h3 className="text-white font-bold text-xl md:text-3xl tracking-widest uppercase mb-2 group-hover/placeholder:text-regilio-green transition-colors">
                        Upload Sequence
                    </h3>
                    <p className="text-neutral-500 font-mono text-xs md:text-sm uppercase tracking-widest">
                        Drag & Drop or Click to Browse
                    </p>
                </label>
             )}
          </div>

          {/* Decorative Tech Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-regilio-green/0 group-hover:border-regilio-green/50 transition-colors duration-500 z-10 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-regilio-green/0 group-hover:border-regilio-green/50 transition-colors duration-500 z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-regilio-green/0 group-hover:border-regilio-green/50 transition-colors duration-500 z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-regilio-green/0 group-hover:border-regilio-green/50 transition-colors duration-500 z-10 pointer-events-none"></div>

          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10 pointer-events-none"></div>
      </div>
    </section>
  );
};

export default DisciplineVideoSection;