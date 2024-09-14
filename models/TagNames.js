const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const TagNames = sequelize.define('TagNames', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tag_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'tag_name',
  timestamps: false,
});

module.exports = TagNames;
