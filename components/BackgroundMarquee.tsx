import React from 'react';

interface BackgroundMarqueeProps {
  text: string;
  opacity?: string; // Tailwind opacity class (e.g., 'opacity-[0.05]')
  className?: string;
}

const BackgroundMarquee: React.FC<BackgroundMarqueeProps> = ({ 
  text, 
  opacity = 'opacity-[0.03]',
  className = "" 
}) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none -z-10 select-none ${className}`}>
      {/* 
        We duplicate the content to ensure a seamless loop.
        The animation moves from -50% to 0% (Left to Right).
      */}
      <div className={`flex whitespace-nowrap animate-marquee-right ${opacity}`}>
         {/* Chunk 1 */}
         <div className="flex shrink-0">
             <span className="text-[25vw] leading-none font-black tracking-tighter px-12 text-outline-subtle">{text}</span>
             <span className="text-[25vw] leading-none font-black tracking-tighter px-12 text-outline-subtle">{text}</span>
         </div>
         {/* Chunk 2 (Duplicate for loop) */}
         <div className="flex shrink-0">
             <span className="text-[25vw] leading-none font-black tracking-tighter px-12 text-outline-subtle">{text}</span>
             <span className="text-[25vw] leading-none font-black tracking-tighter px-12 text-outline-subtle">{text}</span>
         </div>
      </div>
      
      <style>{`
        .text-outline-subtle {
           /* Optional: Makes the text feel more like a background texture if needed, currently using solid with low opacity */
           color: currentColor; 
        }
      `}</style>
    </div>
  );
};

export default BackgroundMarquee;