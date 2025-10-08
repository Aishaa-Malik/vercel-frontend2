import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Lenis: any;
    lenisInstance: any;
    VANTA: any;
    THREE: any;
    vantaEffect: any;
  }
}

const LandingPage3: React.FC = () => {
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    // Load CSS files
    const cssFiles = [
      'css/transition.css',
      'css/fonts.css',
      'css/nav-sticky.css',
      'css/globals.css',
      'css/hero-section.css',
      'css/hero-intro.css',
      'css/menu.css',
      'css/home.css',
      'css/work.css',
      'css/project.css',
      'css/features.css',
      'css/about.css',
      'css/contact.css',
      'css/footer.css',
      'css/pre-load.css'
    ];

    const loadedStyles: HTMLLinkElement[] = [];
    const loadedScripts: HTMLScriptElement[] = [];

    // Load CSS
    cssFiles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      loadedStyles.push(link);
    });

    // Load external libraries in correct order
    const loadExternalLibraries = () => {
      return new Promise<void>((resolve) => {
        let scriptsLoaded = 0;
        const totalScripts = 5;

        const onScriptLoad = () => {
          scriptsLoaded++;
          console.log(`Libraries loaded: ${scriptsLoaded}/${totalScripts}`);
          if (scriptsLoaded === totalScripts) {
            resolve();
          }
        };

        // Three.js (required for Vanta)
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js';
        threeScript.onload = onScriptLoad;
        threeScript.onerror = () => console.error('Failed to load Three.js');
        document.head.appendChild(threeScript);
        loadedScripts.push(threeScript);

        // Vanta.js
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js';
        vantaScript.onload = onScriptLoad;
        vantaScript.onerror = () => console.error('Failed to load Vanta.js');
        document.head.appendChild(vantaScript);
        loadedScripts.push(vantaScript);

        // GSAP and ScrollTrigger are now imported via npm
        // Calling onScriptLoad twice to account for the removed scripts
        onScriptLoad();
        onScriptLoad();

        // Lenis
        const lenisScript = document.createElement('script');
        lenisScript.src = 'https://unpkg.com/lenis@1.1.18/dist/lenis.min.js';
        lenisScript.onload = onScriptLoad;
        lenisScript.onerror = () => console.error('Failed to load Lenis');
        document.head.appendChild(lenisScript);
        loadedScripts.push(lenisScript);
      });
    };

    // Initialize Lenis smooth scroll
    const initializeLenis = () => {
      if (window.Lenis) {
        console.log('Initializing Lenis...');
        
        const lenis = new window.Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          smoothTouch: false,
          touchMultiplier: 2,
        });

        // Add lenis class to html element
        document.documentElement.classList.add('lenis');
        console.log('Added lenis class to html element');

        // Animation frame function
        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);

        // Store lenis instance for cleanup
        window.lenisInstance = lenis;
        console.log('Lenis initialized successfully');
      } else {
        console.error('Lenis not available');
      }
    };

    // Load content and scripts
    const loadContent = async () => {
      try {
        // Load HTML
        const response = await fetch("/LandingPage3.html");
        const data = await response.text();
        const bodyContent = data.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || data;
        setHtmlContent(bodyContent);

        // Load external libraries first
        await loadExternalLibraries();
        console.log('All external libraries loaded');

        // Initialize Lenis first (adds the class)
        setTimeout(() => {
          initializeLenis();
        }, 500);

        // Initialize Vanta.js
        setTimeout(() => {
          if (window.VANTA && window.THREE) {
            console.log('Initializing Vanta.js...');
            window.vantaEffect = window.VANTA.FOG({
              el: "#vanta-bg",
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              highlightColor: 0x0,
              midtoneColor: 0xbceaff,
              lowlightColor: 0x0,
              baseColor: 0x0,
              blurFactor: 0.40
            });
            console.log('Vanta.js initialized successfully');
          } else {
            console.error('VANTA or THREE not available:', {
              VANTA: !!window.VANTA,
              THREE: !!window.THREE
            });
          }
        }, 1000);

        // Load custom scripts after libraries
        setTimeout(() => {
          const Lenis = window.Lenis;
          const jsFiles = [
            '/script-hero.js',  // Added the main hero script that handles text segments
            '/text-hero.js',   // Handles hero text animation
            '/js/hero-intro-text.js',
            '/js/magnetic-hover.js',
            '/js/in-page-trans-nav.js',
            '/js/lenis-scroll.js',
            '/js/hero.js',
            '/js/featured-work.js',
            '/js/services.js',
            '/js/work.js',
            '/features.js',
            '/js/project.js',
            '/js/about.js',
            '/js/contact.js',
            '/js/footer.js'
          ];

          jsFiles.forEach(src => {
            const script = document.createElement('script');
            // script.type = 'module';
            script.src = src;
            script.onload = () => console.log(`✅ Script loaded: ${src}`);
            script.onerror = () => console.error(`❌ Script failed: ${src}`);
            document.body.appendChild(script);
            loadedScripts.push(script);
          });
        }, 1500);

      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();

    // Cleanup
    return () => {
      // Clean up Lenis
      if (window.lenisInstance) {
        window.lenisInstance.destroy();
        document.documentElement.classList.remove('lenis');
      }
      
      // Clean up Vanta effect
      if (window.vantaEffect) {
        window.vantaEffect.destroy();
      }
      
      loadedStyles.forEach(link => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
      loadedScripts.forEach(script => {
        if (script.parentNode) script.parentNode.removeChild(script);
      });
    };
  }, []);

  return (
    <>
      <div id="vanta-bg" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }} />
      <div className="landing-page-container">
        <div className="page home-page">
          {/* sticky nav */}
          <div className="nav-sticky">
            <div className="nav-sticky-bottom">
              <div className="nav-sticky-home">
                <img src="assets/logooo.png" alt="Website Logo" className="nav-sticky-logo" />
              </div>

              <div className="nav-sticky-items">
                <div className="nav-sticky-item">
                  <a href="#features-cards">Features</a>
                </div>
              </div>

              <div className="nav-sticky-home-2" id="toggle-btn">
                <a href="#">Login</a>
              </div>
            </div>
          </div>

          {/* HERO SECTION */}
          <HeroSection />

          {/* Rest of the content loaded dynamically */}
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    </>
  );
};

export default LandingPage3;
