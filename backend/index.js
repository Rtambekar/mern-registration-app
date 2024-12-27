require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// import routes and controllers
const authRoutes = require('./routes/authRoutes');

//  express
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Test route to verify the backend is running
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Use routes for authentication
app.use('/api', authRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

