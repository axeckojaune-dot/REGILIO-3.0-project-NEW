import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trophy, Medal, Star } from 'lucide-react';
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

interface Achievement {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  stats?: { label: string; value: string }[];
  placeholder: string;
  orientation: 'portrait' | 'landscape';
}

const achievements: Achievement[] = [
  {
    id: "LEGACY_01",
    year: "1988",
    title: "The Seoul Statement",
    subtitle: "Olympic Games • KO1 (1:50) vs Kelcie Banks",
    description: "In Seoul, the unknown Dutch featherweight delivered a moment the world couldn’t ignore. One slip. One opening. One punch at 1:50—and the arena flipped from silence to shock. No medal that night… but a statement that his name belonged on the world stage.",
    icon: <Medal className="w-5 h-5" />,
    placeholder: "MAGAZINE_COVER_88",
    orientation: 'portrait'
  },
  {
    id: "LEGACY_02",
    year: "1994",
    title: "World Champion",
    subtitle: "WBO Super Featherweight • Title Win in Rotterdam",
    description: "Rotterdam became the checkpoint where talent turned permanent. On September 24, 1994, Regilio captured the vacant WBO world title against Eugene Speed—and never lost it in the ring. Six defenses later, the belt was still his. The game was forced to adapt to his precision.",
    icon: <Trophy className="w-5 h-5" />,
    placeholder: "CHAMPION_BELT",
    orientation: 'landscape'
  },
  {
    id: "LEGACY_03",
    year: "HALL OF FAME",
    title: "The Legend",
    subtitle: "46 Wins • 30 KOs • NY State Boxing Hall of Fame",
    description: "Some champions win belts. Others become a reference. With a record of 46–4–1 and 30 knockouts, Regilio’s style made opponents fight shadows—calm, controlled, surgical. In 2019, that legacy was officially recognized with his induction into the New York State Boxing Hall of Fame.",
    icon: <Star className="w-5 h-5" />,
    stats: [
      { label: "WINS", value: "46" },
      { label: "KOS", value: "30" },
      { label: "DRAWS", value: "01" }
    ],
    placeholder: "HALL_OF_FAME_PIC",
    orientation: 'landscape'
  }
];

