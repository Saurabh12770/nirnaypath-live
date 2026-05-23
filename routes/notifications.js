'use strict';
const express = require('express');
const auth = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications (paginated)
 */
router.get('/', auth, async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const result = await notificationService.getAll(req.user._id, page, limit);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/notifications/unread
 * Get latest unread notifications
 */
router.get('/unread', auth, async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const notifications = await notificationService.getUnread(req.user._id, limit);
        res.json({
            success: true,
            notifications
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/notifications/count
 * Get count of unread notifications
 */
router.get('/count', auth, async (req, res) => {
    try {
        const count = await notificationService.getUnreadCount(req.user._id);
        res.json({
            success: true,
            count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/notifications/:id/read
 * Mark a single notification as read
 */
router.post('/:id/read', auth, async (req, res) => {
    try {
        const notification = await notificationService.markRead(req.user._id, req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/notifications/read-all
 * Mark all notifications as read for current user
 */
router.post('/read-all', auth, async (req, res) => {
    try {
        await notificationService.markAllRead(req.user._id);
        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
