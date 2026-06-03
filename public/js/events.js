
AppLifecycle.register(() => {
  const el1 = document.getElementById('dashNavLink');
  if (el1) {
    el1.addEventListener('click', (e) => {
      e.preventDefault();
      Dashboard.show();
    });
  }
  const elDashMobile = document.getElementById('mobileDashNavLink');
  if (elDashMobile) {
    elDashMobile.addEventListener('click', (e) => {
      e.preventDefault();
      Dashboard.show();
      const navPanel = document.getElementById('mobileNavPanel');
      const panelOverlay = document.getElementById('panelOverlay');
      if (navPanel) navPanel.classList.remove('open');
      if (panelOverlay) panelOverlay.classList.remove('active');
    });
  }
  const el2 = document.getElementById('gen-btn-2');
  if (el2) { el2.addEventListener('click', (e) => { setActiveExam('upsc') }); }
  const el3 = document.getElementById('gen-btn-3');
  if (el3) { el3.addEventListener('click', (e) => { setActiveExam('bpsc') }); }
  const el4 = document.getElementById('gen-btn-4');
  if (el4) { el4.addEventListener('click', (e) => { setActiveExam('ssc') }); }
  const el5 = document.getElementById('gen-btn-5');
  if (el5) { el5.addEventListener('click', (e) => { setActiveExam('banking') }); }
  const el6 = document.getElementById('gen-btn-6');
  if (el6) { el6.addEventListener('click', (e) => { SectionalTests.openModal() }); }
  const el7 = document.getElementById('gen-btn-7');
  if (el7) { el7.addEventListener('click', (e) => { switchPracticeMode('full') }); }
  const el8 = document.getElementById('gen-btn-8');
  if (el8) { el8.addEventListener('click', (e) => { switchPracticeMode('drill') }); }
  const el9 = document.getElementById('gen-btn-9');
  if (el9) { el9.addEventListener('click', (e) => { switchPracticeMode('full') }); }
  const el10 = document.getElementById('gen-btn-10');
  if (el10) { el10.addEventListener('click', (e) => { scrollToDashboard() }); }
  const el11 = document.getElementById('gen-btn-11');
  if (el11) { el11.addEventListener('click', (e) => { SectionalTests.closeModal() }); }
  const el12 = document.getElementById('gen-btn-12');
  if (el12) { el12.addEventListener('click', (e) => { document.getElementById('upgradeModal').style.display='none' }); }
  const elUpgradeCTA = document.getElementById('dashboard-upgrade-cta');
  if (elUpgradeCTA) {
    elUpgradeCTA.addEventListener('click', (e) => {
      document.getElementById('upgradeModal').style.display = 'flex';
    });
  }
  const el13 = document.getElementById('gen-btn-13');
  if (el13) { el13.addEventListener('click', (e) => { PaymentManager.upgrade('pro_monthly') }); }
  const el14 = document.getElementById('gen-btn-14');
  if (el14) { el14.addEventListener('click', (e) => { PaymentManager.upgrade('pro_yearly') }); }
  const el15 = document.getElementById('gen-btn-15');
  if (el15) { el15.addEventListener('click', (e) => { document.getElementById('reviewModal').style.display='none' }); }
  const el16 = document.getElementById('gen-btn-16');
  if (el16) { el16.addEventListener('click', (e) => { document.getElementById('reviewModal').style.display='none'; showView('dashboard') }); }

  // Bind Success Tips links to smooth scroll rather than dead anchor jumps
  document.querySelectorAll('.learn-more-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetEl = document.getElementById('popular-exams') || document.querySelector('.exam-ribbon');
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

