const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/vallidateTokenHandler");
const {
  createFarm,
  deleteFarm,
  getNDVIHistory,
  getFarmNDVI,
  getUserFarms,
  getUserNDVIHistory,
} = require("../controllers/farmController");

router.post("/", validateToken, createFarm);
router.get("/", validateToken, getUserFarms);
// router.get("/:id", validateToken, getUserFarms);
router.delete("/:id", validateToken, deleteFarm);

// NDVI
router.post("/ndvi", validateToken, getFarmNDVI);
router.get("/ndvi/history/:farmId", validateToken, getNDVIHistory);
router.get("/ndvi/history/user/:userId", validateToken, getUserNDVIHistory);

module.exports = router;