// --- Animated Wrapper for Scroll Reveals ---
const RevealWrapper: React.FC<{ children: React.ReactNode; delay?: number; index: number }> = ({ children, delay = 0, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1, // Trigger slightly earlier
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  // Determine initial rotation direction based on index (even/odd)
  const initialRotate = index % 2 === 0 ? 'rotate-y-6 rotate-x-6' : '-rotate-y-6 rotate-x-6';

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform transform-gpu ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 blur-0 rotate-0'
          : `opacity-0 translate-y-24 scale-90 blur-md ${initialRotate}`
      }`}
      style={{ 
        perspective: '1200px',
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

// --- 3D Card Component ---
const LegacyCard: React.FC<{ 
  item: Achievement; 
  uploadedImage?: string; 
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reversed?: boolean;
}> = ({ item, uploadedImage, onUpload, reversed }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const isLandscape = item.orientation === 'landscape';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (max 4 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    setRotate({ x: rotateX, y: rotateY });
    setGlow({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // Dynamic Sizing based on Orientation
  // Landscape cards are shorter to emphasize width. Portrait cards are tall.
  const containerMinHeight = isLandscape ? 'min-h-[340px]' : 'min-h-[500px]';
  const placeholderClass = isLandscape ? 'aspect-video' : 'min-h-[500px]';

  return (
    <div 
      className="perspective-1000 w-full group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={cardRef}
        // FULLY ADAPTIVE CONTAINER
        className={`relative w-full flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'} bg-[#080808] border border-white/10 rounded-xl overflow-hidden transition-transform duration-100 ease-out shadow-[0_30px_60px_rgba(0,0,0,0.6)] h-auto ${containerMinHeight} items-stretch`}
        style={{
          transform: `perspective(2000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
        }}
      >
        {/* Holographic Sheen Overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-15 pointer-events-none z-20 transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(204, 255, 0, 0.8), transparent 60%)`
          }}
        />

        {/* IMAGE SECTION (50% on desktop - Flexible Height) */}
        {/* This container will grow as needed. */}
        <div className={`relative md:w-1/2 bg-[#050505] border-b md:border-b-0 ${reversed ? 'md:border-l' : 'md:border-r'} border-white/5 flex flex-col`}>
             <label className="cursor-pointer block w-full flex-grow relative group/img">
                <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*"
                   onChange={onUpload}
                />
                
                {uploadedImage ? (
                  <div className={`w-full relative bg-[#080808] ${isLandscape ? 'h-full' : 'h-auto'}`}>
                     {/* Background Pattern */}
                     <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-30 pointer-events-none"></div>
                     
                     <img 
                       src={uploadedImage} 
                       alt={item.title} 
                       className="w-full h-full object-cover block relative z-10 transition-transform duration-700 group-hover/img:scale-105"
                     />
                     
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity z-20">
                         <div className="bg-black/80 px-3 py-1 rounded border border-regilio-green/30 flex items-center gap-2 backdrop-blur-md">
                             <Upload className="w-3 h-3 text-regilio-green" />
                             <span className="text-[10px] font-mono text-white tracking-widest uppercase">Edit</span>
                         </div>
                     </div>
                  </div>
                ) : (
                  <div className={`w-full h-full ${placeholderClass} flex flex-col items-center justify-center gap-4 relative`}>
                     {/* Placeholder Pattern */}
                     <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_15px,rgba(255,255,255,0.01)_15px,rgba(255,255,255,0.01)_30px)] opacity-50"></div>
                     
                     <div className="relative z-10 w-16 h-16 rounded-full border border-dashed border-neutral-700 flex items-center justify-center group-hover/img:border-regilio-green/50 transition-colors bg-black/20 backdrop-blur-sm">
                        <Upload className="w-6 h-6 text-neutral-600 group-hover/img:text-regilio-green transition-colors" />
                     </div>
                     <span className="relative z-10 text-[10px] font-mono text-neutral-500 uppercase tracking-widest group-hover/img:text-regilio-green transition-colors">
                        {item.placeholder}
                     </span>
                  </div>
                )}
             </label>

             {/* Year Tag - Floating */}
             <div className={`absolute top-4 ${reversed ? 'right-4' : 'left-4'} bg-regilio-green text-black text-xs font-bold px-2 py-1 tracking-tighter shadow-lg z-20`}>
                {item.year}
             </div>
        </div>

        {/* CONTENT SECTION (50% on desktop) */}
        <div className="relative md:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-[#0a0a0a]">
             <div>
                {/* Accent Line */}
                <div className="w-8 h-[2px] bg-regilio-green mb-4 shadow-[0_0_8px_#ccff00]"></div>
                
                <div className="flex justify-between items-start mb-3">
                   <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-[1]">{item.title}</h3>
                   <div className="text-regilio-green/20 group-hover:text-regilio-green transition-colors p-1.5 border border-white/5 rounded-full">
                      {item.icon}
                   </div>
                </div>
                
                <h4 className="text-[10px] md:text-xs font-mono text-neutral-400 uppercase tracking-[0.2em] mb-6 border-b border-white/5 pb-2 inline-block">{item.subtitle}</h4>
                
                <p className="text-base text-neutral-300 leading-relaxed font-sans font-medium opacity-90">
                   {item.description}
                </p>
             </div>

             {/* Stats Row (Only if present) */}
             {item.stats && (
                <div className="mt-8 pt-6 border-t border-white/5 flex gap-8">
                   {item.stats.map((stat, i) => (
                      <div key={i}>
                         <div className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mb-1">{stat.label}</div>
                         <div className="text-xl md:text-2xl font-bold text-regilio-green tabular-nums">{stat.value}</div>
                      </div>
                   ))}
                </div>
             )}
             
             {/* Large Number Background */}
             <div className={`absolute bottom-[-10px] ${reversed ? 'left-[-10px]' : 'right-[-10px]'} md:bottom-[-20px] md:right-[-20px] text-[100px] md:text-[180px] font-black text-white/5 pointer-events-none font-sans leading-none overflow-hidden select-none`}>
                0{achievements.indexOf(item) + 1}
             </div>
        </div>
      </div>
    </div>
  );
};


const LegacySection: React.FC = () => {
  const [uploadedImages, setUploadedImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAssets().then(setUploadedImages);
  }, []);

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImages(prev => ({ ...prev, [id]: imageUrl }));
      saveAsset(id, file);
    }
  };

  return (
    <section className="relative min-h-screen bg-transparent py-24 overflow-hidden">
      
      {/* Background Marquee */}
      <BackgroundMarquee text="LEGACY" />
      
      {/* Background Glows for Seamless Transitions */}
      {/* Top creeping glow (connects to Story) */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-regilio-green/5 blur-[150px] rounded-full pointer-events-none -z-10"></div>
      
      {/* Bottom creeping glow (connects to Vision) */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh] bg-regilio-green/5 blur-[150px] rounded-full pointer-events-none -z-10 opacity-60"></div>

      {/* Header */}
      <div className="text-center mb-24 px-6 relative z-10">
          <span className="text-regilio-green font-mono text-xs tracking-[0.3em] uppercase mb-3 block animate-fade-up">The Hall of Fame</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter">
            LEGACY OF A CHAMPION
          </h2>
      </div>

      {/* Vertical Stack */}
      <div className="container mx-auto px-6 flex flex-col gap-12 md:gap-32 max-w-5xl z-10 relative">
         {achievements.map((item, index) => (
            <div key={item.id} className="w-full">
                <RevealWrapper delay={index * 100} index={index}>
                  <LegacyCard 
                    item={item} 
                    uploadedImage={uploadedImages[item.id]}
                    onUpload={(e) => handleImageUpload(item.id, e)}
                    reversed={index % 2 !== 0}
                  />
                </RevealWrapper>
            </div>
         ))}
      </div>
    </section>
  );
};

export default LegacySection;