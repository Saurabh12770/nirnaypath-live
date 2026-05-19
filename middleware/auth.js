const jwt = require('jsonwebtoken');
const User = require('../models/user');

const parseCookies = (cookieHeader) => {
    const list = {};
    if (!cookieHeader) return list;
    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name.trim();
        if (!name) return;
        const val = rest.join('=').trim();
        list[name] = decodeURIComponent(val);
    });
    return list;
};

const auth = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.header('Authorization');
        if (authHeader && authHeader !== 'Bearer null' && authHeader !== 'Bearer undefined') {
            token = authHeader.replace('Bearer ', '');
        } else if (req.headers.cookie) {
            const cookies = parseCookies(req.headers.cookie);
            token = cookies.token;
        }

        if (!token) {
            throw new Error('No token found');
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error('FATAL: JWT_SECRET missing');
            process.exit(1);
        }
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error('User not found');
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

module.exports = auth;
