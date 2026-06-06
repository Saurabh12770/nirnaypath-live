const express = require('express');
const router = express.Router();
const path = require('path');

const publicPath = path.join(__dirname, '../public');

router.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

router.get('/about', (req, res) => {
    res.sendFile(path.join(publicPath, 'about.html'));
});

router.get('/about.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'about.html'));
});

// ── Learn Platform ────────────────────────────────────────────────────────────
router.get('/learn', (req, res) => {
    res.sendFile(path.join(publicPath, 'learn.html'));
});

router.get('/learn.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'learn.html'));
});

// ── Mock Tests ────────────────────────────────────────────────────────────────
router.get('/mock-tests', (req, res) => {
    res.sendFile(path.join(publicPath, 'mock-tests.html'));
});

router.get('/mock-tests.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'mock-tests.html'));
});

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(publicPath, 'dashboard.html'));
});

router.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'dashboard.html'));
});

// Redirects for old paths
router.get('/review-admin', (req, res) => { res.redirect(301, '/admin'); });
router.get('/review-admin.html', (req, res) => { res.redirect(301, '/admin'); });

module.exports = router;

