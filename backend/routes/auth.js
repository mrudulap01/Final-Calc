const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-calcnova';

// Register User
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [existing] = await req.db.query('SELECT id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await req.db.query('INSERT INTO Users (email, password) VALUES (?, ?)', [email, hashed]);

        const token = jwt.sign({ userId: result.insertId }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: result.insertId, email } });
    } catch (err) {
        console.error("REGISTER ERROR", {
            email: req.body?.email,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await req.db.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        await req.db.query('UPDATE Users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                avatar: user.avatar,
                preferred_theme: user.preferred_theme,
                preferred_language: user.preferred_language
            }
        });
    } catch (err) {
        console.error("LOGIN ERROR", {
            email: req.body?.email,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to protect routes mapping
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Get Profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const [users] = await req.db.query('SELECT id, email, avatar, preferred_theme, preferred_language FROM Users WHERE id = ?', [req.userId]);
        if (users.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        console.error("PROFILE FETCH ERROR", {
            userId: req.userId,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Profile Theme
router.put('/profile/theme', authenticate, async (req, res) => {
    try {
        const { theme } = req.body;
        await req.db.query('UPDATE Users SET preferred_theme = ? WHERE id = ?', [theme, req.userId]);
        res.json({ success: true, theme });
    } catch (err) {
        console.error("THEME UPDATE ERROR", {
            userId: req.userId,
            theme: req.body?.theme,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update Profile Avatar
router.put('/profile/avatar', authenticate, async (req, res) => {
    try {
        const { avatar } = req.body;
        await req.db.query('UPDATE Users SET avatar = ? WHERE id = ?', [avatar, req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error("AVATAR UPDATE ERROR", {
            userId: req.userId,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete Account
router.delete('/account', authenticate, async (req, res) => {
    try {
        await req.db.query('DELETE FROM Users WHERE id = ?', [req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error("ACCOUNT DELETE ERROR", {
            userId: req.userId,
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
module.exports.authenticate = authenticate;
