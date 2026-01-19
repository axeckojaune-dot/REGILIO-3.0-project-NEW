import React, { useEffect, useRef, useState } from 'react';
import { Upload, ArrowUpRight, LayoutGrid, X, Search, Database } from 'lucide-react';
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

interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
}

const pillars: PillarItem[] = [
  {
    id: "SDI_STYLE",
    title: "Style",
    subtitle: "The Aesthetic",
    description: "Eccentricity is not chaos; it is curated confidence. A fusion of high fashion and street grit that demands attention without asking for it.",
    tag: "01 // APPEARANCE"
  },
  {
    id: "SDI_DISCIPLINE",
    title: "Discipline",
    subtitle: "The Grind",
    description: "The quiet hours that build the loud moments. It is the refusal to compromise on the standard, even when no one is watching.",
    tag: "02 // MINDSET"
  },
  {
    id: "SDI_INFLUENCE",
    title: "Influence",
    subtitle: "The Impact",
    description: "True power is energy. It is the ability to shift the atmosphere of a room simply by entering it. Leadership felt, not spoken.",
    tag: "03 // AURA"
  }
];

const INFLUENCE_SLIDES = [
  { id: "INFLUENCE_ALI", label: "M. Ali", code: "MA-74" },
  { id: "INFLUENCE_MAYWEATHER", label: "F. Mayweather", code: "FM-50" },
  { id: "INFLUENCE_TYSON", label: "M. Tyson", code: "MT-86" },
  { id: "INFLUENCE_LEONARD", label: "S. Ray Leonard", code: "SL-80" },
  { id: "INFLUENCE_KING", label: "D. King", code: "DK-31" },
  { id: "INFLUENCE_TRUMP", label: "D. Trump", code: "DT-45" }
];

