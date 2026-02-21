const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based version for cleaner code
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

// --- MySQL CONNECTION POOL ---
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root007',
    database: process.env.DB_NAME || 'disaster_relief',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// --- API ROUTES ---

// GET: Fetch all volunteers from MySQL
app.get('/api/volunteers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM volunteers ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).send("Database connection failed.");
    }
});

// POST: Register volunteer in MySQL
app.post('/api/volunteers', async (req, res) => {
    const { name, phone, location, skill } = req.body;
    try {
        const sql = 'INSERT INTO volunteers (name, phone, location, skill) VALUES (?, ?, ?, ?)';
        await pool.execute(sql, [name, phone, location, skill]);
        res.status(201).json({ message: "Volunteer registered successfully!" });
    } catch (err) {
        console.error("Insert Error:", err);
        res.status(500).send("Failed to save volunteer data.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 SQL-Relief Server live at http://localhost:${PORT}`);
});