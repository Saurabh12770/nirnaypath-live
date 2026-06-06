/**
 * SyllabusService v2.0
 * Loads & caches the exam→subject hierarchy from data/syllabus/index.json
 * No AI, no Redis, no external dependencies — pure in-memory.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SYLLABUS_PATH = path.resolve(__dirname, '../data/syllabus/index.json');

let _cache = null;        // { exams: [...] }
let _mapByExam = null;    // { UPSC: { id, name, subjects: [...] }, ... }
let _mapBySubject = null; // { history: [{ examId, examName, subject }], ... }

function _load() {
    if (_cache) return;
    try {
        const raw = fs.readFileSync(SYLLABUS_PATH, 'utf8');
        _cache = JSON.parse(raw);
    } catch (err) {
        console.error('[SyllabusService] Failed to load syllabus index:', err.message);
        _cache = { exams: [] };
    }

    _mapByExam = {};
    _mapBySubject = {};

    for (const exam of _cache.exams) {
        _mapByExam[exam.id] = exam;
        for (const subject of exam.subjects) {
            if (!_mapBySubject[subject.id]) {
                _mapBySubject[subject.id] = [];
            }
            _mapBySubject[subject.id].push({ examId: exam.id, examName: exam.name, subject });
        }
    }
}

class SyllabusService {
    /**
     * Returns the full exam catalogue.
     * @returns {{ exams: object[] }}
     */
    static getCatalogue() {
        _load();
        return _cache;
    }

    /**
     * Returns all exams (array).
     * @returns {object[]}
     */
    static getAllExams() {
        _load();
        return _cache.exams;
    }

    /**
     * Returns one exam by ID, or null.
     * @param {string} examId
     * @returns {object|null}
     */
    static getExam(examId) {
        _load();
        return _mapByExam[examId.toUpperCase()] || null;
    }

    /**
     * Returns subjects for a given exam.
     * @param {string} examId
     * @returns {object[]|null}
     */
    static getSubjectsForExam(examId) {
        _load();
        const exam = _mapByExam[examId.toUpperCase()];
        return exam ? exam.subjects : null;
    }

    /**
     * Returns all exams that contain a given subject.
     * @param {string} subjectId
     * @returns {object[]}
     */
    static getExamsForSubject(subjectId) {
        _load();
        return _mapBySubject[subjectId.toLowerCase()] || [];
    }

    /**
     * Returns the canonical data key for a subject within an exam.
     * @param {string} examId
     * @param {string} subjectId
     * @returns {string|null}
     */
    static getDataKey(examId, subjectId) {
        _load();
        const exam = _mapByExam[examId.toUpperCase()];
        if (!exam) return null;
        const subject = exam.subjects.find(s => s.id === subjectId.toLowerCase());
        return subject ? subject.dataKey : null;
    }

    /**
     * Returns a flat summary of all subjects across all exams (unique by id).
     * @returns {object[]}
     */
    static getAllSubjects() {
        _load();
        const seen = new Set();
        const result = [];
        for (const exam of _cache.exams) {
            for (const sub of exam.subjects) {
                if (!seen.has(sub.id)) {
                    seen.add(sub.id);
                    result.push(sub);
                }
            }
        }
        return result;
    }

    static clearCache() {
        _cache = null;
        _mapByExam = null;
        _mapBySubject = null;
    }
}

module.exports = SyllabusService;
