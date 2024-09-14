const express = require('express');
const router = express.Router();
const Places = require('../models/Places');
const TagIds = require('../models/TagIds');
const TagNames = require('../models/TagNames');
const PlaceBranches = require('../models/PlaceBranches');
const Photos = require('../models/Photos');

router.get('/', async (req, res) => {
    try {
        console.log('Fetching places...');
        const places = await Places.findAll({
            include: [
                {
                    model: TagIds,
                    as: 'Tags',
                    include: [{ model: TagNames, as: 'TagNames' }]
                },
                { model: PlaceBranches, as: 'Branches' },
                { model: Photos, as: 'Photos' }
            ],
            attributes: ['id', 'name', 'description', 'phone_number', 'website_url', 'average_rating']
        });
        console.log('Places fetched successfully');
        res.json(places);
    } catch (error) {
        console.error('Error fetching places:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
