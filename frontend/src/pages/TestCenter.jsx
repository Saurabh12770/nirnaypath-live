import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../services/api';
import { FlaskConical, Clock, ChevronRight, Flag, CheckCircle, XCircle, SkipForward, Trophy, TrendingUp, AlertTriangle, RotateCcw, BookOpen, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const EXAM_COLORS = {
  'UPSC': '#6C63FF', 'BPSC': '#C850C0', 'SSC CGL': '#FF6B35',
  'SSC CHSL': '#0ea5e9', 'Railway': '#22c55e', 'Banking': '#facc15', 'State PCS': '#a78bfa'
};

// ─── Test Config ──────────────────────────────────────────────────────────────
function TestSetup({ onStart, t }) {
  const location = useLocation();
  const initialExam = location.state?.exam?.toUpperCase() || '';
  const initialSubject = (location.state?.exam?.toUpperCase() === initialExam) ? (location.state?.subject || '') : '';
  const initialTopic = (location.state?.exam?.toUpperCase() === initialExam) ? (location.state?.topic || '') : '';

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(initialExam);
  const [testType, setTestType] = useState('topic');
  const [syllabus, setSyllabus] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);

  const [prevSelectedExam, setPrevSelectedExam] = useState(selectedExam);

  if (selectedExam !== prevSelectedExam) {
    setPrevSelectedExam(selectedExam);
    if (!selectedExam) {
      setSyllabus(null);
      setSelectedSubject('');
      setSelectedTopic('');
    }
  }

  useEffect(() => {
    api.get('/syllabus').then(res => setExams(res.data.exams));
  }, []);

  // Load syllabus and pre-select subject/topic
  useEffect(() => {
    if (selectedExam) {
      api.get(`/syllabus/${selectedExam.toLowerCase()}`).then(res => {
        setSyllabus(res.data.syllabus);
        
        if (location.state && location.state.exam?.toUpperCase() === selectedExam) {
          const { subject, topic } = location.state;
          if (subject) setSelectedSubject(subject);
          if (topic) setSelectedTopic(topic);
        }
      });
    }
  }, [selectedExam, location.state]);

  const subjects = syllabus?.subjects || [];
  const topics = subjects.find(s => s.name === selectedSubject)?.topics || [];

  const canStart = selectedExam && (testType === 'full_mock' || (testType === 'subject' && selectedSubject) || (testType === 'topic' && selectedSubject && selectedTopic));

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    try {
      const body = { testType, exam: selectedExam, subject: selectedSubject, topic: selectedTopic };
      const res = await api.post('/tests/sessions', body);
      onStart(res.data.session);
    } catch (e) {
      alert(e.response?.data?.message || t('Failed to start test. Try different options.', 'मॉक टेस्ट शुरू करने में असमर्थ। कृपया अन्य विकल्प चुनें।'));
    } finally { setLoading(false); }
  };

  const selStyle = { background: 'rgba(255,255,255,0.8)', border: '2px solid var(--color-border-base)', color: 'var(--color-text-title-base)', padding: '12px 14px', borderRadius: 12, width: '100%', outline: 'none', fontFamily: 'Outfit,sans-serif', fontSize: 14.5, cursor: 'pointer', marginBottom: 18 };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: selectedExam ? '1.2fr 1fr' : '1fr', gap: 32, alignItems: 'start' }} className="grid-2">
        
        {/* Left Side: Exam Cards Grid */}
        <div>
          <label style={{ color: 'var(--color-text-title-base)', fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 16, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {t('SELECT TARGET EXAM TRACK', 'परीक्षा ट्रैक का चयन करें')}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: selectedExam ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: 16 }} className="grid-2">
            {exams.map(e => {
              const color = EXAM_COLORS[e.name] || '#6C63FF';
              const isSelected = selectedExam === e.id;
              return (
                <button
                  key={e.id}
                  id={`exam-card-${e.id.toLowerCase()}`}
                  onClick={() => {
                    setSelectedExam(e.id);
                    setSelectedSubject('');
                    setSelectedTopic('');
                  }}
                  className="premium-card"
                  style={{
                    padding: '24px 20px',
                    border: isSelected ? `2.5px solid ${color}` : '2px solid var(--color-border-base)',
                    background: isSelected ? 'rgba(108,99,255,0.05)' : 'var(--color-card-bg)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 200ms ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    alignItems: 'flex-start',
                    width: '100%',
                    boxShadow: isSelected ? `0 12px 30px -6px ${color}30` : 'var(--shadow-card)'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: color }} />
                  <div style={{ fontSize: '2.4rem', marginBottom: 4 }}>{e.icon}</div>
                  <h4 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 16, fontFamily: 'Outfit,sans-serif', margin: 0 }}>{t(e.name, e.name)}</h4>
                  <p style={{ color: 'var(--color-text-muted-base)', fontSize: 12.5, lineHeight: 1.5, margin: 0 }}>{e.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Configuration Options */}
        {selectedExam ? (
          <div className="premium-card anim-fade-in-up" style={{ padding: 32, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
                {t('Configure Assessment', 'मूल्यांकन सेटअप करें')}
              </h3>
              <button 
                onClick={() => { setSelectedExam(''); setSelectedSubject(''); setSelectedTopic(''); }}
                style={{ background: 'none', border: 'none', color: '#FF6B00', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                {t('Reset Track', 'लक्ष्य बदलें')}
              </button>
            </div>

            <label style={{ color: 'var(--color-text-title-base)', fontSize: 11, fontWeight: 800, display: 'block', marginBottom: 10, letterSpacing: '0.06em' }}>{t('ASSESSMENT SCOPE', 'परीक्षण श्रेणी')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                ['topic', t('Topic-wise Drill', 'टॉपिक टेस्ट'), t('10 Questions • 10 Minutes', '10 प्रश्न / 10 मिनट')],
                ['subject', t('Subject-wise Mock', 'सब्जेक्ट टेस्ट'), t('20 Questions • 20 Minutes', '20 प्रश्न / 20 मिनट')],
                ['full_mock', t('Full-Length Mock Test', 'फुल मॉक'), t('30 Questions • 30 Minutes', '30 प्रश्न / 30 मिनट')]
              ].map(([val, label, sub]) => (
                <button id={`type-${val}`} key={val} onClick={() => setTestType(val)}
                  style={{ 
                    padding: '16px', 
                    borderRadius: 16, 
                    border: `2px solid ${testType === val ? '#FF6B00' : 'var(--color-border-base)'}`, 
                    background: testType === val ? 'rgba(255,107,0,0.06)' : 'rgba(255,255,255,0.6)', 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    transition: 'all 200ms ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                  <div>
                    <div style={{ color: testType === val ? '#FF6B00' : 'var(--color-text-title-base)', fontWeight: 800, fontSize: 14, fontFamily: 'Outfit' }}>{label}</div>
                    <div style={{ color: 'var(--color-text-muted-base)', fontSize: 11.5, marginTop: 2 }}>{sub}</div>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid currentColor', display: 'flex', alignItems: 'center', justifyContent: 'center', color: testType === val ? '#FF6B00' : 'var(--color-border-base)' }}>
                    {testType === val && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B00' }} />}
                  </div>
                </button>
              ))}
            </div>

            {testType !== 'full_mock' && (
              <>
                <label style={{ color: 'var(--color-text-title-base)', fontSize: 11, fontWeight: 800, display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>{t('SELECT SUBJECT', 'विषय चुनें')}</label>
                <select id="sel-subject" style={selStyle} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
                  <option value="">{t('-- Select Subject --', '-- विषय चुनें --')}</option>
                  {subjects.map(s => <option key={s.name} value={s.name}>{t(s.name, s.name)}</option>)}
                </select>
              </>
            )}

            {testType === 'topic' && selectedSubject && (
              <>
                <label style={{ color: 'var(--color-text-title-base)', fontSize: 11, fontWeight: 800, display: 'block', marginBottom: 8, letterSpacing: '0.06em' }}>{t('SELECT TOPIC', 'टॉपिक चुनें')}</label>
                <select id="sel-topic" style={selStyle} value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
                  <option value="">{t('-- Select Topic --', '-- टॉपिक चुनें --')}</option>
                  {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </>
            )}

            <button id="btn-start-test" className="btn-primary" onClick={handleStart} disabled={!canStart || loading}
              style={{ 
                width: '100%', 
                justifyContent: 'center', 
                marginTop: 10, 
                padding: '16px', 
                fontSize: '15px', 
                opacity: (!canStart || loading) ? 0.5 : 1, 
                cursor: (!canStart || loading) ? 'not-allowed' : 'pointer'
              }}>
              <FlaskConical size={18} />
              {loading ? t('Preparing Exam Engine...', 'परीक्षा इंजन तैयार हो रहा है...') : t('Launch Practice Console', 'परीक्षा कंसोल लॉन्च करें')}
            </button>
          </div>
        ) : (
          <div className="premium-card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(108, 99, 255, 0.25)' }}>
              <FlaskConical size={28} color="white" />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif' }}>
              {t('Select an Exam Track to Begin', 'शुरू करने के लिए एक परीक्षा का चयन करें')}
            </h3>
            <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14, maxWidth: 360, margin: '12px auto 0', lineHeight: 1.6 }}>
              {t('Select an exam track from the left to unlock customized mock assessments and practice drills.', 'अनुकूलित मॉक परीक्षण और अभ्यास प्रश्न अनलॉक करने के लिए बाईं ओर से परीक्षा ट्रैक चुनें।')}
            </p>
          </div>
        )}
      </div>

      {/* Trust Feature Strip */}
      <div className="grid-3" style={{ gap: 24, marginTop: 48 }}>
        {[
          ['🎯', t('Topic Drills', 'विषयवार अभ्यास'), t('Strengthen specific sub-concepts with focused questions', 'विशिष्ट उप-अवधारणाओं को मजबूत करें')],
          ['📚', t('Subject Evaluation', 'विषय मूल्यांकन'), t('Assess broad subject readiness across active syllabi', 'व्यापक विषय तत्परता का आकलन करें')],
          ['🏆', t('Simulated Mock Exams', 'सिम्युलेटेड मॉक'), t('30-minute high-pressure timed exam simulator', '30 मिनट का परीक्षा दबाव मोड')]
        ].map(([icon, title, desc]) => (
          <div key={title} className="premium-card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>{icon}</div>
            <div style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 15, marginBottom: 6, fontFamily: 'Outfit' }}>{title}</div>
            <div style={{ color: 'var(--color-text-muted-base)', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Test (TCS iON CBT Exam Console) ──────────────────────────────────
function ActiveTest({ session, onComplete, t }) {
  const { user, language, setLanguage } = useAuth();
  const { questions, id: sessionId, timeRemaining: initialTime } = session;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)
  );

  const timerRef = useRef(null);
  const saveRef = useRef(null);
  const testContainerRef = useRef(null);

  const handleAnswer = (qId, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await api.put(`/tests/sessions/${sessionId}`, { answers, timeRemaining: timeLeft });
      const res = await api.post(`/tests/sessions/${sessionId}/submit`);
      
      // Exit fullscreen safely
      try {
        const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exitFS && (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement)) {
          await exitFS.call(document);
        }
      } catch (fsErr) {
        console.warn("Fullscreen exit failed:", fsErr);
      }

      onComplete(res.data.result);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }, [sessionId, answers, timeLeft, onComplete]);

  const handleSubmitRef = useRef(handleSubmit);
  useEffect(() => { handleSubmitRef.current = handleSubmit; });

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmitRef.current(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    document.addEventListener('webkitfullscreenchange', handleFSChange);
    document.addEventListener('mozfullscreenchange', handleFSChange);
    document.addEventListener('MSFullscreenChange', handleFSChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFSChange);
      document.removeEventListener('webkitfullscreenchange', handleFSChange);
      document.removeEventListener('mozfullscreenchange', handleFSChange);
      document.removeEventListener('MSFullscreenChange', handleFSChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = document.documentElement;
      const requestFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (requestFS) requestFS.call(el).catch(() => {});
    } else {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) exitFS.call(document).catch(() => {});
    }
  };

  // Autosave every 20s
  useEffect(() => {
    saveRef.current = setInterval(() => {
      api.put(`/tests/sessions/${sessionId}`, { answers, timeRemaining: timeLeft }).catch(() => {});
    }, 20000);
    return () => clearInterval(saveRef.current);
  }, [answers, timeLeft, sessionId]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const q = questions[current];
  if (!q) return null;

  const totalQ = questions.length;
  const attempted = Object.keys(answers).length;
  const markedCount = flagged.size;
  const unansweredCount = totalQ - attempted;
  const questionText = language === 'hi' && q.question?.hi ? q.question.hi : q.question?.en;

  const renderConfirmModal = () => (
    <div className="modal-backdrop" style={{ zIndex: 2000 }} onClick={() => setShowConfirmModal(false)}>
      <div className="modal-box glass-card" style={{ maxWidth: 460, width: '90%' }} onClick={e=>e.stopPropagation()}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--color-text-title-base)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>
          {t('Review Assessment Status', 'परीक्षा की स्थिति की समीक्षा')}
        </h3>
        <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14, marginBottom: 20 }}>
          {t('Are you sure you want to submit your responses? Please review your summary below:', 'क्या आप अपने उत्तर सबमिट करना चाहते हैं? कृपया नीचे सारांश की समीक्षा करें:')}
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#10B981', fontFamily: 'Outfit' }}>{attempted}</div>
            <div style={{ fontSize: 10.5, color: '#10B981', marginTop: 3, fontWeight: 700 }}>{t('Answered', 'उत्तर दिया')}</div>
          </div>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', fontFamily: 'Outfit' }}>{unansweredCount}</div>
            <div style={{ fontSize: 10.5, color: '#ef4444', marginTop: 3, fontWeight: 700 }}>{t('Unanswered', 'बिना उत्तर')}</div>
          </div>
          <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: 12, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#f97316', fontFamily: 'Outfit' }}>{markedCount}</div>
            <div style={{ fontSize: 10.5, color: '#f97316', marginTop: 3, fontWeight: 700 }}>{t('Marked', 'समीक्षा हेतु')}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setShowConfirmModal(false)}>
            {t('Back to Test', 'वापस जाएं')}
          </button>
          <button className="btn-primary" style={{ padding: '10px 24px', fontWeight: 800 }} onClick={() => { setShowConfirmModal(false); handleSubmit(); }} disabled={submitting}>
            {submitting ? t('Submitting...', 'जमा किया जा रहा है...') : t('Submit Answers', 'सबमिट करें')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaletteGrid = (cols = 5) => (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, marginBottom: 20 }}>
      {questions.map((ques, i) => {
        const isAnswered = answers[ques._id] !== undefined;
        const isFlagged = flagged.has(ques._id);
        const isCurrent = i === current;
        
        let bg = 'rgba(8,18,41,0.02)';
        let color = '#64748b';
        let border = '1px solid #cbd5e1';
        let shadow = 'none';

        if (isCurrent) {
          bg = '#2196F3';
          color = 'white';
          border = '2px solid #2196F3';
          shadow = '0 4px 10px rgba(33,150,243,0.3)';
        } else if (isAnswered && isFlagged) {
          bg = '#9c27b0';
          color = 'white';
          border = '2px solid #9c27b0';
        } else if (isAnswered) {
          bg = '#4CAF50';
          color = 'white';
          border = '2px solid #4CAF50';
        } else if (isFlagged) {
          bg = '#f97316';
          color = 'white';
          border = '2px solid #f97316';
        }

        return (
          <button key={i} onClick={() => { setCurrent(i); setShowPaletteDrawer(false); }}
            style={{
              height: 38, borderRadius: 8, border, background: bg, color, cursor: 'pointer',
              fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: shadow, transition: 'all 150ms ease', fontFamily: 'Outfit'
            }}>
            {i+1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={testContainerRef} style={{ width: '100vw', height: '100vh', background: 'var(--color-bg-base)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .cbt-container { display: flex; flex-direction: row; flex: 1; min-height: 0; overflow: hidden; }
        .cbt-left { flex: 1; display: flex; flex-direction: column; min-width: 0; background: var(--color-bg-base); border-right: 2.5px solid var(--color-border-base); }
        .cbt-right { width: 320px; display: flex; flex-direction: column; background: var(--color-bg-base); flex-shrink: 0; border-left: 1px solid var(--color-border-base); }
        .cbt-mobile-bar { display: none; }
        @media (max-width: 768px) {
          .cbt-right { display: none !important; }
          .cbt-left { border-right: none !important; }
          .cbt-mobile-bar { display: flex !important; }
          .cbt-desktop-bar { display: none !important; }
        }
      `}</style>

      {/* TOP HEADER */}
      <header style={{ height: 64, background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, zIndex: 10, boxShadow: '0 2px 20px rgba(0,0,0,0.3)', borderBottom: '2px solid rgba(108,99,255,0.3)' }}>
        <div>
          <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {session.exam} CBT Console
          </span>
          <h2 style={{ fontSize: 14.5, fontWeight: 800, color: 'white', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            {session.testType?.replace('_',' ').toUpperCase()} Practice Assessment
          </h2>
        </div>
        
        {/* Timer */}
        <div style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={15} color="#fff" />
          <span style={{ fontWeight: 800, fontSize: 14.5, fontFamily: 'Outfit, sans-serif', color: 'white' }}>{formatTime(timeLeft)}</span>
        </div>

        {/* Controls - Language Switch and Fullscreen toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 2 }}>
            {[['en', 'EN'], ['hi', 'हिं']].map(([lang, lbl]) => (
              <button key={lang} onClick={() => setLanguage(lang)}
                style={{
                  background: language === lang ? 'var(--gradient-primary)' : 'none',
                  border: 'none',
                  color: 'white',
                  opacity: language === lang ? 1 : 0.6,
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontFamily: 'Outfit',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                {lbl}
              </button>
            ))}
          </div>

          {/* Fullscreen status & toggle */}
          <button onClick={toggleFullscreen}
            style={{
              background: isFullscreen ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${isFullscreen ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8,
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: isFullscreen ? '#22c55e' : '#ef4444',
              cursor: 'pointer',
              fontFamily: 'Outfit',
              fontSize: 12,
              fontWeight: 700,
              transition: 'all 0.2s'
            }}>
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span className="hide-mobile">{isFullscreen ? t('Fullscreen Active', 'पूर्ण स्क्रीन सक्रिय') : t('Fullscreen Off', 'पूर्ण स्क्रीन बंद')}</span>
          </button>

          {/* Candidate Details (Desktop only) */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 12 }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#f8fafc' }}>{user?.name || 'Aspirant'}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Roll: NP-2026-CBT</div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="cbt-container">
        {/* Left Side: Question area */}
        <div className="cbt-left">
          {/* Question Info Panel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid var(--color-border-base)', background: 'var(--color-bg-solid)', flexShrink: 0 }}>
            <span style={{ fontWeight: 800, color: 'var(--color-text-title-base)', fontSize: 13.5 }}>
              {t('Question No.', 'प्रश्न संख्या')} {current + 1}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted-base)' }}>
              <span>Marks: <b style={{ color: '#22c55e' }}>+2.00</b> | Neg: <b style={{ color: '#ef4444' }}>-0.66</b></span>
            </div>
          </div>

          {/* Question Text and Options */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
            <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--color-text-title-base)', fontWeight: 700, marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>
              {questionText}
            </div>
            {language === 'hi' && q.question?.hi && q.question?.en && (
              <div style={{ fontSize: 14, color: 'var(--color-text-muted-base)', fontStyle: 'italic', borderLeft: '3px solid var(--color-border-base)', paddingLeft: 16, marginBottom: 28 }}>
                {q.question.en}
              </div>
            )}

            {/* Options Styled Like Real CBT Radio buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800 }}>
              {q.options?.map((opt, i) => {
                const optText = language === 'hi' && opt.hi ? opt.hi : opt.en;
                const optSubText = language === 'hi' && opt.hi ? opt.en : opt.hi;
                const isSelected = answers[q._id] === i;

                return (
                  <button key={i} onClick={() => handleAnswer(q._id, i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 20px',
                      borderRadius: 12,
                      border: isSelected ? '2.5px solid var(--color-accent)' : '1.5px solid var(--color-border-base)',
                      background: isSelected ? 'rgba(255,107,0,0.06)' : 'var(--color-card-bg)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms ease',
                      width: '100%'
                    }}>
                    {/* Circle radio */}
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      border: `2px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-text-muted-base)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-accent)' }} />}
                    </div>

                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-muted-base)' }}>
                      ({String.fromCharCode(65+i)})
                    </span>

                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--color-text-base)' }}>{optText}</span>
                      {optSubText && <span style={{ display: 'block', fontSize: 12, opacity: 0.6, marginTop: 2 }}>{optSubText}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP BOTTOM CONTROL BAR */}
          <div className="cbt-desktop-bar" style={{ height: 64, borderTop: '2px solid var(--color-border-base)', background: 'var(--color-bg-solid)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => {
                setFlagged(prev => { const s=new Set(prev); s.add(q._id); return s; });
                setCurrent(c => Math.min(totalQ - 1, c + 1));
              }} className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, borderColor: '#FF6B00', color: '#FF6B00' }}>
                {t('Mark for Review & Next', 'समीक्षा के लिए चिह्नित और अगला')}
              </button>
              {answers[q._id] !== undefined && (
                <button onClick={() => setAnswers(prev => { const n={...prev}; delete n[q._id]; return n; })}
                  className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
                  {t('Clear Response', 'उत्तर हटाएँ')}
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, opacity: current === 0 ? 0.5 : 1 }}>
                {t('Previous', 'पिछला')}
              </button>
              <button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))} disabled={current === totalQ - 1}
                className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                {t('Save & Next', 'सहेजें और अगला')} <ChevronRight size={14} />
              </button>
              <button onClick={() => setShowConfirmModal(true)} className="btn-primary" style={{ padding: '8px 20px', fontSize: 13, background: 'var(--gradient-orange)' }}>
                {t('Submit Exam', 'परीक्षा सबमिट करें')}
              </button>
            </div>
          </div>

          {/* MOBILE BOTTOM CONTROL BAR (2-ROW SYSTEM) */}
          <div className="cbt-mobile-bar" style={{
            display: 'none',
            flexDirection: 'column',
            borderTop: '2.5px solid var(--color-border-base)',
            background: 'var(--color-bg-solid)',
            padding: '10px 12px 14px',
            gap: 10,
            flexShrink: 0
          }}>
            {/* Row 1: Actions */}
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => {
                setFlagged(prev => { const s=new Set(prev); s.add(q._id); return s; });
                setCurrent(c => Math.min(totalQ - 1, c + 1));
              }} className="btn-secondary" style={{ flex: 1, padding: '10px 8px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderColor: '#FF6B00', color: '#FF6B00', fontWeight: 700 }}>
                <Flag size={13} /> {t('Flag', 'चिह्नित')}
              </button>
              {answers[q._id] !== undefined && (
                <button onClick={() => setAnswers(prev => { const n={...prev}; delete n[q._id]; return n; })}
                  className="btn-secondary" style={{ flex: 1, padding: '10px 8px', fontSize: 12, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontWeight: 700 }}>
                  {t('Clear', 'साफ़ करें')}
                </button>
              )}
              <button onClick={() => setShowPaletteDrawer(true)} className="btn-secondary" style={{ flex: 1, padding: '10px 8px', fontSize: 12, fontWeight: 700 }}>
                {t('Palette', 'पैलेट')} ({attempted}/{totalQ})
              </button>
            </div>
            {/* Row 2: Navigation & Submit */}
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
                className="btn-secondary" style={{ flex: 1, padding: '10px 8px', fontSize: 12, opacity: current === 0 ? 0.5 : 1, fontWeight: 700 }}>
                {t('Prev', 'पिछला')}
              </button>
              <button onClick={() => setCurrent(c => Math.min(totalQ - 1, c + 1))} disabled={current === totalQ - 1}
                className="btn-primary" style={{ flex: 1.2, padding: '10px 8px', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                {t('Save & Next', 'सहेजें व अगला')} <ChevronRight size={13} />
              </button>
              <button onClick={() => setShowConfirmModal(true)} className="btn-primary" style={{ flex: 1.1, padding: '10px 8px', fontSize: 12, background: 'var(--gradient-orange)', fontWeight: 800 }}>
                {t('Submit', 'सबमिट')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Question Palette Sidebar */}
        <div className="cbt-right">
          {/* Photo & Roll section */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-base)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 14 }}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'U'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-title-base)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
              <div style={{ fontSize: 10.5, color: 'var(--color-text-muted-base)', marginTop: 2 }}>Roll: NP-2026-CBT</div>
            </div>
          </div>

          {/* Palette scroll section */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            <h4 style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-title-base)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t('Question Palette', 'प्रश्न पैलेट')}
            </h4>
            
            {renderPaletteGrid(4)}

            {/* Legends */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, borderTop: '1px solid var(--color-border-base)', paddingTop: 16 }}>
              {[
                ['#4CAF50', t('Answered', 'उत्तर दिया'), attempted],
                ['rgba(8,18,41,0.02)', t('Not Answered', 'उत्तर नहीं दिया'), unansweredCount],
                ['#f97316', t('Marked for Review', 'समीक्षा हेतु चिह्नित'), markedCount],
                ['#9c27b0', t('Answered & Marked Review', 'उत्तर दिया और समीक्षा'), Array.from(flagged).filter(id => answers[id] !== undefined).length]
              ].map(([color, label, count]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: color, border: color==='rgba(8,18,41,0.02)'?'1px solid var(--color-border-base)':'none', borderRadius: 2 }} />
                  <span style={{ color: 'var(--color-text-muted-base)', flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-title-base)' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit button section */}
          <div style={{ padding: 16, borderTop: '1px solid var(--color-border-base)', flexShrink: 0 }}>
            <button onClick={() => setShowConfirmModal(true)} className="btn-primary" style={{ width: '100%', padding: '12px 14px', fontSize: 13.5, background: 'var(--gradient-orange)', justifyContent: 'center' }}>
              {t('Submit Exam', 'परीक्षा सबमिट करें')}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE PALETTE BOTTOM DRAWER */}
      {showPaletteDrawer && (
        <div className="modal-backdrop" style={{ zIndex: 1999 }} onClick={() => setShowPaletteDrawer(false)}>
          <div className="premium-card" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: 'var(--color-card-bg)', borderRadius: '24px 24px 0 0',
            padding: 24, zIndex: 2000, maxHeight: '80vh', overflowY: 'auto',
            border: 'none', borderTop: '2px solid var(--color-border-base)', boxShadow: '0 -8px 40px rgba(0,0,0,0.15)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit' }}>
                {t('Question Palette & Legends', 'प्रश्न पैलेट एवं संक्षेप')}
              </h4>
              <button onClick={() => setShowPaletteDrawer(false)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 800, fontSize: 13 }}>
                {t('Close', 'बंद करें')}
              </button>
            </div>

            {renderPaletteGrid(5)}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5, borderTop: '1px solid var(--color-border-base)', paddingTop: 16, marginBottom: 20 }}>
              {[
                ['#4CAF50', t('Answered', 'उत्तर दिया'), attempted],
                ['rgba(8,18,41,0.02)', t('Not Answered', 'उत्तर नहीं दिया'), unansweredCount],
                ['#f97316', t('Marked for Review', 'समीक्षा हेतु चिह्नित'), markedCount],
                ['#9c27b0', t('Answered & Marked Review', 'उत्तर दिया और समीक्षा'), Array.from(flagged).filter(id => answers[id] !== undefined).length]
              ].map(([color, label, count]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 12, height: 12, background: color, border: color==='rgba(8,18,41,0.02)'?'1px solid var(--color-border-base)':'none', borderRadius: 2 }} />
                  <span style={{ color: 'var(--color-text-muted-base)', flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-title-base)' }}>{count}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { setShowPaletteDrawer(false); setShowConfirmModal(true); }}
              className="btn-primary" style={{ width: '100%', padding: '12px 14px', fontSize: 13.5, background: 'var(--gradient-orange)', justifyContent: 'center' }}>
              {t('Submit Exam', 'परीक्षा सबमिट करें')}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Submission Modal */}
      {showConfirmModal && renderConfirmModal()}
    </div>
  );
}

