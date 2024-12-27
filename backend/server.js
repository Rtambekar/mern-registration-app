const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize the app and connect to MySQL database
const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',  // Replace with your MySQL password
    database: 'client_management'
});

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ', err.stack);
        return;
    }
    console.log('Connected to database');
});

// API to register a new user
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, mobileNumber, password, createdBy, updatedBy } = req.body;

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = 'CALL insert_user(?, ?, ?, ?, ?, ?)';
    db.query(query, [firstName, lastName, mobileNumber, hashedPassword, createdBy, updatedBy], (err, result) => {
        if (err) {
            console.error('Error inserting data: ', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(201).json({ message: 'User registered successfully', result });
    });
});

// API to login a user (POST request)
app.post('/api/login', (req, res) => {
    const { mobileNumber, password } = req.body;

    // Query the database for the user with the provided mobile number
    db.query('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber], async (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Database error' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result[0];

        // Compare the entered password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Create a JWT token if the user is authenticated
        const token = jwt.sign(
            { id: user.id, firstName: user.first_name, lastName: user.last_name },
            'your_secret_key', // Use a secret key for JWT creation, store securely
            { expiresIn: '1h' } // Set token expiration time (1 hour in this case)
        );

        // Respond with the generated token and user details
        res.status(200).json({
            message: 'Login successful',
            token,  // The JWT token
            user: { 
                firstName: user.first_name, 
                lastName: user.last_name 
            }
        });
    });
});

// API to get user data
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error fetching data: ', err);
            return res.status(500).json({ message: 'Database error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(result[0]);
    });
});

// API to update user data
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, mobileNumber, password, updatedBy } = req.body;

    db.query(
        'UPDATE users SET first_name = ?, last_name = ?, mobile_number = ?, password = ?, updatedBy = ? WHERE id = ?',
        [firstName, lastName, mobileNumber, password, updatedBy, id],
        (err, result) => {
            if (err) {
                console.error('Error updating data: ', err);
                return res.status(500).json({ message: 'Database error' });
            }
            res.status(200).json({ message: 'User updated successfully' });
        }
    );
});

// API to delete user
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting data: ', err);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
