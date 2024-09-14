const sequelize = require('./db');
const Places = require('../models/Places');
const Ratings = require('../models/Ratings');

async function updateAverageRating(placeId) {
    try {
        const ratings = await Ratings.findAll({
            where: { place_id: placeId },
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']],
            raw: true
        });

        let averageRating = parseFloat(ratings[0].averageRating).toFixed(2);
        if (isNaN(averageRating)) {
            averageRating = 0.00;
        }

        await Places.update({ average_rating: averageRating }, { where: { id: placeId } });
        console.log(`Average rating for place ID ${placeId} updated to ${averageRating}`);
    } catch (error) {
        console.error('Error calculating average rating:', error);
    }
}

module.exports = updateAverageRating;
