import { useState } from 'react';
import { BookOpen, FlaskConical, Trophy, Target, Users, Star, ArrowRight, X, Eye, EyeOff, GraduationCap, Zap, Shield, MessageSquare, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  { icon: BookOpen, color: '#6366f1', label: 'Learn Hub', desc: 'Structured study notes, facts, and tables organized hierarchically for rapid retention. Integrated with real exam PYQs.' },
  { icon: FlaskConical, color: '#a855f7', label: 'Mock Tests', desc: 'Attempt topic-wise, subject-wise, or full-length mock examinations with a real-time exam console and grading.' },
  { icon: Trophy, color: '#f59e0b', label: 'Weakness Analysis', desc: 'Understand exactly where you lose marks. Our dashboard pinpoints your topic-wise strengths and weaknesses.' },
  { icon: Target, color: '#14b8a6', label: 'Practice Mode', desc: 'Filter from over 1.3 Lakh questions by exam, subject, or difficulty level to drill down on target topics.' },
];

const EXAMS = [
  { name: 'UPSC Civil Services', id: 'upsc', icon: '🏛️', color: '#6366f1', desc: 'Union Public Service Commission - IAS/IPS' },
  { name: 'BPSC State Services', id: 'bpsc', icon: '🏢', color: '#a855f7', desc: 'Bihar Public Service Commission' },
  { name: 'SSC CGL', id: 'ssc-cgl', icon: '📋', color: '#f59e0b', desc: 'Combined Graduate Level Exam' },
  { name: 'SSC CHSL', id: 'ssc-chsl', icon: '📝', color: '#14b8a6', desc: 'Combined Higher Secondary Level' },
  { name: 'Railway RRB', id: 'railway', icon: '🚂', color: '#22c55e', desc: 'NTPC and Group D Recruitment' },
  { name: 'Banking Exams', id: 'banking', icon: '🏦', color: '#06b6d4', desc: 'SBI/IBPS PO & Clerk' },
  { name: 'State PCS', id: 'state-pcs', icon: '🗺️', color: '#ec4899', desc: 'UPPCS, MPPCS, and other state tracks' },
];

const STATS = [
  { value: '1,34,861', label: 'Practice Questions', desc: 'Seeded & Verified', icon: '📚' },
  { value: '7 Major', label: 'National & State Exams', desc: 'Fully Mapped Syllabus', icon: '🎯' },
  { value: '100% Free', label: 'High Quality Education', desc: 'No Hidden Charges', icon: '✨' },
  { value: 'Bilingual', label: 'English & Hindi Medium', desc: 'Both Languages Supported', icon: '🌐' },
];

const TESTIMONIALS = [
  {
    name: 'Anjali Sharma',
    role: 'UPSC Aspirant (Cleared Prelims 2025)',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    content: 'The Learn Hub was a lifesaver. Having detailed notes connected directly to the previous years questions made revision extremely efficient. Highly recommend the bilingual toggle!',
    stars: 5,
  },
  {
    name: 'Rahul Mishra',
    role: 'BPSC Rank 42',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    content: 'The weakness analysis in the dashboard pointed out that my General Science section was bringing down my scores. I polished it using Topic Tests and cleared BPSC on my first attempt!',
    stars: 5,
  },
  {
    name: 'Siddharth Roy',
    role: 'SSC CGL Selected (Excise Inspector)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    content: 'Unbeatable speed and question variety. The mock test UI is identical to the actual exam server, which helped reduce my exam-day anxiety significantly.',
    stars: 5,
  },
];

const FAQS = [
  {
    q: 'Is NirnayPath really 100% free?',
    a: 'Yes, NirnayPath is completely free. We do not have any hidden subscription plans, premium lockouts, or ads. All 1.3L+ questions and study guides are open to all registered aspirants.'
  },
  {
    q: 'Does the platform support Hindi medium?',
    a: 'Absolutely. NirnayPath is built from the ground up as a bilingual platform. In the Learn Hub and Test Center, you can toggle between English and Hindi content instantly.'
  },
  {
    q: 'How accurate are the question banks?',
    a: 'Our database contains over 1,34,861 questions sourced directly from previous years papers and standard references. Every question has been normalized for difficulty and verified by our system.'
  },
  {
    q: 'How does the weakness tracking work?',
    a: 'Every time you finish a topic test or mock test, the platform calculates your accuracy rate for that specific topic. Your dashboard aggregates this data to show a visual rating of your strong and weak topics.'
  }
];

