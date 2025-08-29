const asyncHandler = require("express-async-handler");
const Farm = require("../models/farmModel");
const { fetchNDVI, fetchNDVIStats } = require("../services/ndviService");
const { get } = require("../app");

const createFarm = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, location, boundaries, description } = req.body;

  if (!userId || !name || !location || !boundaries) {
    return res.status(400).json({ error: "Missing required farm data" });
  }

  try {
    const farm = await Farm.createFarm(
      userId,
      name,
      location,
      boundaries,
      description
    );
    res.status(201).json(farm);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create farm" });
  }
});

const getUserFarms = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  try {
    const farms = await Farm.getFarmsByUser(userId);
    res.json(farms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch farms" });
  }
});

const deleteFarm = asyncHandler(async (req, res) => {
  const farmId = req.params.id;
  try {
    await Farm.deleteFarm(farmId);
    res.json({ message: "Farm deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete farm" });
  }
});

const getFarmNDVI = asyncHandler(async (req, res) => {
  const { farmId, date } = req.body;

  try {
    const farm = await Farm.getFarmById(farmId);
    if (!farm) return res.status(404).json({ error: "Farm not found" });

    const polygonCoordinates = JSON.parse(farm.boundaries);
    const geoJsonGeometry = {
      type: "Polygon",
      coordinates: [polygonCoordinates],
    };
    const ndviImage = await fetchNDVI(geoJsonGeometry, date);
    console.log("NDVI image fetched");

    const endDate = new Date(date);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 6); // 7-day range because the NDVI data is aggregated weekly

    const from = startDate.toISOString().split("T")[0];
    const to = endDate.toISOString().split("T")[0];

    const stats = await fetchNDVIStats(geoJsonGeometry, from, to);
    console.log("NDVI stats fetched:", stats);

    res.json({
      farmId: farm._id,
      date,
      stats, // { mean, min, max, stddev }
      image: `data:image/png;base64,${ndviImage.toString("base64")}`,
    });
  } catch (err) {
    console.error("NDVI fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch NDVI" });
  }
});

const getNDVIHistory = asyncHandler(async (req, res) => {
  const farmId = req.params.farmId;
  try {
    const history = await Farm.getNDVIHistory(farmId);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch NDVI history" });
  }
});

const getUserNDVIHistory = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const farms = await Farm.getFarmsByUser(userId);
    const allHistory = [];

    for (const farm of farms) {
      const history = await Farm.getNDVIHistory(farm.id);
      allHistory.push({
        farmId: farm.id,
        farmName: farm.name,
        history,
      });
    }

    res.json(allHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user NDVI history" });
  }
});

module.exports = {
  createFarm,
  getUserFarms,
  deleteFarm,
  getFarmNDVI,
  getNDVIHistory,
  getUserNDVIHistory,
};
