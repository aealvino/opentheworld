const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');
const Places = require('./Places');
const TourCompanies = require('./TourCompanies');

const PlaceTourCompanies = sequelize.define('PlaceTourCompanies', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    place_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Places,
            key: 'id',
        },
    },
    tour_company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: TourCompanies,
            key: 'id',
        },
    },
}, {
    tableName: 'place_tour_companies',
    timestamps: false,
});

module.exports = PlaceTourCompanies;
