import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const HeatmapLayer = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Use a higher intensity multiplier (e.g., 1.0 instead of 0.8)
    const heatData = points.map(p => [p.coordinates[1], p.coordinates[0], 1.0]);

    const heatLayer = L.heatLayer(heatData, {
      radius: 40,      // Increased radius for better visibility
      blur: 20,        // Smoother edges
      max: 1.0,        // Normalize intensity
      minOpacity: 0.5, // Ensures hotspots don't disappear on dark maps
      gradient: {
        0.2: '#00f2ff', // Cyber Cyan (Outer)
        0.4: '#7c3aed', // Purple
        0.7: '#ff0055', // Neon Pink
        1.0: '#ffffff'  // White Hot Core
      }
    }).addTo(map);

    return () => map.removeLayer(heatLayer);
  }, [map, points]);

  return null;
};

export default HeatmapLayer;