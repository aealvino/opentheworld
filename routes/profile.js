const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const User = require('../models/User');

router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['username', 'email']
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
