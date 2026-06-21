import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/Layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { User, FlaskConical, BookOpen, Target, Award, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

// ─── Stat Mini Card ───
function MiniStat({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background: 'var(--color-card-bg)', border: '1.5px solid var(--color-border-base)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: 'var(--shadow-card)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ width: 40, height: 40, background: `rgba(${color},0.12)`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={`rgb(${color})`} />
      </div>
      <div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', lineHeight: 1 }}>{value}</div>
        <div style={{ color: 'var(--color-text-muted-base)', fontSize: 12, marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, language } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwStatus, setPwStatus] = useState(null); // 'success' | 'error' | null
  const [pwMessage, setPwMessage] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const t = (en, hi) => language === 'hi' ? hi : en;

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/summary'),
      api.get('/tests/history')
    ]).then(([statsRes, historyRes]) => {
      setStats(statsRes.data.stats);
      setHistory(historyRes.data.history || []);
    }).catch(console.error).finally(() => setLoadingStats(false));
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      setPwStatus('error');
      setPwMessage(t('New passwords do not match.', 'नया पासवर्ड मेल नहीं खाता।'));
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwStatus('error');
      setPwMessage(t('Password must be at least 8 characters.', 'पासवर्ड कम से कम 8 अक्षरों का होना चाहिए।'));
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/password', { currentPassword: pwForm.current, newPassword: pwForm.newPw });
      setPwStatus('success');
      setPwMessage(t('Password updated successfully!', 'पासवर्ड सफलतापूर्वक अपडेट किया गया!'));
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (err) {
      setPwStatus('error');
      setPwMessage(err.response?.data?.message || t('Failed to update password.', 'पासवर्ड अपडेट नहीं हो सका।'));
    } finally {
      setPwLoading(false);
      setTimeout(() => setPwStatus(null), 4000);
    }
  };

  const [activeTab, setActiveTab] = useState('profile');

  const s = stats || {};
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';


  const SIDEBAR_MENUS = [
    { id: 'profile', label: t('Profile Info', 'प्रोफ़ाइल जानकारी'), icon: User },
    { id: 'security', label: t('Security', 'सुरक्षा'), icon: Lock },
    { id: 'notifications', label: t('Notifications', 'सूचनाएं'), icon: AlertCircle },
    { id: 'language', label: t('Language', 'भाषा'), icon: BookOpen },
    { id: 'danger', label: t('Delete Account', 'खाता हटाएं'), icon: AlertCircle, color: '#ef4444' }
  ];

  return (
    <AppLayout>
      <style>{`
        .performance-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .performance-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .performance-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .profile-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .profile-sidebar {
            position: static !important;
            display: flex;
            overflow-x: auto;
            padding: 12px !important;
            gap: 8px;
            scroll-snap-type: x mandatory;
            white-space: nowrap;
          }
          .profile-sidebar nav {
            flex-direction: row !important;
            width: 100%;
          }
          .profile-sidebar button {
            flex-shrink: 0;
            scroll-snap-align: start;
          }
          .profile-avatar-info {
            display: none !important;
          }
        }
      `}</style>
      <div className="profile-layout-grid" style={{ padding: '28px 24px', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 32, alignItems: 'start' }}>
        {/* Left Sidebar settings menu */}
        <div className="premium-card profile-sidebar" style={{ padding: '24px 16px', position: 'sticky', top: 100 }}>
          <div className="profile-avatar-info" style={{ padding: '0 16px', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 12, boxShadow: '0 8px 24px rgba(108,99,255,0.3)' }}>{initials}</div>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: 'var(--color-text-muted-base)', fontSize: 12 }}>{user?.email}</p>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SIDEBAR_MENUS.map(menu => {
              const isActive = activeTab === menu.id;
              const Icon = menu.icon;
              return (
                <button key={menu.id} onClick={() => setActiveTab(menu.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, border: 'none', background: isActive ? 'var(--color-card-hover)' : 'transparent', color: menu.color || (isActive ? 'var(--color-accent-primary)' : 'var(--color-text-base)'), fontWeight: isActive ? 800 : 600, fontSize: 13.5, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' }}>
                  <Icon size={18} />
                  {menu.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div style={{ minWidth: 0 }}>
          {activeTab === 'profile' && (
            <div className="anim-fade-in-up">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 24 }}>{t('Profile Information', 'प्रोफ़ाइल जानकारी')}</h2>
              
              <div className="premium-card" style={{ padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 16 }}>{t('Performance Overview', 'प्रदर्शन अवलोकन')}</h3>
                {loadingStats ? (
                  <div className="performance-grid" style={{ minWidth: 0, overflow: 'hidden' }}>
                    {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
                  </div>
                ) : (
                  <div className="performance-grid" style={{ minWidth: 0, overflow: 'hidden' }}>
                    <MiniStat icon={FlaskConical} label={t('Tests Taken', 'लिए गए टेस्ट')} value={s.testsAttempted ?? 0} color="124,58,237" />
                    <MiniStat icon={Target} label={t('Avg. Accuracy', 'औसत सटीकता')} value={`${(s.accuracy ?? 0).toFixed(0)}%`} color="249,115,22" />
                    <MiniStat icon={BookOpen} label={t('Topics Studied', 'पढ़े गए विषय')} value={`${(s.learningProgress ?? 0).toFixed(1)}%`} color="56,189,248" />
                    <MiniStat icon={Award} label={t('Strong Topics', 'मजबूत टॉपिक्स')} value={s.strongTopics?.length ?? 0} color="34,197,94" />
                  </div>
                )}
              </div>

              <div className="premium-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 16 }}>{t('Test History', 'टेस्ट इतिहास')}</h3>
                {history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-muted-base)' }}>
                    <FlaskConical size={28} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <p style={{ fontSize: 13 }}>{t('No tests yet. Start practicing!', 'अभी तक कोई टेस्ट नहीं। अभ्यास शुरू करें!')}</p>
                    <button onClick={() => navigate('/test')} className="btn-orange" style={{ marginTop: 12, fontSize: 12, padding: '8px 16px' }}>
                      {t('Take First Test', 'पहला टेस्ट दें')}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' }}>
                    {history.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border-base)', borderRadius: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: item.accuracy >= 70 ? 'rgba(34,197,94,0.12)' : item.accuracy >= 50 ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FlaskConical size={18} color={item.accuracy >= 70 ? '#22c55e' : item.accuracy >= 50 ? '#f97316' : '#ef4444'} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'var(--color-text-title-base)', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.exam} {item.testType?.replace('_', ' ').toUpperCase()}
                            {item.subject ? ` — ${item.subject}` : ''}
                          </div>
                          <div style={{ color: 'var(--color-text-muted-base)', fontSize: 12, marginTop: 4 }}>
                            {new Date(item.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 16, color: item.accuracy >= 70 ? '#22c55e' : item.accuracy >= 50 ? '#f97316' : '#ef4444' }}>
                            {item.accuracy.toFixed(0)}%
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted-base)' }}>{item.score}/{item.totalQuestions}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="anim-fade-in-up">
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 24 }}>{t('Security Settings', 'सुरक्षा सेटिंग्स')}</h2>
              <div className="premium-card" style={{ padding: 24, maxWidth: 500 }}>
                <h3 style={{ fontWeight: 700, color: 'var(--color-text-title-base)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontFamily: 'Outfit,sans-serif' }}>
                  <Lock size={17} color="var(--color-accent-primary)" /> {t('Change Password', 'पासवर्ड बदलें')}
                </h3>
                <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { key: 'current', label: t('Current Password', 'वर्तमान पासवर्ड') },
                    { key: 'newPw', label: t('New Password', 'नया पासवर्ड') },
                    { key: 'confirm', label: t('Confirm New Password', 'पासवर्ड की पुष्टि करें') },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ color: 'var(--color-text-title-base)', fontSize: 12, fontWeight: 800, display: 'block', marginBottom: 8 }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPw[key] ? 'text' : 'password'}
                          value={pwForm[key]}
                          onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                          className="input-glass"
                          placeholder="••••••••"
                          style={{ paddingRight: 44, padding: '12px 16px', borderRadius: 12, border: '2px solid var(--color-border-base)', width: '100%', background: 'var(--color-card-bg)', color: 'var(--color-text-base)' }}
                          required
                        />
                        <button type="button" onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted-base)', display: 'flex' }}>
                          {showPw[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {pwStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 12, background: pwStatus === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pwStatus === 'success' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                      {pwStatus === 'success' ? <CheckCircle size={16} color="#22c55e" /> : <AlertCircle size={16} color="#ef4444" />}
                      <span style={{ fontSize: 13, color: pwStatus === 'success' ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{pwMessage}</span>
                    </div>
                  )}

                  <button type="submit" className="btn-primary" disabled={pwLoading} style={{ justifyContent: 'center', padding: '14px', marginTop: 8 }}>
                    <Lock size={16} />
                    {pwLoading ? t('Updating...', 'अपडेट हो रहा है...') : t('Update Password', 'पासवर्ड अपडेट करें')}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
             <div className="anim-fade-in-up">
               <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 24 }}>{t('Notifications', 'सूचनाएं')}</h2>
               <div className="premium-card" style={{ padding: 24 }}>
                 <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14 }}>{t('Notification preferences coming soon.', 'अधिसूचना प्राथमिकताएँ जल्द ही आ रही हैं।')}</p>
               </div>
             </div>
          )}

          {activeTab === 'language' && (
             <div className="anim-fade-in-up">
               <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text-title-base)', fontFamily: 'Outfit,sans-serif', marginBottom: 24 }}>{t('Language Preferences', 'भाषा प्राथमिकताएँ')}</h2>
               <div className="premium-card" style={{ padding: 24 }}>
                 <p style={{ color: 'var(--color-text-muted-base)', fontSize: 14 }}>{t('Language toggle is available in the main header.', 'भाषा बदलने का विकल्प मुख्य हेडर में उपलब्ध है।')}</p>
               </div>
             </div>
          )}

          {activeTab === 'danger' && (
             <div className="anim-fade-in-up">
               <h2 style={{ fontSize: 20, fontWeight: 800, color: '#ef4444', fontFamily: 'Outfit,sans-serif', marginBottom: 24 }}>{t('Danger Zone', 'डेंजर ज़ोन')}</h2>
               <div className="premium-card" style={{ padding: 24, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
                 <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ef4444', marginBottom: 12 }}>{t('Delete Account', 'खाता हटाएं')}</h3>
                 <p style={{ color: 'var(--color-text-title-base)', fontSize: 14, marginBottom: 24 }}>{t('Once you delete your account, there is no going back. Please be certain.', 'एक बार जब आप अपना खाता हटा देते हैं, तो वापस जाने का कोई रास्ता नहीं है। कृपया निश्चित रहें।')}</p>
                 <button className="btn-secondary" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.1)' }}>{t('Delete Account', 'खाता हटाएं')}</button>
               </div>
             </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
