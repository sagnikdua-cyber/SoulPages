import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Sparkles, Heart, Shield, Lock } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const featureHeadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance Animation Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.2 } });

      tl.fromTo('.logo-animate', 
        { scale: 0.8, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 1.5, onComplete: () => {
          // Floating logo
          gsap.to('.logo-animate', {
            y: -20,
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          });
        }}
      )
      .fromTo('.hero-title-span', 
        { y: 60, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          stagger: 0.15,
          onComplete: function() {
            // Floating headings
            gsap.to(this.targets(), {
              y: -10,
              duration: 2.5,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              stagger: {
                each: 0.2,
                repeat: -1,
                yoyo: true
              }
            });
          }
        },
        "-=1"
      )
      .fromTo(subtitleRef.current, 
        { y: 20, opacity: 0 },
        { 
          y: 0, 
          opacity: 1,
          onComplete: () => {
            // Floating subtitle
            gsap.to(subtitleRef.current, {
              y: -8,
              duration: 4,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: 0.5
            });
          }
        },
        "-=0.8"
      )
      .fromTo('.hero-btn-animate', 
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1 },
        "-=0.6"
      );

      // 2. Feature Section Heading Animation
      if (featureHeadingRef.current) {
        gsap.fromTo(featureHeadingRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: featureHeadingRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      // 3. Feature Cards Entrance Animation
      const cards = gsap.utils.toArray('.feature-card-gsap');
      cards.forEach((card: any, i: number) => {
        gsap.fromTo(card,
          { y: 50, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            delay: i * 0.1,
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            onComplete: () => {
              // Start floating animation after entrance
              gsap.to(card, {
                y: -15,
                duration: 2 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: Math.random()
              });
            }
          }
        );
      });

      // 4. Particle Emitter for Logo
      const emitParticle = () => {
        const container = document.querySelector('.particle-container');
        if (!container) return;
        
        const particle = document.createElement('div');
        particle.className = 'particle-dot';
        container.appendChild(particle);
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 80 + Math.random() * 120;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        gsap.set(particle, { x: 0, y: 0, scale: Math.random() * 0.5 + 0.5 });
        
        gsap.to(particle, {
          x: x,
          y: y,
          opacity: 0,
          scale: 0,
          duration: 1.2 + Math.random(),
          ease: "power2.out",
          onComplete: () => particle.remove()
        });
        
        gsap.to(particle, {
          opacity: 1,
          duration: 0.2
        });
      };

      const particleInterval = setInterval(emitParticle, 500);

      // Refresh ScrollTrigger to ensure correct positions
      ScrollTrigger.refresh();

      return () => clearInterval(particleInterval);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const features = [
    { 
      icon: Sparkles, 
      title: "AI Intelligence", 
      desc: "Understand your emotional currents and receive AI coaching for your life's narrative.", 
      color: "border-soul-purple/40",
      glow: "shadow-[0_0_30px_rgba(167,139,250,0.15)]",
      iconCol: "text-soul-purple"
    },
    { 
      icon: Lock, 
      title: "Celestial Vault", 
      desc: "Your most private truths are encrypted and kept safe within your local sanctuary.", 
      color: "border-soul-gold/40",
      glow: "shadow-[0_0_30px_rgba(253,224,71,0.15)]",
      iconCol: "text-soul-gold"
    },
    { 
      icon: Shield, 
      title: "Local Sovereignty", 
      desc: "Your story belongs to you. Data is stored exclusively on your device, private by default.", 
      color: "border-soul-sky/40",
      glow: "shadow-[0_0_30px_rgba(186,230,253,0.15)]",
      iconCol: "text-soul-sky"
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-x-hidden bg-soul-bg">
      <Head>
        <title>SoulPages — Your life. Your memories. Your truth.</title>
      </Head>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-screen text-center relative z-10 overflow-visible">
        <div className="space-y-6 md:space-y-10">
          <div className="flex flex-col items-center justify-center space-y-6 mb-2 logo-animate opacity-0">
            <div className="relative group logo-outer-container">
              {/* Animated Aura Layers */}
              <div className="absolute -inset-8 bg-soul-purple opacity-20 blur-3xl animate-aura rounded-full" />
              <div className="absolute -inset-12 bg-soul-gold/20 blur-3xl animate-aura rounded-full delay-700" />
              <div className="absolute -inset-4 bg-gradient-to-tr from-soul-purple to-soul-gold opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
              
              {/* Particle Container (allows overflow) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none particle-container z-20" />

              <div className="w-48 h-48 md:w-64 md:h-64 bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 animate-glowing overflow-hidden z-10 relative">
                <img src="/logo.png" alt="SoulPages Logo" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
            <h2 className="text-5xl md:text-6xl font-elegant tracking-tighter text-white drop-shadow-2xl">
              Soul<span className="text-soul-purple font-elegant">Pages</span>
            </h2>
          </div>

          <h1 ref={headingRef} className="text-7xl md:text-[8rem] lg:text-[10rem] font-elegant text-white leading-normal tracking-normal py-10 relative overflow-visible">
            <span className="hero-title-span inline-block py-4 opacity-0 relative">Your life.</span> <span className="hero-title-span font-elegant inline-block py-4 opacity-0 relative">Your memories.</span><br />
            <span className="hero-title-span text-soul-gradient font-elegant inline-block py-8 opacity-0 relative">
              Your truth.
            </span>
          </h1>

          <p ref={subtitleRef} className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light opacity-0">
            A celestial digital diary and life companion. Preserve your reflections, architect your goals, and uncover growth with AI-powered wisdom.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12 pb-12">
            <Link href="/auth" className="hero-btn-animate opacity-0">
              <button className="px-10 py-5 bg-white text-soul-indigo rounded-full font-black text-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                Enter The Sanctuary <Sparkles className="w-6 h-6 text-soul-purple" />
              </button>
            </Link>
            <button 
              onClick={() => {
                const element = document.getElementById('features-anchor');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
              className="hero-btn-animate opacity-0 px-10 py-5 glass-premium text-white rounded-full font-bold text-xl hover:bg-white/10 transition-all border border-white/10"
            >
              Discover More
            </button>
          </div>
        </div>

        {/* Features Preview */}
        <div id="features-anchor" className="w-full max-w-7xl mt-40 space-y-20 pb-32">
          <div ref={featureHeadingRef} className="text-center space-y-4 opacity-0">
            <h2 className="text-5xl md:text-7xl font-elegant text-white tracking-tighter">
              Core <span className="text-soul-purple">Facilities</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-soul-purple to-transparent mx-auto opacity-50" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`feature-card-gsap p-10 bg-white/5 backdrop-blur-3xl rounded-[3rem] text-left border ${feature.color} ${feature.glow} transition-all duration-500 group opacity-0`}
            >
              <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`${feature.iconCol} w-8 h-8`} />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-lg font-medium">{feature.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 relative z-10 text-center bg-soul-bg/50 backdrop-blur-xl">
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">
          SoulPages — Your Truth, Architected. 2026.
        </p>
      </footer>
    </div>
  );
}
