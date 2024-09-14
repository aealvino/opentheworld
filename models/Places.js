const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');
const TagIds = require('./TagIds');
const TagNames = require('./TagNames');
const PlaceBranches = require('./PlaceBranches');
const Photos = require('./Photos');
const Ratings = require('./Ratings');
const PlaceRoutes = require('./PlaceRoutes');
const PlaceTourCompanies = require('./PlaceTourCompanies');
const Routes = require('./Routes');

const Places = sequelize.define('Places', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    seasonality: {
        type: DataTypes.STRING,
    },
    price_category: {
        type: DataTypes.STRING,
    },
    phone_number: {
        type: DataTypes.STRING(20),
    },
    website_url: {
        type: DataTypes.STRING,
    },
    average_rating: {
        type: DataTypes.DECIMAL(3, 2),
        defaultValue: 0.00,
    },
}, {
    tableName: 'places',
    timestamps: false,
});

// Relations
Places.hasMany(TagIds, { foreignKey: 'place_id', as: 'Tags' });
TagIds.belongsTo(TagNames, { foreignKey: 'tag_id', as: 'TagNames' });

Places.hasMany(PlaceBranches, { foreignKey: 'place_id', as: 'Branches' });
PlaceBranches.belongsTo(Places, { foreignKey: 'place_id' });

Places.hasMany(Photos, { foreignKey: 'place_id', as: 'Photos' });
Photos.belongsTo(Places, { foreignKey: 'place_id' });

Places.hasMany(PlaceRoutes, { foreignKey: 'place_id', as: 'PlaceRoutes' });
PlaceRoutes.belongsTo(Places, { foreignKey: 'place_id' });

Places.hasMany(PlaceTourCompanies, { foreignKey: 'place_id', as: 'TourCompanies' });
PlaceTourCompanies.belongsTo(Places, { foreignKey: 'place_id' });

module.exports = Places;
