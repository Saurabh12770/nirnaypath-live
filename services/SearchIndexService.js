const MarketplaceListing = require('../models/MarketplaceListing');
const redisService = require('./redisService');

class SearchIndexService {
    async search(query) {
        // Check cache
        const cacheKey = `search:${query}`;
        const cached = await redisService.get(cacheKey);
        if (cached) return JSON.parse(cached);

        // Perform Mongo Text Search (Fuzzy fallback)
        // Ensure text index exists in schema for real-world usage
        const results = await MarketplaceListing.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { tags: query }
            ],
            status: 'published'
        }).limit(20);

        await redisService.set(cacheKey, JSON.stringify(results), 300); // 5 min TTL
        return results;
    }
}
module.exports = new SearchIndexService();
