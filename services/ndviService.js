const axios = require("axios");
const { getSentinelHubToken } = require("./sentinelHubService");

async function fetchNDVI(boundaryGeoJSON, date) {
  try {
    const token = await getSentinelHubToken();

    const payload = {
      input: {
        bounds: {
          geometry: boundaryGeoJSON,
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
          },
        },
        data: [
          {
            type: "S2L2A",
            dataFilter: {
              timeRange: {
                from: `${date}T00:00:00Z`,
                to: `${date}T23:59:59Z`,
              },
            },
          },
        ],
      },
      output: {
        width: 600,
        height: 400,
        responses: [
          {
            identifier: "default",
            format: {
              type: "image/png",
            },
          },
        ],
      },
      evalscript: `
        //VERSION=3
        function setup() {
          return {
            input: ["B04", "B08", "dataMask"],
            output: { bands: 4 } // RGBA output
          };
        }

        function evaluatePixel(sample) {
          let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);

          // Color map for NDVI
          let color;
          if (ndvi < 0.0) {
            color = [128, 128, 128, 255]; // Gray (no vegetation)
          } else if (ndvi < 0.2) {
            color = [165, 42, 42, 255];   // Brown (poor vegetation)
          } else if (ndvi < 0.4) {
            color = [255, 255, 0, 255];   // Yellow (sparse vegetation)
          } else if (ndvi < 0.6) {
            color = [144, 238, 144, 255]; // Light green (moderate vegetation)
          } else if (ndvi < 0.8) {
            color = [0, 128, 0, 255];     // Green (healthy vegetation)
          } else {
            color = [0, 100, 0, 255];     // Dark green (very healthy vegetation)
          }

          // Mask out invalid pixels
          if (sample.dataMask === 0) {
            return [0, 0, 0, 0];
          }

          return color;
        }
      `,
    };

    const response = await axios.post(
      "https://services.sentinel-hub.com/api/v1/process",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "image/png",
        },
        responseType: "arraybuffer",
      }
    );

    return response.data; // PNG image buffer
  } catch (err) {
    const errorBuffer = err.response?.data;
    if (errorBuffer instanceof Buffer) {
      const errorMessage = Buffer.from(errorBuffer).toString("utf-8");
      console.error("Error fetching NDVI:", JSON.parse(errorMessage));
    } else {
      console.error("Error fetching NDVI:", err.message);
    }
    throw err;
  }
}

async function fetchNDVIStats(boundaryGeoJSON, startDate, endDate) {
  try {
    const token = await getSentinelHubToken();

    const payload = {
      input: {
        bounds: {
          geometry: boundaryGeoJSON,
          properties: {
            crs: "http://www.opengis.net/def/crs/EPSG/0/4326",
          },
        },
        data: [
          {
            type: "S2L2A",
            dataFilter: {
              timeRange: {
                from: `${startDate}T00:00:00Z`,
                to: `${endDate}T23:59:59Z`,
              },
            },
          },
        ],
      },
      aggregation: {
        timeRange: {
          from: `${startDate}T00:00:00Z`,
          to: `${endDate}T23:59:59Z`,
        },
        aggregationInterval: {
          of: "P1D",
        },
        evalscript: `
          //VERSION=3
          function setup() {
            return {
              input: ["B04", "B08", "dataMask"],
              output: [
                { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
                { id: "dataMask", bands: 1 }
              ]
            };
          }

          function evaluatePixel(sample) {
            const ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
            return {
              ndvi: [ndvi],
              dataMask: [sample.dataMask]
            };
          }
        `,
      },
    };

    const response = await axios.post(
      "https://services.sentinel-hub.com/api/v1/statistics",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const stats =
      response.data?.data?.[0]?.outputs?.ndvi?.bands?.B0?.stats || null;

    return {
      mean: parseFloat(stats?.mean.toFixed(2)) || null,
      min: parseFloat(stats?.min.toFixed(2)) || null,
      max: parseFloat(stats?.max.toFixed(2)) || null,
      stddev: parseFloat(stats?.stDev.toFixed(2)) || null,
    };
    
  } catch (err) {
    console.error(
      "Error fetching NDVI stats:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { fetchNDVI, fetchNDVIStats };
