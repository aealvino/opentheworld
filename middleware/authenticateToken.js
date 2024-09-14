// authenticateToken.js
const { verifyToken, verifyRefreshToken, generateToken } = require('./jwtService');
const User = require('../models/User');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('Token not provided');
        return res.status(401).json({ error: 'Access token is missing' });
    }

    let user = verifyToken(token);
    if (!user) {
        console.error('Access token is invalid or expired');

        // Попробуем обновить токен с использованием refresh токена
        const refreshToken = req.headers['refresh-token'];
        if (!refreshToken) {
            return res.status(403).json({ error: 'Invalid or expired access token and no refresh token provided' });
        }

        const decodedRefreshToken = await verifyRefreshToken(refreshToken);
        if (!decodedRefreshToken) {
            return res.status(403).json({ error: 'Invalid or expired refresh token' });
        }

        // Генерация нового access токена
        const newAccessToken = generateToken({ id: decodedRefreshToken.userId });

        // Возвращаем новый access токен в заголовке ответа
        res.setHeader('Authorization', `Bearer ${newAccessToken}`);
        user = verifyToken(newAccessToken); // Повторно проверяем новый токен
    }

    try {
        const dbUser = await User.findByPk(user.id);
        if (!dbUser) {
            console.error('User not found in the database');
            return res.status(403).json({ error: 'User does not exist' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Database query failed during token authentication:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = authenticateToken;
