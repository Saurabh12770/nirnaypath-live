import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../services/api';
import { BookOpen, ChevronRight, ChevronDown, CheckCircle, Circle, Bookmark, BookMarked, FlaskConical, ArrowLeft, Lightbulb, Table2, FileText, Star, Clock, Link2, Search, Zap, ArrowRight, ShieldCheck, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EXAM_COLORS = {
  'UPSC': '#6C63FF', 'BPSC': '#C850C0', 'SSC CGL': '#FF6B35',
  'SSC CHSL': '#0ea5e9', 'Railway': '#22c55e', 'Banking': '#facc15', 'State PCS': '#a78bfa'
};

// ─── Markdown Renderer with theme variables ──────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = text;

  // Markdown tables
  html = html.replace(/(?:^|\n)((?:\|.+\|\n?)+)/g, (match, tableBlock) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim().length > 0);
    if (rows.length < 2) return match;
    const isSep = (r) => /^[|\s\-:]+$/.test(r);
    const parseRow = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    const headers = parseRow(rows[0]);
    const bodyRows = rows.slice(1).filter(r => !isSep(r));
    const ths = headers.map(h => `<th style="background:var(--color-border-base);color:var(--color-text-title-base);padding:14px 18px;text-align:left;border:1px solid var(--color-border-base);font-size:13.5px;font-weight:700">${h}</th>`).join('');
    const trs = bodyRows.map((r, i) => {
      const tds = parseRow(r).map(c => `<td style="padding:14px 18px;border:1px solid var(--color-border-base);color:var(--color-text-base);font-size:14px;background:${i%2===0?'transparent':'rgba(8,18,41,0.01)'}">${c}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<div style="overflow-x:auto;margin:24px 0"><table class="premium-table" style="width:100%;border-collapse:collapse"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h5 style="color:var(--color-text-title-base);font-weight:800;margin:24px 0 12px;font-size:15px">$1</h5>');
  html = html.replace(/^### (.+)$/gm, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<h4 id="${id}" style="color:var(--color-text-title-base);font-weight:800;margin-top:28px;margin-bottom:12px;font-size:20px;font-family:'Outfit'">${title}</h4>`;
  });
  html = html.replace(/^## (.+)$/gm, (match, title) => {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<h3 id="${id}" style="color:var(--color-text-title-base);font-weight:800;margin-top:36px;margin-bottom:16px;font-size:26px;border-left:4px solid var(--color-accent-primary);padding-left:12px;font-family:'Outfit'">${title}</h3>`;
  });
  html = html.replace(/^# (.+)$/gm, '<h2 style="color:var(--color-text-title-base);font-weight:900;margin-top:40px;margin-bottom:20px;font-size:34px;font-family:\'Outfit\'">$1</h2>');

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-text-title-base);font-weight:700">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="color:var(--color-accent-primary);font-style:italic">$1</em>');

  // Bullet lists
  html = html.replace(/^[-•] (.+)$/gm, '<li style="color:var(--color-text-base);margin:8px 0;font-size:16px;list-style:none;padding-left:24px;position:relative"><span style="position:absolute;left:4px;color:var(--color-accent-primary)">▸</span>$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>)/gs, '<ul style="margin:14px 0;padding:0">$1</ul>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code style="background:rgba(108,99,255,0.08);color:#6C63FF;padding:3px 8px;border-radius:6px;font-size:14px;font-family:monospace">$1</code>');

  // Newlines
  html = html.replace(/\n/g, '<br/>');

  return html;
}

// ─── Extract Headers for Outline ───
function extractHeaders(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const headers = [];
  lines.forEach(line => {
    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const title = match[2].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      headers.push({ level, title, id });
    }
  });
  return headers;
}

function getLangText(text, lang) {
  if (!text) return '';
  const parts = text.split('===HINDI===');
  if (parts.length > 1) {
    return lang === 'hi' ? parts[1].trim() : parts[0].trim();
  }
  return text;
}

// ─── Exam Card ───
function ExamCard({ exam, onSelect, t }) {
  const color = EXAM_COLORS[exam.name] || '#6C63FF';
  return (
    <div id={`exam-card-${exam.id.toLowerCase()}`} className="premium-card" onClick={() => onSelect(exam)} style={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: '2.2rem', padding: 10, background: `${color}15`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{exam.icon}</div>
        <div>
          <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 16, fontFamily: 'Outfit,sans-serif' }}>{t(exam.name, exam.name)}</h4>
          <span style={{ fontSize: 10, background: `${color}25`, color: color, padding: '2px 6px', borderRadius: 4, fontWeight: 800, display: 'inline-block', marginTop: 4 }}>
            {t('Mapped Track', 'पाठ्यक्रम मैप्ड')}
          </span>
        </div>
      </div>
      <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13.5, lineHeight: 1.6, flex: 1 }}>{exam.description}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--color-border-base)', paddingTop: 14, marginTop: 20, fontSize: 13 }}>
        <span style={{ fontWeight: 800, color: 'var(--color-accent-primary)' }}>{t('Explore Syllabus →', 'पाठ्यक्रम देखें →')}</span>
      </div>
    </div>
  );
}

