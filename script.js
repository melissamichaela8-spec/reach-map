// Expose map globally so optional add-on scripts can access it
var map;

// YOUR published Google Sheet CSV (unchanged; the one you gave me)
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrX1BaSvkrXrc_xT8RBAkopyj-AURsL1cVAQGM304qmKYfjMTIl9DXMnkQAzid5ZUYrBWPQ7MN7mIm/pub?output=csv";

document.addEventListener("DOMContentLoaded", function () {
  // Create map (no hard-coded center/zoom; we'll fit to markers)
  map = L.map("map", {
    worldCopyJump: true,
    minZoom: 2,
  });

  // Tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  // Parse the Google Sheet CSV
  Papa.parse(sheetUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data || [];
      const markers = [];
      let latestDate = null;

      rows.forEach((row) => {
        // Expecting columns: Country, Platform, Lat, Lng, Updated
        const lat = parseFloat((row.Lat || "").toString().trim());
        const lng = parseFloat((row.Lng || "").toString().trim());
        const country = (row.Country || "").toString().trim();
        const platform = (row.Platform || "").toString().trim();

        // Add marker if coords are valid
        if (!isNaN(lat) && !isNaN(lng)) {
          const m = L.marker([lat, lng]).addTo(map);
          m.bindPopup(`<b>${country || "Unknown"}</b><br>${platform || ""}`);
          markers.push(m);
        }

        // Track latest Updated date if present
        if (row.Updated) {
          const d = new Date(row.Updated);
          if (!isNaN(d.getTime())) {
            if (!latestDate || d > latestDate) latestDate = d;
          }
        }
      });

      // Auto-zoom/center to fit all markers (prevents cropping)
      if (markers.length) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [30, 30] });
      } else {
        // Fallback view if no markers
        map.setView([20, 0], 2);
      }

      // Show "Last updated" (from sheet if available; otherwise today)
      const stamp = latestDate || new Date();
      document.getElementById("last-updated").textContent =
        "Last updated: " +
        stamp.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    },
    error: (err) => {
      console.error("CSV load error:", err);
      document.getElementById("last-updated").textContent =
        "Last updated: (data source error)";
      map.setView([20, 0], 2);
    },
  });
});
