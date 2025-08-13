// This script adds custom brand styling to Leaflet markers
document.addEventListener("DOMContentLoaded", function () {
    if (typeof L === 'undefined' || typeof map === 'undefined') {
        console.warn("Leaflet or map object not found - brand marker script not applied.");
        return;
    }

    const brandIcon = L.divIcon({
        className: 'custom-brand-marker',
        html: '<div style="width:18px;height:18px;background-color:#c22a1f;border:2px solid white;border-radius:50%;"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
    });

    // Find all existing markers and re-style them
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            const latLng = layer.getLatLng();
            const popupContent = layer.getPopup() ? layer.getPopup().getContent() : "";
            map.removeLayer(layer);
            L.marker(latLng, { icon: brandIcon }).addTo(map).bindPopup(popupContent);
        }
    });

    console.log("Brand marker styling applied.");
});
