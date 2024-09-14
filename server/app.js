const express = require('express');
const path = require('path');
const sequelize = require('./db');
const authRoutes = require('../routes/auth');
const favoritesRoutes = require('../routes/favorites');
const ratingsRoutes = require('../routes/ratings');
const placesRoutes = require('../routes/places');
const tagsRoutes = require('../routes/tags');
const profileRoutes = require('../routes/profile');

const authenticateToken = require('../middleware/authenticateToken');

const app = express();
const port = process.env.PORT || 3000;
const routesRoutes = require('../routes/routes'); // Ensure this is correctly imported
app.use('/routes', routesRoutes); // Add the new route

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/auth', authRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/ratings', ratingsRoutes);
app.use('/places', placesRoutes);
app.use('/tags', tagsRoutes);
app.use('/profile', profileRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Логирование всех входящих запросов
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// Пример защищенного маршрута
app.get('/protected', authenticateToken, (req, res) => {
    console.log('Protected route accessed');
    res.send('This is a protected route');
});

// Подключение к базе данных и запуск сервера
// app.js
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err.message);
    // You can add more detailed handling here, e.g., send a message to the admin or retry logic
});

