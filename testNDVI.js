require("dotenv").config();
const { fetchNDVI, fetchNDVIStats } = require("./services/ndviService");

const fs = require("fs");

const exampleBoundary = {
  type: "Polygon",
  coordinates: [
    [
      [28.091585, -26.034559],
      [28.096183, -26.034723],
      [28.095925, -26.039140],
      [28.091889, -26.038853],
      [28.091585, -26.034559],
    ],
  ],
};

const date = "2025-05-05";
const boundary = {
  type: "Polygon",
  coordinates: [
    [
      [28.045, -26.204],
      [28.05, -26.204],
      [28.05, -26.2],
      [28.045, -26.2],
      [28.045, -26.204],
    ],
  ],
};

async function testNDVI() {
  try {
    const ndviImage = await fetchNDVI(exampleBoundary, date);
    fs.writeFileSync("ndvi.png", ndviImage);
    console.log("✅ NDVI image saved as ndvi.png");
  } catch (err) {
    console.error("❌ NDVI request failed.");
  }
}
testNDVI();

(async () => {
  try {
    const stats = await fetchNDVIStats(boundary, date);
    console.log("NDVI Stats:", stats);
  } catch {
    console.error("Failed to fetch NDVI stats");
  }
})();