function AuthModal({ mode, onClose, onSwitch }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div className="modal-box glass-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440, width: '90%', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:20, right:20, background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:4 }}>
          <X size={20} />
        </button>

        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:48, height:48, background:'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <GraduationCap size={24} color="white" />
          </div>
          <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:'#f8fafc' }}>
            {mode === 'login' ? 'Welcome Back' : 'Start Your Journey'}
          </h2>
          <p style={{ color:'#94a3b8', fontSize:13, marginTop:4 }}>
            {mode === 'login' ? 'Sign in to access your dashboard' : 'Create a free account to track your progress'}
          </p>
        </div>

        {error && (
          <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, padding:'10px 14px', marginBottom:18, color:'#fca5a5', fontSize:13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em' }}>FULL NAME</label>
              <input id="reg-name" className="input-glass" type="text" placeholder="Enter your name" required
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%' }} />
            </div>
          )}
          <div>
            <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em' }}>EMAIL ADDRESS</label>
            <input id="auth-email" className="input-glass" type="email" placeholder="student@nirnaypath.local" required
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display:'block', color:'#94a3b8', fontSize:11, fontWeight:600, marginBottom:6, letterSpacing:'0.05em' }}>PASSWORD</label>
            <div style={{ position:'relative' }}>
              <input id="auth-password" className="input-glass" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                style={{ paddingRight:44, width: '100%' }}
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#94a3b8', cursor:'pointer', display:'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button id="auth-submit" className="btn-primary" type="submit" disabled={loading}
            style={{ marginTop:8, width: '100%', justifyContent:'center', py: 12, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Sign Up Free'}
          </button>
        </form>

        <p style={{ textAlign:'center', color:'#94a3b8', fontSize:13, marginTop:20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={onSwitch}
            style={{ background:'none', border:'none', color:'#818cf8', cursor:'pointer', fontWeight:600, fontSize:13, padding:0, marginLeft:4 }}>
            {mode === 'login' ? 'Create one' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [modal, setModal] = useState(null);
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="page-container" style={{ background: '#0b0f19', color: '#f1f5f9', minHeight:'100vh', paddingBottom: 0 }}>
      {/* Animated background orbs */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        <div className="bg-orb" style={{ position:'absolute', top:'5%', left:'10%', width:500, height:500, background:'rgba(99,102,241,0.12)', borderRadius:'50%', filter:'blur(100px)' }} />
        <div className="bg-orb" style={{ position:'absolute', top:'45%', right:'5%', width:400, height:400, background:'rgba(168,85,247,0.1)', borderRadius:'50%', filter:'blur(90px)' }} />
        <div className="bg-orb" style={{ position:'absolute', bottom:'10%', left:'30%', width:350, height:350, background:'rgba(20,184,166,0.06)', borderRadius:'50%', filter:'blur(80px)' }} />
      </div>

      {/* Navbar */}
      <nav style={{ position:'sticky', top: 0, zIndex:50, backdropFilter: 'blur(12px)', background: 'rgba(11, 15, 25, 0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1240, margin:'0 auto', padding:'0 24px', height:72, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, background:'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}>
              <GraduationCap size={22} color="white" />
            </div>
            <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.3rem', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #f8fafc, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NirnayPath</span>
            <span style={{ fontSize: 9, background: 'rgba(99,102,241,0.15)', color: '#818cf8', padding: '2px 6px', borderRadius: 4, fontWeight: 700, letterSpacing: '0.05em' }}>V3.0</span>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button id="nav-login" className="btn-secondary" onClick={() => setModal('login')} style={{ fontSize: 14, fontWeight: 600 }}>Sign In</button>
            <button id="nav-register" className="btn-primary" onClick={() => setModal('register')} style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              Get Started <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ maxWidth:1240, margin:'0 auto', padding:'100px 24px 80px', textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.25)', borderRadius:999, padding:'8px 18px', marginBottom:32, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <Zap size={14} color="#818cf8" />
          <span style={{ color:'#c7d2fe', fontSize:13, fontWeight:600, letterSpacing: '0.02em' }}>Bilingual Indian Civil & Government Exam Prep</span>
        </div>

        <h1 style={{ fontSize:'clamp(2.5rem, 7vw, 4.5rem)', fontWeight:900, lineHeight:1.05, marginBottom:28, fontFamily:'Outfit, sans-serif', letterSpacing: '-0.03em' }}>
          <span style={{ color:'#f8fafc' }}>Simplify Your </span>
          <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #6366f1, #c084fc, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Exam Preparation</span>
          <br />
          <span style={{ color:'#f8fafc' }}>Empower Your Journey</span>
        </h1>

        <p style={{ fontSize:'1.15rem', color:'#94a3b8', maxWidth:660, margin:'0 auto 48px', lineHeight:1.75 }}>
          Master UPSC, BPSC, SSC, Railway, and Banking syllabi with deeply structured notes, live performance tracking, and 1.3 Lakh+ verified practice questions. Completely free.
        </p>

        <div style={{ display:'flex', gap:18, justifyContent:'center', flexWrap:'wrap' }}>
          <button id="hero-learn" className="btn-primary" onClick={() => setModal('register')}
            style={{ padding:'16px 36px', fontSize:'1.05rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            <BookOpen size={20} /> Access Learn Hub
          </button>
          <button id="hero-test" className="btn-orange" onClick={() => setModal('register')}
            style={{ padding:'16px 36px', fontSize:'1.05rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(249,115,22,0.3)' }}>
            <FlaskConical size={20} /> Take Free Mock Test
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:24, maxWidth:1000, margin:'88px auto 0' }}>
          {STATS.map((s, idx) => (
            <div key={idx} className="glass-card" style={{ padding:'28px 24px', textAlign:'left', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: 16, top: 16, fontSize: '1.8rem', opacity: 0.2 }}>{s.icon}</div>
              <div style={{ fontSize:'2.2rem', fontWeight:900, color:'#ffffff', fontFamily:'Outfit,sans-serif', letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#e2e8f0' }}>{s.label}</div>
              <div style={{ fontSize:12, color:'#64748b' }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ maxWidth:1240, margin:'0 auto', padding:'60px 24px 80px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h2 style={{ fontSize:'2.2rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit, sans-serif' }}>Comprehensive Features</h2>
          <p style={{ color:'#64748b', fontSize: 16, marginTop: 8 }}>Everything you need to successfully clear government examinations</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(270px, 1fr))', gap:28 }}>
          {FEATURES.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-card" style={{ padding:32, display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width:48, height:48, background:`${f.color}15`, border: `1px solid ${f.color}30`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <Icon size={22} color={f.color} />
                </div>
                <h3 style={{ fontSize:'1.15rem', fontWeight:700, color:'#f8fafc', marginBottom:10 }}>{f.label}</h3>
                <p style={{ color:'#94a3b8', fontSize:14, lineHeight:1.6, flexGrow: 1 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Exam Tracks Section */}
      <section style={{ background: 'rgba(15,23,42,0.4)', borderY: '1px solid rgba(255,255,255,0.02)', padding:'80px 24px', position:'relative', zIndex:1 }}>
        <div style={{ maxWidth:1240, margin:'0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <h2 style={{ fontSize:'2.2rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit, sans-serif' }}>Choose Your Exam Track</h2>
            <p style={{ color:'#64748b', fontSize: 16, marginTop: 8 }}>Access specialized syllabus hierarchies mapped dynamically for each exam</p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {EXAMS.map((exam, idx) => (
              <div key={idx} className="glass-card" style={{ padding: 24, border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'all 0.25s ease' }}
                onClick={() => setModal('register')}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ fontSize: '2.2rem', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>{exam.icon}</div>
                <div>
                  <h4 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 15 }}>{exam.name}</h4>
                  <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{exam.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth:1240, margin:'0 auto', padding:'80px 24px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h2 style={{ fontSize:'2.2rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit, sans-serif' }}>Student Success Stories</h2>
          <p style={{ color:'#64748b', fontSize: 16, marginTop: 8 }}>Hear from aspirants who prepared with NirnayPath</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:28 }}>
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="glass-card" style={{ padding:32, border: '1px solid rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', gap: 2, color: '#f59e0b' }}>
                {[...Array(t.stars)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" />)}
              </div>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, fontStyle: 'italic', flexGrow: 1 }}>
                "{t.content}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#818cf8' }}>
                  {t.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h4 style={{ color: '#f8fafc', fontWeight: 700, fontSize: 14 }}>{t.name}</h4>
                  <p style={{ color: '#64748b', fontSize: 12 }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section style={{ maxWidth:800, margin:'0 auto', padding:'40px 24px 100px', position:'relative', zIndex:1 }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontSize:'2.2rem', fontWeight:800, color:'#f8fafc', fontFamily:'Outfit, sans-serif' }}>Frequently Asked Questions</h2>
          <p style={{ color:'#64748b', fontSize: 16, marginTop: 8 }}>Have questions? We have answers</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FAQS.map((faq, idx) => (
            <div key={idx} className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
              <button onClick={() => toggleFaq(idx)} style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#f8fafc' }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{faq.q}</span>
                <ChevronDown size={18} style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease', color: '#64748b' }} />
              </button>
              <div style={{ maxHeight: activeFaq === idx ? 200 : 0, transition: 'max-height 0.3s ease', overflow: 'hidden', background: 'rgba(255,255,255,0.01)' }}>
                <p style={{ padding: '0 24px 20px', color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background:'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, rgba(168,85,247,0.05) 100%)', borderTop:'1px solid rgba(255,255,255,0.03)', padding:'80px 24px', position:'relative', zIndex:1, textAlign: 'center' }}>
        <div style={{ maxWidth:680, margin:'0 auto' }}>
          <div style={{ display: 'inline-flex', padding: 10, background: 'rgba(99,102,241,0.1)', borderRadius: 16, marginBottom: 20 }}>
            <Shield size={36} color="#818cf8" />
          </div>
          <h2 style={{ fontSize:'2.4rem', fontWeight:800, color:'#f8fafc', marginBottom:16, fontFamily: 'Outfit, sans-serif' }}>Ready to Ace Your Exams?</h2>
          <p style={{ color:'#94a3b8', fontSize: 16, marginBottom: 36, lineHeight: 1.6 }}>
            Join thousands of serious aspirants preparing with the most detailed syllabus guides and comprehensive mock test consoles.
          </p>
          <button id="cta-start" className="btn-primary" onClick={() => setModal('register')}
            style={{ padding:'18px 48px', fontSize:'1.05rem', fontWeight: 700, boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            Start Preparing For Free <ArrowRight size={16} style={{ marginLeft: 6 }} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)', background: '#070a13', padding:'48px 24px 28px', color:'#64748b', fontSize:14, position:'relative', zIndex:1 }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 32, marginBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 300 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <GraduationCap size={18} color="white" />
              </div>
              <span style={{ fontFamily:'Outfit,sans-serif', fontWeight:800, fontSize:'1.15rem', color: '#f8fafc' }}>NirnayPath</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              A premium, open-source exam preparation platform hosting thousands of free bilingual practice questions and syllabus notes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 13, letterSpacing: '0.05em' }}>PRODUCTS</span>
              <a href="#" onClick={e=>{e.preventDefault(); setModal('register');}} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Learn Hub</a>
              <a href="#" onClick={e=>{e.preventDefault(); setModal('register');}} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Mock Test Center</a>
              <a href="#" onClick={e=>{e.preventDefault(); setModal('register');}} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Performance Tracker</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 13, letterSpacing: '0.05em' }}>LEGAL</span>
              <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Privacy Policy</a>
              <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Terms of Service</a>
              <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#64748b', textDecoration: 'none', fontSize: 13 }}>Contact Support</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign:'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 20, fontSize: 12 }}>
          © 2026 NirnayPath 3.0. Made for serious government exam preparation. All rights reserved.
        </div>
      </footer>

      {/* Auth Modals */}
      {modal && (
        <AuthModal
          mode={modal}
          onClose={() => setModal(null)}
          onSwitch={() => setModal(modal === 'login' ? 'register' : 'login')}
        />
      )}
    </div>
  );
}
