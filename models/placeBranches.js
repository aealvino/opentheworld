const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const PlaceBranches = sequelize.define('PlaceBranches', {
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
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yandex_map_link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
  },
}, {
  tableName: 'place_branches',
  timestamps: false,
});

module.exports = PlaceBranches;
