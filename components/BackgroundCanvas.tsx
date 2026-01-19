import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  baseAlpha: number;
  size: number;
  vx: number;
  vy: number;
}

const BackgroundCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize Stars
    const stars: Star[] = [];
    const numStars = 150;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        baseAlpha: Math.random() * 0.3 + 0.1, // Slightly more visible by default since no spotlight
        size: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.15, 
        vy: (Math.random() - 0.5) * 0.15,
      });
    }

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      stars.forEach(star => {
        // Move star
        star.x += star.vx;
        star.y += star.vy;

        // Wrap around screen edges
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        // Twinkle effect
        const alpha = star.baseAlpha + (Math.sin(Date.now() * 0.001 + star.x) * 0.05);

        // Draw Star
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        
        // Slight tint for aesthetics
        if (alpha > 0.2) {
             ctx.fillStyle = '#ccff00'; // Regilio Green tint for brighter stars
        } else {
             ctx.fillStyle = '#ffffff';
        }
        
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 w-full h-full pointer-events-none z-0" 
      style={{ background: '#030303' }} // Base dark background
    />
  );
};

export default BackgroundCanvas;