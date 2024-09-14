const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const Favorites = sequelize.define('Favorites', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users', // название таблицы с пользователями
      key: 'id',
    },
  },
  place_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'places', // название таблицы с местами
      key: 'id',
    },
  },
}, {
  tableName: 'favorites',
  timestamps: false,
});

module.exports = Favorites;
