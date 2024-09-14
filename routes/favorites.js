const express = require('express');
const router = express.Router();
const Favorites = require('../models/Favorites');
const authenticateToken = require('../middleware/authenticateToken');

// Добавление в избранное
router.post('/add', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  const user_id = req.user.id;

  try {
    const existingFavorite = await Favorites.findOne({ where: { user_id, place_id } });
    if (existingFavorite) {
      return res.status(400).json({ error: 'Это место уже добавлено в избранное' });
    }

    await Favorites.create({ user_id, place_id });
    res.json({ message: 'Добавлено в избранное' });
  } catch (error) {
    console.error('Ошибка при добавлении в избранное:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Удаление из избранного
router.post('/remove', authenticateToken, async (req, res) => {
  const { place_id } = req.body;
  const user_id = req.user.id;

  try {
    const existingFavorite = await Favorites.findOne({ where: { user_id, place_id } });
    if (!existingFavorite) {
      return res.status(400).json({ error: 'Это место не найдено в избранном' });
    }

    await existingFavorite.destroy();
    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Ошибка при удалении из избранного:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const favorites = await Favorites.findAll({ where: { user_id } });
    res.json(favorites);
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

module.exports = router;
