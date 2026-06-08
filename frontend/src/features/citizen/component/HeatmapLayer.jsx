import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

const HeatmapLayer = ({ points }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (!points || points.length === 0) return;

    const container = map.getContainer();
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      const retryFrame = requestAnimationFrame(() => {
        map.invalidateSize();
      });
      return () => cancelAnimationFrame(retryFrame);
    }

    const heatData = points.map(p => [
      p.coordinates[1], // Latitude
      p.coordinates[0], // Longitude
      parseFloat(p.intensity || 1.0)
    ]);

    try {
      heatLayerRef.current = L.heatLayer(heatData, {
        radius: 35,
        blur: 25,
        max: 1.0,
        minOpacity: 0.45,
        gradient: {
          0.1: '#00f2ff', // Cyber Cyan
          0.4: '#7c3aed', // Neon Purple
          0.8: '#ff0055', // High Density Hot Pink
          1.0: '#ffffff'  // Critical Density White Core
        }
      }).addTo(map);
    } catch (error) {
      console.warn("HEATMAP_CANVAS_INITIALIZATION_DEFERRED:", error.message);
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;