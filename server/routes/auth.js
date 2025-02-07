const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Correct relative path

const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
    const { numeroImmatriculation, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ numeroImmatriculation, email, password: hashedPassword });
        await user.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_jwt_secret');
        res.json({ success: true, token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;