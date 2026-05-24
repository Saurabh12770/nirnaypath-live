/**
 * Syllabus Intelligence Engine for NirnayPath
 * Phase 4 - Content Generation & Ingestion Pipeline
 */

const fs = require('fs');
const path = require('path');

class SyllabusIntelligenceService {
    static cache = new Map();
    static BLUEPRINTS_DIR = path.join(__dirname, '../data/syllabusBlueprints');

    /**
     * Safely deep clone an object to ensure immutability
     */
    static deepClone(obj) {
        if (!obj) return null;
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Normalize strings for consistent comparison
     */
    static normalizeName(name) {
        if (!name || typeof name !== 'string') return '';
        return name.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
    }

    /**
     * Load a subject blueprint safely
     */
    static loadBlueprint(subject) {
        try {
            const normalizedSubject = this.normalizeName(subject);
            
            // 1. Check cache first
            if (this.cache.has(normalizedSubject)) {
                return {
                    success: true,
                    blueprint: this.deepClone(this.cache.get(normalizedSubject)),
                    error: null
                };
            }

            // 2. Read all files to find aliases (since filenames might differ slightly)
            if (!fs.existsSync(this.BLUEPRINTS_DIR)) {
                return { success: false, blueprint: null, error: { code: 'DIR_NOT_FOUND', message: 'Syllabus blueprints directory is missing' } };
            }

            const files = fs.readdirSync(this.BLUEPRINTS_DIR).filter(f => f.endsWith('.json'));
            let foundBlueprint = null;

            for (const file of files) {
                const filePath = path.join(this.BLUEPRINTS_DIR, file);
                const rawData = fs.readFileSync(filePath, 'utf8');
                const bp = JSON.parse(rawData);

                const aliases = (bp.aliases || []).map(a => this.normalizeName(a));
                const subjectName = this.normalizeName(bp.subject);

                if (subjectName === normalizedSubject || aliases.includes(normalizedSubject)) {
                    foundBlueprint = bp;
                    break;
                }
            }

            if (!foundBlueprint) {
                return { success: false, blueprint: null, error: { code: 'BLUEPRINT_NOT_FOUND', message: `No blueprint found for subject: ${subject}` } };
            }

            // Validate strict rules
            if (!foundBlueprint.topics || foundBlueprint.topics.length === 0) {
                return { success: false, blueprint: null, error: { code: 'INVALID_BLUEPRINT', message: 'Blueprint must contain topics array' } };
            }
            
            let totalWeight = 0;
            const topicNames = new Set();
            for (const topic of foundBlueprint.topics) {
                const tName = this.normalizeName(topic.name);
                if (topicNames.has(tName)) {
                    return { success: false, blueprint: null, error: { code: 'INVALID_BLUEPRINT', message: `Duplicate topic found: ${topic.name}` } };
                }
                topicNames.add(tName);
                totalWeight += (topic.weightage || 0);
            }

            if (totalWeight !== 100 && foundBlueprint.topics.length > 0) {
                 return { success: false, blueprint: null, error: { code: 'INVALID_BLUEPRINT', message: `Total topic weightage must equal 100. Found: ${totalWeight}` } };
            }

            // 3. Cache and return
            this.cache.set(normalizedSubject, foundBlueprint);
            // Also cache under aliases
            (foundBlueprint.aliases || []).forEach(a => {
                this.cache.set(this.normalizeName(a), foundBlueprint);
            });

            return {
                success: true,
                blueprint: this.deepClone(foundBlueprint),
                error: null
            };

        } catch (e) {
            console.error('[SyllabusEngine] Blueprint Load Error:', e);
            return {
                success: false,
                blueprint: null,
                error: { code: 'SYSTEM_ERROR', message: e.message }
            };
        }
    }

    /**
     * Return canonical syllabus structure.
     */
    static getSubjectBlueprint(subject) {
        const { success, blueprint, error } = this.loadBlueprint(subject);
        if (!success) {
            throw new Error(`Failed to get blueprint for ${subject}: ${error.message}`);
        }
        return blueprint;
    }

    /**
     * Return topic weightage distribution mapping
     */
    static getTopicDistribution(subject) {
        const blueprint = this.getSubjectBlueprint(subject);
        const distribution = {};
        blueprint.topics.forEach(t => {
            distribution[this.normalizeName(t.name)] = t.weightage || 0;
        });
        return distribution;
    }

    /**
     * Audit whether a question bank matches syllabus expectations.
     */
    static validateTopicCoverage(subject, questionBank) {
        const blueprint = this.getSubjectBlueprint(subject);
        const targetTotal = blueprint.targetQuestionCount || 5000;
        
        const actualCounts = {};
        const diffCounts = { EASY: 0, MEDIUM: 0, HARD: 0 };
        const totalActual = questionBank.length;

        // Tally actual bank
        questionBank.forEach(q => {
            const topic = this.normalizeName(q.topic || q.topicId || 'uncategorized');
            actualCounts[topic] = (actualCounts[topic] || 0) + 1;
            
            const diff = (q.difficulty || 'MEDIUM').toUpperCase();
            if (diffCounts[diff] !== undefined) {
                diffCounts[diff]++;
            }
        });

        const missingTopics = [];
        const weakTopics = [];
        const overrepresentedTopics = [];
        const recommendations = [];

        // Analyze topics
        blueprint.topics.forEach(t => {
            const tName = this.normalizeName(t.name);
            const expectedRatio = (t.weightage || 0) / 100;
            const expectedCount = targetTotal * expectedRatio;
            const actualCount = actualCounts[tName] || 0;

            if (actualCount === 0) {
                missingTopics.push(t.name);
                recommendations.push(`CRITICAL: Generate ${expectedCount} questions for missing topic '${t.name}'.`);
            } else if (actualCount < expectedCount * 0.8) {
                weakTopics.push(t.name);
                recommendations.push(`Generate ${Math.ceil(expectedCount - actualCount)} questions for weak topic '${t.name}'.`);
            } else if (actualCount > expectedCount * 1.5) {
                overrepresentedTopics.push(t.name);
                recommendations.push(`Pause generation for overrepresented topic '${t.name}'.`);
            }
        });

        // Analyze difficulty
        const actualDiffRatios = {
            EASY: totalActual > 0 ? (diffCounts.EASY / totalActual) * 100 : 0,
            MEDIUM: totalActual > 0 ? (diffCounts.MEDIUM / totalActual) * 100 : 0,
            HARD: totalActual > 0 ? (diffCounts.HARD / totalActual) * 100 : 0
        };

        const targetDiffRatios = blueprint.difficultyDistribution || { EASY: 33, MEDIUM: 34, HARD: 33 };

        const coverageScore = this.calculateCoverageScore(blueprint, actualCounts, totalActual, actualDiffRatios, targetDiffRatios);

        const result = {
            valid: missingTopics.length === 0 && weakTopics.length === 0 && totalActual >= targetTotal,
            coverageScore,
            missingTopics,
            weakTopics,
            overrepresentedTopics,
            difficultyDistribution: actualDiffRatios,
            recommendations
        };

        this.logTrace('validateTopicCoverage', subject, { coverageScore, totalActual, targetTotal });

        return result;
    }

    /**
     * Generate normalized 0-100 syllabus coverage score.
     */
    static calculateCoverageScore(blueprint, actualCounts, totalActual, actualDiffRatios, targetDiffRatios) {
        if (totalActual === 0) return 0;
        let score = 100;

        // Penalty for missing/weak topics
        blueprint.topics.forEach(t => {
            const tName = this.normalizeName(t.name);
            const expectedRatio = (t.weightage || 0) / 100;
            const actualRatio = actualCounts[tName] ? (actualCounts[tName] / totalActual) : 0;
            
            const diff = Math.abs(expectedRatio - actualRatio);
            if (diff > 0.1) {
                score -= (diff * 50); // Heavily penalize large imbalances
            }
        });

        // Penalty for difficulty drift
        ['EASY', 'MEDIUM', 'HARD'].forEach(level => {
            const expected = targetDiffRatios[level] || 33;
            const actual = actualDiffRatios[level];
            const drift = Math.abs(expected - actual);
            if (drift > 15) {
                score -= 10;
            }
        });

        // Volume Penalty
        const targetTotal = blueprint.targetQuestionCount || 5000;
        if (totalActual < targetTotal) {
            score -= ((targetTotal - totalActual) / targetTotal) * 40;
        }

        return Math.max(0, Math.round(score));
    }

    /**
     * Find next starving topic based on coverage.
     */
    static getRecommendedTopic(subject, currentBankCounts = {}) {
        const blueprint = this.getSubjectBlueprint(subject);
        
        let mostStarvedTopic = null;
        let lowestRatio = Infinity;

        // If currentBankCounts is empty, assume all are 0
        const targetTotal = blueprint.targetQuestionCount || 5000;

        for (const topic of blueprint.topics) {
            const tName = this.normalizeName(topic.name);
            const expectedRatio = (topic.weightage || 0) / 100;
            const expectedCount = targetTotal * expectedRatio;
            const actualCount = currentBankCounts[tName] || 0;
            
            const fillRatio = actualCount / expectedCount;

            if (fillRatio < lowestRatio) {
                lowestRatio = fillRatio;
                mostStarvedTopic = topic;
            }
        }

        return mostStarvedTopic ? this.deepClone(mostStarvedTopic) : null;
    }

    /**
     * Trace Logger
     */
    static logTrace(action, subject, data) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                action,
                subject: this.normalizeName(subject),
                ...data
            };
            const logsDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
            const logFile = path.join(logsDir, 'syllabus_runtime_trace.json');
            
            if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir, { recursive: true });
            }
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        } catch (e) {
            console.error('[SyllabusEngine] Failed to write trace log', e.message);
        }
    }
}

module.exports = SyllabusIntelligenceService;
