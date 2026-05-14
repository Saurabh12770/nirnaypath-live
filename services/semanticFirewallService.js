/**
 * Semantic Firewall Service for NirnayPath
 * Phase 4 - Build Semantic Duplicate Firewall
 */

const crypto = require('crypto');

class SemanticFirewallService {
    static STOPWORDS = new Set([
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'of', 'to', 'for', 'with', 'by', 'was', 'were', 'what', 'who', 'how', 'when', 'where', 'why',
        'है', 'था', 'थे', 'थी', 'और', 'या', 'का', 'की', 'के', 'में', 'से', 'पर', 'को', 'क्या', 'कौन', 'कैसे', 'कब', 'कहाँ', 'क्यों'
    ]);

    /**
     * 1. Normalize Semantic Text
     */
    static normalizeSemanticText(text) {
        if (!text || typeof text !== 'string') return '';
        let normalized = text.toLowerCase().trim();
        // Remove A), B), C), D) patterns
        normalized = normalized.replace(/^[a-d][\.\)]\s*/g, '');
        // Remove punctuation and brackets
        normalized = normalized.replace(/[^\w\s\u0900-\u097F]/g, ' ');
        // Remove extra whitespace
        normalized = normalized.replace(/\s+/g, ' ').trim();
        
        // Remove stopwords and sort alphabetically for order-agnostic comparison
        const tokens = normalized.split(' ').filter(t => !this.STOPWORDS.has(t) && t.length > 1);
        return tokens.sort().join(' ');
    }

    /**
     * 2. Generate Semantic Fingerprint
     */
    static generateSemanticFingerprint(question) {
        const normQEn = this.normalizeSemanticText(question.question_en || question.text || '');
        const normQHi = this.normalizeSemanticText(question.question_hi || '');
        const normOptsEn = (question.options_en || []).map(o => this.normalizeSemanticText(o)).sort().join('|');
        const normOptsHi = (question.options_hi || []).map(o => this.normalizeSemanticText(o)).sort().join('|');
        
        const subject = (question.subject || '').toLowerCase().trim();
        const topic = (question.topic || '').toLowerCase().trim();

        const combinedString = `${subject}:${topic}:${normQEn}:${normQHi}:${normOptsEn}:${normOptsHi}`;
        return crypto.createHash('sha256').update(combinedString).digest('hex');
    }

    /**
     * Helper: Calculate Jaccard Similarity between two sets of tokens
     */
    static jaccardSimilarity(str1, str2) {
        const set1 = new Set(str1.split(' '));
        const set2 = new Set(str2.split(' '));
        if (set1.size === 0 && set2.size === 0) return 1.0;
        if (set1.size === 0 || set2.size === 0) return 0.0;
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return intersection.size / union.size;
    }

    /**
     * 3. Calculate Similarity
     */
    static calculateSimilarity(a, b) {
        const normEnA = this.normalizeSemanticText(a.question_en || a.text || '');
        const normEnB = this.normalizeSemanticText(b.question_en || b.text || '');
        
        const normHiA = this.normalizeSemanticText(a.question_hi || '');
        const normHiB = this.normalizeSemanticText(b.question_hi || '');

        const simEn = this.jaccardSimilarity(normEnA, normEnB);
        const simHi = this.jaccardSimilarity(normHiA, normHiB);

        // Options overlap
        const optsA = (a.options_en || []).map(o => this.normalizeSemanticText(o)).join(' ');
        const optsB = (b.options_en || []).map(o => this.normalizeSemanticText(o)).join(' ');
        const simOpts = this.jaccardSimilarity(optsA, optsB);

        // Weighted average (Question text is 60%, Options are 40%)
        const avgTextSim = (simEn + simHi) / 2;
        return (avgTextSim * 0.6) + (simOpts * 0.4);
    }

    /**
     * 4. Detect Semantic Duplicate against an existing pool
     */
    static detectSemanticDuplicate(question, existingQuestions) {
        const fingerprint = this.generateSemanticFingerprint(question);
        
        for (const existing of existingQuestions) {
            const existingFp = this.generateSemanticFingerprint(existing);
            
            if (fingerprint === existingFp) {
                return {
                    duplicate: true,
                    severity: 'HIGH',
                    matchedQuestionId: existing.id || existing._id,
                    similarity: 1.0,
                    reasons: ['Exact Semantic Fingerprint Match']
                };
            }

            const similarity = this.calculateSimilarity(question, existing);
            if (similarity >= 0.90) {
                return {
                    duplicate: true,
                    severity: 'HIGH',
                    matchedQuestionId: existing.id || existing._id,
                    similarity,
                    reasons: ['Similarity >= 0.90 (Hard Duplicate)']
                };
            }

            if (similarity >= 0.75) {
                return {
                    duplicate: true, // We still consider it a duplicate to quarantine it
                    severity: 'MEDIUM',
                    matchedQuestionId: existing.id || existing._id,
                    similarity,
                    reasons: ['Similarity >= 0.75 (Review Required)']
                };
            }
        }

        return {
            duplicate: false,
            severity: 'NONE',
            matchedQuestionId: null,
            similarity: 0,
            reasons: []
        };
    }

    /**
     * 5. Enforce Question Diversity within a batch
     */
    static enforceQuestionDiversity(batch) {
        const warnings = [];
        let passed = true;

        if (!batch || batch.length === 0) return { passed, warnings, metrics: {} };

        const total = batch.length;
        const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
        const topicCounts = {};
        const stemSet = new Set();

        for (const q of batch) {
            // Check Answers
            if (q.correctAnswer !== undefined) {
                answerCounts[q.correctAnswer] = (answerCounts[q.correctAnswer] || 0) + 1;
            }

            // Check Topics
            const topic = (q.topic || 'Unknown').toLowerCase();
            topicCounts[topic] = (topicCounts[topic] || 0) + 1;

            // Check Stem repetition
            const stem = this.normalizeSemanticText(q.question_en || q.text || '');
            if (stem) {
                if (stemSet.has(stem)) {
                    warnings.push(`Repeated stem detected: ${stem.substring(0, 30)}...`);
                    passed = false;
                }
                stemSet.add(stem);
            }
        }

        // Rule: no answer index > 40%
        if (total > 5) {
            for (const [ans, count] of Object.entries(answerCounts)) {
                if (count / total > 0.4) {
                    warnings.push(`Answer index ${ans} used excessively (${Math.round((count/total)*100)}%)`);
                    passed = false;
                }
            }
        }

        // Topic dominance (Rule: > 50% is bad for a batch unless explicitly requested, we use 30% for templates generally, adjusting to 50% for topic-specific batches)
        for (const [top, count] of Object.entries(topicCounts)) {
            if (count / total > 0.8 && total > 10) {
                warnings.push(`Topic ${top} dominance > 80% in batch`);
                // passed = false; // We just warn for topic dominance since batch generation targets specific topics
            }
        }

        return {
            passed,
            warnings,
            metrics: { answerCounts, topicCounts }
        };
    }
}

module.exports = SemanticFirewallService;
