import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StorySection from './components/StorySection';
import LegacySection from './components/LegacySection';
import VisionSection from './components/VisionSection';
import StyleDisciplineSection from './components/StyleDisciplineSection';
import DisciplineVideoSection from './components/DisciplineVideoSection';
import PressCultureSection from './components/PressCultureSection';
import RadicalDecisionSection from './components/RadicalDecisionSection';
import ConclusionSection from './components/ConclusionSection';
import TuurSection from './components/TuurSection';
import Loader from './components/Loader';
import BackgroundCanvas from './components/BackgroundCanvas';
import ThunderOverlay from './components/ThunderOverlay';
import IntroVideo from './components/IntroVideo';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [isNavBarLight, setIsNavBarLight] = useState(false);

  // Monitor scroll to switch Navbar theme when entering the white part of Radical Decision section 
  // AND continuing through the Tuur section and Conclusion section.
  useEffect(() => {
    const handleScroll = () => {
        const radicalSection = document.getElementById('radical-decision');
        
        let shouldBeLight = false;

        if (radicalSection) {
            const radicalRect = radicalSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const radicalHeight = radicalRect.height;
            
            // Progress 0 = top of radical section hits top of viewport
            const radicalProgress = -radicalRect.top / (radicalHeight - viewportHeight);
            
            // The white background flash happens around progress 0.39 in Radical Decision.
            // Since everything after this (Tuur, Conclusion) is white/silver, we keep it light.
            if (radicalProgress > 0.39) {
                 shouldBeLight = true;
            }
        }

        setIsNavBarLight(shouldBeLight);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 1. INITIAL LOADER */}
      {loading && <Loader onComplete={() => setLoading(false)} />}
      
      {/* 2. INTRO VIDEO SEQUENCE (Plays after loader, before main app) */}
      {!loading && !introFinished && (
        <IntroVideo onComplete={() => setIntroFinished(true)} />
      )}

      {/* 3. MAIN APP CONTENT (Only mounts when intro is finished) */}
      {!loading && introFinished && (
        <>
          {/* Global Background (Fixed z-0) */}
          <BackgroundCanvas />

          {/* Global Noise Overlay (Fixed z-1) - Ensures seamless texture across sections */}
          <div className="fixed inset-0 bg-noise opacity-[0.12] pointer-events-none z-[1]"></div>

          {/* Thunder Effect (Fixed z-5: Behind content, above background) */}
          <ThunderOverlay />

          <div className="min-h-screen font-sans selection:bg-regilio-green selection:text-black relative z-10 animate-fade-in">
            <Navbar isLightMode={isNavBarLight} />
            <main>
              {/* Only mount Hero when not loading to ensure animations start at the right time */}
              <Hero />
              
              {/* Story Section */}
              <StorySection />

              {/* Legacy Section */}
              <LegacySection />

              {/* Vision Quote Section (The Break) */}
              <VisionSection />

              {/* Style, Discipline, Influence Section */}
              <StyleDisciplineSection />

              {/* Video Placeholder Section */}
              <DisciplineVideoSection />

              {/* Press & Culture Section */}
              <PressCultureSection />

              {/* THE RADICAL DECISION: Scroll Transition Section */}
              <RadicalDecisionSection />

              {/* TUUR: Machines Become Smart (White Theme) */}
              <TuurSection />

              {/* CONCLUSION: The Final Metallic Statement */}
              <ConclusionSection />
            </main>
          </div>
        </>
      )}
      
      {/* Helper style for the hard cut entry of the main app */}
      <style>{`
        @keyframes fadeInApp {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeInApp 1s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default App;