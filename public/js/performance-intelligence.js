// public/js/performance-intelligence.js
document.addEventListener('DOMContentLoaded', () => {
    const mockData = {
        confidenceScore: 88,
        confidenceExplain: "Your accuracy improved steadily over time, showing strong fundamental understanding.",
        stressIndicator: 15, // Low stress
        stressExplain: "Your answering rhythm was calm and consistent. Excellent time management.",
        topicMastery: "High",
        topicExplain: "Strong performance in Core Subjects. Suggested revision: Advanced application topics."
    };

    const dashboard = document.getElementById('ai-dashboard');

    const createCard = (title, value, explanation) => `
        <div class="card">
            <div class="metric-title">${title}</div>
            <div class="metric-value">${value}</div>
            <div class="explanation"><strong>Why?</strong> ${explanation}</div>
        </div>
    `;

    dashboard.innerHTML = `
        ${createCard('Confidence Score', mockData.confidenceScore + '%', mockData.confidenceExplain)}
        ${createCard('Stress Indicator', mockData.stressIndicator + '%', mockData.stressExplain)}
        ${createCard('Topic Mastery', mockData.topicMastery, mockData.topicExplain)}
    `;
});