// ─── Result View ────────────────────────────────────────────────────────────────
function ResultView({ result, session, onRetry, t, language }) {
  const navigate = useNavigate();
  const [showReview, setShowReview] = useState(false);
  const [reviewAnswers] = useState(session?.answers || {});
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);

  const percent = result.accuracy;
  const grade = percent >= 80 ? t('Excellent Performance', 'उत्कृष्ट प्रदर्शन') : percent >= 60 ? t('Good Standing', 'संतोषजनक स्थिति') : percent >= 40 ? t('Average Standing', 'सामान्य स्थिति') : t('Development Needed', 'सुधार की आवश्यकता');

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const stepTime = Math.abs(Math.floor(duration / percent));
    const timer = setInterval(() => {
      start += 1;
      if (start >= percent) {
        clearInterval(timer);
        setAnimatedAccuracy(percent);
      } else {
        setAnimatedAccuracy(start);
      }
    }, stepTime || 10);
    return () => clearInterval(timer);
  }, [percent]);

  const subjectBreakdown = {};
  if (session && session.questions) {
    session.questions.forEach(q => {
      const subj = q.subject || 'General';
      if (!subjectBreakdown[subj]) {
        subjectBreakdown[subj] = { correct: 0, total: 0 };
      }
      subjectBreakdown[subj].total += 1;
      const userAns = reviewAnswers[q._id];
      if (userAns !== undefined && userAns === q.answer) {
        subjectBreakdown[subj].correct += 1;
      }
    });
  }

  const radius = 60;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (animatedAccuracy / 100) * circumference;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Score Header */}
      <div className="premium-card" style={{ padding: '48px 32px', textAlign: 'center', marginBottom: 28, background: 'var(--gradient-primary)', border: 'none', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)', backgroundSize: '16px 16px', opacity: 0.4 }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Trophy size={52} color="#facc15" style={{ marginBottom: 16, filter: 'drop-shadow(0 6px 16px rgba(250,204,21,0.4))' }} />
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: 24, fontFamily: 'Outfit, sans-serif' }}>
            {t('Mock Evaluation Report', 'मॉक टेस्ट मूल्यांकन रिपोर्ट')}
          </h2>
          
          {/* Radial Accuracy Gauge */}
          <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <svg height={140} width={140}>
              <circle stroke="rgba(255, 255, 255, 0.15)" fill="transparent" strokeWidth={strokeWidth} r={normalizedRadius} cx={70} cy={70} />
              <circle
                stroke="#facc15"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                r={normalizedRadius} cx={70} cy={70}
              />
            </svg>
            <div style={{ position: 'absolute', color: '#ffffff', fontSize: '2.4rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>
              {animatedAccuracy.toFixed(0)}%
            </div>
          </div>

          <div style={{ color: '#ffffff', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.02em', textShadow: '0 2px 10px rgba(8,18,41,0.3)', fontFamily: 'Outfit' }}>{grade}</div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid-4" style={{ gap: 16, marginBottom: 28 }}>
        {[
          [CheckCircle, '#10B981', t('Correct', 'सही उत्तर'), result.correctAnswers],
          [XCircle, '#ef4444', t('Wrong', 'गलत उत्तर'), result.wrongAnswers],
          [SkipForward, '#FF6B00', t('Skipped', 'छोड़े गए'), result.unattempted],
          [Clock, '#6C63FF', t('Time Taken', 'लिया गया समय'), `${Math.floor(result.duration/60)}m ${result.duration%60}s`],
        ].map(([Icon, color, label, val]) => (
          <div key={label} className="premium-card" style={{ padding: 24, textAlign: 'center' }}>
            <Icon size={24} color={color} style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif' }}>{val}</div>
            <div style={{ color: 'var(--color-text-muted-base)', fontSize: 13, marginTop: 4, fontWeight: 700 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Subject Wise Accuracy Breakdown */}
      {Object.keys(subjectBreakdown).length > 0 && (
        <div className="premium-card" style={{ padding: 28, marginBottom: 28 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit, sans-serif', marginBottom: 20 }}>
            {t('Subject-wise Performance Breakdown', 'विषयवार प्रदर्शन विश्लेषण')}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {Object.entries(subjectBreakdown).map(([subjectName, stats]) => {
              const subAccuracy = Math.round((stats.correct / stats.total) * 100);
              let barColor = '#10B981';
              if (subAccuracy < 40) barColor = '#ef4444';
              else if (subAccuracy < 70) barColor = '#FF6B00';

              return (
                <div key={subjectName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 14 }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-text-title-base)' }}>{t(subjectName, subjectName)}</span>
                    <span style={{ fontWeight: 800, color: barColor }}>
                      {stats.correct}/{stats.total} ({subAccuracy}%)
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--color-border-base)', borderRadius: 4, overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        width: `${subAccuracy}%`, 
                        background: barColor, 
                        height: '100%', 
                        borderRadius: 4,
                        transition: 'width 0.5s ease' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weak / Strong analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }} className="grid-2">
        <div className="premium-card" style={{ padding: 28, border: '2px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#10B981', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <TrendingUp size={16} /> {t('MASTERED SYLLABUS TOPICS', 'मजबूत टॉपिक्स')}
          </div>
          {result.analysis?.strongTopics?.length > 0 ? result.analysis.strongTopics.map(t => (
            <div key={t} style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, color: '#10B981', fontSize: 13.5, fontWeight: 600 }}>✓ {t}</div>
          )) : <div style={{ color: 'var(--color-text-muted-base)', fontSize: 14 }}>{t('No topics met the 70% accuracy criteria in this set.', 'इस सेट में किसी भी टॉपिक में 70% सटीकता नहीं मिली।')}</div>}
        </div>
        
        <div className="premium-card" style={{ padding: 28, border: '2px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: '#ef4444', fontWeight: 800, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <AlertTriangle size={16} /> {t('FOCUS AREAS FOR IMPROVEMENT', 'कमजोर टॉपिक्स')}
          </div>
          {result.analysis?.weakTopics?.length > 0 ? result.analysis.weakTopics.map(t => (
            <div key={t} style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 8, color: '#ef4444', fontSize: 13.5, fontWeight: 600 }}>✗ {t}</div>
          )) : <div style={{ color: 'var(--color-text-muted-base)', fontSize: 14 }}>{t('Perfect score! No weak topics detected.', 'उत्कृष्ट प्रदर्शन! कोई कमजोर टॉपिक नहीं मिला।')}</div>}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40 }}>
        <button id="btn-retry" className="btn-primary" onClick={onRetry} style={{ padding: '12px 24px', fontSize: 14 }}>
          <RotateCcw size={15} /> {t('Configure New Test', 'नया टेस्ट सेटअप करें')}
        </button>
        <button 
          id="btn-go-dashboard" 
          className="btn-secondary" 
          onClick={() => navigate('/dashboard')} 
          style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700 }}
        >
          <TrendingUp size={15} /> {t('Analyze in Dashboard', 'डैशबोर्ड में विश्लेषण देखें')}
        </button>
        <button id="btn-review" className="btn-secondary" onClick={() => setShowReview(!showReview)} style={{ padding: '12px 24px', fontSize: 14, fontWeight: 700, marginLeft: 'auto' }}>
          {showReview ? <ArrowLeft size={15} /> : <BookOpen size={15} />}
          {showReview ? t('Hide Question Review', 'समीक्षा छिपाएँ') : t('Detailed Question Review', 'प्रश्नों की विस्तृत समीक्षा')}
        </button>
      </div>

      {/* Detailed Review Lists */}
      {showReview && session?.questions && (
        <div style={{ marginTop: 24 }} className="anim-fade-in-up">
          <h3 style={{ color: 'var(--color-text-title-base)', fontWeight: 800, fontSize: 18, marginBottom: 20, fontFamily: 'Outfit, sans-serif' }}>{t('Question Review Outline', 'प्रश्नों की समीक्षा')}</h3>
          {session.questions.map((q, i) => {
            const userAns = reviewAnswers[q._id];
            const isCorrect = userAns === q.answer;
            const isSkipped = userAns === undefined;
            const questionText = language === 'hi' && q.question?.hi ? q.question.hi : q.question?.en;

            return (
              <div key={q._id} className="premium-card" style={{ padding: 28, marginBottom: 20, borderLeft: `6px solid ${isSkipped ? '#FF6B00' : isCorrect ? '#10B981' : '#ef4444'}` }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-title-base)', fontSize: 12, fontWeight: 800 }}>{t('QUESTION', 'प्रश्न')} {i+1}</span>
                  <span className={`badge badge-${q.difficulty}`} style={{ fontSize: 10, fontWeight: 800 }}>{q.difficulty}</span>
                  {isSkipped ? <span style={{ color: '#FF6B00', fontSize: 12.5, fontWeight: 800 }}>⊘ {t('Unattempted', 'प्रयास नहीं किया')}</span> :
                   isCorrect ? <span style={{ color: '#10B981', fontSize: 12.5, fontWeight: 800 }}>✓ {t('Correct Response', 'सही उत्तर')}</span> :
                   <span style={{ color: '#ef4444', fontSize: 12.5, fontWeight: 800 }}>✗ {t('Incorrect Response', 'गलत उत्तर')}</span>}
                </div>
                
                <p style={{ color: 'var(--color-text-title-base)', fontSize: 16, lineHeight: 1.7, marginBottom: 16, fontWeight: 700, fontFamily: 'Outfit' }}>{questionText}</p>
                
                {language === 'hi' && q.question?.hi && q.question?.en && (
                  <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14, lineHeight: 1.6, marginBottom: 16, fontStyle: 'italic' }}>{q.question.en}</p>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options?.map((opt, j) => {
                    const optText = language === 'hi' && opt.hi ? opt.hi : opt.en;
                    const optSubText = language === 'hi' && opt.hi ? opt.en : opt.hi;

                    let optionBorder = 'var(--color-border-base)';
                    let optionBg = 'rgba(255,255,255,0.6)';
                    let optionColor = 'var(--color-text-base)';

                    if (j === q.answer) {
                      optionBorder = '#10B981';
                      optionBg = 'rgba(16,185,129,0.08)';
                      optionColor = '#10B981';
                    } else if (!isSkipped && userAns === j) {
                      optionBorder = '#ef4444';
                      optionBg = 'rgba(239,68,68,0.08)';
                      optionColor = '#ef4444';
                    }

                    return (
                      <div key={j} style={{
                        padding: '12px 16px', borderRadius: 12, border: '2px solid',
                        borderColor: optionBorder, background: optionBg, color: optionColor,
                        fontSize: 14
                      }}>
                        <strong style={{ marginRight: 6 }}>{String.fromCharCode(65+j)}.</strong> {optText}
                        {optSubText && <div style={{ fontSize: 11.5, opacity: 0.6, marginTop: 3, marginLeft: 20 }}>{optSubText}</div>}
                      </div>
                    );
                  })}
                </div>
                
                {(q.explanation?.en || q.explanation?.hi) && (
                  <div style={{ marginTop: 18, background: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 14, padding: 16, color: 'var(--color-text-base)', fontSize: 14, lineHeight: 1.7 }}>
                    <strong style={{ color: 'var(--color-text-title-base)', display: 'block', marginBottom: 6, fontFamily: 'Outfit' }}>{t('Explanation:', 'स्पष्टीकरण:')}</strong>
                    {language === 'hi' && q.explanation?.hi ? q.explanation.hi : q.explanation?.en}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Exam Instructions Screen ───────────────────────────────────────────────
function InstructionsScreen({ session, onConfirm, t }) {
  const [agreed, setAgreed] = useState(false);
  const { questions, exam } = session;
  const totalQ = questions.length;
  const duration = Math.round((session.timeRemaining || 600) / 60);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }} className="page-enter">
      <div className="premium-card" style={{ padding: 36, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--gradient-primary)' }} />
        
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-text-title-base)', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>
          {t('General Exam Instructions', 'सामान्य परीक्षा निर्देश')}
        </h2>
        <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14.5, marginBottom: 28 }}>
          {t('Please read the following instructions carefully before starting the assessment.', 'कृपया मूल्यांकन शुरू करने से पहले निम्नलिखित निर्देशों को ध्यान से पढ़ें।')}
        </p>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }} className="grid-2">
          <div style={{ background: 'rgba(8, 18, 41, 0.02)', border: '1px solid var(--color-border-base)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 800 }}>{t('EXAM NAME', 'परीक्षा का नाम')}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-title-base)', marginTop: 4, textTransform: 'uppercase' }}>{exam}</div>
          </div>
          <div style={{ background: 'rgba(8, 18, 41, 0.02)', border: '1px solid var(--color-border-base)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 800 }}>{t('QUESTIONS', 'कुल प्रश्न')}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-title-base)', marginTop: 4 }}>{totalQ}</div>
          </div>
          <div style={{ background: 'rgba(8, 18, 41, 0.02)', border: '1px solid var(--color-border-base)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 800 }}>{t('DURATION', 'अवधि')}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text-title-base)', marginTop: 4 }}>{duration} Min</div>
          </div>
          <div style={{ background: 'rgba(8, 18, 41, 0.02)', border: '1px solid var(--color-border-base)', borderRadius: 16, padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)', fontWeight: 800 }}>{t('MARKING SCHEME', 'अंक प्रणाली')}</div>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#10B981', marginTop: 4 }}>+2.00 / <span style={{ color: '#ef4444' }}>-0.66</span></div>
          </div>
        </div>

        {/* General Instructions Box */}
        <div style={{ border: '2px solid var(--color-border-base)', borderRadius: 20, padding: 24, background: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-text-title-base)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {t('Instructions Overview', 'निर्देशों का सारांश')}
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 20, fontSize: 14.5, color: 'var(--color-text-base)', lineHeight: 1.6 }}>
            <li>{t('The countdown timer at the top center of the screen will show the remaining time available for you to complete the exam.', 'स्क्रीन के शीर्ष केंद्र में उलटी गिनती टाइमर परीक्षा पूरा करने के लिए आपके पास उपलब्ध शेष समय दिखाएगा।')}</li>
            <li>{t('Questions can be answered in any order. Options are chosen via standard radio selections.', 'प्रश्नों का उत्तर किसी भी क्रम में दिया जा सकता है। विकल्प मानक रेडियो चयनों के माध्यम से चुने जाते हैं।')}</li>
            <li>{t('Question Palette on the right displays color-coded numbers representing answered, unanswered, and review states.', 'दाहिनी ओर प्रश्न पैलेट उत्तर दिए गए, बिना उत्तर दिए गए, और समीक्षा राज्यों का प्रतिनिधित्व करने वाले रंग-कोडित नंबर प्रदर्शित करता है।')}</li>
            <li>{t('Ensure you click "Save & Next" to save your response before proceeding, or "Mark for Review" to review it later.', 'आगे बढ़ने से पहले अपना उत्तर सहेजने के लिए "सहेजें और अगला" पर क्लिक करें, या बाद में समीक्षा करने के लिए "समीक्षा के लिए चिह्नित करें" पर क्लिक करें।')}</li>
            <li>{t('Click "Submit Exam" to view your score breakdown, accuracy details, and analytical recommendations.', 'अपना स्कोर ब्रेकडाउन, सटीकता विवरण और विश्लेषणात्मक सिफारिशें देखने के लिए "परीक्षा सबमिट करें" पर क्लिक करें।')}</li>
          </ul>
        </div>

        {/* Agreement Checkbox */}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 36 }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            style={{ width: 18, height: 18, marginTop: 3, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
          />
          <span style={{ fontSize: 14, color: 'var(--color-text-title-base)', fontWeight: 600, lineHeight: 1.5 }}>
            {t('I have read and understood all instructions. I agree that in case of any technical discrepancy, my session will stand resolved by the platform engine.', 'मैंने सभी निर्देश पढ़ और समझ लिए हैं। मैं सहमत हूँ कि किसी भी तकनीकी विसंगति के मामले में, मेरा सत्र प्लेटफ़ॉर्म इंजन द्वारा हल किया जाएगा।')}
          </span>
        </label>

        {/* Start Button */}
        <button
          onClick={onConfirm}
          disabled={!agreed}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '16px',
            fontSize: '16px',
            opacity: agreed ? 1 : 0.5,
            cursor: agreed ? 'pointer' : 'not-allowed'
          }}
        >
          {t('Start Test', 'परीक्षा शुरू करें')}
        </button>
      </div>
    </div>
  );
}

// ─── Main TestCenter ───────────────────────────────────────────────────────────
export default function TestCenter() {
  const { language } = useAuth();
  const [view, setView] = useState('setup');
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);

  const t = (en, hi) => language === 'hi' ? hi : en;

  const handleStart = (sess) => { setSession(sess); setView('instructions'); };
  const handleComplete = (res) => { setResult(res); setView('result'); };
  const handleRetry = () => { setSession(null); setResult(null); setView('setup'); };

  return (
    <AppLayout hideLayout={view === 'active'}>
      <div style={{ padding: view === 'active' ? '0' : '28px 24px' }}>
        {view === 'setup' && (
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <span className="section-pill">{t('Mock Tests', 'मूल्यांकन')}</span>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--color-text-title-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'Outfit, sans-serif' }}>
              <FlaskConical size={32} color="#FF6B00" /> {t('Mock Test Center', 'मॉक टेस्ट सेंटर')}
            </h1>
            <p style={{ color: 'var(--color-text-muted-base)', marginTop: 8, fontSize: 15 }}>{t('Benchmark your preparation with timed custom mock assessments', 'समयबद्ध मॉक परीक्षाओं के साथ अपने प्रदर्शन का मूल्यांकन करें')}</p>
          </div>
        )}

        {view === 'setup' && <TestSetup onStart={handleStart} t={t} />}
        {view === 'instructions' && session && <InstructionsScreen session={session} onConfirm={() => {
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
          setView('active');
        }} t={t} />}
        {view === 'active' && session && <ActiveTest session={session} onComplete={handleComplete} t={t} language={language} />}
        {view === 'result' && result && <ResultView result={result} session={session} onRetry={handleRetry} t={t} language={language} />}
      </div>
    </AppLayout>
  );
}



