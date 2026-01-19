import React, { useRef, useState, useEffect } from 'react';
import { Upload, ExternalLink, Scan, Layers, LayoutGrid, GalleryHorizontalEnd } from 'lucide-react';
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

interface Magazine {
  id: string;
  title: string;
  category: string;
  description: string;
  issue: string;
}

const magazines: Magazine[] = [
  {
    id: "PRESS_PLAYBOY",
    title: "Playboy",
    category: "LIFESTYLE",
    description: "Breaking conventions. The fighter who became a symbol of charisma.",
    issue: "VOL. 94 // SPECIAL ED."
  },
  {
    id: "PRESS_ESQUIRE",
    title: "Esquire",
    category: "FASHION",
    description: "The Gentleman Boxer. Redefining masculinity and style in sports.",
    issue: "STYLE ISSUE // OCT"
  },
  {
    id: "PRESS_COSMO",
    title: "Cosmopolitan",
    category: "CULTURE",
    description: "Heartthrob of the 90s. Capturing the female gaze with raw appeal.",
    issue: "MAN OF THE YEAR"
  },
  {
    id: "PRESS_MAN",
    title: "MAN",
    category: "LIFESTYLE",
    description: "Raw masculinity. The definitive interview on life inside and outside the ring.",
    issue: "SUMMER EDITION"
  },
  {
    id: "PRESS_REVU",
    title: "Revu",
    category: "EDITORIAL",
    description: "Raw and Uncut. The controversial stories behind the champion.",
    issue: "COVER STORY"
  },
  {
    id: "PRESS_GLAMOUR",
    title: "Glamour",
    category: "FASHION",
    description: "High Fashion meets Hard Knocks. A visual paradox.",
    issue: "THE ICONS ISSUE"
  },
  {
    id: "PRESS_DESIGN_01",
    title: "Fashion Design I",
    category: "DESIGN REVIEW",
    description: "Critically acclaimed debut collection. A fusion of athletic function and high couture.",
    issue: "RUNWAY REPORT"
  },
  {
    id: "PRESS_DESIGN_02",
    title: "Fashion Design II",
    category: "DESIGN REVIEW",
    description: "The evolution of the brand. Avant-garde textiles meeting street culture.",
    issue: "SEASONAL EDIT"
  }
];

const PressCultureSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadAssets().then(setUploadedImages);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // --- Auto-Scroll & Sequence Logic ---
  useEffect(() => {
    // Continuous movement logic: Only stop if not in carousel mode or not visible.
    // Explicitly NOT pausing on hover to ensure "always moving" behavior.
    if (viewMode !== 'carousel' || !isVisible) return;

    // Increased speed: 2200ms per slide (approx 2.2 seconds)
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % magazines.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [viewMode, isVisible]);

  // --- Reliable Scroll to Active Item (Without Vertical Jump) ---
  useEffect(() => {
    if (viewMode !== 'carousel' || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const cards = container.querySelectorAll('[data-magazine-card]');
    const targetCard = cards[activeIndex] as HTMLElement;

    if (targetCard) {
        // Fix: Use container.scrollTo instead of targetCard.scrollIntoView.
        // scrollIntoView can trigger a full page scroll if the element is partially out of viewport,
        // which prevents the user from scrolling away from the section.
        
        // We calculate the position to center the card within the container manually.
        const cardLeft = targetCard.offsetLeft;
        const cardWidth = targetCard.offsetWidth;
        const containerWidth = container.clientWidth;
        
        // Calculate the scroll position that puts the center of the card at the center of the container
        const targetScrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);

        container.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth'
        });
    }
  }, [activeIndex, viewMode]);


  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => ({ ...prev, [id]: imageUrl }));
      saveAsset(id, file);
    }
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
    if (viewMode === 'grid') setActiveIndex(0);
  };

  return (
    <section 
      id="press-culture"
      ref={containerRef} 
      className="relative w-full min-h-screen py-32 bg-transparent z-20 overflow-hidden flex flex-col justify-center"
    >
      <BackgroundMarquee text="CULTURE" />

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
        @keyframes float-btn {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
        .animate-float-btn {
            animation: float-btn 3s ease-in-out infinite;
        }
        .glow-shadow {
            box-shadow: 0 0 20px rgba(204, 255, 0, 0.2);
        }
        .glow-shadow:hover {
            box-shadow: 0 0 40px rgba(204, 255, 0, 0.5);
        }
      `}</style>

      {/* Decorative Background Elements - Gradient Masked to Prevent Hard Cuts */}
      <div 
        className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,rgba(255,255,255,0.01)_40px,rgba(255,255,255,0.01)_41px)] opacity-50 pointer-events-none"
        style={{
            maskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)'
        }}
      ></div>

      <div className="max-w-[1400px] mx-auto px-6 w-full mb-12 relative z-10">
         <div className={`transition-all duration-1000 flex flex-col md:flex-row md:items-end justify-between gap-8 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            
            {/* Header Text */}
            <div className="z-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-block w-2 h-2 bg-regilio-green animate-pulse rounded-full"></span>
                    <span className="text-regilio-green font-mono text-xs tracking-[0.3em] uppercase">Media Archive</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase mb-4">
                    Press & <span className="text-transparent bg-clip-text bg-gradient-to-r from-regilio-green to-white">Culture</span>
                </h2>
                <p className="text-neutral-300 max-w-2xl font-sans text-lg md:text-xl leading-relaxed font-medium">
                    From the boxing ring to the glossy pages of high fashion. A documented history of breaking the mold.
                </p>
            </div>

            {/* View Toggle Button - Upgraded Visibility */}
            <div className="z-10">
                <button 
                    onClick={toggleViewMode}
                    className="group relative flex items-center gap-4 px-8 py-4 bg-black/80 backdrop-blur-xl border border-regilio-green/50 hover:border-regilio-green text-white rounded-none transition-all duration-500 animate-float-btn glow-shadow hover:bg-regilio-green hover:text-black"
                >
                    <span className="text-sm font-bold uppercase tracking-widest font-sans">
                        {viewMode === 'carousel' ? 'Explore Full Grid' : 'Resume Sequence'}
                    </span>
                    <div className="relative">
                        {viewMode === 'carousel' ? (
                            <LayoutGrid className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                        ) : (
                            <GalleryHorizontalEnd className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                        )}
                    </div>
                    
                    {/* Decorative Tech Corners on the Button */}
                    <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-regilio-green opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-regilio-green opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                </button>
            </div>
         </div>
      </div>

      {/* Content Container - Switchable Layout */}
      <div 
        ref={scrollContainerRef}
        className={`w-full transition-all duration-700 relative z-10
            ${viewMode === 'carousel' 
                ? 'max-w-[1400px] mx-auto overflow-x-auto hide-scrollbar px-6 md:px-12 pb-20 pt-10 flex gap-6 md:gap-8 snap-x snap-mandatory' 
                : 'max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20'
            }
        `}
      >
        {magazines.map((item, index) => {
            const hasImage = !!uploadedImages[item.id];
            
            // Determine "Active" state.
            // In Carousel: Programmatically set by index.
            // In Grid: Standard hover interaction.
            const isActive = viewMode === 'carousel' ? index === activeIndex : false; // For grid, we rely on group-hover CSS
            
            // Animation Stagger for Grid View
            const staggerDelay = viewMode === 'grid' ? index * 100 : 0;

            return (
                <div 
                    key={item.id}
                    data-magazine-card
                    className={`
                        relative flex-shrink-0 group perspective-1000 transition-all duration-700
                        ${viewMode === 'carousel' ? 'w-[300px] md:w-[380px] h-[450px] md:h-[550px] snap-center cursor-pointer' : 'w-full aspect-[3/4]'}
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}
                    `}
                    style={{ transitionDelay: `${staggerDelay}ms` }}
                    // Allow manual click to set active index in carousel mode
                    onClick={() => viewMode === 'carousel' && setActiveIndex(index)}
                >
                    {/* The Card - 3D Tilt Wrapper */}
                    <div 
                        className={`
                            relative w-full h-full bg-[#080808] border transition-all duration-500 ease-out overflow-hidden
                            ${isActive 
                                ? 'border-regilio-green/50 -translate-y-6 shadow-[0_30px_60px_rgba(204,255,0,0.15)] scale-105 z-10' 
                                : 'border-white/10 group-hover:-translate-y-2 group-hover:border-white/30 group-hover:shadow-xl'
                            }
                        `}
                    >
                        
                        {/* 1. Image Layer */}
                        <div className="absolute inset-0 z-0 bg-[#050505]">
                            <label className="cursor-pointer block w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(item.id, e)}
                                />
                                {hasImage ? (
                                    <>
                                        <img 
                                            src={uploadedImages[item.id]} 
                                            alt={item.title}
                                            className={`
                                                w-full h-full object-cover transition-all duration-700
                                                ${isActive ? 'grayscale-0 scale-105' : 'filter grayscale group-hover:grayscale-0 group-hover:scale-105'}
                                            `}
                                        />
                                        
                                        {/* Scanline Overlay - Active Only */}
                                        <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-regilio-green/10 to-transparent h-[20%] w-full pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100 animate-[scanline_3s_linear_infinite]' : 'opacity-0'}`}></div>
                                        
                                        {/* Edit Button */}
                                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black/60 p-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-regilio-green hover:text-black hover:border-regilio-green text-white transition-all">
                                                <Upload className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center relative group/placeholder">
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.02)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.02)_50%,rgba(255,255,255,0.02)_75%,transparent_75%,transparent)] bg-[length:20px_20px]"></div>
                                        <Layers className={`w-12 h-12 mb-4 transition-colors ${isActive ? 'text-regilio-green' : 'text-neutral-700 group-hover/placeholder:text-regilio-green'}`} />
                                        <div className="text-center">
                                            <span className="block text-white font-bold tracking-widest uppercase mb-1">{item.title}</span>
                                            <span className="text-[10px] text-regilio-green font-mono uppercase">Upload Asset</span>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* 2. Holographic Overlay (Active State OR Grid Hover) */}
                        <div 
                            className={`absolute inset-0 pointer-events-none transition-opacity duration-500 z-10 bg-gradient-to-t from-black/95 via-black/20 to-transparent flex flex-col justify-end
                                ${isActive || viewMode === 'grid' ? 'opacity-100' : 'opacity-0'}
                                ${viewMode === 'grid' ? 'group-hover:opacity-100 opacity-0' : ''}
                            `}
                        >
                            <div className="w-full p-6 md:p-8 transform transition-transform duration-500 translate-y-0">
                                {/* Tech Details */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] font-mono text-regilio-green bg-regilio-green/10 px-2 py-1 border border-regilio-green/20">
                                        {item.issue}
                                    </span>
                                    {isActive && (
                                        <div className="flex gap-2">
                                            <span className="w-1.5 h-1.5 bg-regilio-green rounded-full animate-pulse"></span>
                                            <span className="w-1.5 h-1.5 bg-regilio-green rounded-full animate-pulse delay-75"></span>
                                            <span className="w-1.5 h-1.5 bg-regilio-green rounded-full animate-pulse delay-150"></span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                                    {item.title}
                                </h3>
                                <div className={`w-12 h-[3px] bg-regilio-green mb-4 shadow-[0_0_10px_#ccff00] transition-all duration-500 ${isActive ? 'w-24' : 'w-12'}`}></div>
                                <p className="text-xs md:text-sm text-neutral-300 font-sans leading-relaxed border-l-2 border-white/20 pl-3">
                                    {item.description}
                                </p>
                            </div>
                        </div>

                        {/* 3. Static Info (Inactive State) */}
                        <div 
                            className={`absolute bottom-0 left-0 w-full p-6 transition-all duration-500 pointer-events-none bg-gradient-to-t from-black/90 to-transparent
                                ${isActive ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
                                ${viewMode === 'grid' ? 'group-hover:opacity-0 group-hover:translate-y-4' : ''}
                            `}
                        >
                            <div className="flex items-end justify-between">
                                <div>
                                    <span className="block text-[9px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{item.category}</span>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight">{item.title}</h3>
                                </div>
                                {viewMode === 'carousel' && (
                                   <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                                      <span className="text-[10px] text-neutral-500 font-mono">{index + 1}</span>
                                   </div>
                                )}
                            </div>
                        </div>

                        {/* Corner Accents */}
                        <div className={`absolute top-0 left-0 w-3 h-3 border-t border-l transition-colors duration-300 ${isActive ? 'border-regilio-green' : 'border-white/20'}`}></div>
                        <div className={`absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors duration-300 ${isActive ? 'border-regilio-green' : 'border-white/20'}`}></div>
                        <div className={`absolute bottom-0 left-0 w-3 h-3 border-b border-l transition-colors duration-300 ${isActive ? 'border-regilio-green' : 'border-white/20'}`}></div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-b border-r transition-colors duration-300 ${isActive ? 'border-regilio-green' : 'border-white/20'}`}></div>
                    </div>

                    {/* Reflection / Shadow */}
                    <div 
                        className={`absolute -bottom-6 left-4 right-4 h-6 bg-regilio-green/20 blur-xl transition-all duration-500 rounded-[100%]
                            ${isActive ? 'opacity-60 scale-x-100' : 'opacity-0 scale-x-50'}
                        `}
                    ></div>
                </div>
            );
        })}
      </div>

      {/* Footer Navigation (Carousel Mode Only) */}
      {viewMode === 'carousel' && (
          <div className="absolute bottom-12 left-0 w-full flex flex-col items-center pointer-events-none gap-4">
              {/* Progress Dots */}
              <div className="flex gap-2">
                 {magazines.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-500 ${i === activeIndex ? 'w-8 bg-regilio-green shadow-[0_0_8px_#ccff00]' : 'w-2 bg-white/20'}`}
                    ></div>
                 ))}
              </div>
              
              <div className="flex items-center gap-2 opacity-40">
                  <div className="w-12 h-[1px] bg-white"></div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white">Auto-Sequence Active</span>
                  <div className="w-12 h-[1px] bg-white"></div>
              </div>
          </div>
      )}
    </section>
  );
};

export default PressCultureSection;