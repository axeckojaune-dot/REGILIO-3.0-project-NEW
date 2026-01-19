import React, { useState, useEffect, useRef } from 'react';
import { Upload, ArrowRight, Play, X, Film, Volume2, VolumeX } from 'lucide-react';

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

interface IntroVideoProps {
  onComplete: () => void;
}

const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [loadingAsset, setLoadingAsset] = useState(true);
  const [isMuted, setIsMuted] = useState(true); // Default to true for autoplay compliance
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadAssets().then((assets) => {
      if (assets['INTRO_SEQUENCE']) {
        setVideoSrc(assets['INTRO_SEQUENCE']);
      }
      setLoadingAsset(false);
    });
  }, []);

  // Auto-play when source is set
  useEffect(() => {
    if (videoSrc && videoRef.current) {
        // Enforce mute to satisfy browser autoplay policies
        videoRef.current.muted = true;
        setIsMuted(true);

        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                setIsPlaying(true);
            }).catch(err => {
                console.log("Autoplay blocked, waiting for interaction", err);
                setIsPlaying(false);
            });
        }
    }
  }, [videoSrc]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      saveAsset('INTRO_SEQUENCE', file);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleVideoEnded = () => {
    onComplete();
  };

  const togglePlay = () => {
    if (videoRef.current) {
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    }
  };

  if (loadingAsset) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center overflow-hidden">
      
      {videoSrc ? (
        // VIDEO PLAYING STATE
        <div 
            className="absolute inset-0 w-full h-full group"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onClick={togglePlay} // Allow click to pause/play
        >
            <video 
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted={isMuted}
                onEnded={handleVideoEnded}
            />

            {/* Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                
                {/* Top Right: Actions */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-4">
                     {/* Mute Toggle */}
                     <button 
                        onClick={toggleMute}
                        className="bg-black/50 hover:bg-white hover:text-black border border-white/20 p-2 rounded-full backdrop-blur-md transition-all text-white"
                     >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                     </button>

                     {/* Upload Change */}
                     <label className="cursor-pointer flex items-center gap-2 bg-black/50 hover:bg-regilio-green hover:text-black border border-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all text-white text-xs font-mono uppercase tracking-widest">
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="video/*"
                            onChange={handleUpload}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Upload className="w-3 h-3" />
                        <span>Change Intro</span>
                     </label>
                </div>

                {/* Bottom Right: Skip */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handleSkip(); }}
                    className="absolute bottom-12 right-12 flex items-center gap-3 group/skip"
                >
                    <span className="text-white font-black text-xl md:text-2xl tracking-tighter uppercase group-hover/skip:text-regilio-green transition-colors">
                        Skip Video
                    </span>
                    <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center bg-white/5 group-hover/skip:bg-regilio-green group-hover/skip:border-regilio-green transition-all">
                        <ArrowRight className="w-4 h-4 text-white group-hover/skip:text-black" />
                    </div>
                </button>
            </div>
            
            {/* Play Button (if paused) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 bg-regilio-green/90 rounded-full flex items-center justify-center shadow-[0_0_30px_#ccff00]">
                        <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                    </div>
                </div>
            )}
        </div>
      ) : (
        // EMPTY STATE: UPLOAD PROMPT
        <div className="relative z-10 w-full max-w-2xl px-6 text-center">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:30px_30px] opacity-20 pointer-events-none"></div>

            <div className="mb-8 relative">
                <div className="w-24 h-24 mx-auto mb-6 relative group">
                     <div className="absolute inset-0 bg-regilio-green/20 rounded-full blur-xl animate-pulse"></div>
                     <div className="relative w-full h-full border-2 border-dashed border-neutral-700 rounded-full flex items-center justify-center bg-black/50">
                        <Film className="w-8 h-8 text-neutral-500" />
                     </div>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
                    Upload Intro Sequence
                </h2>
                <p className="text-neutral-400 font-mono text-sm max-w-md mx-auto leading-relaxed">
                    Upload a video to play before the site loads.<br/>
                    Supported formats: MP4, WebM.
                </p>
            </div>

            <div className="flex flex-col items-center gap-6">
                <label className="cursor-pointer group relative px-8 py-4 bg-regilio-green hover:bg-white transition-colors">
                    <input 
                        type="file" 
                        className="hidden" 
                        accept="video/*"
                        onChange={handleUpload}
                    />
                    <div className="flex items-center gap-3 text-black font-bold uppercase tracking-widest text-sm">
                        <Upload className="w-4 h-4" />
                        <span>Select Video Asset</span>
                    </div>
                </label>

                <button 
                    onClick={handleSkip}
                    className="text-neutral-500 hover:text-white font-mono text-xs uppercase tracking-[0.2em] transition-colors border-b border-transparent hover:border-white pb-1"
                >
                    Skip Video
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default IntroVideo;