'use strict';
const mongoose = require('mongoose');

/**
 * NirnayPath — Notification Model (Phase 10 — Module D)
 * Persistent in-app notifications with read-state tracking.
 */
const NotificationSchema = new mongoose.Schema({
    userId: {
        type:     mongoose.Schema.Types.ObjectId,
        ref:      'User',
        required: true,
        index:    true
    },
    title:   { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    type: {
        type:    String,
        enum:    ['achievement', 'streak', 'reminder', 'recommendation', 'exam_countdown', 'xp_reward', 'system', 'leaderboard'],
        default: 'system'
    },
    icon:      { type: String, default: '🔔' },
    action:    { type: String, default: '/dashboard' },  // URL to navigate to
    isRead:    { type: Boolean, default: false, index: true },
    priority:  { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    metadata:  { type: Object, default: {} },
    expiresAt: { type: Date, default: null },          // null = never expires
    createdAt: { type: Date, default: Date.now, index: true }
});

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true }); // TTL for auto-delete

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;
