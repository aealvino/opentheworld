// models/RefreshToken.js
const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');
const User = require('./User');

const RefreshToken = sequelize.define('RefreshToken', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // название таблицы, к которой создается внешний ключ
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    token: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW,
    },
});

module.exports = RefreshToken;
