import React, { useEffect, useRef, useState } from 'react';

const ConclusionSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // --- VISIBILITY OBSERVER ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // --- BLACK PARTICLE ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let animationId: number;

    const particles: {x: number, y: number, size: number, vx: number, vy: number, alpha: number}[] = [];
    const particleCount = window.innerWidth < 768 ? 40 : 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.5, // Faster movement than stars
        vy: (Math.random() - 0.5) * 0.5,
        alpha: Math.random() * 0.5 + 0.1 // Black alpha
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap Logic
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw Particle (Black)
        ctx.fillStyle = `rgba(0, 0, 0, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
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

  // --- METALLIC SPOTLIGHT ANIMATION ---
  useEffect(() => {
    let frameId: number;
    const start = performance.now();
    
    const animateText = (t: number) => {
        const elapsed = t - start;
        const duration = 5000; 
        const progress = (elapsed % duration) / duration; 
        
        // Calculate Spotlight Position (-20% to 120%)
        // Sweep from left to right
        const percentage = -20 + (progress * 140);
        
        if (textRef.current) {
            // Complex gradient simulating a light source reflecting off chrome text
            // The text is transparent, background clips to text.
            // Gradient: Dark Grey -> Bright Silver -> Dark Grey
            textRef.current.style.backgroundImage = `linear-gradient(120deg, #1a1a1a ${percentage - 25}%, #ffffff ${percentage}%, #1a1a1a ${percentage + 25}%)`;
        }
        
        frameId = requestAnimationFrame(animateText);
    }
    frameId = requestAnimationFrame(animateText);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section 
      ref={containerRef}
      id="conclusion-section"
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden z-40 bg-[#d4d4d8]"
    >
        {/* --- LAYER 1: METALLIC BASE --- */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 z-0"></div>
        
        {/* --- LAYER 2: TEXTURE --- */}
        <div className="absolute inset-0 bg-noise opacity-30 mix-blend-multiply pointer-events-none z-0"></div>
        
        {/* --- LAYER 3: VIGNETTE --- */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)] pointer-events-none z-0"></div>

        {/* --- LAYER 4: BLACK PARTICLES --- */}
        <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none"></canvas>

        {/* --- CONTENT --- */}
        <div className={`relative z-10 max-w-[90vw] md:max-w-7xl px-6 text-center transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            
            {/* The Quote */}
            <h1 
                ref={textRef}
                className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.95] md:leading-[0.9] select-none"
                style={{
                    color: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    backgroundSize: '200% 100%',
                    // Initial fallback
                    backgroundImage: 'linear-gradient(120deg, #1a1a1a, #52525b, #1a1a1a)',
                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.2))'
                }}
            >
                Where a champion's discipline meets breakthrough innovation
            </h1>

            {/* The Subtitle / Label */}
            <div className="mt-16 md:mt-24 flex items-center justify-center gap-6 opacity-80">
                <div className="hidden md:block w-16 h-[2px] bg-black/20"></div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                    <p className="font-mono text-xs md:text-sm font-bold tracking-[0.3em] uppercase text-black">
                        The Regilio 3.0 Story
                    </p>
                </div>
                <div className="hidden md:block w-16 h-[2px] bg-black/20"></div>
            </div>
            
            {/* Footer Copyright */}
            <div className="absolute top-[calc(100%+80px)] left-0 w-full text-center pb-8 opacity-40">
                <p className="text-[10px] font-mono text-black uppercase tracking-widest">© 2024 Regilio Tuur. All Rights Reserved.</p>
             </div>
        </div>
    </section>
  );
};

export default ConclusionSection;