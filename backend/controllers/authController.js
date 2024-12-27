const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../config/db');

// Registration function
const registerUser = (req, res) => {
    const { firstName, lastName, mobileNumber, password } = req.body;

    if (!firstName || !lastName || !mobileNumber || !password) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query = `INSERT INTO users (first_name, last_name, mobile_number, password) VALUES (?, ?, ?, ?)`;
    const values = [firstName, lastName, mobileNumber, hashedPassword];

    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'User registered successfully!' });
    });
};

// Login function
const loginUser = (req, res) => {
    const { mobileNumber, password } = req.body;

    if (!mobileNumber || !password) {
        return res.status(400).json({ error: 'Mobile number and password are required!' });
    }

    const query = `SELECT * FROM users WHERE mobile_number = ?`;
    connection.query(query, [mobileNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = results[0];
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.id, mobileNumber: user.mobile_number }, 'secret_key', { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    });
};

module.exports = {
    registerUser,
    loginUser,
};
