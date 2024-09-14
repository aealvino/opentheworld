const express = require('express');
const router = express.Router();
const sequelize = require('../server/db'); // For executing raw SQL queries

router.get('/', async (req, res) => {
    const { tagIds } = req.query;  // Получаем список тегов из запроса
    const tagFilter = tagIds ? `AND ti.tag_id IN (${tagIds.split(',').map(id => `'${id}'`).join(',')})` : '';

    try {
        const [routes] = await sequelize.query(`
            SELECT 
                r.id AS route_id, 
                r.name AS route_name, 
                tc.name AS tour_company_name, 
                tc.contact_info, 
                tc.website_url, 
                p.id AS place_id, 
                p.name AS place_name, 
                MIN(pb.yandex_map_link) AS yandex_map_link,  -- Берем один уникальный URL карты
                MIN(ph.photo_url) AS photo_url,              -- Берем одно фото
                ti.tag_id,
                tn.id AS tag_name_id,
                tn.tag_name
            FROM routes r
            LEFT JOIN tour_companies tc ON r.tour_company_id = tc.id
            JOIN place_routes pr ON r.id = pr.route_id
            JOIN places p ON pr.place_id = p.id
            LEFT JOIN place_branches pb ON p.id = pb.place_id
            LEFT JOIN photos ph ON p.id = ph.place_id
            LEFT JOIN tag_id ti ON p.id = ti.place_id
            LEFT JOIN tag_name tn ON ti.tag_id = tn.id
            WHERE 1=1
            ${tagFilter}  -- Apply tag filtering if tagIds are provided
            GROUP BY r.id, p.id, ti.tag_id, tn.id
        `);

        if (routes.length === 0) {
            return res.status(404).json({ error: 'No routes found' });
        }

        const groupedRoutes = routes.reduce((acc, route) => {
            const existingRoute = acc.find(r => r.route_id === route.route_id);
            const placeData = {
                place_id: route.place_id,
                name: route.place_name,
                yandex_map_link: route.yandex_map_link,
                photo: route.photo_url || 'images/default_route.jpg',
                Tags: [{
                    place_id: route.place_id,
                    tag_id: route.tag_id,
                    TagNames: {
                        id: route.tag_name_id,
                        tag_name: route.tag_name
                    }
                }]
            };

            if (existingRoute) {
                const existingPlace = existingRoute.places.find(p => p.place_id === route.place_id);
                if (existingPlace) {
                    // If the place already exists, just push the tag
                    existingPlace.Tags.push({
                        place_id: route.place_id,
                        tag_id: route.tag_id,
                        TagNames: {
                            id: route.tag_name_id,
                            tag_name: route.tag_name
                        }
                    });
                } else {
                    // If the place doesn't exist, add the place data
                    existingRoute.places.push(placeData);
                }
            } else {
                // If the route doesn't exist, create it
                acc.push({
                    route_id: route.route_id,
                    name: route.route_name,
                    tour_company: {
                        name: route.tour_company_name || 'Без туроператора',
                        contact_info: route.contact_info,
                        website_url: route.website_url
                    },
                    places: [placeData]
                });
            }
            return acc;
        }, []);

        res.json(groupedRoutes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'Server error while fetching routes' });
    }
});

module.exports = router;