// --- Helper: Adaptive Image Component ---
const AdaptiveImage: React.FC<{ 
    src: string; 
    alt: string; 
    className?: string; 
    isGrid?: boolean; 
    isHovering?: boolean; // Controls carousel reveal state
}> = ({ src, alt, className = "", isGrid = false, isHovering = false }) => {
    
    // --- GRID VIEW (PRESERVED: Black Footer Logic) ---
    if (isGrid) {
        return (
            <div className={`relative w-full h-full overflow-hidden bg-[#050505] flex items-center justify-center ${className}`}>
                {/* Blurred Background Layer */}
                <div className="absolute inset-0 z-0">
                     <img 
                        src={src} 
                        alt="" 
                        className="w-full h-full object-cover blur-3xl opacity-30 scale-125 brightness-50"
                     />
                     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80"></div>
                </div>
                
                {/* Main Image Layer (Shifted Up for Footer Clearance) */}
                <img 
                    src={src} 
                    alt={alt}
                    className="relative z-10 w-full h-full object-contain shadow-2xl object-[50%_10%]"
                />
            </div>
        );
    }

    // --- CAROUSEL VIEW (NEW: Cover -> Contain Crossfade) ---
    return (
        <div className={`relative w-full h-full overflow-hidden bg-[#050505] ${className}`}>
            
            {/* 1. Base Blur (Ambient) */}
            <div className="absolute inset-0 z-0">
                 <img src={src} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-125 brightness-50" />
            </div>

            {/* 2. COVER Version (Default: Clean Look) */}
            {/* Fades OUT when hovering */}
            <div className={`absolute inset-0 z-10 transition-opacity duration-700 ease-in-out ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                <img 
                    src={src} 
                    alt={alt}
                    className="w-full h-full object-cover" 
                />
                {/* Gradient overlay for text readability in Cover mode */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
            </div>

            {/* 3. CONTAIN Version (Hover: Full Visibility) */}
            {/* Fades IN when hovering */}
            <div className={`absolute inset-0 z-20 flex items-center justify-center transition-all duration-700 ease-in-out ${isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <img 
                    src={src} 
                    alt={alt}
                    className="w-full h-full object-contain drop-shadow-2xl" 
                />
            </div>
        </div>
    );
};


const StyleDisciplineSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});
  
  // Influence State
  const [influenceIndex, setInfluenceIndex] = useState(0);
  const [isHoveringInfluence, setIsHoveringInfluence] = useState(false);
  const [influenceViewMode, setInfluenceViewMode] = useState<'carousel' | 'grid'>('carousel');

  useEffect(() => {
    loadAssets().then(setUploadedImages);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Handle animation state cleanup
  useEffect(() => {
    if (isVisible) {
      // Calculate when the last item finishes its entry animation
      const fallDuration = 600;
      const totalDuration = (pillars.length - 1) * fallDuration + fallDuration;
      
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, totalDuration + 100); // Buffer

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Auto-scroll logic for Influence column (Carousel Mode)
  useEffect(() => {
    if (isHoveringInfluence || influenceViewMode === 'grid') return;

    const interval = setInterval(() => {
      setInfluenceIndex((prev) => (prev + 1) % INFLUENCE_SLIDES.length);
    }, 2500); // Slightly slower for better viewing

    return () => clearInterval(interval);
  }, [isHoveringInfluence, influenceViewMode]);

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => ({ ...prev, [id]: imageUrl }));
      saveAsset(id, file);
    }
  };

  const toggleInfluenceView = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setInfluenceViewMode(prev => prev === 'carousel' ? 'grid' : 'carousel');
  };

  return (
    <section 
      id="style-discipline"
      ref={containerRef} 
      className="relative w-full py-24 bg-transparent z-20 overflow-hidden"
    >
      <BackgroundMarquee text="LIFESTYLE" />

      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-regilio-green/5 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="mb-16 md:mb-20 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-4 opacity-0 animate-fade-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <div className="w-12 h-[1px] bg-regilio-green"></div>
            <span className="text-regilio-green font-mono text-xs tracking-[0.4em] uppercase">The Lifestyle</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase opacity-0 animate-fade-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Style. Discipline. Influence.
          </h2>
          <p 
            className="mt-6 text-lg md:text-xl text-neutral-400 font-sans max-w-2xl mx-auto md:mx-0 leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
          >
            A life engineered for performance—inside the ring and beyond it.
          </p>
        </div>

        {/* Triptych Flex Container */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-2 h-auto md:h-[700px]">
          {pillars.map((pillar, index) => {
             const isInfluence = pillar.id === 'SDI_INFLUENCE';
             
             // Entry Animation Params
             const fallDuration = 600; 
             const delay = index * fallDuration;

             const transitionClass = animationComplete 
                ? "transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]" 
                : "transition-all ease-[cubic-bezier(0.34,1.3,0.64,1)]";

             return (
               <div 
                 key={pillar.id}
                 onClick={() => isInfluence && influenceViewMode === 'carousel' && toggleInfluenceView()}
                 className={`group relative w-full h-[500px] md:h-full bg-[#0a0a0a] border border-white/5 overflow-hidden 
                   ${transitionClass}
                   md:flex-1 md:hover:flex-[2.5]
                   ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-[150%]'}
                   ${isInfluence && influenceViewMode === 'grid' ? 'md:flex-[2.5]' : ''}
                   ${isInfluence ? 'cursor-pointer' : ''}
                 `}
                 style={{ 
                     transitionDuration: !animationComplete ? `${fallDuration}ms` : undefined,
                     transitionDelay: !animationComplete ? `${delay}ms` : '0ms'
                 }}
                 onMouseEnter={() => isInfluence && setIsHoveringInfluence(true)}
                 onMouseLeave={() => isInfluence && setIsHoveringInfluence(false)}
               >
                  {/* Image Container */}
                  <div className="absolute inset-0 z-0">
                    
                    {/* STANDARD LOGIC (Style, Discipline) - Keep Original Object-Cover for lifestyle shots */}
                    {!isInfluence && (
                        <label className="cursor-pointer block w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                            <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(pillar.id, e)}
                            />
                            
                            {uploadedImages[pillar.id] ? (
                                <div className="w-full h-full relative overflow-hidden">
                                    <img 
                                    src={uploadedImages[pillar.id]} 
                                    alt={pillar.title} 
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110 opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                                    <div className="bg-black/80 p-2 rounded-full border border-regilio-green/30 flex items-center gap-2 backdrop-blur-md">
                                        <Upload className="w-4 h-4 text-regilio-green" />
                                    </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e0e0e] group-hover:bg-[#111] transition-colors relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                                    <div className="relative z-10 w-20 h-20 border border-dashed border-neutral-700 rounded-full flex items-center justify-center mb-4 group-hover:border-regilio-green/50 group-hover:scale-110 transition-all duration-500">
                                    <Upload className="w-6 h-6 text-neutral-600 group-hover:text-regilio-green" />
                                    </div>
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest group-hover:text-white transition-colors">Upload {pillar.title}</span>
                                </div>
                            )}
                        </label>
                    )}

                    {/* INFLUENCE LOGIC (Carousel + Digital Archive Grid) */}
                    {isInfluence && (
                        <div className="w-full h-full relative">
                            
                            {/* Toggle Button - Fixed within the container, visible in both modes */}
                            <div className="absolute top-6 right-6 z-40 pointer-events-auto">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleInfluenceView(e); }}
                                    className="bg-regilio-green px-4 py-1.5 rounded-full border border-regilio-green text-[10px] uppercase font-mono text-black font-bold tracking-widest shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:bg-white hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300 flex items-center gap-2"
                                >
                                    {influenceViewMode === 'carousel' ? <LayoutGrid className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    <span className="hidden md:inline">{influenceViewMode === 'carousel' ? 'View All' : 'Close'}</span>
                                </button>
                            </div>

                            {/* CAROUSEL MODE */}
                            <div className={`absolute inset-0 transition-opacity duration-500 ${influenceViewMode === 'carousel' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                                {INFLUENCE_SLIDES.map((slide, slideIdx) => {
                                    const isActive = slideIdx === influenceIndex;
                                    const hasImage = !!uploadedImages[slide.id];
                                    
                                    return (
                                        <div 
                                            key={slide.id}
                                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                        >
                                            <label className="cursor-pointer block w-full h-full relative" onClick={(e) => e.stopPropagation()}>
                                                <input 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(slide.id, e)}
                                                />
                                                {hasImage ? (
                                                    <AdaptiveImage 
                                                        src={uploadedImages[slide.id]} 
                                                        alt={slide.label} 
                                                        isHovering={isHoveringInfluence} // Pass section hover state for crossfade
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0e0e0e] group-hover:bg-[#111] transition-colors relative">
                                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-20"></div>
                                                        <div className="relative z-10 w-20 h-20 border border-dashed border-neutral-700 rounded-full flex items-center justify-center mb-4 group-hover:border-regilio-green/50 group-hover:scale-110 transition-all duration-500">
                                                            <Upload className="w-6 h-6 text-neutral-600 group-hover:text-regilio-green" />
                                                        </div>
                                                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest group-hover:text-white transition-colors">
                                                            Upload {slide.label}
                                                        </span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    );
                                })}
                                {/* Carousel Indicators */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                                    {INFLUENCE_SLIDES.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setInfluenceIndex(i); }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === influenceIndex ? 'bg-regilio-green w-4 shadow-[0_0_5px_#ccff00]' : 'bg-white/20 hover:bg-white/50'}`}
                                        ></button>
                                    ))}
                                </div>
                            </div>

                            {/* DIGITAL ARCHIVE GRID MODE (VIEW ALL) */}
                            {influenceViewMode === 'grid' && (
                                <div className="absolute inset-0 z-30 bg-[#0a0a0a] animate-[fadeUp_0.3s_ease-out] flex flex-col">
                                    
                                    {/* Scrollable Container */}
                                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                        
                                        {/* Sticky Grid Header */}
                                        <div className="sticky top-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Database className="w-4 h-4 text-regilio-green" />
                                                <h4 className="text-regilio-green font-mono text-xs tracking-[0.3em] uppercase">Archive_View</h4>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                                                <Search className="w-3 h-3 text-neutral-500" />
                                                <span className="text-[9px] text-neutral-500 font-mono uppercase tracking-widest">Index // 01-05</span>
                                            </div>
                                        </div>
                                        
                                        {/* The Grid */}
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {INFLUENCE_SLIDES.map((slide, i) => {
                                                const hasImage = !!uploadedImages[slide.id];
                                                return (
                                                    <div 
                                                        key={slide.id} 
                                                        className="group/card relative w-full aspect-[3/4] bg-[#050505] border border-white/10 hover:border-regilio-green/50 transition-all duration-300 shadow-2xl overflow-hidden"
                                                    >
                                                        <label className="cursor-pointer w-full h-full block relative" onClick={(e) => e.stopPropagation()}>
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={(e) => handleImageUpload(slide.id, e)}
                                                            />
                                                            
                                                            {/* Image Container with Adaptive Logic */}
                                                            <div className="w-full h-full relative">
                                                                {hasImage ? (
                                                                    <>
                                                                        <AdaptiveImage 
                                                                            src={uploadedImages[slide.id]} 
                                                                            alt={slide.label} 
                                                                            isGrid={true} // Triggers the specific positioning for grid
                                                                        />
                                                                        
                                                                        {/* Hover Overlay */}
                                                                        <div className="absolute inset-0 bg-regilio-green/5 opacity-0 group-hover/card:opacity-100 transition-opacity z-20 pointer-events-none"></div>
                                                                        
                                                                        {/* Upload Button */}
                                                                        <div className="absolute top-3 right-3 z-30 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                                            <div className="bg-black/80 p-2 rounded-full border border-regilio-green/50 hover:bg-regilio-green hover:text-black text-white transition-colors">
                                                                                <Upload className="w-3 h-3" />
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#080808] relative">
                                                                        {/* Grid Pattern */}
                                                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                                                        
                                                                        <div className="relative z-10 w-12 h-12 rounded-full border border-dashed border-neutral-700 flex items-center justify-center group-hover/card:border-regilio-green transition-colors">
                                                                            <Upload className="w-5 h-5 text-neutral-600 group-hover/card:text-regilio-green transition-colors" />
                                                                        </div>
                                                                        <span className="relative z-10 text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Upload Asset</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Tech HUD Overlay (Always Visible on Grid) */}
                                                            <div className="absolute inset-0 z-20 pointer-events-none">
                                                                {/* Corner Brackets */}
                                                                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20 group-hover/card:border-regilio-green transition-colors"></div>
                                                                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20 group-hover/card:border-regilio-green transition-colors"></div>
                                                                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20 group-hover/card:border-regilio-green transition-colors"></div>
                                                                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20 group-hover/card:border-regilio-green transition-colors"></div>
                                                                
                                                                {/* Bottom Info Bar - SOLID BLACK BACKGROUND FOR READABILITY */}
                                                                <div className="absolute bottom-0 left-0 w-full bg-[#050505] border-t border-white/20 p-3 flex justify-between items-center z-30">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[9px] text-neutral-500 font-mono tracking-widest">ID: {slide.code}</span>
                                                                        <span className="text-white text-xs font-bold uppercase tracking-wider">{slide.label}</span>
                                                                    </div>
                                                                    <div className="text-[10px] font-mono text-regilio-green">
                                                                        0{i+1}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        <div className="h-12 w-full"></div> {/* Bottom Spacer */}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                  </div>

                  {/* Content Overlay - Hidden in View All Mode */}
                  <div className={`absolute inset-0 z-10 flex flex-col justify-end p-8 pointer-events-none transition-all duration-300 ${isInfluence && influenceViewMode === 'grid' ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                      
                      {/* Top Tag */}
                      <div className="absolute top-8 left-8 overflow-hidden">
                         <span className="block text-[10px] font-mono font-bold text-regilio-green tracking-widest uppercase transform translate-y-0 transition-transform duration-500 group-hover:-translate-y-full">
                           {pillar.tag}
                         </span>
                         <span className="absolute top-0 left-0 block text-[10px] font-mono font-bold text-white tracking-widest uppercase transform translate-y-full transition-transform duration-500 group-hover:translate-y-0">
                           {pillar.tag}
                         </span>
                      </div>

                      {/* Title & Subtitle */}
                      <div className="transform transition-transform duration-500 group-hover:-translate-y-2 min-w-max">
                          <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">{pillar.subtitle}</h4>
                          <h3 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4">{pillar.title}</h3>
                          
                          <div className="w-12 h-[2px] bg-regilio-green mb-4 transition-all duration-500 ease-out group-hover:w-full group-hover:shadow-[0_0_10px_#ccff00]"></div>
                          
                          <div className="overflow-hidden">
                              <p className="text-sm text-neutral-300 font-sans leading-relaxed max-w-xs opacity-0 md:opacity-60 translate-y-4 md:translate-y-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 whitespace-normal">
                                {pillar.description}
                              </p>
                          </div>
                      </div>

                      {/* Corner Accents */}
                      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                          
                          {/* Arrow Icon appearing on hover */}
                          <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                              <ArrowUpRight className="w-6 h-6 text-regilio-green" />
                          </div>
                      </div>
                  </div>
               </div>
             );
          })}
        </div>
      </div>
    </section>
  );
};

export default StyleDisciplineSection;