// ─── AI Study Assistant Sub-Component ───
function AIStudyAssistant({ subtopic, t }) {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuery, setActiveQuery] = useState('');

  const handleQuery = (queryType) => {
    setLoading(true);
    setActiveQuery(queryType);
    setResponse('');

    setTimeout(() => {
      let ans;
      if (queryType === 'explain') {
        ans = t(
          `Here is the premium summary logic for "${subtopic}":\n\n• **Core Principle**: Designed as a fundamental segment within the targeted syllabus to cover high-scoring rules.\n• **Key Terminology**: Keep watch of key vocabulary maps, structural changes, and definitions outlined in notes.\n• **Topper Tip**: Read this in relation to historical standard questions. Use the translation swap tool to double-check vocabulary definitions.`,
          `विषय "${subtopic}" का मुख्य सारांश विश्लेषण:\n\n• **मूल सिद्धांत**: उच्च अंक प्राप्त करने वाले नियमों को कवर करने के लिए पाठ्यक्रम में विशिष्ट स्थान।\n• **प्रमुख शब्दावली**: नोट्स में दिए गए प्रमुख परिभाषाओं और संरचनात्मक परिवर्तनों पर ध्यान दें।\n• **टॉपर टिप**: इसे ऐतिहासिक मानक प्रश्नों के संबंध में पढ़ें। पारिभाषिक शब्दों के सटीक अर्थ के लिए भाषा परिवर्तन टूल का उपयोग करें।`
        );
      } else if (queryType === 'flashcard') {
        ans = t(
          `💡 **Study Flashcards**:\n\n1. *Question*: What is the primary theme of "${subtopic}"?\n   *Answer*: Core structural concept mapped directly to administrative benchmarks.\n\n2. *Question*: What is a common trap in tests here?\n   *Answer*: Neglecting bilingual terminology variations and chronological accuracy.`,
          `💡 **अध्ययन फ्लैशकार्ड**:\n\n1. *प्रश्न*: "${subtopic}" का प्राथमिक विषय क्या है?\n   *उत्तर*: प्रशासनिक मानदंडों से सीधे जुड़ा मुख्य संरचनात्मक सिद्धांत।\n\n2. *प्रश्न*: टेस्ट में अक्सर होने वाली गलती क्या है?\n   *उत्तर*: द्विभाषी पारिभाषिक शब्दों और कालानुक्रमिक सत्यता की अनदेखी करना।`
        );
      } else {
        ans = t(
          `🧠 **Mnemonic Strategy for "${subtopic}"**:\n\nUse the keyword "**N-I-R-N-A-Y**":\n• **N**avigate related concepts first.\n• **I**solate high-yield tables.\n• **R**evise solved PYQs.\n• **N**ote core definitions.\n• **A**ttempt chapter mock test.\n• **Y**ield success metric of 80%+ accuracy.`,
          `🧠 **याद रखने की रणनीति ("${subtopic}")**:\n\nसंक्षिप्त सूत्र "**निर्णय**" (N-I-R-N-A-Y) याद रखें:\n• **N** - बुनियादी अवधारणाओं को नेविगेट करें।\n• **I** - महत्वपूर्ण तालिकाओं को अलग से पढ़ें।\n• **R** - हल किए गए पीवाईक्यू को दोहराएं।\n• **N** - प्रमुख परिभाषाओं को नोट करें।\n• **A** - विषयवार मॉक परीक्षा दें।\n• **Y** - 80%+ सटीकता प्राप्त करें।`
        );
      }
      setResponse(ans);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="premium-card" style={{ padding: 20, border: '2px solid rgba(108,99,255,0.15)', background: 'linear-gradient(135deg, rgba(108,99,255,0.03) 0%, rgba(255,255,255,0.8) 100%)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Brain size={18} color="#6C63FF" />
        <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 13.5, fontFamily: 'Outfit,sans-serif', margin: 0 }}>{t('AI STUDY ASSISTANT', 'एआई अध्ययन सहायक')}</h4>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        <button onClick={() => handleQuery('explain')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 11.5, justifyContent: 'flex-start', background: activeQuery === 'explain' ? 'rgba(108,99,255,0.08)' : 'transparent', borderColor: activeQuery==='explain'?'#6C63FF':'var(--color-border-base)' }}>
          💡 {t('Explain Concept', 'सिद्धांत स्पष्ट करें')}
        </button>
        <button onClick={() => handleQuery('flashcard')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 11.5, justifyContent: 'flex-start', background: activeQuery === 'flashcard' ? 'rgba(108,99,255,0.08)' : 'transparent', borderColor: activeQuery==='flashcard'?'#6C63FF':'var(--color-border-base)' }}>
          ⚡ {t('Generate Flashcards', 'फ्लैशकार्ड बनाएं')}
        </button>
        <button onClick={() => handleQuery('mnemonic')} className="btn-secondary" style={{ padding: '8px 12px', fontSize: 11.5, justifyContent: 'flex-start', background: activeQuery === 'mnemonic' ? 'rgba(108,99,255,0.08)' : 'transparent', borderColor: activeQuery==='mnemonic'?'#6C63FF':'var(--color-border-base)' }}>
          🧠 {t('Memory Mnemonic', 'याद रखने का सूत्र')}
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
          <div style={{ width: 14, height: 14, border: '2px solid rgba(108,99,255,0.2)', borderTop: '2px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-muted-base)' }}>{t('Consulting AI engine...', 'एआई इंजन से परामर्श किया जा रहा है...')}</span>
        </div>
      )}

      {response && !loading && (
        <div className="anim-fade-in-up" style={{ padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(108,99,255,0.1)', fontSize: 12, lineHeight: 1.6, color: 'var(--color-text-base)', whiteSpace: 'pre-line' }}>
          {response}
        </div>
      )}
    </div>
  );
}

