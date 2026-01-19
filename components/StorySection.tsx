import React, { useRef, useEffect, useState } from 'react';
import { Upload } from 'lucide-react';

// --- Persistence Layer (IndexedDB) ---
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

const stories = [
  {
    id: "01",
    title: "Born in Suriname",
    description: "Born in Paramaribo, Suriname in 1967, during the final years under Dutch rule. Regilio’s story begins far from the spotlight. Before the fame, there was only character—built early, shaped quietly, and carried into every round.",
    image: "STORY_ASSET_01"
  },
  {
    id: "02",
    title: "Rotterdam, The Netherlands",
    description: "In 1973, he moved to the Netherlands, far from where his story began. And Rotterdam became his training ground. His stepfather’s passion for the ring planted the spark—and Dutch discipline turned it into a craft. His style became precise: calm, technical, impossible to break.",
    image: "STORY_ASSET_02"
  },
  {
    id: "03",
    title: "Olympic glory",
    description: "He climbed the Dutch amateur ranks in silence—fight by fight, year by year. In 1987, he broke through with a European bronze, earning his place on the Olympic path. Then came Seoul, 1988: one round, one statement—a shock KO over Kelcie Banks.",
    image: "STORY_ASSET_03"
  },
  {
    id: "04",
    title: "The Move to New York City",
    description: "In 1989, Regilio turned professional—his first fight staged in New York. A new world: brighter lights, harder pressure, and no margin for mistakes.",
    image: "STORY_ASSET_04"
  },
  {
    id: "05",
    title: "Champion Years",
    description: "In 1994, in his hometown Rotterdam, he captured the WBO world title. Then he defended it again and again—six times—proving he wasn’t a moment… he was a reign.",
    image: "STORY_ASSET_05"
  },
  {
    id: "06",
    title: "The radical Decision",
    description: "After reaching the top, Regilio made the rarest move: he chose silence. He didn’t lose his crown — he set it down, unbeaten through six world-title defenses. Not to disappear… but to re-educate himself for the 21st century, and build what boxing couldn’t contain.",
    image: "STORY_ASSET_06"
  },
  {
    id: "07",
    title: "Regilio 3.0",
    description: "WBO World Champion. Six defenses. 46 wins. 30 knockouts. Then the real transformation began: years away from the noise, learning the language of technology, systems, and leadership — preparing a return built for the future.",
    image: "STORY_ASSET_07"
  }
];

