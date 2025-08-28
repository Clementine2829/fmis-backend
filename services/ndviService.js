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

async function fetchNDVIStats(boundaryGeoJSON, date) {
  try {
    // const token = await getSentinelHubToken();

    // const payload = {
    //   input: {
    //     bounds: {
    //       geometry: boundaryGeoJSON,
    //       properties: {
    //         crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
    //       }
    //     },
    //     data: [
    //       {
    //         type: "S2L2A",
    //         dataFilter: {
    //           timeRange: {
    //             from: `${date}T00:00:00Z`,
    //             to: `${date}T23:59:59Z`
    //           }
    //         }
    //       }
    //     ]
    //   },
    //   evalscript: `
    //     //VERSION=3
    //     function setup() {
    //       return {
    //         input: ["B04", "B08", "dataMask"],
    //         output: [
    //           { id: "ndvi", bands: 1, sampleType: "FLOAT32" },
    //           { id: "dataMask", bands: 1 }
    //         ]
    //       };
    //     }
    //     function evaluatePixel(sample) {
    //       return {
    //         ndvi: [(sample.B08 - sample.B04) / (sample.B08 + sample.B04)],
    //         dataMask: [sample.dataMask]
    //       };
    //     }
    //   `,
    //   output: {
    //     stats: true
    //   }
    // };

    // const response = await axios.post(
    //   "https://services.sentinel-hub.com/api/v1/statistics",
    //   payload,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //       "Content-Type": "application/json",
    //       Accept: "application/json"
    //     }
    //   }
    // );

    // // Examples show that response.data.data[0].outputs.ndvi.bands.ndvi.stats holds the NDVI stats
    // const statsObj = response.data?.data?.[0]?.outputs?.ndvi?.bands?.ndvi?.stats;
    // if (!statsObj) throw new Error("NDVI stats not found in response");

    // return {
    //   mean: statsObj.mean,
    //   min: statsObj.min,
    //   max: statsObj.max,
    //   stddev: statsObj.stDev
    // };

    return { mean: 0.56, min: 0.12, max: 0.78, stddev: 0.15 };
  } catch (err) {
    console.error(
      "Error fetching NDVI stats:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { fetchNDVI, fetchNDVIStats };
