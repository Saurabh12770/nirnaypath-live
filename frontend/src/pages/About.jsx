import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap, ArrowLeft, Eye, Target, Award, Map,
  ArrowRight, Sun, Moon, BookOpen, Code2, Globe, Heart, Star, CheckCircle,
  Zap, Shield, GitBranch
} from 'lucide-react';

// ─── About page image carousel ────────────────────────────────────────────────
const ABOUT_CAROUSEL_IMAGES = [
  '/about_hero1.jpg',
  '/about_hero2.jpg',
  '/about_hero3.jpg',
  '/about_hero4.jpg'
];

// ─── Timeline Data ─────────────────────────────────────────────────────────────
const TIMELINE_CHAPTERS = [
  {
    emoji: '🌾',
    color: '#38bdf8',
    year: 'Chapter 01',
    titleEn: 'The Roots: Bihar & the Struggle for Knowledge',
    titleHi: 'बिहार की मिट्टी और शिक्षा का संघर्ष',
    bodyEn: 'My journey began in the rural fields of Bihar — a land of immense intellectual potential but challenged by economic constraints. I watched brilliant friends study under kerosene lanterns, walking miles to reach school, only to find that quality exam notes and test series were completely out of reach. The competitive exams of our country represent a dream of administrative leadership, but for a student from a lower-income rural family, the barrier is not the syllabus — it\'s the lack of financial resources.',
    bodyHi: 'मेरी यात्रा बिहार की ग्रामीण पृष्ठभूमि से शुरू हुई। मैंने प्रतिभाशाली मित्रों को ढिबरी की रोशनी में पढ़ते देखा जो मीलों पैदल चलकर स्कूल जाते थे, लेकिन महंगी अध्ययन सामग्री और टेस्ट सीरीज़ उनके लिए असंभव थीं। प्रतियोगी परीक्षाएं प्रशासनिक सपने हैं, लेकिन गरीब छात्र के लिए बाधा पाठ्यक्रम नहीं, वित्तीय संसाधनों की कमी है।',
  },
  {
    emoji: '💡',
    color: '#c084fc',
    year: 'Chapter 02',
    titleEn: 'The Breakthrough: Cracking the Code of Engineering',
    titleHi: 'सफलता की सीढ़ियाँ: इंजीनियरिंग की यात्रा',
    bodyEn: 'Determined to break the cycle, I mastered software system designs and database frameworks. In the technology industry, I designed systems serving millions of users simultaneously. It clicked: if software can scale commerce and entertainment to the masses, why can it not scale elite education? Digital infrastructure lets us serve complete study guides, syllabus maps, and simulated mock test platforms at near-zero marginal cost.',
    bodyHi: 'मैंने सिस्टम डिजाइन और डेटाबेस आर्किटेक्चर को समझने के लिए दिन-रात मेहनत की। तकनीक की दुनिया में मैंने देखा कि डिजिटल माध्यम से लाखों तक सेवाएं पहुंचाई जा सकती हैं। विचार आया: यदि सॉफ्टवेयर वाणिज्य को हर हाथ तक पहुंचा सकता है, तो उत्कृष्ट शिक्षा का लोकतंत्रीकरण क्यों नहीं?',
  },
  {
    emoji: '🏙️',
    color: '#f97316',
    year: 'Chapter 03',
    titleEn: 'The Awakening: Coaching Hub Realities',
    titleHi: 'वास्तविकता से साक्षात्कार: कोचिंग हब की सच्चाई',
    bodyEn: 'Visiting study centers in Delhi (Mukherjee Nagar, Rajinder Nagar) and Patna, I saw the immense struggle of aspirants. Students live in tiny rooms, skipping meals to pay for monthly test prep. Geared by aggressive marketing campaigns pushing ₹2-5 Lakh coaching subscriptions. Non-English students face severe lack of quality bilingual content. The commercialization of civil service preparation transformed education from national empowerment into a corporate business.',
    bodyHi: 'दिल्ली के मुखर्जी नगर और पटना के अध्ययन केंद्रों पर जाकर छात्रों का गहरा संघर्ष महसूस किया। छात्र छोटे कमरों में रहते हैं, खाना छोड़ते हैं ताकि महंगे टेस्ट पेपर खरीद सकें। व्यावसायिक प्रचार 2-5 लाख की फीस की ओर धकेलता है। शिक्षा — राष्ट्र निर्माण का आधार — कॉर्पोरेट लाभ का व्यवसाय बन चुकी है।',
  },
  {
    emoji: '⚙️',
    color: '#10b981',
    year: 'Chapter 04',
    titleEn: 'The Blueprint: Engineering the Revolution',
    titleHi: 'डिजिटल क्रांति का खाका: निर्णयपथ 3.0',
    bodyEn: 'NirnayPath 3.0 represents a complete rebuild of digital study logic. The database hosts 1.34 Lakh verified questions optimized with fast search indices. The frontend mirrors official exam server environments to reduce student exam-day anxiety. The bilingual engine enables instant Hindi/English toggle down to every MCQ, explanation, and syllabus outline. Detailed progress tracking, custom SVG dashboards, and micro-topic maps make it a powerful free system.',
    bodyHi: 'निर्णयपथ 3.0 डेटाबेस में 1.34 लाख सत्यापित प्रश्न हैं। UI वास्तविक परीक्षा सर्वर जैसा है ताकि परीक्षा दिन की घबराहट कम हो। द्विभाषी इंजन एक क्लिक में हिंदी/अंग्रेजी बदलता है — हर प्रश्न और व्याख्या में। प्रगति ट्रैकर और SVG विश्लेषण के साथ यह एक शक्तिशाली मुफ्त प्रणाली है।',
  },
  {
    emoji: '🤝',
    color: '#e879f9',
    year: 'Chapter 05',
    titleEn: 'The Manifesto: Free Education as a Public Good',
    titleHi: 'हमारा घोषणापत्र: निःशुल्क शिक्षा का लोकतंत्रीकरण',
    bodyEn: 'NirnayPath is bound by a strict code of ethics. This platform will remain 100% free forever. No subscriptions, no ads, no paywalls, no selling of student data. It is a digital monument of public service. Our success is measured solely by our students\' success — especially those from rural and marginalized backgrounds who go on to qualify for administrative roles and reform their communities.',
    bodyHi: 'निर्णयपथ नैतिक मूल्यों पर टिका है। यह मंच सदैव 100% निःशुल्क रहेगा। कोई छिपी फीस, विज्ञापन या व्यावसायिक समझौते नहीं। हम सफलता को मुनाफे से नहीं, छात्रों की प्रगति से मापते हैं — विशेषकर ग्रामीण और वंचित पृष्ठभूमि से आए वे छात्र जो प्रशासनिक पदों पर पहुंचकर समाज को बेहतर बनाएंगे।',
  },
];

