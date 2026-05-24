/**
 * Deterministic Question Generation Engine
 * Phase 4 - Content Generation & Ingestion Pipeline
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const SyllabusIntelligenceService = require('./syllabusIntelligenceService');
const QuestionContentSchema = require('../schemas/questionContentSchema');
const SemanticFirewallService = require('./semanticFirewallService');
const ReviewQueueService = require('./reviewQueueService');

class QuestionGenerationService {
    static QUEUE_DIR = path.join(__dirname, '../generated/review_queue');
    static TRACE_DIR = path.join(__dirname, '../generated/traces');
    static TEMPLATE_DIR = path.join(__dirname, '../generated/templates');

    static ensureDir(dirPath) {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        } catch (e) {
            console.warn('[SRE_WARNING] Failed to create directory safely:', e.message);
        }
    }

    // Pseudo-random deterministic generator based on seed
    static seededRandom(seedStr) {
        let hash = crypto.createHash('sha256').update(seedStr).digest('hex');
        return parseInt(hash.substring(0, 8), 16) / 0xffffffff;
    }

    /**
     * Safely trace generation events
     */
    static trace(action, payload) {
        try {
            const entry = { timestamp: new Date().toISOString(), action, ...payload };
            this.ensureDir(this.TRACE_DIR);
            const traceFile = path.join(this.TRACE_DIR, 'question_generation_trace.json');
            fs.appendFileSync(traceFile, JSON.stringify(entry) + '\n');
        } catch (e) {
            console.error('[GenerationEngine] Trace Write Error:', e.message);
        }
    }

    /**
     * Deterministic ID Generation
     * Format: SUB-TOPIC-DIFF-HASH
     */
    static generateDeterministicId(subject, topic, difficulty, seedIndex) {
        const subCode = subject.substring(0, 3).toUpperCase();
        const topCode = topic.substring(0, 4).toUpperCase();
        const diffCode = difficulty.substring(0, 3).toUpperCase();
        const rawString = `${subCode}-${topCode}-${diffCode}-${seedIndex}-${Date.now()}`;
        const hash = crypto.createHash('md5').update(rawString).digest('hex').substring(0, 6).toUpperCase();
        return `${subCode}-${topCode}-${diffCode}-${hash}`;
    }

    /**
     * Template Resolver (Mocking Deterministic Conceptual Mapping)
     */
    static resolveTemplate(subject, topic, difficulty, seedIndex) {
        // In a real system, this reads from server/generated/templates/ physics_templates.json
        // We use a deterministic fallback for demonstration of the pipeline.
        
        const concepts = [
            { en: 'Newton\'s First Law', hi: 'न्यूटन का पहला नियम' },
            { en: 'Conservation of Energy', hi: 'ऊर्जा संरक्षण' },
            { en: 'Fundamental Rights', hi: 'मौलिक अधिकार' },
            { en: 'Photosynthesis', hi: 'प्रकाश संश्लेषण' }
        ];
        
        const rand = this.seededRandom(`${subject}-${topic}-${seedIndex}`);
        const concept = concepts[Math.floor(rand * concepts.length)];

        let stemEn, stemHi, optsEn, optsHi, correctAns, explEn, explHi;

        if (difficulty === 'EASY') {
            stemEn = `Which of the following best describes the principle of ${concept.en}?`;
            stemHi = `निम्नलिखित में से कौन ${concept.hi} के सिद्धांत का सबसे अच्छा वर्णन करता है?`;
            optsEn = [
                `It states that energy is conserved in ${concept.en}.`,
                `It is the fundamental basis of ${concept.en} mechanics.`,
                `It defines the core properties of ${concept.en}.`,
                `It is an outdated theory regarding ${concept.en}.`
            ];
            optsHi = [
                `यह बताता है कि ${concept.hi} में ऊर्जा संरक्षित है।`,
                `यह ${concept.hi} यांत्रिकी का मूल आधार है।`,
                `यह ${concept.hi} के मुख्य गुणों को परिभाषित करता है।`,
                `यह ${concept.hi} के संबंध में एक पुराना सिद्धांत है।`
            ];
            correctAns = 1;
            explEn = `The principle of ${concept.en} is considered the fundamental basis of its respective mechanics, establishing the groundwork for further physical laws.`;
            explHi = `${concept.hi} के सिद्धांत को इसके संबंधित यांत्रिकी का मूल आधार माना जाता है, जो आगे के भौतिक नियमों के लिए आधार स्थापित करता है।`;
        } else {
            stemEn = `Consider the following statements regarding ${concept.en}. Which statement is analytically correct?`;
            stemHi = `${concept.hi} के संबंध में निम्नलिखित कथनों पर विचार करें। कौन सा कथन विश्लेषणात्मक रूप से सही है?`;
            optsEn = [
                `Statement I is false, Statement II is true regarding ${concept.en}.`,
                `Both statements are true and I explains II for ${concept.en}.`,
                `Both statements are false in the context of ${concept.en}.`,
                `Only Statement I is conceptually valid for ${concept.en}.`
            ];
            optsHi = [
                `कथन I गलत है, ${concept.hi} के संबंध में कथन II सही है।`,
                `दोनों कथन सही हैं और I ${concept.hi} के लिए II की व्याख्या करता है।`,
                `${concept.hi} के संदर्भ में दोनों कथन गलत हैं।`,
                `केवल कथन I ${concept.hi} के लिए वैचारिक रूप से मान्य है।`
            ];
            correctAns = 3;
            explEn = `Analytically, only Statement I holds true under rigorous examination of ${concept.en}, while Statement II fails under boundary conditions.`;
            explHi = `विश्लेषणात्मक रूप से, ${concept.hi} की कठोर जांच के तहत केवल कथन I सत्य है, जबकि कथन II सीमा शर्तों के तहत विफल रहता है।`;
        }

        // Shuffle options deterministically
        const cOptsEn = [...optsEn];
        const cOptsHi = [...optsHi];
        let newCorrect = correctAns;
        
        // Simple swap based on seed
        if (rand > 0.5) {
            [cOptsEn[0], cOptsEn[newCorrect]] = [cOptsEn[newCorrect], cOptsEn[0]];
            [cOptsHi[0], cOptsHi[newCorrect]] = [cOptsHi[newCorrect], cOptsHi[0]];
            newCorrect = 0;
        }

        return { stemEn, stemHi, optsEn: cOptsEn, optsHi: cOptsHi, correctAns: newCorrect, explEn, explHi };
    }

    /**
     * Generate ONE structured question
     */
    static generateQuestion(payload) {
        const { subject, topic, subtopic, difficulty, exam, classLevel, type, seedIndex = 1 } = payload;
        
        this.trace('GENERATE_START', { subject, topic, seedIndex });

        const { stemEn, stemHi, optsEn, optsHi, correctAns, explEn, explHi } = this.resolveTemplate(subject, topic, difficulty, seedIndex);

        const rawQuestion = {
            id: this.generateDeterministicId(subject, topic, difficulty, seedIndex),
            subject,
            topic,
            subtopic: subtopic || 'General',
            difficulty,
            examLevel: exam || 'UPSC',
            question_en: stemEn,
            question_hi: stemHi,
            options_en: optsEn,
            options_hi: optsHi,
            correctAnswer: correctAns,
            explanation_en: explEn,
            explanation_hi: explHi,
            source: 'system_generated',
            generatedBy: 'QuestionGenerationEngine',
            generatedAt: new Date().toISOString()
        };

        // Strict Structural Validation
        const validation = QuestionContentSchema.validateQuestionStructure(rawQuestion);

        if (!validation.valid) {
            this.trace('VALIDATION_FAILED', { id: rawQuestion.id, errors: validation.errors });
            return {
                success: false,
                question: null,
                trace: validation.errors,
                warnings: ['Validation failed structurally']
            };
        }

        this.trace('GENERATE_SUCCESS', { id: rawQuestion.id });
        
        return {
            success: true,
            question: validation.normalizedQuestion,
            trace: 'Generated deterministically',
            warnings: []
        };
    }

    /**
     * Helper to trace firewall events
     */
    static traceFirewall(entry) {
        try {
            const logDir = path.join(__dirname, '../logs');
            if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
            const logFile = path.join(logDir, 'semantic_firewall_trace.json');
            fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
        } catch (e) {
            console.error('[FirewallTrace] Error:', e.message);
        }
    }

    /**
     * Generate multiple questions safely into the review queue
     */
    static generateQuestionBatch(subject, topic, count) {
        const generationId = crypto.randomUUID();
        this.trace('BATCH_START', { generationId, subject, topic, count });
        
        // 1. Verify Syllabus Blueprint exists
        const blueprintResult = SyllabusIntelligenceService.loadBlueprint(subject);
        if (!blueprintResult.success) {
            this.trace('BATCH_FAILED', { reason: 'Missing Blueprint', subject });
            return { success: false, error: blueprintResult.error.message };
        }

        const generatedQuestions = [];
        let failures = 0;
        let quarantined = 0;
        let duplicateCount = 0;
        const warnings = [];

        // Load existing bank for the subject to run duplicate check
        const dataDir = path.join(__dirname, '../data');
        const masterFile = path.join(dataDir, `${subject.toLowerCase()}.json`);
        let existingBank = [];
        if (fs.existsSync(masterFile)) {
            const rawData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
            existingBank = Array.isArray(rawData) ? rawData : (rawData.questions || []);
        }

        // 2. Generation Loop
        for (let i = 0; i < count; i++) {
            const diffRand = this.seededRandom(`${subject}-${topic}-diff-${i}`);
            let diff = 'MEDIUM';
            if (diffRand < 0.3) diff = 'EASY';
            else if (diffRand > 0.7) diff = 'HARD';

            const result = this.generateQuestion({
                subject,
                topic,
                subtopic: 'General',
                difficulty: diff,
                exam: 'UPSC',
                classLevel: '12',
                type: 'conceptual',
                seedIndex: i + Date.now() // Ensure non-collision across batches
            });

            if (!result.success) {
                failures++;
                warnings.push(...result.warnings);
                continue;
            }

            const question = result.question;

            // 3. Semantic Firewall - Duplicate Detection
            const duplicateCheck = SemanticFirewallService.detectSemanticDuplicate(question, existingBank);
            if (duplicateCheck.duplicate) {
                duplicateCount++;
                quarantined++;
                ReviewQueueService.moveToQuarantine(question, `Semantic Duplicate: ${duplicateCheck.reasons.join(', ')}`);
                warnings.push(`Question quarantined due to duplication: ${duplicateCheck.reasons.join(', ')}`);
                continue;
            }

            generatedQuestions.push(question);
        }

        // 4. Semantic Firewall - Diversity Enforcement on Batch
        const diversityCheck = SemanticFirewallService.enforceQuestionDiversity(generatedQuestions);
        if (!diversityCheck.passed) {
            // Entire batch fails diversity -> quarantine all remaining
            generatedQuestions.forEach(q => {
                quarantined++;
                ReviewQueueService.moveToQuarantine(q, `Batch failed diversity check: ${diversityCheck.warnings.join(', ')}`);
            });
            
            this.traceFirewall({
                generationId,
                subject,
                topic,
                generated: count,
                approved: 0,
                quarantined: count,
                duplicateCount,
                diversityWarnings: diversityCheck.warnings,
                timestamp: new Date().toISOString()
            });

            return { success: false, error: `Batch rejected by Semantic Firewall (Diversity Failure): ${diversityCheck.warnings.join(', ')}` };
        }

        warnings.push(...diversityCheck.warnings);

        // 5. Write to Review Queue Service
        if (generatedQuestions.length > 0) {
            ReviewQueueService.enqueueForReview({
                metadata: {
                    generationId,
                    subject,
                    topic,
                    metrics: diversityCheck.metrics
                },
                questions: generatedQuestions
            });
        }

        this.traceFirewall({
            generationId,
            subject,
            topic,
            generated: count,
            approved: generatedQuestions.length,
            quarantined,
            duplicateCount,
            diversityWarnings: diversityCheck.warnings,
            timestamp: new Date().toISOString()
        });
        
        return { 
            success: true, 
            generationId, 
            count: generatedQuestions.length, 
            failures, 
            quarantined, 
            warnings 
        };
    }
}

module.exports = QuestionGenerationService;
