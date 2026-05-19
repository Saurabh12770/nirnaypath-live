// Fallback logic for Chart.js
if (typeof Chart === 'undefined') {
    console.warn('Chart.js CDN failed. Loading local fallback.');
    const script = document.createElement('script');
    script.src = '/vendor/chart.min.js';
    document.head.appendChild(script);
}