const IMPACT_DATA = [
  { value: '1.34L+', label: 'Verified Questions', labelHi: 'सत्यापित प्रश्न', icon: BookOpen, color: '#38bdf8' },
  { value: '95%+', label: 'Syllabus Coverage', labelHi: 'पाठ्यक्रम कवरेज', icon: Target, color: '#c084fc' },
  { value: '7+', label: 'Exams Covered', labelHi: 'परीक्षाएं', icon: Award, color: '#10b981' },
  { value: '₹0', label: 'Forever Free', labelHi: 'हमेशा निःशुल्क', icon: Heart, color: '#f97316' },
];

const ROADMAP = [
  { title: 'Bilingual Content Expansion', titleHi: 'द्विभाषी सामग्री विस्तार', desc: 'Reaching 100% complete translation audits for all subjects.', descHi: 'सभी विषयों के लिए 100% अनुवाद ऑडिट पूरा करना।', status: 'Ongoing', color: '#38bdf8' },
  { title: 'All India Live Mock Tests', titleHi: 'अखिल भारतीय लाइव मॉक टेस्ट', desc: 'Simultaneous national mock test rankings for UPSC & BPSC.', descHi: 'राष्ट्रीय स्तर पर लाइव रैंक मूल्यांकन।', status: 'Phase 4', color: '#c084fc' },
  { title: 'Adaptive AI Learning Insights', titleHi: 'एआई शिक्षण अंतर्दृष्टि', desc: 'Smarter tracking of weak subtopics with automatic content revisions.', descHi: 'स्वचालित रिवीजन नोट्स के साथ स्मार्ट ट्रैकिंग।', status: 'Phase 5', color: '#f97316' },
  { title: 'Mobile App for Offline Access', titleHi: 'ऑफलाइन मोबाइल ऐप', desc: 'Native app with offline-sync for rural network-limited aspirants.', descHi: 'ग्रामीण छात्रों के लिए ऑफलाइन सिंक के साथ नेटिव ऐप।', status: 'Phase 6', color: '#10b981' },
];

