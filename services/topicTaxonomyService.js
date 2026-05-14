class TopicTaxonomyService {
    static canonicalizeTopic(topicName) {
        if (!topicName) return 'uncategorized';
        
        let t = String(topicName).trim().toLowerCase();
        
        // Replace hyphens and underscores with spaces
        t = t.replace(/[-_]/g, ' ');
        
        // Remove excessive spaces
        t = t.replace(/\s+/g, ' ');

        // Specific rules (e.g. History-Ancient -> ancient history)
        if (t.includes('ancient india') || t.includes('history ancient')) {
            return 'ancient history';
        }
        if (t.includes('medieval india') || t.includes('history medieval')) {
            return 'medieval history';
        }
        if (t.includes('modern india') || t.includes('history modern')) {
            return 'modern history';
        }

        // Title case it for nice display
        return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

module.exports = TopicTaxonomyService;
