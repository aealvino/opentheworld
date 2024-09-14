const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const TourCompanies = sequelize.define('TourCompanies', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact_info: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    website_url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: 'tour_companies',
    timestamps: false,
});

module.exports = TourCompanies;
