require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Keep mysql import

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'calcnova',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to inject DB pool
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// Basic routing setup
app.use('/api/auth', require('./routes/auth'));
app.use('/api/history', require('./routes/history'));
app.use('/api/analytics', require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
