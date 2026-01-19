import React, { useRef, useState, useEffect } from 'react';
import { Cpu, Brain, MessageSquareText, ArrowRight, Zap, Trophy, Sparkles, Plus, ArrowUpRight } from 'lucide-react';
import BackgroundMarquee from './BackgroundMarquee';

const TuurSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Brain strokeWidth={1.5} />,
      title: "Connected to an AI-operated platform",
      description: "A neural network that learns from your biomechanics in real-time."
    },
    {
      icon: <Cpu strokeWidth={1.5} />,
      title: "Robotics-inspired equipment",
      description: "Precision engineered hardware that reveals performance from the inside out."
    },
    {
      icon: <MessageSquareText strokeWidth={1.5} />,
      title: "Personalized guidance",
      description: "Through a digital assistant."
    },
    {
      icon: <Zap strokeWidth={1.5} />,
      title: "Future-ready.",
      description: "Built for the next generation of performance."
    },
    {
      icon: <Trophy strokeWidth={1.5} />,
      title: "Winners for life.",
      description: "The best is to come."
    }
  ];

  return (
    <section 
      ref={containerRef}
      id="tuur-section"
      className="relative w-full min-h-screen bg-[#F5F5F7] text-[#111] py-24 md:py-32 overflow-hidden z-40"
    >
      <BackgroundMarquee text="INTELLIGENCE" opacity="opacity-[0.05]" className="text-black" />

      {/* --- BACKGROUND TECH LAYER --- */}
      {/* Subtle Dot Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none"></div>
      
      {/* Gradient Mesh */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-gradient-to-b from-white to-transparent opacity-60 blur-3xl pointer-events-none"></div>

      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-20 items-start">
            
            {/* --- LEFT COLUMN: STICKY HEADER & VISUAL --- */}
            <div className="w-full lg:w-[45%] lg:sticky lg:top-32 self-start">
                
                {/* Header Content */}
                <div className={`transition-all duration-1000 ease-out mb-12 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex items-center gap-3 mb-8">
                        <span className="px-3 py-1 bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase rounded-full">
                            Regilio 3.0
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 font-bold tracking-widest uppercase flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-regilio-green rounded-full animate-pulse"></span>
                            System Active
                        </span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-black mb-8">
                        TUUR <span className="text-neutral-400 font-normal text-4xl block mt-2 tracking-tight">— when machines become smart.</span>
                    </h1>
                    
                    <div className="pl-6 border-l-2 border-regilio-green">
                        <p className="text-lg md:text-xl text-neutral-600 font-sans leading-relaxed">
                            Regilio's early career benefited from emerging diagnostic technologies—tools that revealed performance from the inside out. <br/><span className="text-black font-medium mt-4 block">Years later, he returned to understand the technology behind them—and how to apply it to real people.</span>
                        </p>
                    </div>

                    <div className="mt-12">
                         <button className="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full hover:bg-regilio-green hover:text-black transition-all shadow-lg hover:shadow-regilio-green/50">
                            <span className="font-bold text-sm tracking-widest uppercase">Explore Technology</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </button>
                    </div>
                </div>

                {/* Abstract Visual (Freestanding) */}
                <div className={`relative w-full aspect-square max-w-md mx-auto lg:mx-0 transition-opacity duration-1000 delay-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                     {/* The Core Animation */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="absolute w-[80%] h-[80%] border border-neutral-200 rounded-full animate-[spin_20s_linear_infinite]"></div>
                        <div className="absolute w-[60%] h-[60%] border border-dashed border-neutral-300 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                        <div className="absolute w-[40%] h-[40%] border border-neutral-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
                        
                        {/* Center Brain */}
                        <div className="absolute w-20 h-20 bg-white rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.05)] flex items-center justify-center z-10">
                            <div className="w-3 h-3 bg-regilio-green rounded-full animate-pulse shadow-[0_0_15px_#ccff00]"></div>
                        </div>

                        {/* Orbiting Elements */}
                        <div className="absolute top-0 left-1/2 w-3 h-3 bg-black rounded-full -translate-x-1/2 -translate-y-1.5 shadow-lg"></div>
                     </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: FEATURE LIST --- */}
            <div className="w-full lg:w-[55%] flex flex-col pt-12 lg:pt-0 pb-32">
                {features.map((feature, index) => (
                    <div 
                        key={index}
                        className={`group relative py-10 border-b border-black/5 flex flex-col md:flex-row gap-6 md:gap-10 items-start transition-all duration-700
                             hover:border-black/20
                             ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}
                        `}
                        style={{ transitionDelay: `${index * 150 + 200}ms` }}
                    >
                        {/* Icon */}
                        <div className="w-14 h-14 flex-shrink-0 bg-white rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-black group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                             {React.cloneElement(feature.icon as React.ReactElement, { className: "w-7 h-7" })}
                        </div>

                        {/* Content */}
                        <div className="flex-1 w-full">
                             <div className="flex justify-between items-start w-full">
                                 <h3 className="text-2xl md:text-3xl font-bold text-black mb-4 tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                                     {feature.title}
                                 </h3>
                                 
                                 {/* Interactive Button (No Rectangle) */}
                                 <button className="w-10 h-10 flex-shrink-0 rounded-full border border-black/10 flex items-center justify-center text-black hover:bg-black hover:text-white hover:border-black transition-all duration-300 group-hover:rotate-45 ml-4">
                                     <ArrowUpRight className="w-4 h-4" />
                                 </button>
                             </div>
                             
                             <p className="text-neutral-500 text-lg leading-relaxed max-w-lg group-hover:text-neutral-800 transition-colors duration-300">
                                 {feature.description}
                             </p>
                        </div>
                    </div>
                ))}
            </div>

        </div>

      </div>

      {/* --- SEAMLESS TRANSITION GRADIENT --- */}
      {/* Blends from #F5F5F7 (Current Section) to #e5e7eb (Top of Conclusion Section) */}
      <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-b from-[#F5F5F7]/0 via-[#e5e7eb]/50 to-[#e5e7eb] pointer-events-none z-0"></div>
    </section>
  );
};

export default TuurSection;