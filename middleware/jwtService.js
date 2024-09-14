const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

function generateToken(payload, expiresIn = '24h') {  // Увеличил время жизни токена до 1 часа
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

async function generateRefreshToken(userId, expiresIn = '31d') {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 31);

    // Удаляем старый рефреш-токен пользователя, если он существует
    await RefreshToken.destroy({ where: { user_id: userId } });

    // Создаем новый рефреш-токен
    await RefreshToken.create({ user_id: userId, token, expires_at: expiresAt });

    return token;
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        console.error('Token verification failed:', err.message);
        return null;
    }
}

async function verifyRefreshToken(token) {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const storedToken = await RefreshToken.findOne({ where: { token } });

        if (!storedToken || new Date() > new Date(storedToken.expires_at)) {
            console.error('Refresh token expired or not found');
            return null;
        }

        return decoded;
    } catch (err) {
        console.error('Refresh token verification failed:', err.message);
        return null;
    }
}

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
};
