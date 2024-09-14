// models/Photos.js
const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const Photos = sequelize.define('Photos', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  place_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Places',
      key: 'id',
    },
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'photos',
  timestamps: false,
});

module.exports = Photos;