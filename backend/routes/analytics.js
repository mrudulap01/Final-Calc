const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');

router.use(authenticate);

// Get Analytics data
router.get('/', async (req, res) => {
    try {
        // Total calculations
        const [totalStats] = await req.db.query('SELECT COUNT(*) as total FROM History WHERE user_id = ?', [req.userId]);

        // Mode distribution
        const [modeStats] = await req.db.query(
            'SELECT mode, COUNT(*) as count FROM History WHERE user_id = ? GROUP BY mode',
            [req.userId]
        );

        // Most used operator
        const [patternStats] = await req.db.query(
            'SELECT operator, usage_count FROM Patterns WHERE user_id = ? ORDER BY usage_count DESC LIMIT 5',
            [req.userId]
        );

        // Advanced metrics from History (last 1000 records)
        const [history] = await req.db.query(
            'SELECT expression, created_at FROM History WHERE user_id = ? ORDER BY created_at DESC LIMIT 1000',
            [req.userId]
        );

        const expCount = {};
        const numCount = {};
        const dailyTrend = {};

        history.forEach(row => {
            // Count exact expressions if length > 1 (ignore single digits)
            if (row.expression.length > 1) {
                expCount[row.expression] = (expCount[row.expression] || 0) + 1;
            }

            // Extract numbers
            const nums = row.expression.match(/\d+/g) || [];
            nums.forEach(n => {
                numCount[n] = (numCount[n] || 0) + 1;
            });

            // Daily trend
            const date = new Date(row.created_at).toISOString().split('T')[0];
            dailyTrend[date] = (dailyTrend[date] || 0) + 1;
        });

        // Sort Top 5 Repeated expressions
        const topExpressions = Object.entries(expCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([expr, count]) => ({ label: expr, value: count }));

        // Sort Top 5 Numbers
        const topNumbers = Object.entries(numCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([num, count]) => ({ label: num, value: count }));

        const dailyTrendFormatted = Object.entries(dailyTrend)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, count]) => ({ date, count }));

        res.json({
            totalCalculations: totalStats[0].total,
            modeDistribution: modeStats,
            topOperators: patternStats,
            topExpressions: topExpressions.filter(e => e.value > 1),
            topNumbers: topNumbers,
            dailyTrend: dailyTrendFormatted
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
