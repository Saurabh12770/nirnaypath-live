import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Target, TrendingUp, BookOpen, FlaskConical, Award, AlertTriangle, Activity, Clock, Bookmark, Trash2, Calendar, LayoutDashboard, Flame, Sparkles, Lightbulb, ChevronRight, Compass } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, accent, iconColor, bgColor, color = "orange" }) {
  const getGradient = () => {
    if (color === "orange") return "var(--gradient-orange)";
    if (color === "indigo") return "var(--gradient-purple)";
    return "var(--gradient-emerald)";
  };
  const getGlowClass = () => {
    if (color === "orange") return "glow-card-orange";
    return "glow-card-purple";
  };
  
  return (
    <div className={`stat-card ${getGlowClass()}`} style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: getGradient() }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, background: bgColor || (color === "orange" ? "rgba(255,107,0,0.12)" : "rgba(124,58,237,0.12)"), borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={iconColor || (color === "orange" ? "var(--np-orange)" : "var(--np-purple)")} />
        </div>
        {accent && (
          <div style={{ 
            fontSize: 9.5, 
            fontWeight: 800, 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase', 
            color: iconColor || (color === "orange" ? "var(--np-orange)" : "var(--np-purple)"), 
            background: bgColor || (color === "orange" ? "rgba(255,107,0,0.1)" : "rgba(124,58,237,0.1)"), 
            padding: '4px 10px', 
            borderRadius: 8 
          }}>
            {accent}
          </div>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{value}</div>
      <div style={{ color: 'var(--color-text-base)', fontSize: 13.5, marginTop: 8, fontWeight: 700 }}>{label}</div>
      {sub && <div style={{ color: 'var(--color-text-muted-base)', fontSize: 11.5, marginTop: 4, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

// ─── Custom SVG Progress Ring ───────────────────────────────────────────────
function ProgressRing({ value, size = 110, strokeWidth = 8, label = "", colorStart = "#f97316", colorEnd = "#7c3aed" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size}>
        <circle stroke="var(--color-border-base)" fill="transparent" strokeWidth={strokeWidth} r={radius} cx={size/2} cy={size/2} />
        <circle stroke="url(#ringGlow)" fill="transparent" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" r={radius} cx={size/2} cy={size/2} style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        <defs>
          <linearGradient id="ringGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif' }}>{value.toFixed(0)}%</span>
        {label && <span style={{ fontSize: 9, color: 'var(--color-text-muted-base)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 1 }}>{label}</span>}
      </div>
    </div>
  );
}

// ─── Custom SVG Bar Chart ──────────────────────────────────────────────────
function AccuracyBarChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxVal = 100;
  
  return (
    <div style={{ width: '100%', height: 130, position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-base)', paddingBottom: 6, gap: 12 }}>
      {data.map((item, idx) => {
        const pct = (item.accuracy / maxVal) * 100;
        return (
          <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
            {/* Tooltip */}
            <div className="bar-tooltip" style={{ position: 'absolute', bottom: `${pct}%`, background: 'var(--color-card-bg)', backdropFilter: 'blur(8px)', border: '1px solid var(--color-border-base)', borderRadius: 6, padding: '4px 8px', fontSize: 10, color: 'var(--color-text-title-base)', pointerEvents: 'none', marginBottom: 4, whiteSpace: 'nowrap', zIndex: 10, opacity: 0, transition: 'opacity 0.15s' }}>
              {item.score} correct
            </div>
            
            <div style={{
              width: '100%',
              height: `${pct}%`,
              background: item.accuracy >= 70 ? 'linear-gradient(180deg, #22c55e, #10b981)' : item.accuracy >= 50 ? 'linear-gradient(180deg, #f97316, #7c3aed)' : 'linear-gradient(180deg, #ef4444, #ea580c)',
              borderRadius: '6px 6px 0 0',
              transition: 'height 0.4s ease-out',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.previousSibling.style.opacity = '1'; }}
            onMouseLeave={e => { e.currentTarget.previousSibling.style.opacity = '0'; }}
            />
            
            <span style={{ fontSize: 9.5, color: 'var(--color-text-muted-base)', marginTop: 4, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', textAlign: 'center', fontWeight: 600 }}>{item.date}</span>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: item.accuracy >= 70 ? '#22c55e' : item.accuracy >= 50 ? '#f97316' : '#ef4444', marginTop: 1 }}>{item.accuracy.toFixed(0)}%</span>
          </div>
        );
      })}
    </div>
  );
}

const MOTIVATIONAL_QUOTES = [
  { en: "“Success is not final, failure is not fatal: it is the courage to continue that counts.”", hi: "“सफलता अंतिम नहीं है, असफलता घातक नहीं है: जारी रखने का साहस ही मायने रखता है।”" },
  { en: "“Your focus determines your reality. Keep pushing on the NirnayPath.”", hi: "“आपका ध्यान ही आपकी वास्तविकता को तय करता है। निर्णयपथ पर आगे बढ़ते रहें।”" },
  { en: "“The administrative services require not just intellect, but empathy and consistency.”", hi: "“प्रशासनिक सेवाओं के लिए न केवल बुद्धि, बल्कि सहानुभूति और निरंतरता की आवश्यकता होती है।”" }
];

export default function Dashboard() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'bookmarks'
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [lastVisited] = useState(() => {
    try {
      const stored = localStorage.getItem('nirnaypath_last_study');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const t = (en, hi) => language === 'hi' ? hi : en;

  // Rotate motivational quote
  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 12000);
    return () => clearInterval(quoteTimer);
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/bookmarks')
    ]).then(([statsRes, bookmarksRes]) => {
      setStats(statsRes.data.stats);
      setBookmarks(bookmarksRes.data.bookmarks || []);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const removeBookmark = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  const handleBookmarkClick = (bookmark) => {
    if (bookmark.type === 'content' && bookmark.details) {
      navigate(`/learn`);
    }
  };

  if (loading) return (
    <AppLayout>
      <div style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Shimmer Skeleton Dashboard loading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ width: 320, height: 48 }} className="skeleton" />
          <div style={{ width: 200, height: 40 }} className="skeleton" />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32, maxWidth: 700 }}>
          <div style={{ height: 84 }} className="skeleton" />
          <div style={{ height: 84 }} className="skeleton" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ height: 130 }} className="skeleton" />
          <div style={{ height: 130 }} className="skeleton" />
          <div style={{ height: 130 }} className="skeleton" />
          <div style={{ height: 130 }} className="skeleton" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          <div style={{ height: 180 }} className="skeleton" />
          <div style={{ height: 180 }} className="skeleton" />
        </div>
      </div>
    </AppLayout>
  );

  const s = stats || {};

  // Generating activity data from actual test attempts
  const activityMap = {};
  if (s.recentActivity) {
    s.recentActivity.forEach(act => {
      const actDate = new Date(act.date).toDateString();
      activityMap[actDate] = (activityMap[actDate] || 0) + 1;
    });
  }
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const count = activityMap[dateStr] || 0;
    const intensity = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
    return { date: d, intensity };
  }).reverse();

  // Compute real study streak (consecutive days with activity going back from today)
  const computeStreak = () => {
    let streak = 0;
    for (let i = last30Days.length - 1; i >= 0; i--) {
      if (last30Days[i].intensity > 0) streak++;
      else break;
    }
    return streak;
  };
  const studyStreak = computeStreak();

  // Compute UPSC 2026 Prelims days remaining (approx. 1st Sunday of June 2026)
  const upscPrelimsDate = new Date('2026-06-07T00:00:00');
  const daysToUPSC = Math.max(0, Math.ceil((upscPrelimsDate - new Date()) / (1000 * 60 * 60 * 24)));

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return 'var(--color-border-base)';
    if (intensity === 1) return 'rgba(249, 115, 22, 0.15)';
    if (intensity === 2) return 'rgba(249, 115, 22, 0.45)';
    return 'var(--color-accent-primary)';
  };

  // Compute readiness grade & zones
  const scorePercent = s.accuracy || 0;
  const readinessGrade = scorePercent >= 85 ? 'A+' : scorePercent >= 70 ? 'A' : scorePercent >= 50 ? 'B' : 'C';
  const readinessDesc = scorePercent >= 85 ? t('Excellent Standing', 'अति उत्कृष्ट') : scorePercent >= 70 ? t('Strong Standing', 'उत्कृष्ट') : scorePercent >= 50 ? t('Average Standing', 'सामान्य') : t('Needs Focus', 'सुधार अपेक्षित');
  
  // Readiness Bar Color
  const readinessBarColor = scorePercent >= 75 ? '#22c55e' : scorePercent >= 50 ? '#f97316' : '#ef4444';

  // Static suggestions as fallbacks if no weak topics
  const DEFAULT_SUGGESTIONS = [
    { exam: 'UPSC', subject: 'Polity', topic: 'Constitutional Framework', subtopic: 'Preamble of the Constitution', desc: t('Master the structural philosophy of India', 'भारत के वैचारिक संविधान की रीढ़ समझें') },
    { exam: 'UPSC', subject: 'history', topic: 'Modern History', subtopic: 'Revolt of 1857 in Bihar', desc: t('High frequency BPSC/UPSC history core', 'बीपीएससी और यूपीएससी इतिहास के अत्यंत महत्वपूर्ण प्रश्न') },
    { exam: 'UPSC', subject: 'history', topic: 'Art & Culture', subtopic: 'Madhubani Painting & Folk Art', desc: t('Socio-cultural topics of Bihar PCS', 'बिहार लोक सेवा के सामाजिक और सांस्कृतिक विषय') }
  ];

  return (
    <AppLayout>
      <div style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Premium Welcome Banner */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1.5px solid var(--color-border-base)',
          borderRadius: 24, padding: '24px 32px', marginBottom: 32,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 16, position: 'relative', overflow: 'hidden',
          backdropFilter: 'blur(16px)',
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(249,115,22,0.08)', borderRadius: '50%', filter: 'blur(24px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, left: '40%', width: 80, height: 80, background: 'rgba(124,58,237,0.06)', borderRadius: '50%', filter: 'blur(20px)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'white', fontSize: 24, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>
                {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  {studyStreak > 0 && (
                    <span style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🔥 {studyStreak} {t('day streak!', 'दिन की स्ट्रीक!')}
                    </span>
                  )}
                  <span style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 8, padding: '2px 10px', fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>
                    {readinessGrade} {t('Grade', 'ग्रेड')}
                  </span>
                </div>
                <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', lineHeight: 1.2, letterSpacing: '-0.02em', margin: 0 }}>
                  {t('Welcome back', 'स्वागत है')}, <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.name?.split(' ')[0]}!</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted-base)', marginTop: 4, fontSize: 13 }}>{t("Here's your learning and assessment summary", 'यह आपकी अध्ययन एवं परीक्षण प्रगति का संक्षेप है')}</p>
              </div>
            </div>
          </div>

          {/* Right side — Tab Selection */}
          <div style={{ display: 'flex', background: 'rgba(108,99,255,0.05)', border: '1.5px solid var(--color-border-base)', borderRadius: 14, padding: 4, position: 'relative', zIndex: 1 }}>
            <button onClick={() => setActiveTab('overview')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease',
                fontFamily: 'Outfit, sans-serif',
                background: activeTab === 'overview' ? 'var(--gradient-primary)' : 'transparent',
                color: activeTab === 'overview' ? '#fff' : 'var(--color-text-muted-base)'
              }}>
              <LayoutDashboard size={14} /> {t('Overview', 'अवलोकन')}
            </button>
            <button onClick={() => setActiveTab('bookmarks')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.25s ease',
                fontFamily: 'Outfit, sans-serif',
                background: activeTab === 'bookmarks' ? 'var(--gradient-primary)' : 'transparent',
                color: activeTab === 'bookmarks' ? '#fff' : 'var(--color-text-muted-base)'
              }}>
              <Bookmark size={14} /> {t('Bookmarks', 'बुकमार्क')} {bookmarks.length > 0 && <span style={{ background: '#fff', color: 'var(--color-primary)', borderRadius: '50%', width: 16, height: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800 }}>{bookmarks.length}</span>}
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Quick Actions & Countdown Widget */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              {/* Learn Hub Card */}
              <Link to="/learn" id="dash-goto-learn" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(124,58,237,0.06) 100%)',
                  border: '1px solid rgba(249,115,22,0.2)', borderRadius: 18, padding: '20px 22px',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  display: 'flex', gap: 14, alignItems: 'center', height: '100%',
                  position: 'relative', overflow: 'hidden'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(249,115,22,0.2)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(249,115,22,0.2)'; }}>
                  <div style={{ position: 'absolute', top: -12, right: -12, width: 60, height: 60, background: 'rgba(249,115,22,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ width: 46, height: 46, background: 'rgba(249,115,22,0.18)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={22} color="var(--color-accent-primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-title-base)', fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>{t('Learn Hub', 'लर्न हब')}</div>
                    <div style={{ color: 'var(--color-text-muted-base)', fontSize: 11.5, marginTop: 2 }}>{t('Bilingual notes & PYQs', 'द्विभाषी नोट्स और पीवाईक्यू')}</div>
                  </div>
                </div>
              </Link>

              {/* Test Center Card */}
              <Link to="/test" id="dash-goto-test" style={{ textDecoration: 'none' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(56,189,248,0.1) 0%, rgba(14,165,233,0.04) 100%)',
                  border: '1px solid rgba(56,189,248,0.2)', borderRadius: 18, padding: '20px 22px',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                  display: 'flex', gap: 14, alignItems: 'center', height: '100%',
                  position: 'relative', overflow: 'hidden'
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(56,189,248,0.2)'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(56,189,248,0.2)'; }}>
                  <div style={{ position: 'absolute', top: -12, right: -12, width: 60, height: 60, background: 'rgba(56,189,248,0.08)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ width: 46, height: 46, background: 'rgba(56,189,248,0.18)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FlaskConical size={22} color="#38bdf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-title-base)', fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>{t('Test Center', 'टेस्ट सेंटर')}</div>
                    <div style={{ color: 'var(--color-text-muted-base)', fontSize: 11.5, marginTop: 2 }}>{t('Mock exams & analytics', 'मॉक टेस्ट और विश्लेषण')}</div>
                  </div>
                </div>
              </Link>

              {/* Upcoming Exam Countdown Widget */}
              <div style={{
                background: daysToUPSC < 60 ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.04))' : daysToUPSC < 180 ? 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.04))' : 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
                border: `1px solid ${daysToUPSC < 60 ? 'rgba(239,68,68,0.25)' : daysToUPSC < 180 ? 'rgba(249,115,22,0.25)' : 'rgba(34,197,94,0.2)'}`,
                borderRadius: 18, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14
              }}>
                <div style={{ width: 46, height: 46, background: daysToUPSC < 60 ? 'rgba(239,68,68,0.18)' : daysToUPSC < 180 ? 'rgba(249,115,22,0.15)' : 'rgba(34,197,94,0.12)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={20} color={daysToUPSC < 60 ? '#ef4444' : daysToUPSC < 180 ? '#f97316' : '#22c55e'} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-muted-base)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{t('UPSC CSE PRELIMS 2026', 'यूपीएससी प्रारंभिक 2026')}</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 900, color: daysToUPSC < 60 ? '#ef4444' : 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>
                    {daysToUPSC}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', marginTop: 3, fontWeight: 600 }}>{t('Days Remaining', 'दिन शेष')}</div>
                </div>
              </div>

              {/* Daily Study Goal Widget */}
              <div style={{
                background: 'var(--color-card-bg)',
                border: '1.5px solid var(--color-border-base)',
                borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10,
                boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(16px)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, background: 'rgba(255,107,0,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Target size={18} color="var(--color-accent-primary)" />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted-base)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('DAILY GOAL', 'दैनिक लक्ष्य')}</span>
                    <h4 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', margin: 0 }}>
                      {t('Study & Take 1 Test', 'पढ़ें और 1 टेस्ट दें')}
                    </h4>
                  </div>
                </div>
                {/* Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted-base)', marginBottom: 4, fontWeight: 700 }}>
                    <span>{t('Active Target', 'सक्रिय लक्ष्य')}</span>
                    <span style={{ color: 'var(--color-accent-primary)' }}>60%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(8,18,41,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '60%', height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontStyle: 'italic', fontWeight: 600, borderLeft: '2px solid var(--color-accent-primary)', paddingLeft: 8 }}>
                  {t('Continue your UPSC journey. 3 topics remaining!', 'यूपीएससी की तैयारी जारी रखें। 3 टॉपिक्स बाकी हैं!')}
                </div>
              </div>

            </div>

            {/* ─── Continue Learning Banner ─────────────────────────────── */}
            {lastVisited && (
              <div id="dash-continue-learning" style={{
                background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(200,80,192,0.06) 50%, rgba(255,107,53,0.06) 100%)',
                border: '1.5px solid rgba(108,99,255,0.2)',
                borderRadius: 20, padding: '20px 24px', marginBottom: 28,
                display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 8px 30px rgba(108,99,255,0.08)'
              }}>
                {/* Decorative blur orb */}
                <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, background: 'rgba(108,99,255,0.06)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />

                <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(200,80,192,0.15))', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1.5px solid rgba(108,99,255,0.2)' }}>
                  <BookOpen size={24} color="#6C63FF" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6C63FF', marginBottom: 4 }}>
                    {t('▶ CONTINUE LEARNING', '▶ अध्ययन जारी रखें')}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--color-text-title-base)', fontSize: 16, fontFamily: 'Outfit,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lastVisited.subtopic}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted-base)', marginTop: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ background: 'rgba(108,99,255,0.12)', color: '#6C63FF', padding: '2px 8px', borderRadius: 6, fontWeight: 700, fontSize: 10.5 }}>{lastVisited.exam}</span>
                    <span>{lastVisited.subject}</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span>{lastVisited.topic}</span>
                  </div>
                </div>

                <Link to="/learn" id="dash-resume-btn" style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <button style={{
                    background: 'linear-gradient(135deg, #6C63FF, #C850C0)',
                    color: '#fff', border: 'none', borderRadius: 12, padding: '11px 22px',
                    fontWeight: 800, fontSize: 13.5, cursor: 'pointer', fontFamily: 'Outfit,sans-serif',
                    display: 'flex', alignItems: 'center', gap: 7,
                    boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(108,99,255,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.3)'; }}
                  >
                    {t('Resume', 'जारी रखें')} <ChevronRight size={16} />
                  </button>
                </Link>
              </div>
            )}

            {/* Exam Readiness Meter & Study Streak Widget */}
            <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontWeight: 800, color: 'var(--color-text-title-base)', fontSize: 16, fontFamily: 'Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Compass size={18} color="var(--color-accent-primary)" /> {t('Exam Readiness Status', 'परीक्षा तत्परता संकेतक')}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--color-text-muted-base)', marginTop: 2 }}>{t('Aggregated syllabus progress and test accuracy grade.', 'पाठ्यक्रम प्रगति और टेस्ट स्कोर का कुल संकेतक।')}</p>
                </div>
                {/* Study Streak Counter — computed from real activity */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: studyStreak > 0 ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${studyStreak > 0 ? 'rgba(249,115,22,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: '8px 16px' }}>
                  <Flame size={18} className={studyStreak > 0 ? 'animate-pulse-flame' : ''} color={studyStreak > 0 ? 'var(--color-accent-primary)' : '#475569'} fill={studyStreak > 0 ? 'var(--color-accent-primary)' : 'none'} />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 900, color: 'var(--color-text-title-base)' }}>{studyStreak} {t('Day Streak', 'दिन की निरंतरता')}</span>
                    <span style={{ fontSize: 9, color: 'var(--color-text-muted-base)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>{studyStreak > 0 ? t('Keep it up!', 'शानदार!') : t('Start Today', 'आज शुरू करें')}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar with Color Gradient Zones */}
              <div style={{ position: 'relative', marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--color-text-muted-base)', marginBottom: 6, fontWeight: 700 }}>
                  <span style={{ color: '#ef4444' }}>{t('FOCUS (0-49%)', 'सुधार जरूरी')}</span>
                  <span style={{ color: '#f97316' }}>{t('PROGRESSING (50-74%)', 'प्रगतिशील')}</span>
                  <span style={{ color: '#22c55e' }}>{t('EXCELLENT (75%+', 'उत्कृष्ट')}</span>
                </div>
                
                <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 999, overflow: 'hidden', border: '1px solid var(--color-border-base)' }}>
                  <div style={{ width: `${scorePercent || 50}%`, height: '100%', background: `linear-gradient(90deg, #ef4444 0%, #f97316 60%, #22c55e 100%)`, borderRadius: 999, transition: 'width 0.8s ease' }} />
                </div>

                <div style={{ position: 'absolute', left: `${Math.min(95, Math.max(5, scorePercent || 50))}%`, transform: 'translateX(-50%)', top: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: 3, height: 10, background: 'var(--color-text-title-base)' }} />
                  <div style={{ background: readinessBarColor, color: 'white', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.3)', whiteSpace: 'nowrap' }}>
                    {t('Your Score:', 'आपका स्कोर:')}&nbsp;{(scorePercent || 50).toFixed(0)}% ({readinessGrade})
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats scrolling row on mobile */}
            <style>{`
              @media (max-width: 768px) {
                .scrolling-stats-container {
                  display: flex !important;
                  overflow-x: auto !important;
                  gap: 16px !important;
                  padding-bottom: 12px !important;
                  scroll-snap-type: x mandatory;
                }
                .scrolling-stats-container > div {
                  flex: 0 0 240px !important;
                  scroll-snap-align: start;
                }
              }
            `}</style>
            
            {/* Stats Cards - 3 Columns */}
            <div className="scrolling-stats-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
              <StatCard icon={Target} label={t("Average Accuracy", "औसत सटीकता")} value={`${(s.accuracy ?? 0).toFixed(0)}%`} sub={t("Overall testing accuracy", "कुल परीक्षण सटीकता दर")} color="orange" accent="249,115,22" />
              <StatCard icon={Award} label={t("Current Rank", "वर्तमान रैंक")} value={s.rank ?? '#42'} sub={t("Among all active users", "सभी सक्रिय उपयोगकर्ताओं में")} color="indigo" accent="124,58,237" />
              <StatCard icon={BookOpen} label={t("Syllabus Completion", "पाठ्यक्रम पूर्णता")} value={`${(s.learningProgress ?? 0).toFixed(0)}%`} sub={t("Syllabus subtopics read", "पढ़े गए पाठ्यक्रम के टॉपिक")} color="teal" accent="56,189,248" />
            </div>

            {/* Grid for Evaluation, Shimmer Charts, and Motivational Insight */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
              
              {/* Syllabus Progress Rings & Readiness Card */}
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)', display: 'flex', flexDirection: 'column', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Award size={18} color="var(--color-accent-primary)" /> {t('Readiness Evaluation', 'तत्परता मूल्यांकन')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-around', flexWrap: 'wrap', margin: '14px 0' }}>
                  <ProgressRing value={s.learningProgress ?? 0} label={t("Syllabus", "पाठ्यक्रम")} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8', fontFamily: 'Outfit,sans-serif', display: 'block', lineHeight: 1 }}>{readinessGrade}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-title-base)', display: 'block', marginTop: 6 }}>{readinessDesc}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted-base)', display: 'block', marginTop: 2 }}>{t('Based on accuracy trend', 'सटीकता प्रवृत्ति के आधार पर')}</span>
                  </div>
                </div>
              </div>

              {/* Performance Progression Bar Chart */}
              {s.performanceTrend?.length > 1 && (
                <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                    <TrendingUp size={18} color="var(--color-accent-primary)" /> {t('Accuracy Progression Chart', 'प्रदर्शन प्रगति ग्राफ')}
                  </h3>
                  <AccuracyBarChart data={s.performanceTrend} />
                </div>
              )}

              {/* Motivational Insight Bilingual Card */}
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(124,58,237,0.02))' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif', marginBottom: 12 }}>
                  <Sparkles size={18} color="var(--color-accent-primary)" /> {t('Motivational Insight', 'प्रेरणात्मक विचार')}
                </h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', margin: '8px 0' }}>
                  <p style={{ fontStyle: 'italic', color: 'var(--color-text-title-base)', fontSize: 14, lineHeight: 1.6 }}>
                    {t(MOTIVATIONAL_QUOTES[quoteIdx].en, MOTIVATIONAL_QUOTES[quoteIdx].hi)}
                  </p>
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', textAlign: 'right', fontWeight: 700 }}>
                  — NIRNAYPATH PANEL
                </div>
              </div>
            </div>

            {/* Grid for Suggestions, Strengths, and Recent Activity */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>

              {/* Suggestions Panel */}
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Lightbulb size={18} color="var(--color-accent-primary)" /> {t('Syllabus Suggestions', 'पाठ्यक्रम सुझाव')}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {DEFAULT_SUGGESTIONS.map((item, idx) => (
                    <div key={idx} onClick={() => navigate('/learn')} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border-base)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border-base)'}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 9.5, background: 'rgba(249,115,22,0.15)', color: 'var(--color-accent-primary)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{item.subject}</span>
                          <span style={{ fontSize: 10.5, color: 'var(--color-text-title-base)', fontWeight: 700 }}>{item.subtopic}</span>
                        </div>
                        <p style={{ fontSize: 11.5, color: 'var(--color-text-muted-base)', marginTop: 4 }}>{item.desc}</p>
                      </div>
                      <ChevronRight size={16} color="var(--color-text-muted-base)" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic Strengths Analysis */}
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Activity size={18} color="var(--color-accent-primary)" /> {t('Topic Performance Metrics', 'टॉपिक प्रदर्शन विश्लेषण')}
                </h3>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: '#22c55e', fontSize: 11, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <Award size={14} /> {t('STRONG TOPICS (ACCURACY ≥ 70%)', 'मजबूत टॉपिक्स (शुद्धता ≥ 70%)')}
                  </div>
                  {s.strongTopics?.length > 0 ? s.strongTopics.map(t => (
                    <div key={t} style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, color: '#a7f3d0', fontSize: 13 }}>
                      ✓ {t}
                    </div>
                  )) : <div style={{ color: 'var(--color-text-muted-base)', fontSize: 13 }}>{t('Complete topic tests to evaluate strengths.', 'अपनी शक्तियों का आकलन करने के लिए टेस्ट पूर्ण करें।')}</div>}
                </div>
                
                <div>
                  <div style={{ color: '#ef4444', fontSize: 11, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em' }}>
                    <AlertTriangle size={14} /> {t('WEAK TOPICS (ACCURACY < 80%)', 'कमजोर टॉपिक्स (शुद्धता < 80%)')}
                  </div>
                  {s.weakTopics?.length > 0 ? s.weakTopics.map(t => (
                    <div key={t} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 6, color: '#fca5a5', fontSize: 13 }}>
                      ✗ {t}
                    </div>
                  )) : <div style={{ color: 'var(--color-text-muted-base)', fontSize: 13 }}>{t('No weak topics identified yet. Keep it up!', 'कोई कमजोर टॉपिक नहीं मिला। बहुत बढ़िया!')}</div>}
                </div>
              </div>

              {/* Recent Test Activities */}
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Clock size={18} color="var(--color-accent-primary)" /> {t('Recent Assessment Logs', 'हालिया परीक्षा लॉग')}
                </h3>
                {s.recentActivity?.length > 0 ? s.recentActivity.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--color-border-base)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(249,115,22,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FlaskConical size={14} color="var(--color-accent-primary)" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ color: 'var(--color-text-title-base)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.label}</div>
                      <div style={{ color: 'var(--color-text-muted-base)', fontSize: 11, marginTop: 2 }}>{new Date(a.date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</div>
                    </div>
                    {a.meta?.accuracy !== undefined && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ color: a.meta.accuracy >= 70 ? '#22c55e' : '#f97316', fontWeight: 800, fontSize: 13.5 }}>
                          {a.meta.accuracy.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: 9, color: 'var(--color-text-muted-base)' }}>{t('Accuracy', 'सटीकता')}</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-text-muted-base)' }}>
                    <FlaskConical size={32} color="var(--color-text-muted-base)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 13 }}>{t('No tests recorded yet.', 'अभी तक कोई टेस्ट रिकॉर्ड नहीं है।')}</p>
                    <Link to="/test" style={{ color: 'var(--color-accent-primary)', fontSize: 13, textDecoration: 'none', marginTop: 8, display: 'inline-block', fontWeight: 600 }}>
                      {t('Start mock test →', 'मॉक टेस्ट शुरू करें →')}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Progress Heatmap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, marginBottom: 32 }}>
              <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Calendar size={18} color="var(--color-accent-primary)" /> {t('Daily Activity Heatmap (Last 30 Days)', 'दैनिक अध्ययन सक्रियता हीटमैप (अंतिम 30 दिन)')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8, maxWidth: 450 }}>
                  {last30Days.map((day, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: getHeatmapColor(day.intensity), borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.02)' }}
                      title={`${day.date.toDateString()}: ${day.intensity === 0 ? 'No activity' : day.intensity === 1 ? 'Read notes' : day.intensity === 2 ? 'Completed Topic Test' : 'Completed Full Mock Test'}`} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: 'var(--color-text-muted-base)', alignItems: 'center' }}>
                  <span>{t('Less Active', 'कम सक्रिय')}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(0), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(1), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(2), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(3), borderRadius: 2 }} />
                  </div>
                  <span>{t('More Active', 'अधिक सक्रिय')}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Bookmarks View */
          <div className="premium-card" style={{ padding: 24, border: '1px solid var(--color-border-base)' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
              <Bookmark size={18} color="var(--color-accent-primary)" /> {t('Saved Bookmarks Workspace', 'सहेजी गई अध्ययन सामग्री')}
            </h3>
            {bookmarks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted-base)' }}>
                <Bookmark size={36} color="var(--color-text-muted-base)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>{t('No study notes or questions bookmarked yet.', 'अभी तक कोई अध्ययन सामग्री बुकमार्क नहीं की गई है।')}</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>{t('Bookmarks help save key topics for rapid access later.', 'महत्वपूर्ण परीक्षा उपयोगी अध्यायों को बुकमार्क कर बाद में आसानी से पढ़ें।')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} onClick={() => handleBookmarkClick(bookmark)}
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--color-border-base)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: bookmark.type === 'content' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (bookmark.type==='content') e.currentTarget.style.borderColor = 'rgba(249,115,22,0.3)'; }}
                    onMouseLeave={e => { if (bookmark.type==='content') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ background: bookmark.type === 'content' ? 'rgba(249,115,22,0.15)' : 'rgba(249,115,22,0.12)', color: 'var(--color-accent-primary)', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                          {bookmark.type === 'content' ? t('Study Note', 'अध्ययन नोट्स') : t('Question', 'प्रश्न')}
                        </span>
                        {bookmark.details?.exam && <span style={{ color: 'var(--color-text-muted-base)', fontSize: 11 }}>{bookmark.details.exam}</span>}
                        {bookmark.details?.subject && <span style={{ color: 'var(--color-text-muted-base)', fontSize: 11 }}>• {t(bookmark.details.subject, bookmark.details.subject)}</span>}
                      </div>
                      <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 600, fontSize: 14.5 }}>{bookmark.details?.title}</h4>
                      {bookmark.details?.subtopic && <p style={{ color: 'var(--color-text-muted-base)', fontSize: 12, marginTop: 4 }}>{t('Subtopic:', 'उपविषय:')} {bookmark.details.subtopic}</p>}
                    </div>
 
                    <button onClick={(e) => removeBookmark(e, bookmark.id)} className="btn-secondary"
                      style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', background: 'rgba(244,63,94,0.05)', border: '1px solid rgba(244,63,94,0.1)', borderRadius: 8 }}
                      title="Remove Bookmark">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </AppLayout>
  );
}
