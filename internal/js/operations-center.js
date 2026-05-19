/**
 * Operations Center Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    fetchMetrics();
    // Poll every 5 seconds
    setInterval(fetchMetrics, 5000);
});

async function fetchMetrics() {
    try {
        const response = await fetch('/api/internal/operations/metrics', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateDashboard(data);
        } else {
            console.error('Failed to fetch metrics:', response.status);
            setSystemStatus('DEGRADED');
        }
    } catch (err) {
        console.error('Error fetching metrics:', err);
        setSystemStatus('OFFLINE');
    }
}

function updateDashboard(metrics) {
    document.getElementById('active-candidates').textContent = metrics.activeCandidates.toLocaleString();
    document.getElementById('active-exams').textContent = metrics.activeExams.toLocaleString();
    
    document.getElementById('pm2-workers').textContent = metrics.pm2ClusterHealth.workers || '--';
    document.getElementById('event-loop-lag').textContent = (metrics.eventLoopLag || 0).toFixed(2);
    document.getElementById('heartbeat-rtt').textContent = (metrics.averageHeartbeatRTT || 0).toFixed(2);
    
    document.getElementById('redis-depth').textContent = (metrics.redisStreamDepth || 0).toLocaleString();
    document.getElementById('queue-depth').textContent = (metrics.queueBackpressure || 0).toLocaleString();
    document.getElementById('mongo-lag').textContent = (metrics.mongoReplicationLag?.lagMs || 0).toFixed(2);
    
    document.getElementById('fraud-reviews').textContent = (metrics.activeFraudReviews || 0).toLocaleString();
    document.getElementById('suspicious-spikes').textContent = (metrics.suspiciousActivitySpikes || 0).toLocaleString();
    
    setSystemStatus(metrics.systemStatus || 'ONLINE');
}

function setSystemStatus(status) {
    const dot = document.getElementById('global-status-dot');
    const text = document.getElementById('global-status-text');
    
    dot.className = 'status-indicator';
    if (status === 'ONLINE') {
        dot.classList.add('status-online');
        text.textContent = 'System Online';
    } else if (status === 'DEGRADED') {
        dot.classList.add('status-degraded');
        text.textContent = 'System Degraded';
    } else {
        dot.classList.add('status-offline');
        text.textContent = 'System Offline';
    }
}

async function executeEmergencyAction(action) {
    const confirmMsg = `WARNING: You are about to execute an EMERGENCY action (${action}). This will affect live national exams and will be permanently audited. Proceed?`;
    if (!confirm(confirmMsg)) return;

    try {
        const response = await fetch(`/api/internal/operations/emergency/${action}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason: prompt('Enter reason for this emergency action:') })
        });
        
        if (response.ok) {
            alert('Emergency action executed successfully.');
        } else {
            alert('Failed to execute emergency action. Check console for details.');
        }
    } catch (err) {
        alert('Error executing emergency action.');
        console.error(err);
    }
}
