const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');
const Places = require('./Places');
const Routes = require('./Routes');

const PlaceRoutes = sequelize.define('PlaceRoutes', {
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
    route_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Routes,
            key: 'id',
        },
    },
}, {
    tableName: 'place_routes',
    timestamps: false,
});

module.exports = PlaceRoutes;
