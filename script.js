// Expose map globally (handy if you ever add a small style add-on)
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

  // Base tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Fetch and parse CSV
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: results => {
      const rows = results.data || [];
      const markers = [];
      let latestDate = null;

      rows.forEach(row => {
        // Expect columns: Country, Platform, Lat, Lng, Updated
        const lat = parseFloat((row.Lat || "").toString().trim());
        const lng = parseFloat((row.Lng || "").toString().trim());
        const country = (row.Country || "").toString().trim();
        const platform = (row.Platform || "").toString().trim();

        if (!isNaN(lat) && !isNaN(lng)) {
          const m = L.marker([lat, lng]).addTo(map);
          m.bindPopup(
            `<b>${country || "Unknown"}</b>${platform ? "<br>" + platform : ""}`
          );
          markers.push(m);
        }

        if (row.Updated) {
          const d = new Date(row.Updated);
          if (!isNaN(d.getTime())) {
            if (!latestDate || d > latestDate) latestDate = d;
          }
        }
      });

      // Auto-fit to all markers
      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [30, 30] });
      } else {
        map.setView([20, 0], 2); // fallback if no data
      }

      // Set the “Last updated” badge
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
    error: err => {
      console.error("CSV load error:", err);
      const badge = document.getElementById("last-updated");
      if (badge) badge.textContent = "Last updated: (data source error)";
      map.setView([20, 0], 2);
    }
  });
});
