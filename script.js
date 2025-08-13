document.addEventListener("DOMContentLoaded", function () {
    var map = L.map('map').setView([20, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrX1BaSvkrXrc_xT8RBAkopyj-AURsL1cVAQGM304qmKYfjMTIl9DXMnkQAzid5ZUYrBWPQ7MN7mIm/pub?output=csv";

    Papa.parse(sheetUrl, {
        download: true,
        header: true,
        complete: function(results) {
            var data = results.data;
            let latestDate = null;

            data.forEach(row => {
                if (row.Lat && row.Lng) {
                    L.marker([parseFloat(row.Lat), parseFloat(row.Lng)])
                        .addTo(map)
                        .bindPopup(`<b>${row.Country}</b><br>${row.Platform}`);
                }

                if (row.Updated) {
                    let date = new Date(row.Updated);
                    if (!isNaN(date) && (!latestDate || date > latestDate)) {
                        latestDate = date;
                    }
                }
            });

            if (latestDate) {
                document.getElementById("last-updated").innerText = 
                    "Last updated: " + latestDate.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
            }
        }
    });
});
