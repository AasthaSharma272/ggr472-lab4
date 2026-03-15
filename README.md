# 🚦 Toronto Pedestrian & Cyclist Collisions Hexgrid Map

An interactive web map visualizing **pedestrian and cyclist collision hotspots in Toronto (2006–2021)** using **hexagonal spatial aggregation** and **client-side GIS analysis with Turf.js**.

This project was developed for **GGR472 – Developing Web Maps** at the **University of Toronto**.

## Project Overview

This web map explores the spatial distribution of road collisions involving pedestrians and cyclists in Toronto.  

Instead of displaying raw point data alone, collisions are aggregated into **0.5 km hexagonal grid cells** to reveal patterns of collision density across the city.

Hexgrid maps help reduce spatial bias that can occur in traditional choropleth maps by dividing the study area into **uniform geographic units**, allowing for clearer comparison of collision concentrations.

## Technologies Used

- **Mapbox GL JS** – interactive web mapping
- **Turf.js** – client-side spatial analysis
- **JavaScript (ES6)** – map logic and interaction
- **HTML5 & CSS3** – layout and styling
- **GeoJSON** – spatial data format
- **GitHub Pages** – deployment

## Spatial Analysis Methods

Several Turf.js functions were used to generate the hexgrid and perform spatial aggregation directly in the browser:

| Function | Purpose |
|--------|--------|
| `turf.envelope()` | Creates a bounding box around the collision dataset |
| `turf.transformScale()` | Expands the bounding box slightly to improve grid coverage |
| `turf.bbox()` | Extracts bounding coordinates for grid generation |
| `turf.hexGrid()` | Generates a **0.5 km hexagonal grid** over the study area |
| `turf.collect()` | Aggregates collision points into hexagon polygons |

Each hexagon stores a **COUNT attribute**, representing the number of collisions occurring inside that grid cell.

## Map Features

The web map includes several interactive elements designed to improve usability and data interpretation:

### Hexgrid Density Map
- Collision points aggregated into **0.5 km hexagons**
- **Color gradient** represents increasing collision density
- Optional layer toggle for improved map readability

### Collision Points
- Individual collision locations displayed as red point markers
- Optional layer toggle for improved map readability

### Collision Hotspots
- Hexagons with the highest collision counts are highlighted as **hotspot zones**
- Helps identify potentially dangerous areas for pedestrians and cyclists

### Interactive Popups
Clicking on a hexagon displays:
- Total number of collisions within that cell

### Map Legend
Legend explains:
- collision point symbols
- hotspot hexagons
- hexgrid density gradient

## Data Source

Collision data were derived from the **City of Toronto Open Data Portal**
