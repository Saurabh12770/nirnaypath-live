import { useState, useEffect, useRef } from 'react';
import { BookOpen, FlaskConical, Trophy, Star, ArrowRight, X, Eye, EyeOff, GraduationCap, Zap, Shield, ChevronDown, CheckCircle, Award, Compass, Sun, Moon, ChevronLeft, ChevronRight, BarChart3, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Layout/Footer';

const HERO_SLIDES = [
  { src: '/home_hero1.jpg', tagline: 'UPSC · BPSC · SSC · Railways' },
  { src: '/home_hero2.jpg', tagline: 'Real CBT Exam Simulator' },
  { src: '/home_hero3.jpg', tagline: 'Bilingual Learning System' },
  { src: '/home_hero4.jpg', tagline: '1.34 Lakh+ Practice Questions' },
  { src: '/home_hero5.jpg', tagline: 'AI-Powered Weakness Analysis' },
];

const EXAMS = [
  { id: 'upsc',     name: 'UPSC CSE',          nameHi: 'यूपीएससी सिविल सेवा',       icon: '🏛️', color: '#6C63FF', bg: 'rgba(108,99,255,0.08)', subjects: 12, questions: '45,210' },
  { id: 'bpsc',     name: 'BPSC',               nameHi: 'बीपीएससी',                    icon: '🏢', color: '#C850C0', bg: 'rgba(200,80,192,0.08)', subjects: 10, questions: '32,150' },
  { id: 'ssc-cgl',  name: 'SSC CGL',            nameHi: 'एसएससी सीजीएल',              icon: '📋', color: '#FF6B35', bg: 'rgba(255,107,53,0.08)', subjects: 8,  questions: '28,840' },
  { id: 'ssc-chsl', name: 'SSC CHSL',           nameHi: 'एसएससी सीएचएसएल',           icon: '📝', color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)', subjects: 8,  questions: '18,450' },
  { id: 'railway',  name: 'Railway RRB',        nameHi: 'रेलवे आरआरबी',              icon: '🚂', color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  subjects: 6,  questions: '15,211' },
  { id: 'banking',  name: 'Banking / IBPS',     nameHi: 'बैंकिंग / आईबीपीएस',        icon: '🏦', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', subjects: 5,  questions: '12,500' },
  { id: 'state-pcs',name: 'State PCS',          nameHi: 'राज्य पीसीएस',               icon: '🗺️', color: '#A78BFA', bg: 'rgba(167,139,250,0.08)',subjects: 11, questions: '20,400' },
];

const WHY_US = [
  { icon: Award,     color: '#FF6B35', bg: 'rgba(255,107,53,0.10)', title: 'Zero Cost Education',    titleHi: 'निःशुल्क शिक्षा',       desc: 'No subscriptions, paywalls, or ads — ever.', descHi: 'कोई सदस्यता, पेवॉल या विज्ञापन नहीं।',
    features: ['100% open-source content', 'Unlimited practice attempts', 'No hidden fees'] },
  { icon: Globe,     color: '#6C63FF', bg: 'rgba(108,99,255,0.10)', title: 'Bilingual First',        titleHi: 'द्विभाषी प्रणाली',       desc: 'One-click switch between Hindi and English.', descHi: 'हिंदी और अंग्रेजी के बीच तत्काल स्विच।',
    features: ['Side-by-side translation', 'Bilingual PYQs & notes', 'Hindi MCQs'] },
  { icon: FlaskConical, color: '#C850C0', bg: 'rgba(200,80,192,0.10)', title: 'Real CBT Simulator', titleHi: 'वास्तविक सीबीटी',        desc: 'Exam-grade interface identical to TCS iON.', descHi: 'टीसीएस आईओएन जैसा परीक्षा इंटरफेस।',
    features: ['Color-coded palette', 'Auto-save & timer', 'Submit modal review'] },
  { icon: BarChart3,  color: '#10B981', bg: 'rgba(16,185,129,0.10)', title: 'Smart Analytics',       titleHi: 'स्मार्ट विश्लेषण',      desc: 'Pinpoint your weak areas with data-driven insights.', descHi: 'डेटा-संचालित विश्लेषण से कमजोरी जानें।',
    features: ['Topic accuracy tracking', 'Weakness heatmap', 'Readiness grade'] },
];

const FAQS = [
  { q: 'Is NirnayPath really 100% free?', qHi: 'क्या निर्णयपथ वास्तव में 100% मुफ़्त है?',
    a: 'Yes. No subscriptions, no hidden plans, no ads. All 1.34 Lakh+ questions and guides are fully free.', aHi: 'हाँ। कोई सदस्यता नहीं, कोई छिपी योजना नहीं, कोई विज्ञापन नहीं। सभी 1.34 लाख+ प्रश्न पूरी तरह मुफ़्त हैं।' },
  { q: 'Does it support Hindi medium?', qHi: 'क्या यह हिंदी माध्यम का समर्थन करता है?',
    a: 'Absolutely. Built bilingual from the ground up. Toggle Hindi/English instantly in notes, tests, and the dashboard.', aHi: 'बिल्कुल। शुरू से ही द्विभाषी। नोट्स, परीक्षण और डैशबोर्ड में तुरंत हिंदी/अंग्रेजी टॉगल करें।' },
  { q: 'How accurate is the question bank?', qHi: 'प्रश्न बैंक कितना सटीक है?',
    a: 'Our database contains 1,34,861+ questions sourced from official PYQ papers and verified by our system for difficulty and correctness.', aHi: 'हमारे डेटाबेस में 1,34,861+ आधिकारिक पिछले वर्ष के प्रश्नपत्रों से स्रोत प्रश्न हैं।' },
  { q: 'How does weakness tracking work?', qHi: 'कमजोरी ट्रैकिंग कैसे काम करती है?',
    a: 'After every test, the platform calculates topic-level accuracy. Your dashboard aggregates this into a visual weakness heatmap.', aHi: 'प्रत्येक टेस्ट के बाद, प्लेटफ़ॉर्म विषय-स्तरीय सटीकता की गणना करता है।' },
];

export default function LandingPage() {
  const { language, setLanguage, theme, setTheme, user } = useAuth();
  const navigate = useNavigate();

  const [modal, setModal]           = useState(null);
  const [activeFaq, setActiveFaq]   = useState(null);
  const [slideIdx, setSlideIdx]     = useState(0);
  const [counts, setCounts]         = useState({ questions: 100000, exams: 1, free: 0, students: 2000 });
  const statsRef    = useRef(null);
  const examRef     = useRef(null);

  const t = (en, hi) => language === 'hi' ? hi : en;

  // Auto carousel
  useEffect(() => {
    const timer = setInterval(() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  // Animated counters
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const targets = { questions: 134861, exams: 7, free: 100, students: 4521 };
      const steps   = 60;
      let frame = 0;
      const tick = setInterval(() => {
        frame++;
        const p = Math.min(frame / steps, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCounts({
          questions: Math.round(100000 + (targets.questions - 100000) * ease),
          exams:     Math.round(1 + (targets.exams - 1) * ease),
          free:      Math.round(100 * ease),
          students:  Math.round(2000 + (targets.students - 2000) * ease),
        });
        if (frame >= steps) clearInterval(tick);
      }, 25);
    }, { threshold: 0.1 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page-container" style={{ overflowX: 'hidden' }}>
      <style>{`
        /* Compact Responsive Header & Floating Badges */
        @media (max-width: 640px) {
          .nav-logo-text { display: none !important; }
          .nav-btn-cta { padding: 10px 16px !important; font-size: 14px !important; height: 38px !important; }
          .nav-theme-btn { width: 32px !important; height: 32px !important; }
          .nav-lang-container { padding: 2px !important; }
          .nav-lang-btn { padding: 4px 8px !important; font-size: 10px !important; }
        }
        
        .hero-floating-badge {
          position: absolute;
          background: var(--color-card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1.5px solid var(--color-border-base);
          border-radius: 14px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 30px rgba(8,18,41,0.15);
          z-index: 3;
          white-space: nowrap;
          height: 44px;
          transition: all 0.3s ease;
        }
        .hero-floating-badge span {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--color-text-title-base);
          font-family: 'Outfit', sans-serif;
        }
        .badge-icon-container {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .hero-floating-badge {
            height: 36px !important;
            padding: 6px 10px !important;
          }
          .hero-floating-badge span {
            font-size: 11.5px !important;
          }
          .badge-icon-container {
            width: 24px !important;
            height: 24px !important;
          }
        }
      `}</style>

      {/* ── AMBIENT BACKGROUND ORBS ─────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="bg-orb" style={{ top: '-10%', left: '-5%',  width: 700, height: 700, background: 'rgba(108,99,255,0.07)', animationDelay: '0s' }} />
        <div className="bg-orb" style={{ top: '30%',  right: '-8%', width: 600, height: 600, background: 'rgba(200,80,192,0.05)', animationDelay: '2s' }} />
        <div className="bg-orb" style={{ bottom: '10%',left: '20%', width: 500, height: 500, background: 'rgba(255,107,0,0.05)',  animationDelay: '4s' }} />
      </div>

      {/* ── STICKY NAV ──────────────────────────────────────── */}
      <nav className="navbar" style={{ display: 'flex', alignItems: 'center', padding: '0 clamp(12px,3vw,40px)' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: '0 1 auto', minWidth: 0 }}>
          <div style={{ width: 40, height: 40, background: 'var(--gradient-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(108,99,255,0.30)', flexShrink: 0 }}>
            <GraduationCap size={21} color="white" />
          </div>
          <div className="nav-logo-text" style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.35rem', color: 'var(--color-text-title-base)', letterSpacing: '-0.03em', lineHeight: 1 }}>NirnayPath</div>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--np-orange)', letterSpacing: '0.08em' }}>PRO V4 · PREMIUM</div>
          </div>
        </div>

        {/* Center nav links — desktop */}
        <div className="hide-mobile" style={{ display: 'flex', gap: 28, alignItems: 'center', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {['About', 'Exams', 'Features'].map((item) => (
            <a key={item} href={item === 'About' ? '/about' : `#${item.toLowerCase()}`}
              style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-base)', fontFamily: 'Outfit', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--np-orange)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-base)'}>
              {item}
            </a>
          ))}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
          {/* Theme */}
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="nav-theme-btn"
            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,58,237,0.06)', border: '1.5px solid var(--color-border-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-base)', transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.06)'}>
            {theme === 'dark' ? <Sun size={16} color="var(--np-orange)" /> : <Moon size={16} color="var(--np-purple)" />}
          </button>

          {/* Language */}
          <div className="nav-lang-container" style={{ display: 'flex', background: 'rgba(124,58,237,0.05)', border: '1.5px solid var(--color-border-base)', borderRadius: 10, padding: 3, flexShrink: 0 }}>
            {['EN', 'हिं'].map((lbl, i) => {
              const lang = i === 0 ? 'en' : 'hi';
              return (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className="nav-lang-btn"
                  style={{ background: language === lang ? 'var(--gradient-primary)' : 'none', border: 'none', color: language === lang ? '#fff' : 'var(--color-text-muted-base)', padding: '5px 11px', borderRadius: 7, fontSize: 11, fontFamily: 'Outfit', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>
                  {lbl}
                </button>
              );
            })}
          </div>

          {user ? (
            <button onClick={() => navigate('/dashboard')} className="btn-primary nav-btn-cta" style={{ padding: '9px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>Dashboard</button>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button id="nav-login" onClick={() => setModal('login')} className="btn-secondary hide-mobile" style={{ padding: '9px 18px', fontSize: 13 }}>
                {t('Sign In', 'साइन इन')}
              </button>
              <button id="nav-register" onClick={() => setModal('register')} className="btn-primary nav-btn-cta" style={{ padding: '9px 20px', fontSize: 13, whiteSpace: 'nowrap' }}>
                {t('Start Free', 'शुरू करें')} <ArrowRight size={14} style={{ flexShrink: 0 }} />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────── */}
      <section style={{ paddingTop: 'var(--header-height)', display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        {/* Subtle grid pattern overlay for the hero */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--color-border-base) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px', opacity: 0.3, zIndex: -1 }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px clamp(16px,3vw,40px) 40px', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: 48, alignItems: 'center', width: '100%' }} className="landing-hero-grid">

            {/* LEFT: Copy */}
            <div className="landing-hero-left" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="hero-badge" style={{ marginBottom: 20 }}>
                <Sparkles size={13} />
                {t("India's #1 Free Govt Exam Prep Platform", "भारत का #1 निःशुल्क सरकारी परीक्षा मंच")}
              </div>

              <h1 className="text-hero" style={{ fontWeight: 900, color: 'var(--color-text-title-base)', marginBottom: 20, fontFamily: 'Outfit,sans-serif' }}>
                {t('Crack Govt Exams with ', 'सरकारी परीक्षा क्रैक करें ')}
                <span className="gradient-text">{t("India's Best Free Platform", "भारत के सर्वश्रेष्ठ मुफ़्त मंच से")}</span>
              </h1>

              <p style={{ fontSize: 'clamp(15px,1.3vw,17px)', color: 'var(--color-text-muted-base)', lineHeight: 1.75, marginBottom: 28, maxWidth: 540 }}>
                {t(
                  'Premium bilingual notes, real CBT exam simulator, AI-powered weakness analytics — zero paywalls, zero ads. Built for serious aspirants.',
                  'प्रीमियम द्विभाषी नोट्स, वास्तविक CBT सिम्युलेटर, AI-शक्ति विश्लेषण — कोई पेवॉल नहीं, कोई विज्ञापन नहीं।'
                )}
              </p>

              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 32 }}>
                <button id="cta-register" className="btn-primary" onClick={() => setModal('register')} style={{ padding: '14px 32px', fontSize: 15 }}>
                  {t('Start Learning Free', 'मुफ़्त में शुरू करें')} <ArrowRight size={16} />
                </button>
                <button className="btn-secondary" onClick={() => examRef.current?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '14px 28px', fontSize: 14 }}>
                  {t('Explore Exams', 'परीक्षाएं देखें')}
                </button>
              </div>

              {/* Social proof strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex' }}>
                  {['AS', 'RM', 'SR', 'KP', 'VK'].map((init, i) => (
                    <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-primary)', border: '2.5px solid var(--color-bg-base)', marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{init}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2 }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} fill="#F59E0B" color="#F59E0B" />)}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--color-text-muted-base)', fontWeight: 600, marginTop: 2 }}>
                    {t('4,521+ aspirants this week', 'इस सप्ताह 4,521+ आकांक्षी')}
                  </div>
                </div>
                <div style={{ height: 32, width: 1, background: 'var(--color-border-base)' }} />
                <div style={{ fontSize: 12, color: 'var(--np-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--np-emerald)', animation: 'pulse-glow 2s infinite' }} />
                  {t('Free · No Credit Card Required', 'मुफ़्त · कोई क्रेडिट कार्ड आवश्यक नहीं')}
                </div>
              </div>
            </div>

            {/* RIGHT: Cinematic Carousel */}
            <div className="landing-hero-right" style={{ position: 'relative' }}>
              {/* Carousel */}
              <div className="carousel-container" style={{ boxShadow: '0 32px 80px rgba(108,99,255,0.20), 0 8px 24px rgba(0,0,0,0.15)' }}>
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(8,18,41,0.0) 40%, rgba(8,18,41,0.55) 100%)', zIndex: 1, pointerEvents: 'none' }} />

                {/* Images */}
                {HERO_SLIDES.map((slide, i) => (
                  <img key={i} src={slide.src} alt={`NirnayPath ${i + 1}`} className={`carousel-image${i === slideIdx ? ' active' : ''}`} />
                ))}

                {/* Slide tagline badge */}
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '7px 18px', borderRadius: 100, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', zIndex: 2, whiteSpace: 'nowrap' }}>
                  {HERO_SLIDES[slideIdx].tagline}
                </div>

                {/* Dots */}
                <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, zIndex: 2 }}>
                  {HERO_SLIDES.map((_, i) => (
                    <button key={i} onClick={() => setSlideIdx(i)}
                      style={{ width: i === slideIdx ? 20 : 7, height: 7, borderRadius: 4, background: i === slideIdx ? '#FF6B00' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }} />
                  ))}
                </div>

                {/* Arrows */}
                <button onClick={() => setSlideIdx(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setSlideIdx(i => (i + 1) % HERO_SLIDES.length)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Floating glass stat cards */}
              {[
                { icon: BookOpen,   color: '#6C63FF', text: '1.34L+ Questions',    style: { top: -18, left: -16 }, delay: '0s' },
                { icon: Zap,       color: '#FF6B00', text: '100% Free',           style: { top: 48,  right: -20 }, delay: '0.8s' },
                { icon: Globe,     color: '#10B981', text: 'Hindi + English',      style: { bottom: 70, left: -20 }, delay: '1.6s' },
                { icon: BarChart3, color: '#C850C0', text: 'Real CBT Simulator',  style: { bottom: 0,  right: -16 }, delay: '2.4s' },
              ].map(({ icon: Icon, color, text, style, delay }) => (
                <div key={text} className="hero-floating-badge animate-float" style={{ ...style, animationDelay: delay }}>
                  <div className="badge-icon-container" style={{ background: `${color}18` }}>
                    <Icon size={15} color={color} style={{ flexShrink: 0 }} />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS COUNTERS ──────────────────────────── */}
      <section ref={statsRef} style={{ background: 'var(--color-bg-subtle)', borderTop: '1.5px solid var(--color-border-base)', borderBottom: '1.5px solid var(--color-border-base)', padding: '48px clamp(16px,3vw,40px)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 0 }}>
          {[
            { value: `${counts.questions.toLocaleString()}+`, label: t('Practice Questions', 'अभ्यास प्रश्न'),   color: '#6C63FF', icon: '📚' },
            { value: `${counts.exams} Exams`,                 label: t('Covered Comprehensively', 'पूर्ण पाठ्यक्रम'), color: '#C850C0', icon: '🎯' },
            { value: `${counts.free}% Free`,                  label: t('No Subscription',  'कोई शुल्क नहीं'),   color: '#FF6B00', icon: '✨' },
            { value: `${counts.students.toLocaleString()}+`,  label: t('Registered Aspirants', 'पंजीकृत उम्मीदवार'), color: '#10B981', icon: '🏆' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '24px 16px', borderRight: i < 3 ? '1.5px solid var(--color-border-base)' : 'none', position: 'relative' }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: stat.color, fontFamily: 'Outfit', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted-base)', fontWeight: 600, marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EXAMS UNIVERSE ───────────────────────────────────── */}
      <section id="exams" ref={examRef} style={{ padding: '100px clamp(16px,3vw,40px)', position: 'relative', zIndex: 1, background: 'var(--color-bg-base)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="section-header-center">
            <div className="section-pill"><Trophy size={12} /> {t('Exam Universe', 'परीक्षा ब्रह्मांड')}</div>
            <h2 className="text-display" style={{ marginTop: 8 }}>{t('Fully Mapped Competitive Tracks', 'पूर्ण रूप से मानचित्रित ट्रैक')}</h2>
            <p style={{ color: 'var(--color-text-muted-base)', fontSize: 15, marginTop: 12, maxWidth: 560, margin: '12px auto 0' }}>
              {t('From UPSC to Railways — every exam has its own structured syllabus, notes, and test console.', 'यूपीएससी से रेलवे तक — हर परीक्षा का अपना नोट्स और टेस्ट कंसोल।')}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 52 }}>
            {EXAMS.map((exam) => (
              <button key={exam.id} onClick={() => setModal('register')}
                style={{ background: 'var(--color-card-bg)', backdropFilter: 'blur(16px)', border: `1.5px solid ${exam.color}22`, borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: 'var(--shadow-card)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px) scale(1.01)'; e.currentTarget.style.boxShadow = `0 24px 56px ${exam.color}22, var(--shadow-card)`; e.currentTarget.style.borderColor = `${exam.color}55`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; e.currentTarget.style.borderColor = `${exam.color}22`; }}>
                {/* Top color bar */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: exam.color, borderRadius: '20px 20px 0 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '2.6rem', padding: '10px 12px', background: exam.bg, borderRadius: 16 }}>{exam.icon}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 11, background: `${exam.color}18`, color: exam.color, padding: '3px 10px', borderRadius: 20, fontWeight: 800, border: `1px solid ${exam.color}30` }}>{exam.subjects} {t('Subjects', 'विषय')}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 600 }}>{exam.questions} MCQs</span>
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit', margin: 0 }}>{t(exam.name, exam.nameHi)}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, color: exam.color, fontWeight: 700, fontSize: 13 }}>
                    {t('Start Preparation', 'तैयारी शुरू करें')} <ArrowRight size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY NIRNAYPATH ───────────────────────────────────── */}
      <section id="features" style={{ padding: '100px clamp(16px,3vw,40px)', background: 'var(--color-bg-subtle)', borderTop: '1.5px solid var(--color-border-base)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="section-header-center">
            <div className="section-pill"><Zap size={12} /> {t('Why Choose Us', 'हम क्यों')}</div>
            <h2 className="text-display" style={{ marginTop: 8 }}>{t('Why Serious Aspirants Trust NirnayPath', 'गंभीर उम्मीदवार निर्णयपथ पर भरोसा क्यों करते हैं')}</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginTop: 52 }}>
            {WHY_US.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="premium-card" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: item.color, borderRadius: '20px 20px 0 0' }} />
                  <div style={{ width: 60, height: 60, background: item.bg, border: `2px solid ${item.color}30`, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <Icon size={26} color={item.color} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit', marginBottom: 10 }}>{t(item.title, item.titleHi)}</h3>
                  <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>{t(item.desc, item.descHi)}</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 'auto' }}>
                    {item.features.map((f, fi) => (
                      <li key={fi} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--color-text-base)' }}>
                        <CheckCircle size={14} color="#22c55e" style={{ flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PREPARATION JOURNEY TIMELINE ─────────────────────── */}
      <section style={{ padding: '100px clamp(16px,3vw,40px)', background: 'var(--color-bg-base)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="section-header-center">
            <div className="section-pill"><Compass size={12} /> {t('Your Journey', 'आपकी यात्रा')}</div>
            <h2 className="text-display" style={{ marginTop: 8 }}>{t('5 Steps to Government Job Success', 'सरकारी नौकरी तक 5 कदम')}</h2>
          </div>

          <div className="journey-grid" style={{ marginTop: 52 }}>
            {[
              { step: '01', emoji: '📝', title: t('Free Sign Up', 'मुफ़्त पंजीकरण'), desc: t('Create your profile in 10 seconds. No card required.', '10 सेकंड में प्रोफ़ाइल बनाएं।'), color: '#6C63FF' },
              { step: '02', emoji: '🎯', title: t('Choose Exam Track', 'परीक्षा चुनें'), desc: t('Pick UPSC, BPSC, SSC, or Railway — your path, your pace.', 'अपनी परीक्षा चुनें।'), color: '#C850C0' },
              { step: '03', emoji: '📖', title: t('Learn with Notes', 'नोट्स से सीखें'), desc: t('Bilingual high-yield notes with PYQs and examples.', 'द्विभाषी नोट्स और पीवाईक्यू।'), color: '#FF6B00' },
              { step: '04', emoji: '⚡', title: t('Practice & Test', 'अभ्यास करें'), desc: t('Chapter tests and full mock exams on real CBT interface.', 'असली CBT इंटरफेस पर टेस्ट।'), color: '#F59E0B' },
              { step: '05', emoji: '🏆', title: t('Track & Improve', 'सुधारें'), desc: t('AI weakness analysis guides your next study session.', 'AI कमजोरी विश्लेषण।'), color: '#10B981' },
            ].map((j, i) => (
              <div key={i} className="premium-card" style={{ padding: 28, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -12, right: -12, fontSize: '6rem', fontWeight: 900, color: `${j.color}08`, fontFamily: 'Outfit', lineHeight: 1 }}>{j.step}</div>
                <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{j.emoji}</div>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: j.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, margin: '0 auto 16px', fontFamily: 'Outfit' }}>{j.step}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit', marginBottom: 10 }}>{j.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted-base)', lineHeight: 1.6, position: 'relative', zIndex: 1 }}>{j.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section style={{ padding: '80px clamp(16px,3vw,40px)', background: 'var(--color-bg-subtle)', borderTop: '1.5px solid var(--color-border-base)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="section-header-center">
            <div className="section-pill">FAQ</div>
            <h2 className="text-display" style={{ marginTop: 8 }}>{t('Frequently Asked Questions', 'अक्सर पूछे जाने वाले प्रश्न')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 44 }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '22px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: 'var(--color-text-title-base)', textAlign: 'left', gap: 16 }}>
                  <span style={{ fontWeight: 800, fontSize: 15.5, fontFamily: 'Outfit', flex: 1 }}>{t(faq.q, faq.qHi)}</span>
                  <ChevronDown size={18} style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s', color: 'var(--np-orange)', flexShrink: 0 }} />
                </button>
                <div style={{ maxHeight: activeFaq === i ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease', background: 'rgba(124,58,237,0.02)' }}>
                  <p style={{ padding: '0 28px 22px', color: 'var(--color-text-base)', fontSize: 14.5, lineHeight: 1.7 }}>{t(faq.a, faq.aHi)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section style={{ background: 'var(--gradient-dark-hero)', padding: '100px clamp(16px,3vw,40px)', textAlign: 'center', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(108,99,255,0.15) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px', opacity: 0.6 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', padding: 18, background: 'rgba(255,107,0,0.15)', border: '2px solid rgba(255,107,0,0.3)', borderRadius: 20, marginBottom: 28 }}>
            <Shield size={38} color="#FF6B00" />
          </div>
          <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: '#ffffff', marginBottom: 20, fontFamily: 'Outfit', letterSpacing: '-0.02em' }}>
            {t('Ready to Start Your Success Journey?', 'अपनी सफलता की यात्रा शुरू करने के लिए तैयार हैं?')}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.70)', fontSize: 16, marginBottom: 40, lineHeight: 1.7 }}>
            {t('Join thousands of aspirants achieving their government job dreams — 100% free, forever.', 'हज़ारों आकांक्षियों के साथ जुड़ें जो अपने सपने पूरे कर रहे हैं — 100% मुफ़्त, हमेशा।')}
          </p>
          <button id="cta-start" className="btn-orange" onClick={() => setModal('register')} style={{ padding: '16px 44px', fontSize: 16, margin: '0 auto' }}>
            {t('Start Preparing For Free', 'मुफ़्त में तैयारी शुरू करें')} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <Footer onStartPrep={() => setModal('register')} />

      {/* ── AUTH MODAL ───────────────────────────────────────── */}
      {modal && (
        <AuthModal mode={modal} onClose={() => setModal(null)}
          onSwitch={() => setModal(modal === 'login' ? 'register' : 'login')} t={t} />
      )}
    </div>
  );
}

/* ─── Auth Modal ─────────────────────────────────────────────── */
function AuthModal({ mode, onClose, onSwitch, t }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.name.trim()) { setError(t('Please enter your name.', 'कृपया अपना नाम दर्ज करें।')); setLoading(false); return; }
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('Authentication failed. Please check your credentials.', 'प्रमाणीकरण विफल। कृपया जांचें।'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1000 }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420, width: '100%', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(100,116,139,0.12)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted-base)' }}>
          <X size={16} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, background: 'var(--gradient-primary)', borderRadius: 16, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
            <GraduationCap size={26} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit' }}>
            {mode === 'login' ? t('Welcome Back', 'स्वागत है') : t('Join NirnayPath', 'निर्णयपथ से जुड़ें')}
          </h2>
          <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13.5, marginTop: 6 }}>
            {mode === 'login' ? t('Sign in to your account', 'अपने खाते में साइन इन करें') : t('Create your free account', 'अपना मुफ़्त खाता बनाएं')}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#ef4444', fontSize: 13.5, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted-base)', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>FULL NAME</label>
              <input type="text" placeholder={t('Your full name', 'आपका पूरा नाम')} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required style={{ width: '100%' }} />
            </div>
          )}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted-base)', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>EMAIL ADDRESS</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted-base)', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required style={{ width: '100%', paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-base)', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, marginTop: 6, opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> {t('Please wait...', 'कृपया प्रतीक्षा करें...')}</>
            ) : (
              mode === 'login' ? t('Sign In', 'साइन इन करें') : t('Create Free Account', 'मुफ़्त खाता बनाएं')
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13.5, color: 'var(--color-text-muted-base)' }}>
          {mode === 'login' ? t("Don't have an account?", 'खाता नहीं है?') : t('Already have an account?', 'पहले से खाता है?')}{' '}
          <button onClick={onSwitch} style={{ background: 'none', border: 'none', color: 'var(--np-orange)', fontWeight: 800, cursor: 'pointer', fontSize: 13.5, fontFamily: 'Outfit' }}>
            {mode === 'login' ? t('Register Free', 'मुफ़्त पंजीकरण') : t('Sign In', 'साइन इन')}
          </button>
        </div>
      </div>
    </div>
  );
}
