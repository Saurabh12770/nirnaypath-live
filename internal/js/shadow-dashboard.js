// internal/js/shadow-dashboard.js
// Mock live polling for Shadow Validation Dashboard
setInterval(() => {
    document.getElementById('heartbeat-count').innerText = Math.floor(Math.random() * 5000) + 10000;
    
    const pressure = Math.floor(Math.random() * 30) + 40;
    const pElement = document.getElementById('redis-pressure');
    pElement.innerText = `${pressure}%`;
    pElement.className = `metric ${pressure > 80 ? 'danger' : pressure > 65 ? 'warning' : ''}`;

    const lag = Math.floor(Math.random() * 15);
    const lagElement = document.getElementById('loop-lag');
    lagElement.innerText = `${lag}ms`;
    lagElement.className = `metric ${lag > 10 ? 'warning' : ''}`;

    document.getElementById('fraud-flags').innerText = `${Math.floor(Math.random() * 10)} Flags (Shadow)`;
    document.getElementById('ranking-tps').innerText = `${Math.floor(Math.random() * 500) + 2000} TPS`;
}, 2000);
