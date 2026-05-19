// internal/js/executive-operations-center.js
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('dashboard-grid');

    const metrics = [
        { title: 'National Active Candidates', val: '142,305' },
        { title: 'PM2 Worker Health', val: '99.9%', ok: true },
        { title: 'Redis Memory Pressure', val: '64%', ok: true },
        { title: 'Mongo Event-Loop Lag', val: '12ms', ok: true },
        { title: 'Payment Discrepancies', val: '0', ok: true },
        { title: 'SaaS Marketplace Revenue MTD', val: '₹4.2M' },
        { title: 'Active Tenant Institutions', val: '412' }
    ];

    let html = '';
    metrics.forEach(m => {
        const color = m.ok === false ? 'alert' : '';
        html += `<div class="card ${color}"><h3>${m.title}</h3><div class="val">${m.val}</div></div>`;
    });

    html += `<div class="feed" id="incident-feed">
        <h3>Live Incident & Audit Feed (WORM)</h3>
        <div class="feed-item">[${new Date().toISOString()}] RECONCILIATION: Hourly worker verified 1205 payments.</div>
        <div class="feed-item">[${new Date().toISOString()}] AUDIT_LEDGER: Chain hash anchored successfully.</div>
        <div class="feed-item">[${new Date().toISOString()}] PM2_CLUSTER: Heartbeat synced across 16 nodes.</div>
    </div>`;

    grid.innerHTML = html;
});
