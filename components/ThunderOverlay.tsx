import React, { useEffect, useRef, useState } from 'react';

// --- Procedural Lightning Engine ---
const drawLightning = (
  ctx: CanvasRenderingContext2D, 
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  displace: number, 
  depth: number = 0
) => {
  if (displace < 15) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    return;
  }

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  
  // Calculate normal offset
  const offsetX = (Math.random() - 0.5) * displace;
  const offsetY = (Math.random() - 0.5) * displace;

  drawLightning(ctx, x1, y1, midX + offsetX, midY + offsetY, displace / 2, depth + 1);
  drawLightning(ctx, midX + offsetX, midY + offsetY, x2, y2, displace / 2, depth + 1);
};

const ThunderOverlay: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const lastTriggerTime = useRef(0);

  const triggerThunder = () => {
    const now = Date.now();
    // Cooldown to prevent spamming (1.2s allows triggers between sections but prevents strobe)
    if (now - lastTriggerTime.current < 1200) return; 
    lastTriggerTime.current = now;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize to fit current window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    // 1. Clear previous
    ctx.clearRect(0, 0, w, h);

    // 2. Setup Style - More lowkey
    ctx.strokeStyle = 'rgba(204, 255, 0, 0.7)'; // Regilio Green with transparency
    ctx.lineWidth = Math.random() * 1.5 + 0.5; // Thinner lines
    ctx.shadowBlur = 15; // Reduced glow
    ctx.shadowColor = 'rgba(204, 255, 0, 0.5)';
    ctx.globalCompositeOperation = 'screen';

    // 3. Draw Bolts (Single bolt usually to be less chaotic)
    const numBolts = Math.random() > 0.8 ? 2 : 1;
    for (let i = 0; i < numBolts; i++) {
        const startX = Math.random() * w;
        drawLightning(ctx, startX, 0, Math.random() * w, h, 250);
    }
    ctx.stroke();

    // 4. Trigger Screen Flash (Background only) - Much more subtle
    // Random opacity between 0.02 and 0.06
    setFlashOpacity(Math.random() * 0.04 + 0.02); 
    setTimeout(() => setFlashOpacity(0), 80 + Math.random() * 100);

    // 5. Cleanup Canvas
    setTimeout(() => ctx.clearRect(0, 0, w, h), 200);
  };

  useEffect(() => {
    // Observer for section visibility
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
            triggerThunder();
        }
      });
    }, { threshold: 0.15 }); 

    // Helper to attach observers to current DOM
    const attachObservers = () => {
        // Observe main sections AND individual story blocks for consistent effect while scrolling story
        const targets = document.querySelectorAll('section, .story-block');
        targets.forEach(el => intersectionObserver.observe(el));
    };

    // Watch for new content
    const mutationObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });
        if (shouldUpdate) attachObservers();
    });

    // Start watching
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    
    // Initial attach (wait slightly for React to mount children)
    setTimeout(attachObservers, 100);

    // Initial trigger
    setTimeout(triggerThunder, 800);

    return () => {
        intersectionObserver.disconnect();
        mutationObserver.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full mix-blend-screen opacity-80" 
      />
      <div 
        className="absolute inset-0 bg-white mix-blend-overlay transition-opacity duration-300" 
        style={{ opacity: flashOpacity }} 
      />
    </div>
  );
};

export default ThunderOverlay;