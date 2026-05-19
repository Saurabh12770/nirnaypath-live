// scripts/fraudFalsePositiveLab.js
console.log("Running Fraud Engine False-Positive Lab (Shadow)...");

const simulations = [
    { type: 'nervous_user', rapidClicks: 15, mouseShake: true },
    { type: 'slow_network', latency: 2000, drops: 2 },
    { type: 'accessibility', screenReader: true, slowTyping: true },
    { type: 'shared_ip', ip: '192.168.1.100', users: 50 }
];

simulations.forEach(sim => {
    let score = calculateShadowFraudScore(sim);
    console.log(`Simulation: ${sim.type} | Fraud Score: ${score}`);
    if (score > 80) {
        console.warn(`[WARNING] False Positive Detected for ${sim.type}!`);
    }
});

function calculateShadowFraudScore(sim) {
    let score = 0;
    if (sim.rapidClicks > 10) score += 30; // Could trigger on nervous users
    if (sim.shared_ip && sim.users > 20) score += 40; // False positive for coaching centers
    return score;
}

console.log("Lab execution complete. NO auto-bans were enabled.");
