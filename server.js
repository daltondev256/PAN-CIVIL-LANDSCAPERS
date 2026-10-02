const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- API ENDPOINTS ---

// 1. Submit a Contact Form Message
app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    const query = `INSERT INTO inquiries (name, email, phone, message) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [name, email, phone, message], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Inquiry submitted successfully!', id: this.lastID });
    });
});

// 2. Submit a Quote / Booking Request
app.post('/api/quotes', (req, res) => {
    const { client_name, phone, service_type, property_type, preferred_date } = req.body;
    const query = `INSERT INTO quotes (client_name, phone, service_type, property_type, preferred_date) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [client_name, phone, service_type, property_type, preferred_date], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Quote request submitted successfully!', id: this.lastID });
    });
});

// 3. Admin: View All Customer Inquiries
app.get('/api/admin/inquiries', (req, res) => {
    db.all(`SELECT * FROM inquiries ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ inquiries: rows });
    });
});

// 4. Admin: View All Quote Requests
app.get('/api/admin/quotes', (req, res) => {
    db.all(`SELECT * FROM quotes ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ quotes: rows });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Pancivil Landscapers server running on http://localhost:${PORT}`);
});