const { DataTypes } = require('sequelize');
const sequelize = require('../server/db');

const Routes = sequelize.define('Routes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tour_company_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'tour_companies', // Ensure this references the right table
            key: 'id',
        },
        allowNull: true,
    }
}, {
    tableName: 'routes',
    timestamps: false,
});


module.exports = Routes;