// ─── Content Reader ───
function ContentReader({ exam, subject, topic, subtopic, onBack, onNavigateToRelated, syllabus, onToggleProgress, onNavigateSubtopic }) {
  const { language } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null); // eslint-disable-line no-unused-vars
  const [activeTab, setActiveTab] = useState('overview_theory');
  const [readingTime, setReadingTime] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const containerRef = useRef(null);

  const t = (en, hi) => language === 'hi' ? hi : en;

  const [prevParams, setPrevParams] = useState({ exam, subject, topic, subtopic });
  if (exam !== prevParams.exam || subject !== prevParams.subject || topic !== prevParams.topic || subtopic !== prevParams.subtopic) {
    setPrevParams({ exam, subject, topic, subtopic });
    setLoading(true);
    setContent(null);
  }

  useEffect(() => {
    api.get(`/learn/content/${encodeURIComponent(exam)}/${encodeURIComponent(subject)}/${encodeURIComponent(topic)}/${encodeURIComponent(subtopic)}`)
      .then(res => {
        const data = res.data.content;
        setContent(data);
        setLoading(false);

        // Calculate estimated reading time
        const textToAnalyze = getLangText(data.introduction || '', 'en') + ' ' + getLangText(data.detailedExplanation || '', 'en');
        const wordCount = textToAnalyze.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 200)); // ~200 WPM
        setReadingTime(minutes);

        // Check bookmark status
        api.get('/bookmarks').then(bookmarkRes => {
          const matched = bookmarkRes.data.bookmarks.find(b => b.targetId === data._id);
          if (matched) {
            setBookmarked(true);
            setBookmarkId(matched.id);
          } else {
            setBookmarked(false);
            setBookmarkId(null);
          }
        }).catch(() => {});
      })
      .catch(err => {
        setLoading(false);
        if (err.response?.status === 404) {
          setContent(null);
        } else {
          console.error('[LearnHub] Content fetch error:', err.message);
        }
      });

    api.get('/learn/progress').then(res => {
      const isDone = !!res.data.learningProgress[subtopic];
      setCompleted(isDone);
      if (onToggleProgress) onToggleProgress(subtopic, isDone);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, subject, topic, subtopic]);

  // Track scrolling inside the content reader
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const element = containerRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      if (totalHeight === 0) {
        setScrollProgress(100);
      } else {
        const progress = (element.scrollTop / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, Math.round(progress))));
      }
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [loading, content]);

  const toggleComplete = async () => {
    const next = !completed;
    setCompleted(next);
    if (next) {
      setShowCelebration(true);
    }
    try { 
      await api.post('/learn/progress', { subtopic, completed: next }); 
      if (onToggleProgress) onToggleProgress(subtopic, next);
    } catch { 
      setCompleted(!next);
      if (next) setShowCelebration(false);
    }
  };

  const toggleBookmark = async () => {
    if (!content) return;
    try {
      const res = await api.post('/bookmarks', { type: 'content', targetId: content._id });
      setBookmarked(res.data.bookmarked);
      if (res.data.bookmarked && res.data.bookmark) {
        setBookmarkId(res.data.bookmark._id);
      } else {
        setBookmarkId(null);
      }
    } catch (e) { 
      console.error(e); 
    }
  };

  const handlePracticeLaunch = () => {
    navigate('/test', { state: { exam, subject, topic } });
  };

  // Compute Next Subtopic for Auto Suggestion
  const getNextSubtopic = () => {
    if (!syllabus || !syllabus.subjects) return null;
    const subj = syllabus.subjects.find(s => s.name === subject);
    if (!subj || !subj.topics) return null;

    const flatSubtopics = [];
    subj.topics.forEach(t => {
      (t.subtopics || []).forEach(st => {
        flatSubtopics.push({ topicName: t.name, subtopicName: st });
      });
    });

    const currIdx = flatSubtopics.findIndex(item => item.subtopicName === subtopic);
    if (currIdx !== -1 && currIdx < flatSubtopics.length - 1) {
      return flatSubtopics[currIdx + 1];
    }
    return null;
  };

  const nextSub = getNextSubtopic();

  const handleNextClick = () => {
    if (nextSub) {
      if (onNavigateSubtopic && nextSub.topicName === topic) {
        onNavigateSubtopic(nextSub.subtopicName);
      } else {
        onNavigateToRelated({
          exam,
          subject,
          topic: nextSub.topicName,
          subtopic: nextSub.subtopicName
        });
      }
    }
  };

  const TABS = [
    { id: 'overview_theory', label: t('Overview & Theory', 'अवलोकन एवं सिद्धांत'), icon: FileText },
    { id: 'examples_solved', label: t('Examples & Tables', 'उदाहरण एवं तालिकाएं'), icon: Table2 },
    { id: 'pyq_practice', label: t('PYQs & Practice', 'पीवाईक्यू एवं अभ्यास'), icon: Star },
    { id: 'revision_mindmap', label: t('Revision & Facts', 'संशोधन एवं तथ्य'), icon: Lightbulb },
    { id: 'summary', label: t('Quick Summary', 'त्वरित सारांश'), icon: ShieldCheck },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13.5 }}>{t('Loading study module...', 'अध्ययन सामग्री लोड हो रही है...')}</p>
    </div>
  );

  if (!loading && !content) return (
    <div style={{ padding: '60px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="empty-state-container" style={{ margin: 0, maxWidth: '100%', width: '100%' }}>
        <div className="empty-state-icon">
          <BookOpen size={36} color="var(--color-accent-primary)" />
        </div>
        <h3 className="empty-state-title">{t('Content Coming Soon', 'सामग्री जल्द आ रही है')}</h3>
        <p className="empty-state-desc">
          {t('Study notes for ', 'अध्ययन नोट्स ')} <strong style={{ color: 'var(--color-accent-primary)' }}>{subtopic}</strong> {t('are currently being authored. In the meantime, try starting a mock test!', 'वर्तमान में जोड़े जा रहे हैं। इस बीच, एक मॉक टेस्ट शुरू करें!')}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={handlePracticeLaunch} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
            {t('Take Mock Test', 'मॉक टेस्ट दें')}
          </button>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
            {t('Back to Syllabus', 'पाठ्यक्रम पर वापस')}
          </button>
        </div>
      </div>
    </div>
  );

  const headers = extractHeaders(getLangText(content.detailedExplanation, language));

  return (
    <div>
      {/* Sticky Top Scroll Progress bar */}
      <div className="sticky-progress-container">
        <div className="sticky-progress-bar" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* Header Info Panel */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 11.5, color: 'var(--color-text-muted-base)', fontWeight: 700, letterSpacing: '0.04em' }}>
          <span style={{ color: EXAM_COLORS[exam] || 'var(--color-accent-primary)', fontWeight: 800 }}>{exam}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>{subject}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>{topic}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <h2 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: '1.45rem', fontFamily: 'Outfit,sans-serif', flex: 1, margin: 0, lineHeight: 1.3 }}>{subtopic}</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', padding: '5px 11px', borderRadius: 8, fontSize: 11, color: '#10B981', fontWeight: 700 }}>
              <ShieldCheck size={12} />
              <span>{t('Verified', 'सत्यापित')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.22)', padding: '5px 11px', borderRadius: 8, fontSize: 11, color: '#6C63FF', fontWeight: 700 }}>
              <Clock size={12} />
              <span>{readingTime} {t('min', 'मिनट')}</span>
            </div>
            <button id="btn-bookmark" onClick={toggleBookmark} title={bookmarked ? t('Remove Bookmark', 'बुकमार्क हटाएं') : t('Add Bookmark', 'बुकमार्क जोड़ें')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.2s', background: bookmarked ? 'rgba(255,107,0,0.12)' : 'rgba(255,255,255,0.8)', color: bookmarked ? 'var(--color-accent-primary)' : 'var(--color-text-muted-base)', border: bookmarked ? '1px solid rgba(255,107,0,0.3)' : '2px solid var(--color-border-base)' }}>
              {bookmarked ? <BookMarked size={13} /> : <Bookmark size={13} />}
              <span className="hide-mobile">{bookmarked ? t('Saved', 'सहेजा') : t('Save', 'सहेजें')}</span>
            </button>
            <button id="btn-complete" onClick={toggleComplete}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 800, transition: 'all 0.2s',
                background: completed ? 'rgba(34,197,94,0.15)' : 'rgba(255,107,0,0.1)',
                color: completed ? '#22c55e' : 'var(--color-accent-primary)',
                border: completed ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,107,0,0.25)'
              }}>
              {completed ? <CheckCircle size={13} /> : <Circle size={13} />}
              <span className="hide-mobile">{completed ? t('Done', 'पूर्ण') : t('Mark Done', 'पूर्ण चिह्नित करें')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Double Pane layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28, alignItems: 'start' }} className="grid-2">
        
        {/* Left Pane - Study notes reader CANVAS (1000px wide text book layout) */}
        <div ref={containerRef} style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 10, maxWidth: 1000, width: '100%' }}>
          {/* Premium Tabs */}
          <div className="premium-tabs-container">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const tabColors = {
                overview_theory: '#6C63FF',
                examples_solved: '#C850C0',
                pyq_practice: '#FF6B35',
                revision_mindmap: '#22c55e',
                summary: '#facc15'
              };
              const tc = tabColors[tab.id] || 'var(--color-accent-primary)';
              return (
                <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 13, fontWeight: isActive ? 800 : 600, border: 'none',
                    background: isActive ? `${tc}15` : 'transparent',
                    color: isActive ? tc : 'var(--color-text-muted-base)',
                    boxShadow: isActive ? `inset 0 0 0 1px ${tc}30` : 'none',
                    transition: 'all 200ms ease',
                    flex: '1 1 auto',
                    justifyContent: 'center',
                    minWidth: 100
                  }}>
                  <Icon size={14} />
                  <span style={{ whiteSpace: 'nowrap' }}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {content && (
            <div style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--color-text-base)', fontFamily: "'Inter', sans-serif" }}>
              {activeTab === 'overview_theory' && (
                <div>
                  {content.introduction && (
                    <div className="definition-block">
                      <h3 style={{ color: '#6C63FF', fontWeight: 800, fontSize: '15px', letterSpacing: '0.06em', marginBottom: 12, textTransform: 'uppercase', fontFamily: 'Outfit' }}>{t('Definition & Core Meaning', 'परिभाषा और मूल अर्थ')}</h3>
                      <p style={{ color: 'var(--color-text-title-base)', fontWeight: 500 }}>{getLangText(content.introduction, language)}</p>
                    </div>
                  )}
                  
                  {content.detailedExplanation && (
                    <div className="concept-block">
                      <h3 style={{ color: '#FF6B35', fontWeight: 800, fontSize: '15px', letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase', fontFamily: 'Outfit' }}>{t('Concept Analysis Core', 'विषय का मुख्य विश्लेषण')}</h3>
                      <div className="content-body"
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(getLangText(content.detailedExplanation, language)) }}
                      />
                    </div>
                  )}

                  {nextSub && (
                    <div className="premium-card" style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('NEXT MODULE SUGGESTION', 'अगला अनुशंसित विषय')}</span>
                        <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 16, marginTop: 4 }}>{nextSub.subtopicName}</h4>
                      </div>
                      <button onClick={handleNextClick} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
                        {t('Continue Reading', 'पढ़ना जारी रखें')} <ArrowRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'examples_solved' && (
                <div>
                  <div className="example-block">
                    <h3 style={{ color: '#10B981', fontWeight: 800, fontSize: '16px', marginBottom: 20, fontFamily: 'Outfit' }}>{t('Solved Illustrative Examples', 'हल किए गए निदर्शन उदाहरण')}</h3>
                    {content.examples?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {content.examples.map((ex, i) => (
                          <div key={i} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: i < content.examples.length - 1 ? '1px solid var(--color-border-base)' : 'none' }}>
                            <div style={{ width: 26, height: 26, background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, color: '#10B981', marginTop: 4 }}>{i + 1}</div>
                            <p style={{ color: 'var(--color-text-base)', lineHeight: 1.8, fontSize: 16.5, margin: 0 }}>{getLangText(ex, language)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--color-text-muted-base)', fontSize: 15 }}>{t('No examples listed yet.', 'कोई उदाहरण सूचीबद्ध नहीं हैं।')}</p>
                    )}
                  </div>

                  {content.tables?.length > 0 && (
                    <div style={{ marginTop: 24 }}>
                      <h3 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: '17px', marginBottom: 16, fontFamily: 'Outfit' }}>{t('Structured Reference Data', 'व्यवस्थित संदर्भ डेटा')}</h3>
                      {content.tables.map((table, i) => (
                        <div key={i} className="premium-card" style={{ padding: 24, marginBottom: 20, overflowX: 'auto' }}>
                          <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 15, marginBottom: 16, fontFamily: 'Outfit' }}>{getLangText(table.title, language)}</h4>
                          <table className="premium-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr>
                                {table.headers?.map((h, j) => (
                                  <th key={j}>{getLangText(h, language)}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows?.map((row, j) => (
                                <tr key={j}>
                                  {row.map((cell, k) => (
                                    <td key={k}>{getLangText(cell, language)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'pyq_practice' && (
                <div>
                  <h3 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: '17px', marginBottom: 20, fontFamily: 'Outfit' }}>{t('Solved PYQ Block', 'हल किए गए परीक्षा प्रश्न')}</h3>
                  {content.pyqs?.length > 0 ? content.pyqs.map((q, qi) => (
                    <div key={qi} className="pyq-block">
                      <PYQCard q={q} index={qi} examName={exam} language={language} />
                    </div>
                  )) : <div className="premium-card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted-base)', marginBottom: 24 }}>
                    <Star size={32} color="var(--color-text-muted-base)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ fontSize: 15 }}>{t('No PYQs available for this subtopic.', 'कोई पीवाईक्यू उपलब्ध नहीं है।')}</p>
                  </div>}

                  {content.practiceMcqs?.length > 0 && (
                    <div style={{ marginTop: 32 }}>
                      <h3 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: '17px', marginBottom: 20, fontFamily: 'Outfit' }}>{t('Interactive Practice MCQs', 'इंटरैक्टिव अभ्यास प्रश्न')}</h3>
                      {content.practiceMcqs.map((q, qi) => (
                        <div key={`practice-${qi}`} className="pyq-block">
                          <PYQCard q={q} index={qi} examName={exam} language={language} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'revision_mindmap' && (
                <div>
                  {content.revisionNotes && (
                    <div className="revision-block">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Lightbulb size={18} color="#FF6B00" fill="#FF6B00" />
                        <span style={{ color: '#FF6B00', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('QUICK REVISION CHECKLIST', 'त्वरित पुनरावलोकन नोट्स')}</span>
                      </div>
                      <p style={{ color: 'var(--color-text-title-base)', fontSize: 16.5, fontWeight: 500 }}>{getLangText(content.revisionNotes, language)}</p>
                    </div>
                  )}

                  <div className="memory-block">
                    <h3 style={{ color: '#F59E0B', fontWeight: 800, fontSize: '16px', marginBottom: 20, fontFamily: 'Outfit' }}>{t('Important Memory Tricks & Facts', 'महत्वपूर्ण परीक्षा उपयोगी तथ्य')}</h3>
                    {content.importantFacts?.length > 0 ? content.importantFacts.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: i < content.importantFacts.length - 1 ? '1px solid var(--color-border-base)' : 'none' }}>
                        <div style={{ width: 24, height: 24, background: 'rgba(245,158,11,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>{i+1}</div>
                        <p style={{ color: 'var(--color-text-base)', lineHeight: 1.7, fontSize: 16, margin: 0 }}>{getLangText(f, language)}</p>
                      </div>
                    )) : <p style={{ color: 'var(--color-text-muted-base)', fontSize: 15 }}>{t('No key facts listed yet.', 'कोई तथ्य सूचीबद्ध नहीं हैं।')}</p>}
                  </div>
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="premium-card" style={{ padding: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                    <ShieldCheck size={22} color="#10B981" />
                    <h3 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 17, fontFamily: 'Outfit' }}>{t('Core Concept Mind Map & Takeaways', 'मुख्य अवधारणाएँ और माइंड मैप सारांश')}</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: 15.5 }}>
                    {content.concepts?.length > 0 && (
                      <div>
                        <h4 style={{ color: 'var(--color-accent-primary)', fontWeight: 800, fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('Theoretical Pillars:', 'सैद्धांतिक स्तंभ:')}</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {content.concepts.map((c, i) => (
                            <span key={i} style={{ background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.18)', borderRadius: 10, padding: '6px 14px', color: 'var(--color-accent-primary)', fontWeight: 700 }}>{getLangText(c, language)}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div style={{ borderTop: '2px solid var(--color-border-base)', paddingTop: 20, marginTop: 8 }}>
                      <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>{t('Study Strategy Checklist:', 'अध्ययन रणनीति चेकलिस्ट:')}</h4>
                      <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--color-text-base)' }}>
                        <li>{t('Understand the core principles and chronological evolution.', 'मूल सिद्धांतों और कालानुक्रमिक विकास को समझें।')}</li>
                        <li>{t('Memorize key statistics and data points in the reference tables.', 'संदर्भ तालिकाओं में प्रमुख आंकड़े और डेटा बिंदु याद रखें।')}</li>
                        <li>{t('Attempt the practice MCQs to solidify numerical/analytical tricks.', 'संख्यात्मक/तार्किक ट्रिक्स को मजबूत करने के लिए अभ्यास एमसीक्यू का प्रयास करें।')}</li>
                        <li>{t('Review the solved PYQs to understand the examiner\'s logic and catch common traps.', 'परीक्षक के दृष्टिकोण को समझने और सामान्य गलतियों से बचने के लिए हल किए गए पीवाईक्यू की समीक्षा करें।')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane - Sticky Sidebar Outline & AI Assistant Panel (Collapses on small screens) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Scroll progress & status */}
          <div className="premium-card" style={{ padding: 20 }}>
            <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 12, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('READING PROGRESS', 'पाठन प्रगति')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted-base)' }}>
                <span>{t('Completion Progress:', 'पूर्णता प्रतिशत:')}</span>
                <span style={{ fontWeight: 800, color: 'var(--color-accent-primary)' }}>{scrollProgress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(8,18,41,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${scrollProgress}%`, height: '100%', background: 'var(--gradient-primary)', transition: 'width 0.2s ease-out', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted-base)' }}>
                <span>{t('Read Status:', 'स्थिति:')}</span>
                <span style={{ fontWeight: 800, color: completed ? '#22c55e' : 'var(--color-accent-primary)' }}>{completed ? t('✓ Completed', '✓ पूर्ण') : t('Reading', 'पढ़ रहे हैं')}</span>
              </div>
              
              <button onClick={handlePracticeLaunch} className="btn-primary" style={{ width: '100%', padding: '12px 14px', fontSize: 13, marginTop: 8, justifyContent: 'center' }}>
                <FlaskConical size={15} /> {t('Practice Topic Qs', 'विषय का अभ्यास करें')}
              </button>
            </div>
          </div>

          {/* AI study assistant panel */}
          <AIStudyAssistant subtopic={subtopic} t={t} />

          {/* Table of Contents (TOC) */}
          {headers.length > 0 && (
            <div className="premium-card" style={{ padding: 20, maxHeight: 240, overflowY: 'auto' }}>
              <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 12, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('OUTLINE', 'रूपरेखा')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {headers.map((h, i) => (
                  <a key={i} href={`#${h.id}`} style={{
                    color: 'var(--color-text-muted-base)', textDecoration: 'none', fontSize: 13,
                    paddingLeft: h.level === 3 ? 12 : 0,
                    lineHeight: 1.4, borderLeft: h.level === 2 ? '2px solid #6C63FF' : 'none',
                    padding: '2px 0 2px 8px', transition: 'all 0.2s', fontWeight: 600
                  }} onMouseEnter={e=>e.currentTarget.style.color='#FF6B00'} onMouseLeave={e=>e.currentTarget.style.color='var(--color-text-muted-base)'}>
                    {h.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Related Topics panel */}
          {content?.relatedTopics?.length > 0 && (
            <div className="premium-card" style={{ padding: 20 }}>
              <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 12, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{t('RELATED TOPICS', 'संबंधित विषय')}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {content.relatedTopics.map((rel, idx) => (
                  <button key={idx} onClick={() => onNavigateToRelated(rel)}
                    style={{ background: 'rgba(255,255,255,0.8)', border: '2px solid var(--color-border-base)', borderRadius: 12, padding: '10px 12px', color: 'var(--color-text-base)', fontSize: 12.5, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 8, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B00'; e.currentTarget.style.color = '#FF6B00'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-base)'; e.currentTarget.style.color = 'var(--color-text-base)'; }}>
                    <Link2 size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 700, display: 'block', fontSize: 10, color: 'var(--color-text-muted-base)' }}>{t(rel.subject, rel.subject)}</span>
                      {rel.subtopic}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCelebration && (
        <div className="modal-backdrop" style={{ zIndex: 2000 }} onClick={() => setShowCelebration(false)}>
          <div className="modal-box glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '40px 32px' }} onClick={e => e.stopPropagation()}>
            <div className="celebration-burst" />
            <div style={{ fontSize: '3.5rem', marginBottom: 16, animation: 'float 3s ease-in-out infinite' }}>🏆</div>
            <h3 style={{ fontSize: 22, fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
              {t('Concept Mastered!', 'अवधारणा सिद्ध!')}
            </h3>
            <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              {t(`You have successfully completed "${subtopic}"!`, `आपने "${subtopic}" का अध्ययन सफलतापूर्वक पूर्ण कर लिया है!`)}
            </p>
            
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: '#22c55e', color: 'white', fontWeight: 800, fontSize: 12, padding: '4px 8px', borderRadius: 6 }}>+15 XP</div>
              <span style={{ fontSize: 13.5, color: '#10b981', fontWeight: 700 }}>{t('Knowledge Level Increased!', 'ज्ञान स्तर में वृद्धि!')}</span>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" style={{ padding: '12px 28px' }} onClick={() => setShowCelebration(false)}>
                {t('Continue Learning', 'पढ़ना जारी रखें')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topic Page Workspace ───
function TopicPage({ exam, subject, topic, onBack, syllabus, onNavigateToRelated, initialSubtopic }) {
  const { language } = useAuth();
  const [activeSubtopic, setActiveSubtopic] = useState(initialSubtopic || topic.subtopics?.[0] || '');
  const [completedMap, setCompletedMap] = useState({});
  const [prevInitialSubtopic, setPrevInitialSubtopic] = useState(initialSubtopic);

  const t = (en, hi) => language === 'hi' ? hi : en;

  if (initialSubtopic !== prevInitialSubtopic) {
    setPrevInitialSubtopic(initialSubtopic);
    if (initialSubtopic) {
      setActiveSubtopic(initialSubtopic);
    }
  }

  useEffect(() => {
    api.get('/learn/progress').then(res => {
      setCompletedMap(res.data.learningProgress || {});
    }).catch(() => {});
  }, [topic]);

  const handleToggleProgress = (sub, isCompleted) => {
    setCompletedMap(prev => ({ ...prev, [sub]: isCompleted }));
  };

  // Persist last-visited session to localStorage for Dashboard "Continue Learning" card
  useEffect(() => {
    if (!activeSubtopic || !exam || !subject) return;
    try {
      localStorage.setItem('nirnaypath_last_study', JSON.stringify({
        exam,
        subject,
        topic: topic.name,
        subtopic: activeSubtopic,
        timestamp: Date.now()
      }));
    } catch { /* ignore */ }
  }, [exam, subject, topic.name, activeSubtopic]);

  const totalUnits = topic.subtopics?.length || 0;
  const completedUnits = topic.subtopics?.filter(sub => completedMap[sub]).length || 0;
  const percentComplete = totalUnits > 0 ? Math.round((completedUnits / totalUnits) * 100) : 0;

  return (
    <div>
      {/* Mobile responsive styles for TopicPage */}
      <style>{`
        @media (max-width: 767px) {
          .topic-layout-grid { grid-template-columns: 1fr !important; }
          .topic-desktop-sidebar { display: none !important; }
          .topic-mobile-selector { display: flex !important; }
        }
        @media (min-width: 768px) {
          .topic-mobile-selector { display: none !important; }
        }
        .topic-mobile-selector select {
          width: 100%;
          padding: 12px 40px 12px 16px;
          border-radius: 14px;
          border: 2px solid var(--color-border-base);
          background: var(--color-card-bg);
          color: var(--color-text-title-base);
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 14px;
          appearance: none;
          -webkit-appearance: none;
          outline: none;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s ease;
        }
        .topic-mobile-selector select:focus {
          border-color: #FF6B00;
          box-shadow: 0 0 0 3px rgba(255,107,0,0.12);
        }
        .topic-mobile-selector .select-wrapper {
          position: relative;
          flex: 1;
        }
        .topic-mobile-selector .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--color-text-muted-base);
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, borderBottom: '2px solid var(--color-border-base)', paddingBottom: 16 }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13, flexShrink: 0 }}>
          <ArrowLeft size={14} /> {t('Back', 'वापस')}
        </button>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam} / {t(subject, subject)}</div>
          <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.45rem)', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t(topic.name, topic.name)}</h2>
        </div>
      </div>

      {/* Mobile Subtopic Dropdown Selector — shown only on mobile */}
      <div className="topic-mobile-selector" style={{ marginBottom: 16, gap: 12, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,0,0.08)', border: '1px solid rgba(255,107,0,0.2)', borderRadius: 10, padding: '6px 10px', flexShrink: 0 }}>
          <BookOpen size={14} color="var(--color-accent-primary)" />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-accent-primary)', whiteSpace: 'nowrap' }}>{completedUnits}/{totalUnits}</span>
        </div>
        <div className="select-wrapper">
          <select
            value={activeSubtopic}
            onChange={e => setActiveSubtopic(e.target.value)}
            aria-label={t('Select Study Unit', 'अध्ययन इकाई चुनें')}
          >
            {topic.subtopics?.map((sub) => (
              <option key={sub} value={sub}>
                {completedMap[sub] ? '✓' : '•'} {sub}
              </option>
            ))}
          </select>
          <span className="select-arrow">
            <ChevronDown size={16} />
          </span>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="topic-mobile-selector" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1, height: 4, background: 'rgba(8,18,41,0.07)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${percentComplete}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-accent-primary)', flexShrink: 0, marginLeft: 8 }}>{percentComplete}%</span>
      </div>

      {/* Split-screen layout — desktop sidebar hidden on mobile via CSS */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }} className="topic-layout-grid">
        
        {/* Left Sidebar (Subtopics Navigation) — desktop only */}
        <div className="topic-desktop-sidebar" style={{ position: 'sticky', top: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="premium-card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-title-base)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>{t('TOPIC PROGRESS', 'विषय प्रगति')}</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted-base)', marginBottom: 6 }}>
              <span>{completedUnits} / {totalUnits} {t('Done', 'पूर्ण')}</span>
              <span style={{ fontWeight: 800, color: 'var(--color-accent-primary)' }}>{percentComplete}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'rgba(8,18,41,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${percentComplete}%`, height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }} />
            </div>
          </div>

          <div className="premium-card" style={{ padding: 18 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-title-base)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>{t('STUDY UNITS', 'अध्ययन इकाइयाँ')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', paddingRight: 4 }}>
              {topic.subtopics?.map((sub) => {
                const isActive = sub === activeSubtopic;
                const isDone = !!completedMap[sub];
                return (
                  <button key={sub}
                    onClick={() => setActiveSubtopic(sub)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: isActive ? 'rgba(255,107,0,0.08)' : 'rgba(255,255,255,0.8)',
                      border: isActive ? '2px solid #FF6B00' : '2px solid var(--color-border-base)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
                      color: isActive ? '#FF6B00' : 'var(--color-text-base)',
                      fontWeight: isActive ? 800 : 600, fontSize: 13, transition: 'all 0.15s'
                    }}>
                    <span style={{ color: isDone ? '#22c55e' : 'var(--color-text-muted-base)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {isDone ? <CheckCircle size={14} /> : <Circle size={14} />}
                    </span>
                    <span style={{ flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={sub}>{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel (Content View) */}
        <div style={{ minWidth: 0 }}>
          {activeSubtopic ? (
            <ContentReader
              exam={exam}
              subject={subject}
              topic={topic.name}
              subtopic={activeSubtopic}
              onBack={onBack}
              onNavigateToRelated={onNavigateToRelated}
              syllabus={syllabus}
              onToggleProgress={handleToggleProgress}
              onNavigateSubtopic={setActiveSubtopic}
            />
          ) : (
            <div className="premium-card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted-base)' }}>
              <BookOpen size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>{t('Select a study unit to start learning.', 'अध्ययन शुरू करने के लिए एक अध्ययन इकाई चुनें।')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PYQ Card ───
function PYQCard({ q, index, examName, language }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);
  const examColor = EXAM_COLORS[examName] || '#6C63FF';

  const t = (en, hi) => language === 'hi' ? hi : en;

  // Single language strings
  const questionText = language === 'hi' && q.question?.hi ? q.question.hi : q.question?.en;
  
  return (
    <div style={{ padding: 0 }}>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ background: 'rgba(255,107,0,0.15)', color: 'var(--color-accent-primary)', borderRadius: 8, padding: '4px 12px', fontSize: 11.5, fontWeight: 800 }}>PYQ {index+1}</span>
        {q.year && <span style={{ background: `${examColor}1a`, color: examColor, borderRadius: 8, padding: '4px 12px', fontSize: 11.5, fontWeight: 800 }}>{examName} {q.year}</span>}
      </div>

      <p style={{ color: 'var(--color-text-title-base)', lineHeight: 1.8, marginBottom: 20, fontWeight: 700, fontSize: 16, fontFamily: 'Outfit' }}>{questionText}</p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {q.options?.map((opt, i) => {
          const optText = language === 'hi' && opt.hi ? opt.hi : opt.en;
          
          return (
            <button key={i} className={`option-btn ${revealed ? (i===q.answer?'correct':selected===i?'wrong':'') : selected===i?'selected':''}`}
              onClick={() => !revealed && setSelected(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px', borderRadius: 12, fontSize: 14.5, textAlign: 'left', border: selected===i?'2px solid #FF6B00':'2px solid var(--color-border-base)' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800, marginTop: 1, background: selected===i?'#FF6B00':'transparent', color: selected===i?'#fff':'currentColor' }}>
                {String.fromCharCode(65+i)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{optText}</div>
              </div>
              {revealed && i === q.answer && <CheckCircle size={18} color="#22c55e" style={{ flexShrink: 0, marginTop: 3 }} />}
            </button>
          );
        })}
      </div>

      {!revealed ? (
        <button id={`pyq-reveal-${index}`} className="btn-secondary" style={{ fontSize: 13, padding: '10px 22px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setRevealed(true)}>
          <Zap size={14} color="#FF6B00" /> {t('Show Answer & Explanation', 'उत्तर एवं स्पष्टीकरण देखें')}
        </button>
      ) : (
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 16, padding: 20, marginTop: 12 }}>
          <div style={{ color: '#10B981', fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>✓ {t('Correct Answer: Option', 'सही उत्तर: विकल्प')} {String.fromCharCode(65+q.answer)}</div>
          
          {language === 'hi' && q.explanation?.hi ? (
            <p style={{ color: 'var(--color-text-base)', fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
               <strong>स्पष्टीकरण:</strong> {q.explanation.hi}
            </p>
          ) : (
            q.explanation?.en && (
              <p style={{ color: 'var(--color-text-base)', fontSize: 14.5, lineHeight: 1.7, margin: 0 }}>
                <strong>Explanation:</strong> {q.explanation.en}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── LearnHub Main Component ───
export default function LearnHub() {
  const { language } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [view, setView] = useState('exams');
  const [reading, setReading] = useState(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [initialSubtopic, setInitialSubtopic] = useState(null);

  const t = (en, hi) => language === 'hi' ? hi : en;

  useEffect(() => {
    api.get('/syllabus').then(res => {
      setExams(res.data.exams);
      setLoadingExams(false);
    }).catch(() => setLoadingExams(false));
  }, []);

  const selectExam = (exam) => {
    setSelectedExam(exam);
    setView('syllabus');
    api.get(`/syllabus/${exam.id.toLowerCase()}`).then(res => {
      setSyllabus(res.data.syllabus);
    });
  };

  const selectTopic = (subjectName, topicObj) => {
    setSelectedSubject(subjectName);
    setSelectedTopic(topicObj);
    setInitialSubtopic(null);
    setView('topic-page');
  };

  const handleNavigateRelated = (rel) => {
    const targetExamId = rel.exam || selectedExam?.id;
    if (!targetExamId) return;

    const navigateToTopic = (syllabusData) => {
      const subj = syllabusData.subjects?.find(s => s.name.toLowerCase() === rel.subject.toLowerCase());
      if (!subj) return;
      const top = subj.topics?.find(t => t.name.toLowerCase() === rel.topic.toLowerCase() || t.subtopics?.includes(rel.subtopic));
      if (!top) return;

      setSelectedSubject(subj.name);
      setSelectedTopic(top);
      setInitialSubtopic(rel.subtopic);
      setView('topic-page');
    };

    if (targetExamId !== selectedExam?.id) {
      api.get(`/syllabus/${targetExamId.toLowerCase()}`).then(res => {
        const examObj = exams.find(e => e.id.toLowerCase() === targetExamId.toLowerCase());
        if (examObj) setSelectedExam(examObj);
        setSyllabus(res.data.syllabus);
        navigateToTopic(res.data.syllabus);
      });
    } else if (syllabus) {
      navigateToTopic(syllabus);
    }
  };

  // Filter syllabus tree based on search query
  const getFilteredSyllabus = () => {
    if (!syllabus || !syllabus.subjects) return [];
    if (!searchQuery) return syllabus.subjects;

    const query = searchQuery.toLowerCase();
    
    return syllabus.subjects.map(subject => {
      const matchedTopics = (subject.topics || []).map(topic => {
        const matchesTopic = topic.name.toLowerCase().includes(query);
        const filteredSubtopics = (topic.subtopics || []).filter(sub => 
          sub.toLowerCase().includes(query)
        );

        if (matchesTopic || filteredSubtopics.length > 0) {
          return {
            ...topic,
            subtopics: matchesTopic ? topic.subtopics : filteredSubtopics
          };
        }
        return null;
      }).filter(Boolean);

      const matchesSubject = subject.name.toLowerCase().includes(query);
      if (matchesSubject || matchedTopics.length > 0) {
        return {
          ...subject,
          topics: matchesSubject ? subject.topics : matchedTopics
        };
      }
      return null;
    }).filter(Boolean);
  };

  const filteredSubjects = getFilteredSyllabus();

  return (
    <AppLayout>
      <div style={{ padding: '28px 24px', maxWidth: 1560, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          {view !== 'exams' && (
            <button onClick={() => {
              if (view === 'topic-page') {
                setView('syllabus');
                setSelectedTopic(null);
                setSelectedSubject(null);
              } else {
                setView('exams');
                setSelectedExam(null);
                setSyllabus(null);
              }
              setReading(null);
              setSearchQuery('');
            }} className="btn-secondary" style={{ padding: '8px 14px', fontSize: 13 }}>
              <ArrowLeft size={14} /> {t('Back', 'वापस')}
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-text-title-base)', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit,sans-serif' }}>
              <BookOpen size={24} color="var(--color-accent-primary)" /> {t('Learn Hub', 'लर्न हब')}
            </h1>
            <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13.5, marginTop: 2 }}>
              {view === 'exams' ? t('Choose your exam track to load study notes', 'अध्ययन नोट्स लोड करने के लिए अपना परीक्षा ट्रैक चुनें') :
               view === 'syllabus' ? `${t(selectedExam?.name, selectedExam?.name)} — ${t('Select a syllabus topic', 'पाठ्यक्रम विषय चुनें')}` :
               view === 'topic-page' ? `${t(selectedExam?.name, selectedExam?.name)} — ${t(selectedSubject, selectedSubject)}` :
               t('Bilingual Study Module', 'द्विभाषी अध्ययन सामग्री')}
            </p>
          </div>
        </div>

        {/* Entry Hero Banner */}
        {view === 'exams' && (
          <div style={{ 
            background: 'var(--gradient-primary)', 
            borderRadius: 28, 
            padding: '44px 36px', 
            marginBottom: 36, 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              opacity: 0.4
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="hero-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', marginBottom: 18 }}>
                📚 {t('Academic Syllabus Explorer', 'पाठ्यक्रम खोजक')}
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', fontFamily: 'Outfit, sans-serif', marginBottom: 10 }}>
                {t('Expand Your Knowledge Base', 'अपने ज्ञान के आधार का विस्तार करें')}
              </h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16, maxWidth: 640, lineHeight: 1.7 }}>
                {t('Dive into bilingual micro-syllabus guides curated for UPSC Civil Services and state administrative exams. 100% free with verified toppers notes.', 'यूपीएससी सिविल सेवा और राज्य प्रशासनिक परीक्षाओं के लिए संकलित द्विभाषी पाठ्यक्रम गाइडों में गोता लगाएँ। टॉपर नोट्स के साथ 100% मुफ़्त।')}
              </p>
            </div>
          </div>
        )}

        {/* Exam Selector */}
        {view === 'exams' && (
          loadingExams ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <div style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 24 }}>
              {exams.map(exam => <ExamCard key={exam.id} exam={exam} onSelect={selectExam} t={t} />)}
            </div>
          )
        )}

        {/* Syllabus View */}
        {view === 'syllabus' && (
          <div style={{ maxWidth: 880 }}>
            {/* Search across syllabus */}
            <div style={{ position: 'relative', marginBottom: 24 }}>
              <input
                type="text"
                placeholder={t('Search subjects, topics, or subtopics...', 'विषय, टॉपिक या उपविषय खोजें...')}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-glass"
                style={{ width: '100%', paddingLeft: 44 }}
              />
              <Search size={18} color="var(--color-text-muted-base)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {!syllabus ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div style={{ width: 36, height: 36, border: '3px solid rgba(108,99,255,0.2)', borderTop: '3px solid #6C63FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="premium-card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted-base)' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: 15 }}>{t('No matches found for', 'कोई मिलान नहीं मिला')} "{searchQuery}"</p>
              </div>
            ) : (
              filteredSubjects.map(subject => (
                <div key={subject.name} className="premium-card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
                  <button id={`subj-${subject.name.replace(/\s/g,'-').toLowerCase()}`}
                    onClick={() => setExpandedSubject(expandedSubject === subject.name ? null : subject.name)}
                    style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, padding: '20px 24px', color: 'var(--color-text-title-base)', textAlign: 'left' }}>
                    <BookOpen size={20} color="var(--color-accent-primary)" />
                    <span style={{ flex: 1, fontWeight: 800, fontSize: 16, fontFamily: 'Outfit,sans-serif' }}>{t(subject.name, subject.name)}</span>
                    <span style={{ color: 'var(--color-text-muted-base)', fontSize: 13, fontWeight: 700 }}>{subject.topics?.length} {t('topics', 'विषय')}</span>
                    {expandedSubject === subject.name ? <ChevronDown size={18} color="var(--color-text-muted-base)" /> : <ChevronRight size={18} color="var(--color-text-muted-base)" />}
                  </button>

                  {(expandedSubject === subject.name || searchQuery) && (
                    <div style={{ padding: '24px', background: 'rgba(8,18,41,0.01)', borderTop: '2px solid var(--color-border-base)' }}>
                      <div className="grid-2" style={{ gap: 20 }}>
                        {subject.topics?.map(topic => (
                          <div key={topic.name}
                            id={`topic-card-${topic.name.replace(/\s/g,'-').toLowerCase()}`}
                            className="premium-card"
                            onClick={() => selectTopic(subject.name, topic)}
                            style={{
                              padding: 24,
                              cursor: 'pointer',
                              background: 'rgba(255, 255, 255, 0.95)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              minHeight: 130,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                            {/* Top accent line */}
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--gradient-primary)' }} />
                            
                            <div>
                              <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 15.5, marginBottom: 8, fontFamily: 'Outfit, sans-serif' }}>
                                {t(topic.name, topic.name)}
                              </h4>
                              <p style={{ color: 'var(--color-text-muted-base)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <BookOpen size={13} color="var(--color-accent-primary)" />
                                <span>{topic.subtopics?.length || 0} {t('Study Units', 'अध्ययन इकाइयाँ')}</span>
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(8,18,41,0.05)', paddingTop: 14, marginTop: 14, fontSize: 13 }}>
                              <span style={{ fontWeight: 800, color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {t('Start Learning', 'सीखना शुरू करें')} <ArrowRight size={14} />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Topic Page Workspace */}
        {view === 'topic-page' && selectedSubject && selectedTopic && (
          <TopicPage
            exam={selectedExam?.id}
            subject={selectedSubject}
            topic={selectedTopic}
            onBack={() => { setView('syllabus'); setSelectedTopic(null); setSelectedSubject(null); }}
            syllabus={syllabus}
            onNavigateToRelated={handleNavigateRelated}
            initialSubtopic={initialSubtopic}
          />
        )}

        {/* Content Reader fallback (legacy support) */}
        {view === 'content' && reading && (
          <ContentReader {...reading} onBack={() => { setView('syllabus'); setReading(null); }} onNavigateToRelated={handleNavigateRelated} syllabus={syllabus} />
        )}
      </div>
    </AppLayout>
  );
}
