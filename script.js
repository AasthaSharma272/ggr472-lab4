/*--------------------------------------------------------------------
GGR472 LAB 4: Incorporating GIS Analysis into web maps using Turf.js
--------------------------------------------------------------------*/

/*--------------------------------------------------------------------
Step 1: INITIALIZE MAP
--------------------------------------------------------------------*/
// Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoiYWFzdGhhMjcyIiwiYSI6ImNtbGNud3g4dDB5N2czZ3EwdmN3ejlidGMifQ.qxx3hONjiExrB-iCER2Hjw';

// Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-79.39, 43.65],
    zoom: 11
});

// Add map controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

/*--------------------------------------------------------------------
Step 2: VIEW GEOJSON POINT DATA ON MAP
--------------------------------------------------------------------*/
// Empty variable to store collision data
let collisionData;

// Fetch GeoJSON data
fetch('data/pedcyc_collision_06-21.geojson')
    .then(response => response.json())
    .then(data => {
        collisionData = data;
        console.log('Collision data:', collisionData);

        // Wait until map is loaded before adding sources/layers
        map.on('load', () => {

            /*--------------------------------------------------------------------
            OPTIONAL: VIEW ORIGINAL POINT DATA ON MAP
            --------------------------------------------------------------------*/
            map.addSource('collisions', {
                type: 'geojson',
                data: collisionData
            });

            map.addLayer({
                id: 'collision-points',
                type: 'circle',
                source: 'collisions',
                paint: {
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        11, 2,
                        14, 4
                    ],
                    'circle-color': '#b30000',
                    'circle-opacity': 0.95
                }
            });

            /*--------------------------------------------------------------------
            Step 3: CREATE BOUNDING BOX AND HEXGRID
            --------------------------------------------------------------------*/
            // Create envelope feature around point data
            let bboxFeature = turf.envelope(collisionData);
            console.log('Envelope feature:', bboxFeature);

            // Scale the envelope slightly so edge points are better covered
            let scaledBboxFeature = turf.transformScale(bboxFeature, 1.1);
            console.log('Scaled envelope feature:', scaledBboxFeature);

            // Extract bbox coordinates array [minX, minY, maxX, maxY]
            let bbox = turf.bbox(scaledBboxFeature);
            console.log('Bounding box array:', bbox);

            // Create hexgrid with 0.5 km hexagons
            let hexgrid = turf.hexGrid(bbox, 0.5, { units: 'kilometers' });
            console.log('Hexgrid:', hexgrid);

            /*--------------------------------------------------------------------
            Step 4: AGGREGATE COLLISIONS BY HEXGRID
            --------------------------------------------------------------------*/
            // Collect all unique collision IDs (_id) from points into each hexagon
            let collectedHexgrid = turf.collect(hexgrid, collisionData, '_id', 'values');
            console.log('Collected hexgrid:', collectedHexgrid);

            // Variable to store the largest collision count found in any hexagon
            let maxCount = 0;

            // Loop through each hexagon feature
            collectedHexgrid.features.forEach(function(feature) {
                // Count how many collision point IDs were collected in this hexagon
                let count = feature.properties.values.length;

                // Store the count as a new property called COUNT
                feature.properties.COUNT = count;

                // Update maxCount if this hexagon has a larger count than current max
                if (count > maxCount) {
                    maxCount = count;
                }
            });

            document.getElementById('legend-max').textContent = maxCount;
            console.log('Maximum collision count in a hexagon:', maxCount);
            console.log('Hexgrid with COUNT:', collectedHexgrid);

            // Define hotspot threshold as 75% of maxCount
            let hotspotThreshold = maxCount * 0.75;

            /*--------------------------------------------------------------------
            Step 5: FINALIZE YOUR WEB MAP
            --------------------------------------------------------------------*/
            // Add aggregated hexgrid source
            map.addSource('hexgrid', {
                type: 'geojson',
                data: collectedHexgrid
            });

            // Add hexgrid fill layer
            map.addLayer({
                id: 'hexgrid-fill',
                type: 'fill',
                source: 'hexgrid',
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'COUNT'],
                        0, '#ffffcc',
                        maxCount * 0.25, '#a1dab4',
                        maxCount * 0.5, '#41b6c4',
                        maxCount * 0.75, '#2c7fb8',
                        maxCount, '#253494'
                    ],
                    'fill-opacity': [
                        'case',
                        ['==', ['get', 'COUNT'], 0],
                        0,
                        0.68
                    ]
                }
            });

            // Add hexgrid outline layer
            map.addLayer({
                id: 'hexgrid-outline',
                type: 'line',
                source: 'hexgrid',
                paint: {
                    'line-color': '#444',
                    'line-width': 0.3,
                    'line-opacity': 0.4
                }
            });

            // Add hotspot layer (hexagons with COUNT > 75% of maxCount)
            map.addLayer({
                id: 'hotspots',
                type: 'line',
                source: 'hexgrid',

                filter: ['>', ['get', 'COUNT'], hotspotThreshold],

                paint: {
                    'line-color': '#b30000',
                    'line-width': 1.8,
                    'line-opacity': 0.78
                }
            });

            // Popup on click
            map.on('click', 'hexgrid-fill', (e) => {

                const count = e.features[0].properties.COUNT;

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(`
                        <h3>Collision Density</h3>
                        <p><b>Total collisions:</b> ${count}</p>
                        <p>Hexagon size: 0.5 km</p>
                    `)
                    .addTo(map);

            });

            // Change cursor on hover
            map.on('mouseenter', 'hexgrid-fill', () => {
                map.getCanvas().style.cursor = 'pointer';
            });

            map.on('mouseleave', 'hexgrid-fill', () => {
                map.getCanvas().style.cursor = '';
            });

            /*--------------------------------------------------------------------
            OPTIONAL TOGGLE BUTTON FOR POINTS
            --------------------------------------------------------------------*/
            document.getElementById('toggle-points').addEventListener('click', () => {
                const visibility = map.getLayoutProperty('collision-points', 'visibility');

                if (visibility === 'none') {
                    map.setLayoutProperty('collision-points', 'visibility', 'visible');
                } else {
                    map.setLayoutProperty('collision-points', 'visibility', 'none');
                }
            });

            document.getElementById('toggleHex').onclick = function () {

                let visibility = map.getLayoutProperty('hexgrid-fill', 'visibility');

                if (visibility === 'visible') {
                    map.setLayoutProperty('hexgrid-fill', 'visibility', 'none');
                    map.setLayoutProperty('hexgrid-outline', 'visibility', 'none');
                } else {
                    map.setLayoutProperty('hexgrid-fill', 'visibility', 'visible');
                    map.setLayoutProperty('hexgrid-outline', 'visibility', 'visible');
                }
            };

        });
    })
    .catch(error => {
        console.error('Error loading collision data:', error);
    });