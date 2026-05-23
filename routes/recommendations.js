'use strict';
const express = require('express');
const auth = require('../middleware/auth');
const recommendationService = require('../services/recommendationService');
const router = express.Router();

/**
 * GET /api/recommendations
 * Fetch personalized AI recommendations, weak-topic prioritisation, next-test suggestions, etc.
 */
router.get('/', auth, async (req, res) => {
    try {
        const recommendations = await recommendationService.generate(req.user._id);
        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
