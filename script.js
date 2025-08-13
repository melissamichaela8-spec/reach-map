// Keep map global (handy for future tweaks)
var map;

// Your published Google Sheet CSV URL:
const sheetUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrX1BaSvkrXrc_xT8RBAkopyj-AURsL1cVAQGM304qmKYfjMTIl9DXMnkQAzid5ZUYrBWPQ7MN7mIm/pub?output=csv";

document.addEventListener("DOMContentLoaded", function () {
  // Initialise the map (no fixed center/zoom; we’ll fit to markers)
  map = L.map("map", {
    worldCopyJump: true,
    minZoom: 2
  });

  // Base layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Load CSV and render markers
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data || [];
      const markers = [];
      let latestDate = null;

      rows.forEach((row) => {
        // Expected columns: Country, Platform, Lat, Lng, Updated
        const lat = parseFloat((row.Lat || "").toString().trim());
        const lng = parseFloat((row.Lng || "").toString().trim());
        const country = (row.Country || "").toString().trim();
        const platform = (row.Platform || "").toString().trim();

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng]).addTo(map);
          marker.bindPopup(
            `<b>${country || "Unknown"}</b>${platform ? "<br>" + platform : ""}`
          );
          markers.push(marker);
        }

        if (row.Updated) {
          const d = new Date(row.Updated);
          if (!isNaN(d.getTime())) {
            if (!latestDate || d > latestDate) latestDate = d;
          }
        }
      });

      // Auto-fit to all markers so nothing’s cropped
      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [30, 30] });
      } else {
        map.setView([20, 0], 2);
      }

      // Update the in-map date badge
      const stamp = latestDate || new Date();
      const badge = document.getElementById("last-updated");
      if (badge) {
        badge.textContent =
          "Last updated: " +
          stamp.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
      }
    },
    error: (err) => {
      console.error("CSV load error:", err);
      const badge = document.getElementById("last-updated");
      if (badge) badge.textContent = "Last updated: (data source error)";
      map.setView([20, 0], 2);
    }
  });
});