export default function About() {
  const { language, setLanguage, user, theme, setTheme } = useAuth();
  const navigate = useNavigate();
  const t = (en, hi) => language === 'hi' ? hi : en;

  // Animated counters on scroll
  const [, setCounts] = useState({ q: 100000, a: 80, e: 1 });
  const [carouselIdx, setCarouselIdx] = useState(0);
  const countRef = useRef(null);

  // Auto-slide about page carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIdx(idx => (idx + 1) % ABOUT_CAROUSEL_IMAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let q = 100000, a = 80, e = 1;
        const iv = setInterval(() => {
          let done = true;
          if (q < 134000) { q = Math.min(134000, q + 2000); done = false; }
          if (a < 95) { a = Math.min(95, a + 1); done = false; }
          if (e < 7) { e = Math.min(7, e + 1); done = false; }
          setCounts({ q, a, e });
          if (done) clearInterval(iv);
        }, 28);
        obs.disconnect();
      }
    }, { threshold: 0.15 });
    if (countRef.current) obs.observe(countRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ background: 'var(--color-bg-base)', color: 'var(--color-text-base)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Ambient background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '10%', width: 600, height: 600, background: 'rgba(108,99,255,0.06)', borderRadius: '50%', filter: 'blur(120px)' }} />
        <div style={{ position: 'absolute', top: '50%', right: '5%', width: 500, height: 500, background: 'rgba(255,107,0,0.05)', borderRadius: '50%', filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 400, height: 400, background: 'rgba(200,80,192,0.04)', borderRadius: '50%', filter: 'blur(90px)' }} />
      </div>

      {/* Sticky Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', background: 'var(--color-card-bg)', borderBottom: '1.5px solid var(--color-border-base)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px', height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.06)', border: '1.5px solid var(--color-border-base)', color: 'var(--color-text-title-base)', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>
              <ArrowLeft size={14} /> {t('Back', 'वापस')}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, background: 'var(--gradient-primary)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-glow)' }}>
                <GraduationCap size={18} color="white" />
              </div>
              <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.2rem', color: 'var(--color-text-title-base)', letterSpacing: '-0.02em' }}>NirnayPath</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'rgba(108,99,255,0.06)', border: '1.5px solid var(--color-border-base)', borderRadius: 10, width: 36, height: 36, color: 'var(--color-text-title-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              {theme === 'dark' ? <Sun size={15} color="var(--color-accent-primary)" /> : <Moon size={15} color="var(--color-accent-primary)" />}
            </button>
            <div style={{ display: 'flex', background: 'rgba(108,99,255,0.06)', border: '1.5px solid var(--color-border-base)', borderRadius: 10, padding: 3 }}>
              <button onClick={() => setLanguage('en')} style={{ background: language === 'en' ? 'var(--gradient-primary)' : 'none', border: 'none', color: language === 'en' ? '#fff' : 'var(--color-text-base)', padding: '5px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>EN</button>
              <button onClick={() => setLanguage('hi')} style={{ background: language === 'hi' ? 'var(--gradient-primary)' : 'none', border: 'none', color: language === 'hi' ? '#fff' : 'var(--color-text-base)', padding: '5px 12px', borderRadius: 8, fontSize: 11, fontFamily: 'Outfit, sans-serif', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>हिं</button>
            </div>
            {user ? (
              <Link to="/dashboard" style={{ background: 'var(--gradient-orange)', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>{t('Dashboard', 'डैशबोर्ड')}</Link>
            ) : (
              <Link to="/" style={{ background: 'var(--gradient-primary)', color: '#fff', textDecoration: 'none', padding: '8px 18px', borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s' }}>{t('Join Free', 'निःशुल्क जुड़ें')}</Link>
            )}
          </div>
        </div>
      </nav>

      <section style={{ position: 'relative', zIndex: 1, overflow: 'hidden', minHeight: '60vh', padding: '100px 24px', textAlign: 'center', display: 'flex', alignItems: 'center' }}>
        {/* Cinematic Slider background images */}
        {ABOUT_CAROUSEL_IMAGES.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`NirnayPath About Slide ${idx + 1}`}
            className={`carousel-image ${idx === carouselIdx ? 'active' : ''}`}
          />
        ))}

        {/* Cinematic dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,18,41,0.85) 0%, rgba(13,26,58,0.9) 50%, rgba(24,9,40,0.85) 100%)', zIndex: 1, pointerEvents: 'none' }} />

        {/* Grid pattern overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 1, opacity: 0.5, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 880, margin: '0 auto', width: '100%' }}>
          {/* Top badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.4)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <Star size={12} color="#c084fc" fill="#c084fc" />
            <span style={{ fontSize: 12, color: '#c084fc', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.05em' }}>{t('THE NIRNAYPATH STORY', 'निर्णयपथ की कहानी')}</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.1, fontFamily: 'Outfit, sans-serif', color: '#ffffff', letterSpacing: '-0.03em', marginBottom: 24 }}>
            {t('Transforming India\'s', 'भारत के')} <br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {t('EdTech Landscape', 'एडटेक परिदृश्य का रूपांतरण')}
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 680, margin: '0 auto 40px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {t(
              'A fully transparent, high-yield learning ecosystem built for civil and government exam aspirants across India. Free forever. No paywalls. No excuses.',
              'सिविल और सरकारी परीक्षा उम्मीदवारों के लिए एक पूर्णतः पारदर्शी और अत्यधिक परिणामोन्मुख शिक्षण पारिस्थितिकी। हमेशा निःशुल्क।'
            )}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(user ? '/dashboard' : '/')}
              style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: 16, fontSize: 15, fontWeight: 800, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
              {t('Start Free Today', 'आज से शुरू करें')} <ArrowRight size={16} />
            </button>
            <a href="#story"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.15)', padding: '14px 32px', borderRadius: 16, fontSize: 15, fontWeight: 700, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
              {t('Read Our Story', 'हमारी कहानी पढ़ें')}
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOUNDER INTRO SECTION
      ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 340px) 1fr', gap: 64, alignItems: 'center' }}>
          {/* Photo + profile */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: -10, background: 'var(--gradient-primary)', borderRadius: 32, zIndex: 0, filter: 'blur(6px)', opacity: 0.5 }} />
              <img src="/founder.jpeg" alt="Saurabh Kumar — Founder, NirnayPath" style={{ width: 280, height: 280, objectFit: 'cover', borderRadius: 28, border: '4px solid var(--color-bg-base)', position: 'relative', zIndex: 1 }} />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: 28, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>Saurabh Kumar</h3>
            <p style={{ color: 'var(--color-accent-primary)', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>
              {t('Software Engineer · Founder', 'सॉफ्टवेयर इंजीनियर · संस्थापक')}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              {['#TechForGood', '#FreeEducation', '#Bihar'].map(tag => (
                <span key={tag} style={{ fontSize: 11, background: 'rgba(108,99,255,0.1)', color: '#a78bfa', border: '1px solid rgba(108,99,255,0.2)', padding: '4px 10px', borderRadius: 8, fontWeight: 600 }}>{tag}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {[{ icon: Code2, label: 'Full Stack Dev', color: '#38bdf8' }, { icon: Globe, label: 'Open Source', color: '#10b981' }, { icon: BookOpen, label: 'EdTech Builder', color: '#f97316' }].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--color-card-bg)', border: '1px solid var(--color-border-base)', borderRadius: 10, padding: '6px 12px' }}>
                  <item.icon size={12} color={item.color} />
                  <span style={{ fontSize: 11, color: 'var(--color-text-base)', fontWeight: 600 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Story intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 3, background: 'var(--gradient-primary)', borderRadius: 99 }} />
              <span style={{ fontSize: 12, color: 'var(--color-accent-primary)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif' }}>{t('FOUNDER\'S VISION', 'संस्थापक का दर्शन')}</span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 24 }}>
              {t('Bridging the Gap:', 'अंतर को पाटना:')}<br />
              <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {t('The Story of NirnayPath', 'निर्णयपथ की कहानी')}
              </span>
            </h2>
            <p style={{ color: 'var(--color-text-base)', fontSize: 16, lineHeight: 1.9, marginBottom: 16 }}>
              {t(
                'As a software engineer, I witnessed the powerful impact of scalable technology. Yet I noticed a troubling disparity: quality test preparation for civil services like UPSC and BPSC is locked behind expensive paywalls. Serious aspirants from rural and lower-income families are systematically disadvantaged simply because they cannot afford lakhs in coaching fees.',
                'एक सॉफ्टवेयर इंजीनियर के रूप में, मैंने बड़े पैमाने पर तकनीक के प्रभाव को प्रत्यक्ष देखा। लेकिन एक परेशान करने वाली असमानता भी देखी: यूपीएससी और बीपीएससी जैसी परीक्षाओं की उच्च गुणवत्ता वाली तैयारी महंगी फीस के पीछे बंद है।'
              )}
            </p>
            <p style={{ color: 'var(--color-text-base)', fontSize: 16, lineHeight: 1.9, marginBottom: 28 }}>
              {t(
                'NirnayPath was born out of a single mission: eliminate the educational rich-versus-poor inequality. We provide 100% free, high-yield academic guides, bilingual question banks (over 1.34 Lakh verified MCQs), and a high-performance mock assessment environment.',
                'निर्णयपथ का जन्म एक मिशन से हुआ: शिक्षा में अमीर-गरीब की असमानता को मिटाना। हम 100% निःशुल्क गाइड, द्विभाषी प्रश्न बैंक और उत्कृष्ट मॉक टेस्ट वातावरण प्रदान करते हैं।'
              )}
            </p>
            <blockquote style={{ borderLeft: '4px solid var(--color-accent-primary)', paddingLeft: 20, margin: 0, fontStyle: 'italic', color: 'var(--color-accent-primary)', fontSize: 15, fontWeight: 600, lineHeight: 1.7, background: 'rgba(255,107,0,0.04)', borderRadius: '0 12px 12px 0', padding: '16px 20px' }}>
              {t(
                '"The future of India should be written by the fire in an aspirant\'s heart, not the size of their bank balance."',
                '"भारत का भविष्य आकांक्षी के दिल की आग से लिखा जाएगा, बैंक बैलेंस से नहीं।"'
              )}
            </blockquote>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TIMELINE — 5 Chapter Story
      ═══════════════════════════════════════ */}
      <section id="story" style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto', padding: '20px 24px 80px' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 16 }}>
            <GitBranch size={12} color="#a78bfa" />
            <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.06em' }}>{t('THE FULL STORY', 'पूरी कहानी')}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            {t('Five Chapters of', 'पाँच अध्याय')} <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('Purpose', 'उद्देश्य के')}</span>
          </h2>
        </div>

        {/* Timeline items */}
        <div style={{ position: 'relative', paddingLeft: 48 }}>
          {/* Vertical spine */}
          <div style={{ position: 'absolute', left: 16, top: 12, bottom: 12, width: 3, background: 'var(--gradient-primary)', borderRadius: 99, opacity: 0.3 }} />

          {TIMELINE_CHAPTERS.map((ch, i) => (
            <div key={i} style={{ position: 'relative', marginBottom: 48 }}>
              {/* Timeline dot */}
              <div style={{ position: 'absolute', left: -40, top: 6, width: 18, height: 18, borderRadius: '50%', background: ch.color, border: '3px solid var(--color-bg-base)', boxShadow: `0 0 12px ${ch.color}88` }} />

              {/* Card */}
              <div style={{ background: 'var(--color-card-bg)', border: '1.5px solid var(--color-border-base)', borderRadius: 24, padding: '28px 32px', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = ch.color + '40'; e.currentTarget.style.boxShadow = `var(--shadow-elevated), 0 0 20px ${ch.color}15`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--color-border-base)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{ch.emoji}</div>
                  <div>
                    <div style={{ fontSize: 10, color: ch.color, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>{ch.year}</div>
                    <h3 style={{ fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', lineHeight: 1.3, margin: 0 }}>
                      {t(ch.titleEn, ch.titleHi)}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--color-text-base)', margin: 0 }}>
                  {t(ch.bodyEn, ch.bodyHi)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          IMPACT STATS COUNTER SECTION
      ═══════════════════════════════════════ */}
      <section ref={countRef} style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, #081229 0%, #0d1a3a 100%)', padding: '80px 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 30% 50%, rgba(108,99,255,0.1) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(255,107,0,0.07) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
              {t('The NirnayPath', 'निर्णयपथ का')} <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{t('Impact', 'प्रभाव')}</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, marginTop: 10 }}>{t('Real numbers. Real mission. No shortcuts.', 'असली संख्याएं। असली मिशन।')}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {IMPACT_DATA.map((item, i) => (
              <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '36px 24px', backdropFilter: 'blur(16px)' }}>
                <div style={{ width: 52, height: 52, background: `${item.color}20`, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: `1px solid ${item.color}30` }}>
                  <item.icon size={24} color={item.color} />
                </div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif', lineHeight: 1 }}>{item.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 10, fontWeight: 600 }}>{t(item.label, item.labelHi)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MISSION / VISION / VALUES CARDS
      ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 1240, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em' }}>
            {t('What Guides Us', 'हमारा मार्गदर्शन')}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            { icon: Target, color: '#c084fc', bgColor: 'rgba(192,84,252,0.1)', titleEn: 'Our Mission', titleHi: 'हमारा मिशन', bodyEn: 'To make quality government examination preparation completely free and accessible to every single aspirant in India, ensuring equality of opportunity in the country\'s public service entries.', bodyHi: 'भारत में हर आकांक्षी के लिए गुणवत्तापूर्ण सरकारी परीक्षा की तैयारी पूरी तरह से मुफ्त और सुलभ बनाना।' },
            { icon: Eye, color: '#38bdf8', bgColor: 'rgba(56,189,248,0.1)', titleEn: 'Our Vision', titleHi: 'हमारा विज़न', bodyEn: 'To build the nation\'s most transparent, data-driven, and high-performance open-source platform, shaping the future of digital education without commercial boundaries.', bodyHi: 'व्यावसायिक सीमाओं के बिना डिजिटल शिक्षा के भविष्य को आकार देते हुए देश का सबसे पारदर्शी ओपन-सोर्स प्लेटफॉर्म बनाना।' },
            { icon: Shield, color: '#10b981', bgColor: 'rgba(16,185,129,0.1)', titleEn: 'Core Values', titleHi: 'मूल सिद्धांत', bodyEn: 'Zero commercial paywalls • Academic depth & accuracy-first • Open, inclusive bilingual learning • Transparent data practices • Community-first development.', bodyHi: 'शून्य शुल्क • शैक्षणिक गहराई • द्विभाषी समावेशिता • पारदर्शी डेटा • समुदाय-केंद्रित विकास।' },
          ].map((card, i) => (
            <div key={i} style={{ background: 'var(--color-card-bg)', border: '1.5px solid var(--color-border-base)', borderRadius: 24, padding: 32, backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-card)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.boxShadow = `var(--shadow-elevated), 0 0 24px ${card.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}>
              <div style={{ width: 52, height: 52, background: card.bgColor, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1px solid ${card.color}30` }}>
                <card.icon size={24} color={card.color} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', marginBottom: 12 }}>{t(card.titleEn, card.titleHi)}</h3>
              <p style={{ color: 'var(--color-text-base)', fontSize: 14.5, lineHeight: 1.8, margin: 0 }}>{t(card.bodyEn, card.bodyHi)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ROADMAP TIMELINE
      ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ background: 'var(--color-card-bg)', border: '1.5px solid var(--color-border-base)', borderRadius: 28, padding: '44px 40px', backdropFilter: 'blur(16px)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 44, height: 44, background: 'rgba(255,107,0,0.1)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,107,0,0.2)' }}>
              <Map size={22} color="var(--color-accent-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{t('Future Roadmap', 'भविष्य की रूपरेखा')}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--color-text-muted-base)', margin: 0, marginTop: 2 }}>{t('What we\'re building next', 'आगे क्या बनाएंगे')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {ROADMAP.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: i < ROADMAP.length - 1 ? 28 : 0, position: 'relative' }}>
                {/* Dot + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, border: '3px solid var(--color-bg-base)', boxShadow: `0 0 10px ${item.color}80`, flexShrink: 0 }} />
                  {i < ROADMAP.length - 1 && <div style={{ flex: 1, width: 2, background: `linear-gradient(to bottom, ${item.color}60, ${ROADMAP[i+1].color}30)`, marginTop: 4 }} />}
                </div>
                {/* Content */}
                <div style={{ paddingBottom: i < ROADMAP.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ padding: '3px 10px', background: `${item.color}18`, border: `1px solid ${item.color}35`, color: item.color, borderRadius: 6, fontSize: 10.5, fontWeight: 800, fontFamily: 'Outfit, sans-serif', letterSpacing: '0.04em' }}>{item.status}</span>
                    <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 14.5, fontFamily: 'Outfit, sans-serif', margin: 0 }}>{t(item.title, item.titleHi)}</h4>
                  </div>
                  <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{t(item.desc, item.descHi)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PLEDGE / CHARTER CARD
      ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.08), rgba(255,107,0,0.06))', border: '2px solid rgba(108,99,255,0.25)', borderRadius: 28, padding: '52px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden', boxShadow: '0 0 60px rgba(108,99,255,0.08)' }}>
          {/* Glow orbs */}
          <div style={{ position: 'absolute', top: -40, left: -40, width: 160, height: 160, background: 'rgba(108,99,255,0.07)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -40, right: -40, width: 160, height: 160, background: 'rgba(255,107,0,0.07)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

          <div style={{ display: 'inline-flex', padding: 16, background: 'rgba(255,107,0,0.1)', borderRadius: '50%', marginBottom: 20, border: '1px solid rgba(255,107,0,0.2)' }}>
            <Award size={36} color="var(--color-accent-primary)" />
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 12, letterSpacing: '-0.02em' }}>
            {t('The NirnayPath Charter & Student Promise', 'निर्णयपथ चार्टर और छात्र प्रतिज्ञा')}
          </h2>
          <p style={{ maxWidth: 680, margin: '0 auto 28px', fontSize: 15.5, color: 'var(--color-text-base)', lineHeight: 1.85, fontStyle: 'italic' }}>
            {t(
              '"We believe administrative services represent the heart of Indian democracy. Officers who lead our districts and policy rooms should be selected solely based on intellect, empathy, and integrity. We pledge to keep all testing systems, analytics dashboards, and reading modules 100% free, forever. No paywalls will ever lock an aspirant out of their destiny."',
              '"हमारा मानना है कि प्रशासनिक सेवाएं भारतीय लोकतंत्र का दिल हैं। हम प्रतिज्ञा करते हैं कि सभी परीक्षण प्रणालियों और शिक्षण मॉड्यूल को हमेशा के लिए 100% मुफ्त रखेंगे। कोई भी भुगतान दीवार किसी उम्मीदवार को उसकी नियति से नहीं रोक पाएगी।"'
            )}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, color: 'var(--color-accent-primary)', marginBottom: 4 }}>Saurabh Kumar</div>
              <div style={{ height: 1, width: 160, background: 'var(--color-border-base)', margin: '6px auto' }} />
              <div style={{ fontSize: 10, color: 'var(--color-text-muted-base)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.06em' }}>{t('FOUNDER SIGNATURE', 'संस्थापक हस्ताक्षर')}</div>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed var(--color-accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--color-accent-primary)', fontSize: 10, transform: 'rotate(-12deg)', textTransform: 'uppercase', letterSpacing: '0.03em', padding: 6, textAlign: 'center', lineHeight: 1.3 }}>
              {t('Seal of Truth', 'सत्य की मुहर')}
            </div>
          </div>

          {/* Promise checklist */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 36 }}>
            {[
              t('Free Forever', 'हमेशा निःशुल्क'),
              t('No Ads Ever', 'कभी विज्ञापन नहीं'),
              t('No Data Selling', 'डेटा नहीं बेचा जाएगा'),
              t('Open Source Spirit', 'ओपन सोर्स भावना'),
            ].map(prom => (
              <div key={prom} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '8px 16px' }}>
                <CheckCircle size={14} color="#10b981" />
                <span style={{ fontSize: 13, color: 'var(--color-text-title-base)', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{prom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════ */}
      <section style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto', padding: '0 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.2)', borderRadius: 99, padding: '6px 16px', marginBottom: 20 }}>
          <Zap size={11} color="#a78bfa" />
          <span style={{ fontSize: 11, color: '#a78bfa', fontFamily: 'Outfit, sans-serif', fontWeight: 700, letterSpacing: '0.07em' }}>{t('JOIN THE REVOLUTION', 'क्रांति में जुड़ें')}</span>
        </div>
        <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', marginBottom: 16, letterSpacing: '-0.02em' }}>
          {t('Support the Revolution in Indian EdTech', 'भारतीय एडटेक क्रांति का समर्थन करें')}
        </h2>
        <p style={{ color: 'var(--color-text-muted-base)', fontSize: 16, lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
          {t(
            'We are open-source and free of commercial intent. Contribute study content, report corrections, or create a free account to start practicing today.',
            'हम ओपन-सोर्स हैं। अध्ययन सामग्री योगदान करें, त्रुटियाँ रिपोर्ट करें, या आज ही अभ्यास के लिए निःशुल्क खाता बनाएं।'
          )}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(user ? '/dashboard' : '/')}
            style={{ background: 'var(--gradient-primary)', color: '#fff', border: 'none', padding: '16px 36px', borderRadius: 16, fontSize: 16, fontWeight: 800, fontFamily: 'Outfit, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(108,99,255,0.25)', transition: 'all 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            {user ? t('Go to Workspace', 'कार्यक्षेत्र पर जाएँ') : t('Create Free Account Now', 'अभी निःशुल्क खाता बनाएँ')} <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 768px) {
          section > div[style*="grid-template-columns: minmax(260px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
