import React, { useState, useEffect } from 'react';
import { NavLink } from '../types';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const NAV_ITEMS: NavLink[] = [
  { label: "REGILIO'S STORY", href: "#story" },
  { label: "STYLE. DISCIPLINE. INFLUENCE.", href: "#style-discipline" },
  { label: "PRESS & CULTURE", href: "#press-culture" },
  { label: "THE RADICAL DECISION", href: "#radical-decision" },
];

interface NavbarProps {
  isLightMode?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ isLightMode = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auto-hover sequencer state
  const [autoHoverIndex, setAutoHoverIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Rhythmic Auto-Hover Sequence
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const runSequence = (index: number) => {
        // Cycle through items 0 to 3
        if (index < NAV_ITEMS.length) {
            setAutoHoverIndex(index);
            // Stay on this item for 1.2s before moving to next
            timeoutId = setTimeout(() => {
                runSequence(index + 1);
            }, 1200); 
        } else {
            // Sequence complete. Reset to null (all off) for a pause, then restart.
            setAutoHoverIndex(null);
            timeoutId = setTimeout(() => {
                runSequence(0);
            }, 1500); // 1.5s pause before restarting loop
        }
    };

    // Initial start delay
    timeoutId = setTimeout(() => runSequence(0), 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Programmatic Scroll Handler to prevent default anchor behavior
  const handleNavClick = (e: React.MouseEvent<HTMLElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  // Theme Variables
  const logoColor = isLightMode ? 'text-black' : 'text-white';
  const navTextColor = isLightMode ? 'text-black' : 'text-regilio-green';
  const navHoverColor = isLightMode ? 'text-regilio-green' : 'text-white';
  const borderColor = isLightMode ? 'border-black/5' : 'border-white/5';
  const bgColor = isLightMode ? 'bg-white/90' : 'bg-[#030303]/80';

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] border-b backdrop-blur-md
        ${isScrolled ? 'py-3' : 'py-6'}
        ${bgColor} ${borderColor}
        `}
      >
        <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
          
          {/* --- LOGO: Glitch/Tech Aesthetic --- */}
          <a 
            href="#hero" 
            onClick={(e) => handleNavClick(e, '#hero')}
            className="relative group cursor-pointer z-50 select-none"
          >
            <div className="flex items-center gap-1.5">
              {/* Main Name */}
              <div className="relative overflow-hidden">
                <span className={`block text-2xl font-black tracking-tighter ${logoColor} transition-transform duration-500 group-hover:-translate-y-full`}>
                  REGILIO
                </span>
                <span className={`absolute top-0 left-0 block text-2xl font-black tracking-tighter ${isLightMode ? 'text-black' : 'text-regilio-green'} transition-transform duration-500 translate-y-full group-hover:translate-y-0`}>
                  REGILIO
                </span>
              </div>
              
              {/* Version Tag */}
              <div className={`relative px-1.5 py-0.5 border ${isLightMode ? 'border-black' : 'border-regilio-green'} overflow-hidden`}>
                <div className={`absolute inset-0 transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0 ${isLightMode ? 'bg-black' : 'bg-regilio-green'}`}></div>
                <span className={`relative z-10 block font-mono text-[10px] font-bold leading-none transition-colors duration-300 ${isLightMode ? 'text-black group-hover:text-white' : 'text-regilio-green group-hover:text-black'}`}>
                  3.0
                </span>
              </div>
            </div>
          </a>

          {/* --- DESKTOP NAV: Sliding Text Reveal & Floating Wave --- */}
          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item, index) => {
              // Determine if this item is currently active in the auto-sequence
              const isAutoActive = index === autoHoverIndex;

              return (
                <a 
                  key={index} 
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="group relative overflow-hidden py-2 cursor-pointer animate-nav-wave"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Text Wrapper */}
                  <div className="relative">
                      {/* Default State (Slides Up) */}
                      {/* logic: If autoActive OR groupHover, translate up out of view */}
                      <div className={`text-[11px] font-bold uppercase tracking-[0.2em] font-sans transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${navTextColor}
                          ${isAutoActive ? '-translate-y-[150%]' : 'group-hover:-translate-y-[150%]'}
                      `}>
                          {item.label}
                      </div>
                      
                      {/* Hover State (Slides From Bottom) */}
                      {/* logic: If autoActive OR groupHover, translate in to view */}
                      <div className={`absolute top-0 left-0 w-full text-[11px] font-bold uppercase tracking-[0.2em] font-sans transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] ${navHoverColor}
                          ${isAutoActive ? 'translate-y-0' : 'translate-y-[150%] group-hover:translate-y-0'}
                      `}>
                          {item.label}
                      </div>
                  </div>

                  {/* Animated Underline (Center Out) */}
                  <div className={`absolute bottom-0 left-1/2 h-[1px] -translate-x-1/2 transition-all duration-500 ease-out ${isLightMode ? 'bg-black' : 'bg-regilio-green'}
                      ${isAutoActive ? 'w-full' : 'w-0 group-hover:w-full'}
                  `}></div>
                </a>
              );
            })}
          </div>

          {/* --- RIGHT ACTION: Magnetic/Fill Button --- */}
          <div className="hidden md:block">
            <button 
                onClick={(e) => handleNavClick(e, '#tuur-section')}
                className={`group relative px-7 py-2.5 overflow-hidden border transition-all duration-300
                ${isLightMode 
                    ? 'border-black text-black hover:text-white' 
                    : 'border-white/20 text-white hover:border-regilio-green hover:text-black'
                }
            `}>
                {/* Background Fill Animation */}
                <div className={`absolute inset-0 translate-y-[102%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                    ${isLightMode ? 'bg-black' : 'bg-regilio-green'}
                `}></div>

                {/* Content */}
                <div className="relative flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
                        Switch to Tuurmill
                    </span>
                    <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
            </button>
          </div>

          {/* --- MOBILE TOGGLE --- */}
          <div className="md:hidden z-50">
             <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`p-2 transition-colors duration-300 ${isMobileMenuOpen ? 'text-white' : logoColor}`}
             >
                 {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>

        {/* --- MOBILE MENU OVERLAY --- */}
        <div 
            className={`fixed inset-0 z-40 bg-black flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
            ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
            `}
        >
             {/* Background Noise */}
             <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

             <div className="flex flex-col gap-8 text-center relative z-10">
                {NAV_ITEMS.map((item, index) => (
                    <a 
                        key={index}
                        href={item.href}
                        onClick={(e) => handleNavClick(e, item.href)}
                        className={`text-3xl font-black text-regilio-green uppercase tracking-tighter transition-all duration-500 transform
                        ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}
                        `}
                        style={{ transitionDelay: `${index * 100}ms` }}
                    >
                        {item.label}
                    </a>
                ))}
             </div>
             
             <div className="absolute bottom-12 text-regilio-green font-mono text-xs uppercase tracking-widest opacity-50">
                System Online
             </div>
        </div>

        {/* --- STYLES FOR WAVE ANIMATION --- */}
        <style>{`
            @keyframes nav-wave {
                0%, 100% { transform: translateY(0); }
                15% { transform: translateY(-4px); }
                30% { transform: translateY(0); }
            }
            .animate-nav-wave {
                animation: nav-wave 5s ease-in-out infinite;
                will-change: transform;
            }
        `}</style>
      </nav>
    </>
  );
};

export default Navbar;