const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const TagIds = sequelize.define('TagIds', {
  place_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  tag_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
}, {
  tableName: 'tag_id',
  timestamps: false,
});

module.exports = TagIds;
