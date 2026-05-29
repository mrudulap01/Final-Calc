const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');

// Get specific history item for sharing (Public, no auth)
router.get('/share/:id', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            `SELECT h.expression, h.result, h.created_at, u.avatar, u.email, u.preferred_theme as theme 
             FROM History h JOIN Users u ON h.user_id = u.id 
             WHERE h.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching share item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.use(authenticate);

// Create shareable link explicitly
router.post('/share', async (req, res) => {
    try {
        const { expression, result, mode } = req.body;
        if (!expression || !result) {
            return res.status(400).json({ error: 'Expression and result are required' });
        }
        const [insert] = await req.db.query(
            'INSERT INTO History (user_id, expression, result, mode) VALUES (?, ?, ?, ?)',
            [req.userId, expression, result, mode || 'basic']
        );
        res.json({ id: insert.insertId });
    } catch (err) {
        console.error('Error creating share item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Parse operators to save to Patterns
const extractOperators = (expr) => {
    const ops = expr.match(/[\+\-\*\/\%\^]/g) || [];
    return ops;
};

// Add history
router.post('/', async (req, res) => {
    try {
        const { expression, result, mode } = req.body;
        if (!expression || !result || !mode) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        await req.db.query(
            'INSERT INTO History (user_id, expression, result, mode) VALUES (?, ?, ?, ?)',
            [req.userId, expression, result, mode]
        );

        // Pattern tracking
        const operators = extractOperators(expression);
        for (const op of operators) {
            const [existing] = await req.db.query('SELECT id FROM Patterns WHERE user_id = ? AND operator = ?', [req.userId, op]);
            if (existing.length > 0) {
                await req.db.query('UPDATE Patterns SET usage_count = usage_count + 1 WHERE id = ?', [existing[0].id]);
            } else {
                await req.db.query('INSERT INTO Patterns (user_id, operator, usage_count) VALUES (?, ?, 1)', [req.userId, op]);
            }
        }

        res.status(201).json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get history
router.get('/', async (req, res) => {
    try {
        const [rows] = await req.db.query(
            'SELECT * FROM History WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete history item
router.delete('/:id', async (req, res) => {
    try {
        await req.db.query('DELETE FROM History WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting history item:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear all history
router.delete('/', async (req, res) => {
    try {
        await req.db.query('DELETE FROM History WHERE user_id = ?', [req.userId]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error clearing history:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
