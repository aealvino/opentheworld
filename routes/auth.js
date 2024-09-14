const express = require('express');
const bcrypt = require('bcrypt');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/jwtService');
const User = require('../models/User');
const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            console.warn('Password validation failed');
            return res.status(400).json({ error: 'Password must be at least 8 characters long and include both letters and numbers' });
        }

        if (password !== confirmPassword) {
            console.warn('Password confirmation does not match');
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const existingUserByUsername = await User.findOne({ where: { username } });
        if (existingUserByUsername) {
            console.warn(`Username already taken: ${username}`);
            return res.status(400).json({ error: 'Username is already taken' });
        }

        const existingUserByEmail = await User.findOne({ where: { email } });
        if (existingUserByEmail) {
            console.warn(`Email already registered: ${email}`);
            return res.status(400).json({ error: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password_hash: hashedPassword
        });

        console.log(`User registered successfully: ${username}`);
        res.status(201).json({ message: 'User successfully registered' });
    } catch (error) {
        console.error('Error during registration:', error.message);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        user.last_login = new Date();
        await user.save();

        const token = generateToken({ id: user.id, email: user.email });
        const refreshToken = await generateRefreshToken(user.id); // Ожидание асинхронной функции

        res.status(200).json({ message: 'Login successful', token, refreshToken });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error during login' });
    }
});

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const decoded = await verifyRefreshToken(refreshToken);
        if (!decoded) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        const token = generateToken({ id: decoded.userId });
        res.status(200).json({ token });
    } catch (error) {
        console.error('Error during token refresh:', error.message);
        res.status(500).json({ error: 'Internal server error during token refresh' });
    }
});

module.exports = router;
