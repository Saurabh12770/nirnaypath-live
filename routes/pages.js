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

// Alias for about.html in case of direct links
router.get('/about.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'about.html'));
});

// Review admin was removed — redirect to main admin dashboard
router.get('/review-admin', (req, res) => {
    res.redirect(301, '/admin');
});
router.get('/review-admin.html', (req, res) => {
    res.redirect(301, '/admin');
});

module.exports = router;
