const express =
require("express");

const router =
express.Router();

const protect =
require(
  "../middleware/authMiddleware"
);

const {
  dashboardStats,
} = require(
  "../controllers/dashboardController"
);

router.get(
  "/",
  protect,
  dashboardStats
);

module.exports = router;