const express = require("express");
const {
  getUser,
  refreshTokenUser,
  loginUser,
  createUser,
  updateUser,
  getUserProfile
} = require("../controllers/userController");
const validateToken = require("../middleware/vallidateTokenHandler");

const router = express.Router();

router.get("/refresh", refreshTokenUser);
router.get("/profile", validateToken, getUserProfile);
router.get("/:id", validateToken, getUser);
router.post("/login", loginUser);
router.post("/signup", createUser);
router.put("/:id", validateToken, updateUser);

module.exports = router;