const StorySection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  // Initialize: Load persisted images
  useEffect(() => {
    loadAssets().then(setUploadedImages);
  }, []);

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => ({ ...prev, [id]: imageUrl }));
      saveAsset(id, file); // Persist to IndexedDB
    }
  };

  // Track scroll position to update active index and progress bar
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const { top, height } = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Overall progress through the entire section
      const scrolled = -top;
      const totalScroll = height - viewportHeight;
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScroll));
      setProgress(rawProgress);

      // Determine which individual story block is currently in focus
      const storyBlocks = document.querySelectorAll('.story-block');
      let currentInView = 0;
      
      storyBlocks.forEach((block, index) => {
        const rect = block.getBoundingClientRect();
        const blockCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        
        if (rect.top < viewportCenter && rect.bottom > viewportCenter) {
            currentInView = index;
        }
      });
      
      setActiveIndex(currentInView);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="story" ref={containerRef} className="relative w-full bg-transparent z-10 pt-24 pb-24">
      
      <style>{`
        @keyframes neon-frame-pulse {
            0%, 100% {
                box-shadow: 0 0 10px rgba(204, 255, 0, 0.4), inset 0 0 10px rgba(204, 255, 0, 0.1);
                border-color: #ccff00;
            }
            50% {
                box-shadow: 0 0 30px rgba(204, 255, 0, 0.7), inset 0 0 20px rgba(204, 255, 0, 0.3);
                border-color: #ffffff;
            }
        }
        .animate-neon-frame {
            animation: neon-frame-pulse 3s infinite ease-in-out;
        }

        /* Moving Dash Animation */
        .animate-dash {
          stroke-dashoffset: 0;
          animation: dash 6s linear infinite;
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -200;
          }
        }
      `}</style>

      {/* Increased max-width to allow visuals to be the main element */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* LEFT COLUMN: Scrollable Text Content */}
          {/* Reduced width on Large screens to 35% to give priority to images */}
          <div className="w-full lg:w-[35%] relative order-2 lg:order-1">
             
             {/* TIMELINE CONTAINER */}
             <div 
                className="absolute left-0 top-0 bottom-0 w-[4px] hidden md:block pointer-events-none"
                style={{ 
                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', 
                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' 
                }}
             >
                <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-neutral-800"></div>
                <div 
                    className="absolute left-1/2 top-0 w-[3px] -translate-x-1/2 bg-regilio-green shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] z-20"
                    style={{ height: `${progress * 100}%` }}
                ></div>
             </div>

             {/* Story Blocks */}
             <div className="flex flex-col">
               {stories.map((story, index) => (
                 <div 
                    key={story.id} 
                    className={`story-block min-h-[80vh] flex flex-col justify-center pl-8 md:pl-12 py-12 transition-opacity duration-500 ${index === activeIndex ? 'opacity-100' : 'opacity-20 blur-[1px]'}`}
                 >
                    {/* Step Indicator */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-regilio-green font-mono font-bold text-sm tracking-widest">
                         {story.id} / 0{stories.length}
                      </span>
                      <div className={`w-8 h-[1px] transition-all duration-500 ${index === activeIndex ? 'bg-regilio-green w-16' : 'bg-neutral-800'}`}></div>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tighter leading-[1.1]">
                      {story.title}
                    </h2>

                    <div className={`border-l-2 pl-6 transition-colors duration-500 ${index === activeIndex ? 'border-regilio-green' : 'border-neutral-800'}`}>
                      <p className="text-neutral-400 text-lg leading-relaxed max-w-md font-sans">
                        {story.description}
                      </p>
                    </div>

                    {/* Mobile Only Image (Inline) */}
                    <div className="lg:hidden mt-8 w-full aspect-video bg-[#0a0a0a] border border-white/10 relative overflow-hidden group">
                        <label className="cursor-pointer block w-full h-full relative">
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleImageUpload(story.id, e)}
                          />
                          {uploadedImages[story.id] ? (
                              <div className="w-full h-full relative">
                                <img 
                                  src={uploadedImages[story.id]} 
                                  alt={story.title} 
                                  className="w-full h-full object-cover bg-black"
                                />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                              </div>
                          ) : (
                              <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                  <Upload className="w-6 h-6 text-regilio-green opacity-50" />
                                  <span className="text-neutral-500 text-[10px]">Tap to Upload</span>
                              </div>
                          )}
                        </label>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* RIGHT COLUMN: Sticky Visuals */}
          {/* Increased Width to 65% for Big Impact */}
          <div className="hidden lg:flex w-[65%] h-screen sticky top-0 items-center justify-center py-8 order-1 lg:order-2 pl-12">
             
             {/* Background Grid - subtle */}
             <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30 pointer-events-none"></div>

             {/* Dynamic Content Container */}
             {stories.map((story, index) => {
                const hasImage = !!uploadedImages[story.id];
                const isActive = index === activeIndex;

                return (
                    <div 
                        key={`img-${index}`}
                        className={`absolute inset-0 flex items-center justify-center p-6 transition-all duration-700 ease-in-out
                            ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-95 pointer-events-none'}
                        `}
                    >
                        {hasImage ? (
                            // UPLOADED STATE: Content hugging logic
                            // We use a wrapper that is inline-block/flex with max constraints so the SVG frames the *image* not the container.
                            <div className="relative group/frame flex flex-col items-center justify-center">
                                 
                                 {/* Moving Neon Outline (Depth Effect) - Absolute to this wrapper */}
                                 <svg className="absolute -inset-5 w-[calc(100%+40px)] h-[calc(100%+40px)] z-20 pointer-events-none overflow-visible mix-blend-screen">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                                            <feMerge>
                                                <feMergeNode in="coloredBlur"/>
                                                <feMergeNode in="SourceGraphic"/>
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <rect 
                                        x="20" y="20" width="calc(100% - 40px)" height="calc(100% - 40px)" 
                                        fill="none" 
                                        stroke="#ccff00" 
                                        strokeWidth="2"
                                        strokeOpacity="0.8"
                                        pathLength="100"
                                        strokeDasharray="40 60"
                                        strokeLinecap="round"
                                        className="animate-dash"
                                        filter="url(#glow)"
                                    />
                                    <rect 
                                        x="20" y="20" width="calc(100% - 40px)" height="calc(100% - 40px)" 
                                        fill="none" 
                                        stroke="#ccff00" 
                                        strokeWidth="1"
                                        strokeOpacity="0.15"
                                    />
                                 </svg>

                                 {/* Glowing pulsating aura */}
                                 <div className="absolute inset-0 bg-regilio-green/5 blur-3xl rounded-lg opacity-40 animate-pulse pointer-events-none"></div>
                                 
                                 {/* The Image - Size constrained to 70vh, width auto. Wrapper will shrink to fit. */}
                                 <img 
                                    src={uploadedImages[story.id]} 
                                    alt={story.title} 
                                    className="block max-h-[70vh] max-w-full w-auto h-auto object-contain shadow-2xl rounded-sm relative z-10"
                                 />
                                 
                                 {/* Edit Overlay - Subtle corner button */}
                                 <label className="absolute bottom-6 right-6 cursor-pointer opacity-0 group-hover/frame:opacity-100 transition-opacity duration-300 z-30">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(story.id, e)}
                                    />
                                    <div className="flex items-center gap-2 px-4 py-2 bg-black/80 border border-white/20 hover:border-regilio-green hover:bg-regilio-green hover:text-black text-white rounded-full backdrop-blur-md transition-colors shadow-lg">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-[10px] font-mono font-bold tracking-widest uppercase">Change</span>
                                    </div>
                                 </label>
                            </div>
                        ) : (
                            // PLACEHOLDER STATE: MASSIVE & TECH
                            <div className="relative w-full h-full max-h-[70vh] bg-[#050505] border border-white/10 flex flex-col items-center justify-center group/placeholder shadow-2xl rounded-sm overflow-hidden">
                                
                                {/* Animated Neon Outline (Placeholder) */}
                                <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                                    <rect 
                                        x="0" y="0" width="100%" height="100%" 
                                        fill="none" 
                                        stroke="#ccff00" 
                                        strokeWidth="1.5"
                                        strokeOpacity="0.4"
                                        pathLength="100"
                                        strokeDasharray="15 85" 
                                        className="animate-dash"
                                    />
                                </svg>
                                
                                {/* Background Tech Pattern */}
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] opacity-30 pointer-events-none"></div>
                                
                                {/* Animated Scan Line */}
                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover/placeholder:translate-y-full transition-transform duration-[2000ms] ease-in-out pointer-events-none"></div>

                                {/* Top Metadata Bar */}
                                <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start opacity-60">
                                    <div className="font-mono text-[10px] text-regilio-green tracking-widest uppercase">
                                        Input_Signal_{story.id}
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                        <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Main Interaction Area */}
                                <div className="relative z-10 text-center">
                                    <label className="group/btn relative inline-flex flex-col items-center cursor-pointer">
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(story.id, e)}
                                        />
                                        
                                        {/* Large Circle Button */}
                                        <div className="w-28 h-28 mb-8 rounded-full border border-neutral-700 bg-neutral-900/50 flex items-center justify-center group-hover/btn:border-regilio-green group-hover/btn:scale-110 group-hover/btn:bg-black transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                                            <Upload className="w-10 h-10 text-neutral-500 group-hover/btn:text-regilio-green transition-colors" />
                                        </div>
                                        
                                        <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-3 group-hover/btn:text-regilio-green transition-colors">
                                            Upload Visual
                                        </h3>
                                        <div className="px-4 py-1 border border-white/20 rounded-full">
                                            <span className="text-neutral-400 font-mono text-xs uppercase tracking-[0.2em] group-hover/btn:text-white transition-colors">
                                                {story.title}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Corner Accents (Big) */}
                                <div className="absolute top-0 left-0 w-16 h-16 border-t-[3px] border-l-[3px] border-white/10 group-hover/placeholder:border-regilio-green/50 transition-colors"></div>
                                <div className="absolute top-0 right-0 w-16 h-16 border-t-[3px] border-r-[3px] border-white/10 group-hover/placeholder:border-regilio-green/50 transition-colors"></div>
                                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[3px] border-l-[3px] border-white/10 group-hover/placeholder:border-regilio-green/50 transition-colors"></div>
                                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[3px] border-r-[3px] border-white/10 group-hover/placeholder:border-regilio-green/50 transition-colors"></div>
                            </div>
                        )}
                    </div>
                );
             })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorySection;