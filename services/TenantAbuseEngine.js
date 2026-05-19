const FeatureFlags = require('../config/featureFlags');
const redisService = require('./redisService');

class TenantAbuseEngine {
    async analyzeInstitutionTraffic(institutionId, ipAddress) {
        if (!FeatureFlags.isEnabled('ENABLE_TENANT_ABUSE_ENGINE')) return;

        const clusterKey = `tenant_ip_cluster:${institutionId}`;
        await redisService.client.sadd(clusterKey, ipAddress);
        const uniqueIps = await redisService.client.scard(clusterKey);

        // Heuristics for distributed scraping/farming
        if (uniqueIps > 5000) {
            console.warn(`[ABUSE_ENGINE] SHADOW ALERT: Massive IP scatter for Tenant ${institutionId}. Possible bot enrollment or scraping.`);
            // Only log in shadow mode, no blocking
            // Deduct institution trust score
        }
    }
}
module.exports = new TenantAbuseEngine();
