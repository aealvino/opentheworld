const express = require('express');
const router = express.Router();
const TagNames = require('../models/TagNames');

router.get('/', async (req, res) => {
  try {
    console.log('Fetching tags...');
    const tags = await TagNames.findAll();
    console.log('Tags fetched successfully');
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
