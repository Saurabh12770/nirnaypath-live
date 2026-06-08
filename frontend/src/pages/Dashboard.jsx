import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Target, TrendingUp, BookOpen, FlaskConical, ChevronRight, Award, AlertTriangle, Activity, Clock, Bookmark, Trash2, Calendar, LayoutDashboard } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sub, color, accent }) {
  return (
    <div className={`stat-card ${color}`} style={{ border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
        <div style={{ width:40, height:40, background:`rgba(${accent},0.12)`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={18} color={`rgb(${accent})`} />
        </div>
      </div>
      <div style={{ fontSize:'1.8rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit,sans-serif', lineHeight:1 }}>{value}</div>
      <div style={{ color:'#94a3b8', fontSize:13, marginTop:8, fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color:'#64748b', fontSize:11, marginTop:4 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'bookmarks'

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
      // Navigate to LearnHub content reading mode
      navigate(`/learn`); // The user can select it from the sidebar or we can redirect to a direct reader view
    }
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <div style={{ textAlign:'center' }}>
          <div style={{ width:48, height:48, border:'3px solid rgba(99,102,241,0.3)', borderTop:'3px solid #6366f1', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }} />
          <p style={{ color:'#818cf8', fontWeight: 600 }}>Loading dashboard summary...</p>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      </div>
    </AppLayout>
  );

  const s = stats || {};

  // Generating mock activity data for 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Give some random activity intensity
    const intensity = i % 4 === 0 ? 0 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 2;
    return { date: d, intensity };
  }).reverse();

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return 'rgba(255,255,255,0.03)';
    if (intensity === 1) return 'rgba(99,102,241,0.2)';
    if (intensity === 2) return 'rgba(99,102,241,0.5)';
    return '#6366f1';
  };

  return (
    <AppLayout>
      <div style={{ padding:'28px 24px', maxWidth:1200, margin:'0 auto' }}>

        {/* Welcome Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize:'1.8rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit,sans-serif' }}>
              👋 Welcome back, {user?.name?.split(' ')[0]}!
            </h1>
            <p style={{ color:'#64748b', marginTop:4, fontSize: 13.5 }}>Here's your learning and assessment summary</p>
          </div>

          {/* Tab Selection */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: 4 }}>
            <button onClick={() => setActiveTab('overview')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'overview' ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTab === 'overview' ? '#818cf8' : '#94a3b8' }}>
              <LayoutDashboard size={14} /> Overview
            </button>
            <button onClick={() => setActiveTab('bookmarks')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === 'bookmarks' ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: activeTab === 'bookmarks' ? '#818cf8' : '#94a3b8' }}>
              <Bookmark size={14} /> Bookmarks ({bookmarks.length})
            </button>
          </div>
        </div>

        {activeTab === 'overview' ? (
          <>
            {/* Quick Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16, marginBottom:32, maxWidth:700 }}>
              <Link to="/learn" id="dash-goto-learn" style={{ textDecoration:'none' }}>
                <div style={{ background:'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08))', border:'1px solid rgba(99,102,241,0.2)', borderRadius:16, padding:20, cursor:'pointer', transition:'all 0.3s', display:'flex', gap:14, alignItems:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(99,102,241,0.2)'; e.currentTarget.style.transform='none'; }}>
                  <div style={{ width:44, height:44, background:'rgba(99,102,241,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <BookOpen size={22} color="#818cf8" />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#f8fafc', fontSize:15, fontFamily:'Outfit,sans-serif' }}>Learn Hub</div>
                    <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>Hierarchical study notes & PYQs</div>
                  </div>
                </div>
              </Link>
              <Link to="/test" id="dash-goto-test" style={{ textDecoration:'none' }}>
                <div style={{ background:'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(239,68,68,0.08))', border:'1px solid rgba(249,115,22,0.2)', borderRadius:16, padding:20, cursor:'pointer', transition:'all 0.3s', display:'flex', gap:14, alignItems:'center' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(249,115,22,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(249,115,22,0.2)'; e.currentTarget.style.transform='none'; }}>
                  <div style={{ width:44, height:44, background:'rgba(249,115,22,0.15)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FlaskConical size={22} color="#f97316" />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#f8fafc', fontSize:15, fontFamily:'Outfit,sans-serif' }}>Test Center</div>
                    <div style={{ color:'#64748b', fontSize:12, marginTop:2 }}>Targeted mock exams & palettes</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Stats Cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20, marginBottom:32 }}>
              <StatCard icon={FlaskConical} label="Tests Completed" value={s.testsAttempted ?? 0} sub="Topic and Full-Mock attempts" color="indigo" accent="99,102,241" />
              <StatCard icon={Target} label="Average Accuracy" value={`${(s.accuracy ?? 0).toFixed(0)}%`} sub="Overall performance rating" color="orange" accent="249,115,22" />
              <StatCard icon={BookOpen} label="Learning Progress" value={`${(s.learningProgress ?? 0).toFixed(0)}%`} sub="Syllabus subtopics completed" color="teal" accent="20,184,166" />
              <StatCard icon={Award} label="Mastered Topics" value={s.strongTopics?.length ?? 0} sub="Accuracy rate above 70%" color="green" accent="34,197,94" />
            </div>

            {/* Grid for Topics Analysis, Activities & Heatmap */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:24, marginBottom:32 }}>

              {/* Topic Strengths Analysis */}
              <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.03)' }}>
                <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 15, fontFamily:'Outfit,sans-serif' }}>
                  <Activity size={18} color="#818cf8" /> Topic Strengths & Weaknesses
                </h3>
                <div style={{ marginBottom:20 }}>
                  <div style={{ color:'#4ade80', fontSize:11, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:6, letterSpacing: '0.05em' }}>
                    <Award size={14} /> STRONG TOPICS (ACCURACY ≥ 70%)
                  </div>
                  {s.strongTopics?.length > 0 ? s.strongTopics.map(t => (
                    <div key={t} style={{ background:'rgba(34,197,94,0.07)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:8, padding:'8px 12px', marginBottom:6, color:'#a7f3d0', fontSize:13 }}>
                      ✓ {t}
                    </div>
                  )) : <div style={{ color:'#64748b', fontSize:13 }}>Complete topic tests to evaluate strengths.</div>}
                </div>
                <div>
                  <div style={{ color:'#f87171', fontSize:11, fontWeight:700, marginBottom:10, display:'flex', alignItems:'center', gap:6, letterSpacing: '0.05em' }}>
                    <AlertTriangle size={14} /> WEAK TOPICS (ACCURACY &lt; 70%)
                  </div>
                  {s.weakTopics?.length > 0 ? s.weakTopics.map(t => (
                    <div key={t} style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:8, padding:'8px 12px', marginBottom:6, color:'#fca5a5', fontSize:13 }}>
                      ✗ {t}
                    </div>
                  )) : <div style={{ color:'#64748b', fontSize:13 }}>No weak topics identified yet. Keep it up!</div>}
                </div>
              </div>

              {/* Recent Test Activities */}
              <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.03)' }}>
                <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 15, fontFamily:'Outfit,sans-serif' }}>
                  <Clock size={18} color="#818cf8" /> Recent Test Logs
                </h3>
                {s.recentActivity?.length > 0 ? s.recentActivity.map(a => (
                  <div key={a.id} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <FlaskConical size={14} color="#818cf8" />
                    </div>
                    <div style={{ minWidth:0, flex: 1 }}>
                      <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.label}</div>
                      <div style={{ color:'#64748b', fontSize:11, marginTop:2 }}>{new Date(a.date).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</div>
                    </div>
                    {a.meta?.accuracy !== undefined && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <span style={{ color: a.meta.accuracy >= 70 ? '#4ade80' : '#fb923c', fontWeight:800, fontSize:13.5 }}>
                          {a.meta.accuracy.toFixed(0)}%
                        </span>
                        <span style={{ fontSize: 9, color: '#64748b' }}>Accuracy</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div style={{ textAlign:'center', padding:'36px 0', color:'#64748b' }}>
                    <FlaskConical size={32} color="#1e293b" style={{ margin:'0 auto 12px' }} />
                    <p style={{ fontSize:13 }}>No tests recorded yet.</p>
                    <Link to="/test" style={{ color:'#818cf8', fontSize:13, textDecoration:'none', marginTop:8, display:'inline-block', fontWeight: 600 }}>
                      Start mock test →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Study Activity Heatmap & Performance Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: s.performanceTrend?.length > 1 ? '1fr 1fr' : '1fr', gap: 24, marginBottom: 32 }}>
              
              {/* Daily Progress Heatmap */}
              <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.03)' }}>
                <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 15, fontFamily:'Outfit,sans-serif' }}>
                  <Calendar size={18} color="#818cf8" /> Practice Activity (Last 30 Days)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 8, maxWidth: 450 }}>
                  {last30Days.map((day, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: getHeatmapColor(day.intensity), borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.02)' }}
                      title={`${day.date.toDateString()}: ${day.intensity === 0 ? 'No activity' : day.intensity === 1 ? 'Read notes' : day.intensity === 2 ? 'Completed Topic Test' : 'Completed Full Mock Test'}`} />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16, fontSize: 11, color: '#64748b', alignItems: 'center' }}>
                  <span>Less Active</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(0), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(1), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(2), borderRadius: 2 }} />
                    <div style={{ width: 10, height: 10, background: getHeatmapColor(3), borderRadius: 2 }} />
                  </div>
                  <span>More Active</span>
                </div>
              </div>

              {/* Accuracy Trend Chart */}
              {s.performanceTrend?.length > 1 && (
                <div className="glass-card" style={{ padding:24, border: '1px solid rgba(255,255,255,0.03)' }}>
                  <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 15, fontFamily:'Outfit,sans-serif' }}>
                    <TrendingUp size={18} color="#818cf8" /> Performance Progression
                  </h3>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-end', height:110, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                    {s.performanceTrend.map((p, i) => (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, height: '100%', justifyContent: 'flex-end' }}>
                        <div style={{ width:'100%', background:`linear-gradient(180deg, ${p.accuracy>=70?'#6366f1':'#f97316'}, rgba(99,102,241,0.05))`, borderRadius:'4px 4px 0 0', height: `${Math.max(10, p.accuracy)}%`, transition:'height 0.3s' }} />
                        <div style={{ fontSize:10, color:'#64748b', whiteSpace:'nowrap' }}>{p.date}</div>
                        <div style={{ fontSize:11, color: p.accuracy>=70?'#4ade80':'#fb923c', fontWeight:700 }}>{p.accuracy}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Bookmarks View */
          <div className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.03)' }}>
            <h3 style={{ fontWeight:700, color:'#f8fafc', marginBottom:20, display:'flex', alignItems:'center', gap:8, fontSize: 15, fontFamily:'Outfit,sans-serif' }}>
              <Bookmark size={18} color="#818cf8" /> Bookmarked Material
            </h3>
            {bookmarks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
                <Bookmark size={36} color="#1e293b" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 14 }}>No study notes or questions bookmarked yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>Bookmarks help save key topics for rapid access later.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} onClick={() => handleBookmarkClick(bookmark)}
                    style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: bookmark.type === 'content' ? 'pointer' : 'default', transition: 'all 0.2s' }}
                    onMouseEnter={e => { if (bookmark.type==='content') e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                    onMouseLeave={e => { if (bookmark.type==='content') e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ background: bookmark.type === 'content' ? 'rgba(99,102,241,0.15)' : 'rgba(249,115,22,0.12)', color: bookmark.type === 'content' ? '#818cf8' : '#f97316', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
                          {bookmark.type === 'content' ? 'Study Note' : 'Question'}
                        </span>
                        {bookmark.details?.exam && <span style={{ color: '#64748b', fontSize: 11 }}>{bookmark.details.exam}</span>}
                        {bookmark.details?.subject && <span style={{ color: '#64748b', fontSize: 11 }}>• {bookmark.details.subject}</span>}
                      </div>
                      <h4 style={{ color: '#e2e8f0', fontWeight: 600, fontSize: 14.5 }}>{bookmark.details?.title}</h4>
                      {bookmark.details?.subtopic && <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Subtopic: {bookmark.details.subtopic}</p>}
                    </div>

                    <button onClick={(e) => removeBookmark(e, bookmark.id)} className="btn-secondary"
                      style={{ padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 8 }}
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
