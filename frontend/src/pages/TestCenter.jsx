import { useState, useEffect, useRef, useCallback } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import api from '../services/api';
import { FlaskConical, Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, XCircle, SkipForward, Trophy, TrendingUp, AlertTriangle, RotateCcw, BookOpen, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

// ─── Test Config ──────────────────────────────────────────────────────────────
function TestSetup({ onStart }) {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [testType, setTestType] = useState('topic');
  const [syllabus, setSyllabus] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/syllabus').then(res => setExams(res.data.exams));
  }, []);

  useEffect(() => {
    if (selectedExam) {
      api.get(`/syllabus/${selectedExam.toLowerCase()}`).then(res => setSyllabus(res.data.syllabus));
      setSelectedSubject(''); setSelectedTopic('');
    }
  }, [selectedExam]);

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
      alert(e.response?.data?.message || 'Failed to start test. Try different options.');
    } finally { setLoading(false); }
  };

  const selStyle = { background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', color:'#e2e8f0', padding:'12px 14px', borderRadius:10, width:'100%', outline:'none', fontFamily:'Outfit,sans-serif', fontSize:14.5, cursor:'pointer', marginBottom:18 };

  return (
    <div style={{ maxWidth:580, margin:'0 auto' }}>
      <div className="glass-card" style={{ padding:32, border: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:52, height:52, background:'linear-gradient(135deg,#f97316,#ef4444)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)' }}>
            <FlaskConical size={26} color="white" />
          </div>
          <h2 style={{ fontSize:'1.45rem', fontWeight:800, color:'#f8fafc', fontFamily: 'Outfit, sans-serif' }}>Configure Mock Assessment</h2>
          <p style={{ color:'#64748b', fontSize:13.5, marginTop:4 }}>Select exam tracks and custom assessment scopes</p>
        </div>

        <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'0.05em' }}>SELECT EXAM TRACK</label>
        <select id="sel-exam" style={selStyle} value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
          <option value="">-- Select Target Exam --</option>
          {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'0.05em' }}>ASSESSMENT SCOPE</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:18 }}>
          {[
            ['topic','Topic Test','10 Qs / 10 mins'],
            ['subject','Subject Test','20 Qs / 20 mins'],
            ['full_mock','Full Mock','30 Qs / 30 mins']
          ].map(([val,label,sub]) => (
            <button id={`type-${val}`} key={val} onClick={() => setTestType(val)}
              style={{ padding:'14px 8px', borderRadius:10, border:`1px solid ${testType===val?'rgba(249,115,22,0.4)':'rgba(255,255,255,0.05)'}`, background:testType===val?'rgba(249,115,22,0.08)':'rgba(255,255,255,0.01)', cursor:'pointer', textAlign:'center', transition:'all 0.25s' }}>
              <div style={{ color: testType===val?'#f97316':'#94a3b8', fontWeight:700, fontSize:13 }}>{label}</div>
              <div style={{ color:'#64748b', fontSize:10, marginTop:4 }}>{sub}</div>
            </button>
          ))}
        </div>

        {testType !== 'full_mock' && selectedExam && (
          <>
            <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'0.05em' }}>SUBJECT</label>
            <select id="sel-subject" style={selStyle} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic(''); }}>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </>
        )}

        {testType === 'topic' && selectedSubject && (
          <>
            <label style={{ color:'#94a3b8', fontSize:11, fontWeight:600, display:'block', marginBottom:6, letterSpacing:'0.05em' }}>TOPIC</label>
            <select id="sel-topic" style={selStyle} value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
              <option value="">-- Select Topic --</option>
              {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
            </select>
          </>
        )}

        <button id="btn-start-test" className="btn-orange" onClick={handleStart} disabled={!canStart || loading}
          style={{ width:'100%', justifyContent:'center', marginTop:10, padding:'14px', fontSize:'1rem', fontWeight: 700, opacity:(!canStart||loading)?0.5:1, cursor:(!canStart||loading)?'not-allowed':'pointer', boxShadow: '0 4px 14px rgba(249,115,22,0.2)' }}>
          {loading ? 'Assembling Question Set...' : 'Launch Test Console →'}
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginTop:24 }}>
        {[
          ['🎯','Topic Drill','Strengthen specific sub-concepts'],
          ['📚','Subject Evaluation','Assess broad subject readiness'],
          ['🏆','Simulated Mock','30-minute exam pressure mode']
        ].map(([icon,title,desc]) => (
          <div key={title} className="glass-card" style={{ padding:20, textAlign:'center', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{icon}</div>
            <div style={{ color:'#f8fafc', fontWeight:700, fontSize:13, marginBottom:4 }}>{title}</div>
            <div style={{ color:'#64748b', fontSize:11, lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Active Test ───────────────────────────────────────────────────────────────
function ActiveTest({ session, onComplete }) {
  const { questions, id: sessionId, timeRemaining: initialTime } = session;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [submitting, setSubmitting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const timerRef = useRef(null);
  const saveRef = useRef(null);
  const testContainerRef = useRef(null);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Autosave every 20s
  useEffect(() => {
    saveRef.current = setInterval(() => {
      api.put(`/tests/sessions/${sessionId}`, { answers, timeRemaining: timeLeft }).catch(() => {});
    }, 20000);
    return () => clearInterval(saveRef.current);
  }, [answers, timeLeft]);

  const handleAnswer = (qId, idx) => {
    setAnswers(prev => ({ ...prev, [qId]: idx }));
  };

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      await api.put(`/tests/sessions/${sessionId}`, { answers, timeRemaining: timeLeft });
      const res = await api.post(`/tests/sessions/${sessionId}/submit`);
      onComplete(res.data.result);
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }, [sessionId, answers, timeLeft]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      testContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const q = questions[current];
  if (!q) return null;

  const totalQ = questions.length;
  const attempted = Object.keys(answers).length;
  const urgent = timeLeft < 120;

  return (
    <div ref={testContainerRef} style={{ maxWidth:1000, margin:'0 auto', background: isFullscreen ? '#0b0f19' : 'transparent', padding: isFullscreen ? '32px' : '0' }}>
      {/* Test Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ color:'#64748b', fontSize:12, fontWeight: 700, letterSpacing: '0.05em' }}>{session.exam} — {session.testType?.replace('_',' ').toUpperCase()}</div>
          <div style={{ color:'#f8fafc', fontWeight:800, fontSize: 16, marginTop: 2 }}>Question {current+1} of {totalQ}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* Fullscreen Toggle */}
          <button onClick={toggleFullscreen} className="btn-secondary" style={{ padding: 10, borderRadius: 10 }}>
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          {/* Timer Block */}
          <div style={{ display:'flex', alignItems:'center', gap:8, background:urgent?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.03)', border:`1px solid ${urgent?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.06)'}`, borderRadius:10, padding:'8px 16px' }}>
            <Clock size={16} color={urgent?'#f87171':'#818cf8'} />
            <span style={{ color:urgent?'#f87171':'#f8fafc', fontWeight:800, fontSize:'1.1rem', fontFamily:'Outfit,sans-serif' }}>{formatTime(timeLeft)}</span>
          </div>

          <button id="btn-submit-test" onClick={() => setShowConfirmModal(true)} className="btn-orange" style={{ padding:'9px 24px', fontSize:13.5, fontWeight:700 }}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar" style={{ marginBottom:24, height: 6, background: 'rgba(255,255,255,0.03)' }}>
        <div className="progress-bar-fill" style={{ width:`${(attempted/totalQ)*100}%`, background: 'linear-gradient(to right, #f97316, #ef4444)' }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

        {/* Question Panel */}
        <div>
          <div className="glass-card" style={{ padding:28, marginBottom:16, border: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems: 'center' }}>
              <span className={`badge badge-${q.difficulty}`} style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}>{q.difficulty}</span>
              <span style={{ color:'#64748b', fontSize:12, fontWeight: 600 }}>{q.topic}</span>
              <button id={`btn-flag-${current}`} onClick={() => setFlagged(prev => { const s=new Set(prev); s.has(q._id)?s.delete(q._id):s.add(q._id); return s; })}
                style={{ marginLeft:'auto', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 12px', cursor:'pointer', color:flagged.has(q._id)?'#f97316':'#64748b', display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight: 600 }}>
                <Flag size={13} fill={flagged.has(q._id)?"#f97316":"none"} /> {flagged.has(q._id)?'Flagged':'Flag Question'}
              </button>
            </div>
            <p style={{ color:'#f8fafc', fontSize:'1rem', lineHeight:1.8, fontWeight:500 }}>{q.question?.en}</p>
            {q.question?.hi && <p style={{ color:'#94a3b8', fontSize:14.5, lineHeight:1.7, marginTop:12, fontStyle:'italic' }}>{q.question.hi}</p>}
          </div>

          {/* Options List */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:20 }}>
            {q.options?.map((opt, i) => (
              <button key={i} id={`opt-${i}`}
                className={`option-btn ${answers[q._id]===i?'selected':''}`}
                onClick={() => handleAnswer(q._id, i)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 10 }}>
                <span style={{ width:24, height:24, borderRadius:'50%', border:'1px solid currentColor', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:800 }}>
                  {String.fromCharCode(65+i)}
                </span>
                <div style={{ textAlign: 'left' }}>
                  <div>{opt.en}</div>
                  {opt.hi && <div style={{ fontSize:12, opacity:0.6, marginTop:2 }}>{opt.hi}</div>}
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Controls */}
          <div style={{ display:'flex', gap:12 }}>
            <button id="btn-prev" onClick={() => setCurrent(c => Math.max(0, c-1))} disabled={current===0} className="btn-secondary"
              style={{ padding:'10px 20px', fontSize:13.5, fontWeight: 600, opacity:current===0?0.4:1 }}>
              <ChevronLeft size={15} /> Prev
            </button>
            <button id="btn-next" onClick={() => setCurrent(c => Math.min(totalQ-1, c+1))} disabled={current===totalQ-1} className="btn-secondary"
              style={{ padding:'10px 20px', fontSize:13.5, fontWeight: 600, opacity:current===totalQ-1?0.4:1 }}>
              Next <ChevronRight size={15} />
            </button>
            {answers[q._id] !== undefined && (
              <button id="btn-clear" onClick={() => setAnswers(prev => { const n={...prev}; delete n[q._id]; return n; })}
                className="btn-secondary" style={{ padding:'10px 20px', fontSize:13.5, fontWeight: 600, color:'#ef4444', borderColor:'rgba(239,68,68,0.2)' }}>
                Clear Response
              </button>
            )}
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="glass-card" style={{ padding:20, position:'sticky', top:20, border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{ color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:16, letterSpacing:'0.05em' }}>QUESTION PALETTE</div>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap:6, marginBottom:20 }}>
            {questions.map((ques, i) => {
              const isAnswered = answers[ques._id] !== undefined;
              const isFlagged = flagged.has(ques._id);
              const isCurrent = i === current;
              
              let bg = 'rgba(255,255,255,0.03)';
              let color = '#64748b';
              let border = '1px solid rgba(255,255,255,0.06)';
              let shadow = 'none';

              if (isCurrent) {
                bg = 'linear-gradient(135deg, #f97316, #ef4444)';
                color = 'white';
                border = 'none';
                shadow = '0 4px 12px rgba(249,115,22,0.3)';
              } else if (isAnswered && isFlagged) {
                bg = 'rgba(168,85,247,0.18)';
                color = '#c084fc';
                border = '1px solid rgba(168,85,247,0.35)';
              } else if (isAnswered) {
                bg = 'rgba(34,197,94,0.15)';
                color = '#4ade80';
                border = '1px solid rgba(34,197,94,0.3)';
              } else if (isFlagged) {
                bg = 'rgba(249,115,22,0.15)';
                color = '#fb923c';
                border = '1px solid rgba(249,115,22,0.3)';
              }

              return (
                <button key={i} id={`nav-q-${i+1}`} onClick={() => setCurrent(i)}
                  title={`Q${i+1} • ${ques.difficulty} • ${ques.topic}`}
                  style={{ height:36, borderRadius:8, border, background: bg, color, cursor:'pointer',
                    fontWeight:700, fontSize:12.5, display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:shadow, transition:'all 0.15s' }}>
                  {i+1}
                </button>
              );
            })}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:7, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
            {[
              ['rgba(34,197,94,0.15)','rgba(34,197,94,0.35)','#4ade80','Answered', attempted],
              ['rgba(249,115,22,0.15)','rgba(249,115,22,0.35)','#fb923c','Flagged', flagged.size],
              ['rgba(168,85,247,0.15)','rgba(168,85,247,0.35)','#c084fc','Marked & Answered', Array.from(flagged).filter(id => answers[id] !== undefined).length],
              ['rgba(255,255,255,0.03)','rgba(255,255,255,0.1)','#64748b','Not Visited', totalQ - attempted]
            ].map(([bg,border,color,label,count]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, fontSize: 12 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:bg, border:`1px solid ${border}`, flexShrink:0 }} />
                <span style={{ color:'#64748b', flex:1 }}>{label}</span>
                <span style={{ color, fontWeight:800, fontSize:14 }}>{count}</span>
              </div>
            ))}
          </div>

          {/* Quick summary */}
          <div style={{ marginTop:16, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#64748b', marginBottom:6 }}>
              <span>Completion</span><span style={{ color:'#818cf8', fontWeight:700 }}>{Math.round((attempted/totalQ)*100)}%</span>
            </div>
            <div style={{ width:'100%', height:4, background:'rgba(255,255,255,0.04)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ width:`${(attempted/totalQ)*100}%`, height:'100%', background:'linear-gradient(to right,#22c55e,#4ade80)', transition:'width 0.3s' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submission Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }} onClick={() => setShowConfirmModal(false)}>
          <div className="modal-box glass-card" style={{ maxWidth: 460, width: '90%', border: '1px solid rgba(255,255,255,0.08)' }} onClick={e=>e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc', marginBottom: 12, fontFamily: 'Outfit, sans-serif' }}>Review Assessment Status</h3>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>Are you sure you want to submit your responses? Please review your summary below:</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4ade80' }}>{attempted}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Answered</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>{totalQ - attempted}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Unattempted</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, textAlign: 'center', gridColumn: 'span 2' }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fb923c' }}>{flagged.size}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Flagged / Marked for Review</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" style={{ padding: '10px 20px' }} onClick={() => setShowConfirmModal(false)}>
                Back to Test
              </button>
              <button className="btn-orange" style={{ padding: '10px 24px', fontWeight: 700 }} onClick={() => { setShowConfirmModal(false); handleSubmit(); }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Result View ────────────────────────────────────────────────────────────────
function ResultView({ result, session, onRetry }) {
  const [showReview, setShowReview] = useState(false);
  const [reviewAnswers] = useState(session?.answers || {});

  const percent = result.accuracy;
  const grade = percent >= 80 ? 'Excellent Performance' : percent >= 60 ? 'Good Standing' : percent >= 40 ? 'Average Standing' : 'Development Needed';
  const gradeColor = percent >= 80 ? '#4ade80' : percent >= 60 ? '#818cf8' : percent >= 40 ? '#f97316' : '#ef4444';

  return (
    <div style={{ maxWidth:820, margin:'0 auto' }}>
      {/* Score Header */}
      <div className="glass-card" style={{ padding:36, textAlign:'center', marginBottom:20, background:'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.06))', border: '1px solid rgba(255,255,255,0.03)' }}>
        <Trophy size={48} color="#f59e0b" style={{ margin:'0 auto 16px', filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.3))' }} />
        <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#f8fafc', marginBottom:6, fontFamily: 'Outfit, sans-serif' }}>Mock Evaluation Report</h2>
        <div style={{ fontSize:'4.2rem', fontWeight:900, color: gradeColor, fontFamily:'Outfit,sans-serif', lineHeight:1 }}>{result.accuracy.toFixed(0)}%</div>
        <div style={{ color:gradeColor, fontWeight:700, fontSize:'1.2rem', marginTop:8 }}>{grade}</div>
      </div>

      {/* Stats Cards Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:14, marginBottom:20 }}>
        {[
          [CheckCircle, '#4ade80', 'Correct', result.correctAnswers],
          [XCircle, '#f87171', 'Wrong', result.wrongAnswers],
          [SkipForward, '#fb923c', 'Skipped', result.unattempted],
          [Clock, '#818cf8', 'Time Taken', `${Math.floor(result.duration/60)}m ${result.duration%60}s`],
        ].map(([Icon, color, label, val]) => (
          <div key={label} className="glass-card" style={{ padding:20, textAlign:'center', border: '1px solid rgba(255,255,255,0.02)' }}>
            <Icon size={22} color={color} style={{ margin:'0 auto 8px' }} />
            <div style={{ fontSize:'1.6rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit,sans-serif' }}>{val}</div>
            <div style={{ color:'#64748b', fontSize:12, marginTop:4, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Score progress bar */}
      <div className="glass-card" style={{ padding:20, marginBottom:20, border:'1px solid rgba(255,255,255,0.02)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8', marginBottom:8 }}>
          <span style={{ fontWeight:600 }}>Overall Score Breakdown</span>
          <span>{result.correctAnswers}/{result.correctAnswers+result.wrongAnswers+result.unattempted} answered</span>
        </div>
        <div style={{ width:'100%', height:10, background:'rgba(255,255,255,0.04)', borderRadius:5, overflow:'hidden', display:'flex' }}>
          <div style={{ width:`${(result.correctAnswers/(result.correctAnswers+result.wrongAnswers+result.unattempted||1))*100}%`, background:'linear-gradient(to right,#22c55e,#4ade80)', transition:'width 1s ease', height:'100%' }} />
          <div style={{ width:`${(result.wrongAnswers/(result.correctAnswers+result.wrongAnswers+result.unattempted||1))*100}%`, background:'rgba(239,68,68,0.6)', height:'100%' }} />
        </div>
        <div style={{ display:'flex', gap:16, marginTop:8, fontSize:11 }}>
          <span style={{ color:'#4ade80' }}>■ Correct ({result.correctAnswers})</span>
          <span style={{ color:'#f87171' }}>■ Wrong ({result.wrongAnswers})</span>
          <span style={{ color:'#64748b' }}>■ Skipped ({result.unattempted})</span>
        </div>
      </div>

      {/* Weak / Strong analysis */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:20, marginBottom:24 }}>
        <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, color:'#4ade80', fontWeight:700, fontSize:13, letterSpacing: '0.05em' }}>
            <TrendingUp size={14} /> MASTERED SYLLABUS TOPICS
          </div>
          {result.analysis?.strongTopics?.length > 0 ? result.analysis.strongTopics.map(t => (
            <div key={t} style={{ background:'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius:8, padding:'8px 12px', marginBottom:6, color:'#a7f3d0', fontSize:13 }}>✓ {t}</div>
          )) : <div style={{ color:'#64748b', fontSize:13 }}>No topics met the 70% accuracy criteria in this set.</div>}
        </div>
        <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.02)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:16, color:'#f87171', fontWeight:700, fontSize:13, letterSpacing: '0.05em' }}>
            <AlertTriangle size={14} /> FOCUS AREAS FOR IMPROVEMENT
          </div>
          {result.analysis?.weakTopics?.length > 0 ? result.analysis.weakTopics.map(t => (
            <div key={t} style={{ background:'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:'8px 12px', marginBottom:6, color:'#fca5a5', fontSize:13 }}>✗ {t}</div>
          )) : <div style={{ color:'#64748b', fontSize:13 }}>Perfect score! No weak topics detected.</div>}
        </div>
      </div>

      {/* Control Buttons */}
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom: 28 }}>
        <button id="btn-retry" className="btn-primary" onClick={onRetry} style={{ padding: '12px 24px', fontWeight: 700 }}>
          <RotateCcw size={15} /> Configure New Test
        </button>
        <button id="btn-review" className="btn-secondary" onClick={() => setShowReview(!showReview)} style={{ padding: '12px 24px', fontWeight: 600 }}>
          {showReview ? <ArrowLeft size={15} /> : <BookOpen size={15} />}
          {showReview ? 'Hide Question Review' : 'Detailed Question Review'}
        </button>
      </div>

      {/* Detailed Review Lists */}
      {showReview && session?.questions && (
        <div style={{ marginTop:24 }}>
          <h3 style={{ color:'#f8fafc', fontWeight:800, fontSize: 16, marginBottom:16, fontFamily: 'Outfit, sans-serif' }}>Question Review Outline</h3>
          {session.questions.map((q, i) => {
            const userAns = reviewAnswers[q._id];
            const isCorrect = userAns === q.answer;
            const isSkipped = userAns === undefined;
            return (
              <div key={q._id} className="glass-card" style={{ padding:24, marginBottom:16, borderLeft:`4px solid ${isSkipped?'#fb923c':isCorrect?'#22c55e':'#ef4444'}`, border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap', alignItems: 'center' }}>
                  <span style={{ color:'#64748b', fontSize:12, fontWeight: 700 }}>QUESTION {i+1}</span>
                  <span className={`badge badge-${q.difficulty}`} style={{ fontSize: 10, fontWeight: 700 }}>{q.difficulty}</span>
                  {isSkipped ? <span style={{ color:'#fb923c', fontSize:12, fontWeight:700 }}>⊘ Unattempted</span> :
                   isCorrect ? <span style={{ color:'#4ade80', fontSize:12, fontWeight:700 }}>✓ Correct Response</span> :
                   <span style={{ color:'#f87171', fontSize:12, fontWeight:700 }}>✗ Incorrect Response</span>}
                </div>
                
                <p style={{ color:'#cbd5e1', fontSize:14.5, lineHeight:1.75, marginBottom:14, fontWeight: 500 }}>{q.question?.en}</p>
                {q.question?.hi && <p style={{ color:'#64748b', fontSize:13.5, lineHeight:1.6, marginBottom:14, fontStyle:'italic' }}>{q.question.hi}</p>}
                
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {q.options?.map((opt, j) => (
                    <div key={j} style={{ padding:'10px 14px', borderRadius:8, border:'1px solid',
                      borderColor: j===q.answer?'rgba(34,197,94,0.3)':(!isSkipped&&userAns===j)?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.04)',
                      background: j===q.answer?'rgba(34,197,94,0.07)':(!isSkipped&&userAns===j)?'rgba(239,68,68,0.07)':'rgba(255,255,255,0.01)',
                      color: j===q.answer?'#4ade80':(!isSkipped&&userAns===j)?'#f87171':'#94a3b8', fontSize:13.5 }}>
                      <strong style={{ marginRight: 6 }}>{String.fromCharCode(65+j)}.</strong> {opt.en}
                      {opt.hi && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2, marginLeft: 20 }}>{opt.hi}</div>}
                    </div>
                  ))}
                </div>
                {q.explanation?.en && (
                  <div style={{ marginTop:14, background:'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius:10, padding:'12px 16px', color:'#a5b4fc', fontSize:13.5, lineHeight: 1.6 }}>
                    <strong style={{ color: '#ffffff', display: 'block', marginBottom: 4 }}>Explanation:</strong>
                    {q.explanation.en}
                    {q.explanation?.hi && <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 8, marginTop: 8, fontStyle: 'italic', color: '#818cf8' }}>{q.explanation.hi}</div>}
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

// ─── Main TestCenter ───────────────────────────────────────────────────────────
export default function TestCenter() {
  const [view, setView] = useState('setup');
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);

  const handleStart = (sess) => { setSession(sess); setView('active'); };
  const handleComplete = (res) => { setResult(res); setView('result'); };
  const handleRetry = () => { setSession(null); setResult(null); setView('setup'); };

  return (
    <AppLayout>
      <div style={{ padding:'28px 24px' }}>
        {/* Header */}
        {view === 'setup' && (
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <h1 style={{ fontSize:'1.8rem', fontWeight:800, color:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily: 'Outfit, sans-serif' }}>
              <FlaskConical size={26} color="#f97316" /> Test Center
            </h1>
            <p style={{ color:'#64748b', marginTop:4, fontSize: 13.5 }}>Benchmark your performance with timed mock exams</p>
          </div>
        )}

        {view === 'setup' && <TestSetup onStart={handleStart} />}
        {view === 'active' && session && <ActiveTest session={session} onComplete={handleComplete} />}
        {view === 'result' && result && <ResultView result={result} session={session} onRetry={handleRetry} />}
      </div>
    </AppLayout>
  );
}
