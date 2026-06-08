import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import api from '../services/api';
import { BookOpen, ChevronRight, ChevronDown, CheckCircle, Circle, Bookmark, BookMarked, FlaskConical, ArrowLeft, Lightbulb, Table2, FileText, Star, Clock, Link2, Search, Zap } from 'lucide-react';

const EXAM_COLORS = {
  'UPSC': '#6366f1', 'BPSC': '#a855f7', 'SSC CGL': '#f59e0b',
  'SSC CHSL': '#14b8a6', 'Railway': '#22c55e', 'Banking': '#06b6d4', 'State PCS': '#ec4899'
};

// ─── Markdown Renderer ──────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return '';
  let html = text;

  // Markdown tables: | col | col |
  html = html.replace(/(?:^|\n)((?:\|.+\|\n?)+)/g, (match, tableBlock) => {
    const rows = tableBlock.trim().split('\n').filter(r => r.trim().length > 0);
    if (rows.length < 2) return match;
    const isSep = (r) => /^[|\s\-:]+$/.test(r);
    const parseRow = (r) => r.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
    const headers = parseRow(rows[0]);
    const bodyRows = rows.slice(1).filter(r => !isSep(r));
    const ths = headers.map(h => `<th style="background:rgba(99,102,241,0.1);color:#818cf8;padding:10px 14px;text-align:left;border:1px solid rgba(99,102,241,0.15);font-size:13px;font-weight:700">${h}</th>`).join('');
    const trs = bodyRows.map((r, i) => {
      const tds = parseRow(r).map(c => `<td style="padding:10px 14px;border:1px solid rgba(255,255,255,0.04);color:#cbd5e1;font-size:13.5px;background:${i%2===0?'transparent':'rgba(255,255,255,0.01)'}">${c}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<div style="overflow-x:auto;margin:16px 0"><table style="width:100%;border-collapse:collapse"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
  });

  // Headings
  html = html.replace(/^#### (.+)$/gm, '<h5 style="color:#ffffff;font-weight:700;margin:16px 0 8px;font-size:14px">$1</h5>');
  html = html.replace(/^### (.+)$/gm, '<h4 style="color:#ffffff;font-weight:700;margin-top:18px;margin-bottom:10px;font-size:15px">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 style="color:#ffffff;font-weight:800;margin-top:24px;margin-bottom:12px;font-size:17px;border-left:3px solid #6366f1;padding-left:10px">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 style="color:#ffffff;font-weight:900;margin-top:28px;margin-bottom:14px;font-size:20px">$1</h2>');

  // Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffffff">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em style="color:#a5b4fc">$1</em>');

  // Bullet lists
  html = html.replace(/^[-•] (.+)$/gm, '<li style="color:#cbd5e1;margin:5px 0;font-size:14.5px;list-style:none;padding-left:20px;position:relative"><span style="position:absolute;left:4px;color:#6366f1">▸</span>$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>)/gs, '<ul style="margin:10px 0;padding:0">$1</ul>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.12);color:#a5b4fc;padding:2px 6px;border-radius:4px;font-size:13px">$1</code>');

  // Newlines
  html = html.replace(/\n/g, '<br/>');

  return html;
}


function ExamCard({ exam, onSelect }) {
  const color = EXAM_COLORS[exam.name] || '#6366f1';
  return (
    <button id={`exam-card-${exam.id.toLowerCase()}`} onClick={() => onSelect(exam)}
      style={{ background:`${color}0e`, border:`1px solid ${color}22`, borderRadius:16, padding:24, cursor:'pointer', textAlign:'left', transition:'all 0.3s', width:'100%' }}
      onMouseEnter={e => { e.currentTarget.style.background=`${color}1b`; e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px ${color}18`; }}
      onMouseLeave={e => { e.currentTarget.style.background=`${color}0e`; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
      <div style={{ fontSize:'2.2rem', marginBottom:12 }}>{exam.icon}</div>
      <div style={{ fontWeight:700, color:'#f8fafc', fontSize:15, marginBottom:6, fontFamily:'Outfit,sans-serif' }}>{exam.name}</div>
      <div style={{ color:'#94a3b8', fontSize:12, lineHeight: 1.5 }}>{exam.description}</div>
    </button>
  );
}

function ContentReader({ exam, subject, topic, subtopic, onBack, onNavigateToRelated }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [readingTime, setReadingTime] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api.get(`/learn/content/${encodeURIComponent(exam)}/${encodeURIComponent(subject)}/${encodeURIComponent(topic)}/${encodeURIComponent(subtopic)}`)
      .then(res => {
        const data = res.data.content;
        setContent(data);
        setLoading(false);

        // Calculate estimated reading time
        const textToAnalyze = (data.introduction || '') + ' ' + (data.detailedExplanation || '');
        const wordCount = textToAnalyze.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.ceil(wordCount / 220)); // ~220 WPM
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
      .catch(err => { console.error(err); setLoading(false); });

    api.get('/learn/progress').then(res => {
      setCompleted(!!res.data.learningProgress[subtopic]);
    }).catch(() => {});
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
    try { 
      await api.post('/learn/progress', { subtopic, completed: next }); 
    } catch (e) { 
      setCompleted(!next); 
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

  const TABS = [
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'facts', label: 'Key Facts', icon: Lightbulb },
    { id: 'tables', label: 'Summary Tables', icon: Table2 },
    { id: 'pyqs', label: 'Solved PYQs', icon: Star },
  ];

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300, flexDirection:'column', gap:16 }}>
      <div style={{ width:36, height:36, border:'3px solid rgba(99,102,241,0.3)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'#64748b', fontSize:13 }}>Loading study module...</p>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );

  if (!loading && !content) return (
    <div style={{ textAlign:'center', padding:'60px 20px' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>📭</div>
      <h3 style={{ color:'#f8fafc', fontWeight:700, fontSize:'1.2rem', marginBottom:8 }}>Content Coming Soon</h3>
      <p style={{ color:'#64748b', fontSize:14, marginBottom:20 }}>Study notes for <strong style={{ color:'#818cf8' }}>{subtopic}</strong> are being authored and will appear soon.</p>
      <button onClick={onBack} className="btn-secondary" style={{ padding:'10px 20px', fontSize:13 }}>
        <ArrowLeft size={14} /> Back to Syllabus
      </button>
    </div>
  );

  return (
    <div>
      {/* Reading Progress Indicator */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 4, background: 'rgba(255,255,255,0.05)', zIndex: 1000 }}>
        <div style={{ width: `${scrollProgress}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', transition: 'width 0.1s ease-out' }} />
      </div>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding:'8px 14px', fontSize:13 }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ color:'#64748b', fontSize:12, marginBottom:2 }}>{exam} / {subject} / {topic}</div>
          <h2 style={{ color:'#e2e8f0', fontWeight:700, fontSize:'1.2rem' }}>{subtopic}</h2>
        </div>
        <div style={{ display:'flex', gap:8, alignItems: 'center' }}>
          {/* Estimated Reading Time Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 12px', borderRadius: 8, fontSize: 12, color: '#94a3b8' }}>
            <Clock size={13} />
            <span>{readingTime} min read</span>
          </div>

          <button id="btn-bookmark" onClick={toggleBookmark} className="btn-secondary" style={{ padding:'8px 14px', fontSize:13 }}>
            {bookmarked ? <BookMarked size={14} color="#818cf8" /> : <Bookmark size={14} />}
          </button>
          
          <button id="btn-complete" onClick={toggleComplete}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.2s',
              background: completed ? 'rgba(22,163,74,0.15)' : 'rgba(99,102,241,0.1)',
              color: completed ? '#4ade80' : '#818cf8',
              border: completed ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(99,102,241,0.2)' }}>
            {completed ? <CheckCircle size={14} /> : <Circle size={14} />}
            {completed ? 'Completed' : 'Mark Complete'}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Left Pane - Study notes reader */}
        <div ref={containerRef} style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: 10 }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid rgba(255,255,255,0.06)', paddingBottom:0 }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} id={`tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
                  style={{ display:'flex', alignItems:'center', gap:6, padding:'12px 18px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:activeTab===tab.id?600:400,
                    color: activeTab===tab.id?'#818cf8':'#64748b',
                    borderBottom: activeTab===tab.id?'2px solid #6366f1':'2px solid transparent',
                    marginBottom:-1, transition:'all 0.2s' }}>
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>

          {content && (
            <div>
              {activeTab === 'notes' && (
                <div>
                  {content.introduction && (
                  <div className="glass-card" style={{ padding:24, marginBottom:20, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h3 style={{ color:'#818cf8', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:12, textTransform:'uppercase' }}>Introduction</h3>
                    <p style={{ color:'#cbd5e1', lineHeight:1.8, fontSize: 14.5 }}>{content.introduction}</p>
                  </div>
                  )}
                  
                  {content.detailedExplanation && (
                  <div className="glass-card" style={{ padding:24, marginBottom:20, border: '1px solid rgba(255,255,255,0.03)' }}>
                    <h3 style={{ color:'#818cf8', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:16, textTransform:'uppercase' }}>Detailed Explanation</h3>
                    <div className="content-body" style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: 14.5 }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(content.detailedExplanation) }}
                    />
                  </div>
                  )}

                  {content.concepts?.length > 0 && (
                    <div className="glass-card" style={{ padding:24, marginBottom:20, border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h3 style={{ color:'#818cf8', fontWeight:700, fontSize:'0.85rem', letterSpacing:'0.05em', marginBottom:12, textTransform:'uppercase' }}>Key Concepts</h3>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                        {content.concepts.map((c, i) => (
                          <span key={i} style={{ background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:8, padding:'6px 12px', color:'#a5b4fc', fontSize:13 }}>{c}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.revisionNotes && (
                    <div style={{ background:'linear-gradient(135deg,rgba(249,115,22,0.08),rgba(249,115,22,0.03))', border:'1px solid rgba(249,115,22,0.2)', borderRadius:14, padding:20 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <Star size={16} color="#f97316" fill="#f97316" />
                        <span style={{ color:'#f97316', fontWeight:700, fontSize:12, letterSpacing: '0.05em' }}>QUICK REVISION NOTES</span>
                      </div>
                      <p style={{ color:'#fed7aa', lineHeight:1.8, fontSize:14 }}>{content.revisionNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'facts' && (
                <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h3 style={{ color:'#ffffff', fontWeight:700, fontSize: 16, marginBottom:20 }}>Important Revision Facts</h3>
                  {content.importantFacts?.length > 0 ? content.importantFacts.map((f, i) => (
                    <div key={i} style={{ display:'flex', gap:12, padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ width:24, height:24, background:'rgba(99,102,241,0.15)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:800, color:'#818cf8' }}>{i+1}</div>
                      <p style={{ color:'#cbd5e1', lineHeight:1.7, fontSize:14.5 }}>{f}</p>
                    </div>
                  )) : <p style={{ color:'#64748b' }}>No key facts available for this subtopic yet.</p>}
                </div>
              )}

              {activeTab === 'tables' && (
                <div>
                  {content.tables?.length > 0 ? content.tables.map((table, i) => (
                    <div key={i} className="glass-card" style={{ padding:24, marginBottom:16, overflowX:'auto', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <h4 style={{ color:'#ffffff', fontWeight:700, fontSize: 15, marginBottom:16 }}>{table.title}</h4>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                          <tr>
                            {table.headers?.map((h, j) => (
                              <th key={j} style={{ background:'rgba(99,102,241,0.1)', color:'#818cf8', padding:'12px 14px', textAlign:'left', border:'1px solid rgba(99,102,241,0.15)', fontSize:13, fontWeight: 700 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows?.map((row, j) => (
                            <tr key={j} style={{ background: j % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                              {row.map((cell, k) => (
                                <td key={k} style={{ padding:'12px 14px', border:'1px solid rgba(255,255,255,0.04)', color:'#cbd5e1', fontSize:13.5 }}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )) : <p style={{ color:'#64748b', padding:24 }}>No tables available for this subtopic yet.</p>}
                </div>
              )}

              {activeTab === 'pyqs' && (
                <div>
                  <h3 style={{ color:'#ffffff', fontWeight:700, fontSize: 16, marginBottom:20 }}>Previous Year Solved Questions</h3>
                  {content.pyqs?.length > 0 ? content.pyqs.map((q, qi) => (
                    <PYQCard key={qi} q={q} index={qi} examName={exam} />
                  )) : <div className="glass-card" style={{ padding:32, textAlign:'center', color:'#64748b', border: '1px solid rgba(255,255,255,0.03)' }}>
                    <Star size={32} color="#1e293b" style={{ margin:'0 auto 12px' }} />
                    <p>PYQs for this subtopic are currently being added.</p>
                  </div>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Pane - Sticky Sidebar Outline & Related Topics */}
        <div style={{ position: 'sticky', top: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Scroll progress & status */}
          <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Session Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                <span>Reading Progress:</span>
                <span style={{ fontWeight: 700, color: '#818cf8' }}>{scrollProgress}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${scrollProgress}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', transition: 'width 0.2s ease-out', borderRadius: 3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                <span>Completion:</span>
                <span style={{ fontWeight: 700, color: completed ? '#4ade80' : '#f59e0b' }}>{completed ? '✓ Done' : 'In Progress'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8' }}>
                <span>Est. Read Time:</span>
                <span style={{ fontWeight: 700, color: '#94a3b8' }}>{readingTime} min</span>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          {content && (
          <div className="glass-card" style={{ padding: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: 12, marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Module Contents</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['📝', 'Facts', content.importantFacts?.length || 0],
                ['📊', 'Tables', content.tables?.length || 0],
                ['🎯', 'PYQs', content.pyqs?.length || 0],
                ['🔗', 'Related', content.relatedTopics?.length || 0],
              ].map(([icon, label, count]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <span style={{ color: '#64748b' }}>{icon} {label}</span>
                  <span style={{ fontWeight: 800, color: count > 0 ? '#818cf8' : '#334155', fontSize: 14 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Related Topics panel */}
          <div className="glass-card" style={{ padding: 20, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h4 style={{ color: '#ffffff', fontWeight: 700, fontSize: 13, marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Related Topics</h4>
            {content?.relatedTopics?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {content.relatedTopics.map((rel, idx) => (
                  <button key={idx} onClick={() => onNavigateToRelated(rel)}
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px', color: '#cbd5e1', fontSize: 12, textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 6, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#818cf8'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                    <Link2 size={13} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 600, display: 'block', fontSize: 11, color: '#94a3b8' }}>{rel.subject}</span>
                      {rel.subtopic}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: 12 }}>No linked topics for this module.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PYQCard({ q, index, examName }) {
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);
  const examColor = EXAM_COLORS[examName] || '#6366f1';
  return (
    <div className="glass-card" style={{ padding:24, marginBottom:16, border: '1px solid rgba(255,255,255,0.03)' }}>
      <div style={{ display:'flex', gap:10, marginBottom:16, alignItems: 'center', flexWrap:'wrap' }}>
        <span style={{ background:'rgba(99,102,241,0.15)', color:'#818cf8', borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700 }}>PYQ {index+1}</span>
        {q.year && <span style={{ background:`${examColor}1a`, color:examColor, borderRadius:6, padding:'3px 10px', fontSize:11, fontWeight:700 }}>{examName} {q.year}</span>}
        {selected !== null && !revealed && <span style={{ color:'#f59e0b', fontSize:11, fontWeight:600 }}>Option {String.fromCharCode(65+selected)} selected</span>}
      </div>
      <p style={{ color:'#e2e8f0', lineHeight:1.75, marginBottom:q.question?.hi?10:18, fontWeight:500, fontSize: 14.5 }}>{q.question?.en}</p>
      
      {q.question?.hi && (
        <p style={{ color:'#94a3b8', lineHeight:1.75, marginBottom:18, fontStyle: 'italic', fontSize: 13.5, borderLeft:'2px solid rgba(255,255,255,0.06)', paddingLeft:10 }}>
          {q.question?.hi}
        </p>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:18 }}>
        {q.options?.map((opt, i) => (
          <button key={i} className={`option-btn ${revealed ? (i===q.answer?'correct':selected===i?'wrong':'') : selected===i?'selected':''}`}
            onClick={() => !revealed && setSelected(i)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderRadius: 8, fontSize: 13.5, textAlign: 'left' }}>
            <span style={{ width:24, height:24, borderRadius:'50%', border:'1px solid currentColor', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:800, marginTop:1 }}>
              {String.fromCharCode(65+i)}
            </span>
            <div style={{ flex:1 }}>
              <div>{opt.en}</div>
              {opt.hi && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opt.hi}</div>}
            </div>
            {revealed && i === q.answer && <CheckCircle size={16} color="#22c55e" style={{ flexShrink:0, marginTop:3 }} />}
          </button>
        ))}
      </div>
      {!revealed ? (
        <button id={`pyq-reveal-${index}`} className="btn-secondary" style={{ fontSize:13, padding:'10px 20px', fontWeight: 600, display:'flex', alignItems:'center', gap:6 }} onClick={() => setRevealed(true)}>
          <Zap size={14} color="#f59e0b" /> Show Answer & Explanation
        </button>
      ) : (
        <div style={{ background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, padding:18, marginTop:10 }}>
          <div style={{ color:'#22c55e', fontWeight:700, fontSize:13.5, marginBottom:8 }}>✓ Correct Answer: Option {String.fromCharCode(65+q.answer)}</div>
          {q.explanation?.en && (
            <p style={{ color:'#a7f3d0', fontSize:13.5, lineHeight:1.7 }}>
              <strong style={{ color: '#ffffff' }}>Explanation:</strong> {q.explanation.en}
            </p>
          )}
          {q.explanation?.hi && (
            <p style={{ color:'#86efac', fontSize:13, lineHeight:1.6, marginTop: 8, borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:8, fontStyle: 'italic' }}>
              {q.explanation.hi}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function LearnHub() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [syllabus, setSyllabus] = useState(null);
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [view, setView] = useState('exams');
  const [reading, setReading] = useState(null);
  const [loadingExams, setLoadingExams] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const openContent = (subjectName, topicName, subtopic) => {
    setReading({ exam: selectedExam.id, subject: subjectName, topic: topicName, subtopic });
    setView('content');
  };

  const handleNavigateRelated = (rel) => {
    // Navigate to a related topic within the reader
    setReading({
      exam: rel.exam || selectedExam.id,
      subject: rel.subject,
      topic: rel.topic,
      subtopic: rel.subtopic
    });
    // Ensure view is content
    setView('content');
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
            // If the query matches the topic name, return all subtopics, otherwise return only filtered
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
      <div style={{ padding:'28px 24px', maxWidth:1200, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
          {view !== 'exams' && (
            <button onClick={() => { setView(view==='content'?'syllabus':'exams'); setReading(null); setSearchQuery(''); }} className="btn-secondary" style={{ padding:'8px 14px', fontSize:13 }}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <div>
            <h1 style={{ fontSize:'1.6rem', fontWeight:800, color:'#e2e8f0', display:'flex', alignItems:'center', gap:10, fontFamily:'Outfit,sans-serif' }}>
              <BookOpen size={24} color="#818cf8" /> Learn Hub
            </h1>
            <p style={{ color:'#64748b', fontSize:13, marginTop:2 }}>
              {view==='exams' ? 'Choose your exam track to load study notes' :
               view==='syllabus' ? `${selectedExam?.name} — Select a syllabus topic` : 'Bilingual Study Module'}
            </p>
          </div>
        </div>

        {/* Exam Selector */}
        {view === 'exams' && (
          loadingExams ? (
            <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
              <div style={{ width:36, height:36, border:'3px solid rgba(99,102,241,0.3)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(250px, 1fr))', gap:20 }}>
              {exams.map(exam => <ExamCard key={exam.id} exam={exam} onSelect={selectExam} />)}
            </div>
          )
        )}

        {/* Syllabus Tree View */}
        {view === 'syllabus' && (
          <div style={{ maxWidth:800 }}>
            {/* Search across syllabus */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <input
                type="text"
                placeholder="Search subjects, topics, or subtopics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-glass"
                style={{ width: '100%', paddingLeft: 40, py: 12 }}
              />
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            {!syllabus ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}>
                <div style={{ width:36, height:36, border:'3px solid rgba(99,102,241,0.3)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="glass-card" style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p>No matches found for "{searchQuery}"</p>
              </div>
            ) : (
              filteredSubjects.map(subject => (
                <div key={subject.name} className="glass-card" style={{ padding:0, marginBottom:12, overflow:'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
                  <button id={`subj-${subject.name.replace(/\s/g,'-').toLowerCase()}`}
                    onClick={() => setExpandedSubject(expandedSubject===subject.name ? null : subject.name)}
                    style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12, padding:'18px 20px', color:'#e2e8f0', textAlign:'left' }}>
                    <BookOpen size={18} color="#818cf8" />
                    <span style={{ flex:1, fontWeight:700, fontSize:15, fontFamily:'Outfit,sans-serif' }}>{subject.name}</span>
                    <span style={{ color:'#64748b', fontSize:12 }}>{subject.topics?.length} topics</span>
                    {expandedSubject===subject.name ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
                  </button>

                  {(expandedSubject===subject.name || searchQuery) && subject.topics?.map(topic => (
                    <div key={topic.name} style={{ borderTop:'1px solid rgba(255,255,255,0.04)' }}>
                      <button id={`topic-${topic.name.replace(/\s/g,'-').toLowerCase()}`}
                        onClick={() => setExpandedTopic(expandedTopic===topic.name ? null : topic.name)}
                        style={{ width:'100%', background:'rgba(255,255,255,0.01)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:12, padding:'14px 20px 14px 44px', color:'#cbd5e1', textAlign:'left' }}>
                        <span style={{ flex:1, fontSize:14, fontWeight: 600 }}>{topic.name}</span>
                        <span style={{ color:'#64748b', fontSize:11 }}>{topic.subtopics?.length} subtopics</span>
                        {expandedTopic===topic.name ? <ChevronDown size={14} color="#64748b" /> : <ChevronRight size={14} color="#64748b" />}
                      </button>

                      {(expandedTopic===topic.name || searchQuery) && topic.subtopics?.map(subtopic => (
                        <button key={subtopic} id={`subtopic-${subtopic.replace(/\s/g,'-').toLowerCase().substring(0,20)}`}
                          onClick={() => openContent(subject.name, topic.name, subtopic)}
                          style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, padding:'12px 20px 12px 64px', color:'#94a3b8', textAlign:'left', fontSize:13.5, borderTop:'1px solid rgba(255,255,255,0.02)', transition:'all 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background='rgba(99,102,241,0.06)'; e.currentTarget.style.color='#a5b4fc'; e.currentTarget.style.paddingLeft='70px'; }}
                          onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.paddingLeft='64px'; }}>
                          <ChevronRight size={12} style={{ flexShrink:0, opacity: 0.5 }} />
                          <span style={{ flex:1 }}>{subtopic}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Content Reader */}
        {view === 'content' && reading && (
          <ContentReader {...reading} onBack={() => { setView('syllabus'); setReading(null); }} onNavigateToRelated={handleNavigateRelated} />
        )}
      </div>
    </AppLayout>
  );
}
