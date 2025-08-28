const axios = require("axios");
const qs = require("querystring");

async function getSentinelHubToken() {
  try {
    const data = qs.stringify({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
    });

    const response = await axios.post(
      "https://services.sentinel-hub.com/oauth/token",
      data,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (err) {
    console.error(
      "Failed to get Sentinel Hub token:",
      err.response?.data || err.message
    );
    throw err;
  }
}

module.exports = { getSentinelHubToken };
