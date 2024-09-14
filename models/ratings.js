const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const Ratings = sequelize.define('Ratings', {
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5,
    }
  }
}, {
  tableName: 'ratings',
  timestamps: false,
});

module.exports = Ratings;
