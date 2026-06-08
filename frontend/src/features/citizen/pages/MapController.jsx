import { useEffect } from "react";
import { useMap } from "react-leaflet";

const MapController = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), {
        animate: true,
        duration: 1.5,
      });
    }
  }, [center, map]);
  return null;
};

export default MapController;