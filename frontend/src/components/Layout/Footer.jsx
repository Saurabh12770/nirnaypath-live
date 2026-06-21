import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function FooterSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }} className="footer-section">
      {/* Mobile view accordion header */}
      <div 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 10 }}
        className="footer-section-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ fontWeight: 800, color: '#ffffff', fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</span>
        <span className="footer-section-arrow" style={{ color: '#ffffff' }}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>
      {/* List items */}
      <div 
        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        className={`footer-section-content ${isOpen ? 'open' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}

export default function Footer({ onStartPrep }) {
  const { language } = useAuth();
  const t = (en, hi) => language === 'hi' ? hi : en;

  return (
    <footer style={{ background: '#000000', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '80px 24px 40px', color: '#a1a1aa', position: 'relative', zIndex: 1 }} className="footer">
      <style>{`
        /* Desktop styles */
        .footer-grid {
          max-width: 1240px;
          margin: 0 auto 60px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
          gap: 40px;
        }
        .footer-section-arrow {
          display: none !important;
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            margin-bottom: 40px !important;
          }
          .footer-section-arrow {
            display: block !important;
          }
          .footer-section-content {
            display: none !important;
            padding-left: 8px;
            margin-top: -6px;
          }
          .footer-section-content.open {
            display: flex !important;
          }
          .footer-section-header {
            user-select: none;
          }
        }
      `}</style>
      
      <div className="footer-grid">
        {/* Column 1: Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, background: 'var(--gradient-primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={22} color="white" />
            </div>
            <span style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 900, fontSize: '1.45rem', color: '#ffffff', letterSpacing: '-0.02em' }}>NirnayPath</span>
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#a1a1aa' }}>
            {t('Transforming government exam preparation with our democratic, open-source bilingual framework. 100% free notes and mock exams.', 'हमारे लोकतांत्रिक, ओपन-सोर्स द्विभाषी ढांचे के साथ सरकारी परीक्षा की तैयारी को बदलना। 100% मुफ्त नोट्स और मॉक परीक्षा।')}
          </p>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: '#ffffff', letterSpacing: '0.04em', marginTop: 4 }}>
            {t('BUILT WITH PRECISION FOR INDIA\'S FUTURE.', 'भारत के भविष्य के लिए सटीकता के साथ निर्मित।')}
          </div>
          {/* Social Links */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            {['Telegram', 'LinkedIn', 'Twitter', 'GitHub'].map((social, idx) => (
              <a key={idx} href="#" onClick={e => e.preventDefault()} style={{ 
                width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 700, transition: 'all 0.2s' 
              }} onMouseEnter={e => { e.currentTarget.style.background = '#FF6B00'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#94a3b8'; }}>
                {social[0]}
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Platform */}
        <FooterSection title={t('PLATFORM', 'प्लेटफॉर्म')} language={language}>
          <Link to="/about" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{t('About & Story', 'परिचय व कहानी')}</Link>
          <a href="#" onClick={e=>{e.preventDefault(); if(onStartPrep) onStartPrep();}} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{t('Learn Hub', 'लर्न हब')}</a>
          <a href="#" onClick={e=>{e.preventDefault(); if(onStartPrep) onStartPrep();}} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{t('Mock Test Center', 'मॉक टेस्ट सेंटर')}</a>
        </FooterSection>

        {/* Column 3: Exams */}
        <FooterSection title={t('EXAMS', 'परीक्षाएं')} language={language}>
          {['UPSC CSE', 'BPSC Civil Services', 'SSC CGL', 'SSC CHSL', 'Railways NTPC'].map((ex, idx) => (
            <a key={idx} href="#" onClick={e=>{e.preventDefault(); if(onStartPrep) onStartPrep();}} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{ex}</a>
          ))}
        </FooterSection>

        {/* Column 4: Community */}
        <FooterSection title={t('COMMUNITY', 'समुदाय')} language={language}>
          {['Telegram Channel', 'Discussion Forum', 'Contribute Notes', 'Open Source'].map((item, idx) => (
            <a key={idx} href="#" onClick={e=>e.preventDefault()} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{item}</a>
          ))}
        </FooterSection>

        {/* Column 5: Legal */}
        <FooterSection title={t('LEGAL', 'कानूनी')} language={language}>
          <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{t('Privacy Policy', 'गोपनीयता नीति')}</a>
          <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: 14 }} onMouseEnter={e=>e.currentTarget.style.color='#ffffff'} onMouseLeave={e=>e.currentTarget.style.color='#a1a1aa'}>{t('Terms of Service', 'सेवा की शर्तें')}</a>
        </FooterSection>
      </div>

      {/* Legal and Copyright strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 30, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20, fontSize: 13, alignItems: 'center' }}>
        <div>
          {t('© 2026 NirnayPath 3.0. Made for serious government exam preparation. All rights reserved.', '© 2026 निर्णयपथ 3.0. गंभीर सरकारी परीक्षा की तैयारी के लिए निर्मित। सर्वाधिकार सुरक्षित।')}
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FF6B00'} onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>{t('Privacy', 'गोपनीयता')}</a>
          <a href="#" onClick={e=>e.preventDefault()} style={{ color: '#94a3b8', textDecoration: 'none' }} onMouseEnter={e=>e.currentTarget.style.color='#FF6B00'} onMouseLeave={e=>e.currentTarget.style.color='#94a3b8'}>{t('Terms', 'शर्तें')}</a>
        </div>
      </div>
    </footer>
  );
}
