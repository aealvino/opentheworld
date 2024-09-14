const express = require('express');
const router = express.Router();
const Ratings = require('../models/Ratings');
const authenticateToken = require('../middleware/authenticateToken');
const updateAverageRating = require('../server/averageRating');
const Places = require('../models/Places'); // Подключите модель Places

// Добавление или обновление рейтинга
router.post('/rate', authenticateToken, async (req, res) => {
    const { place_id, rating } = req.body;
    const user_id = req.user.id;

    try {
        const existingRating = await Ratings.findOne({ where: { user_id, place_id } });
        if (existingRating) {
            existingRating.rating = rating;
            await existingRating.save();
            await updateAverageRating(place_id);  // Обновление средней оценки
            const place = await Places.findOne({ where: { id: place_id } });
            return res.json({ message: 'Rating updated', averageRating: place.average_rating });
        }

        await Ratings.create({ user_id, place_id, rating });
        await updateAverageRating(place_id);  // Обновление средней оценки
        const place = await Places.findOne({ where: { id: place_id } });
        res.json({ message: 'Rating added', averageRating: place.average_rating });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const ratings = await Ratings.findAll({ where: { user_id } });
        res.json(ratings);
    } catch (error) {
        console.error('Ошибка при получении оценок:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

module.exports = router;
