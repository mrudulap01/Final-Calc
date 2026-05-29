const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');

router.use(authenticate);

// Add voice log
router.post('/', async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) return res.status(400).json({ error: 'Transcript is required' });

        await req.db.query(
            'INSERT INTO VoiceLogs (user_id, transcript) VALUES (?, ?)',
            [req.userId, transcript]
        );
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error logging voice transcript:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
