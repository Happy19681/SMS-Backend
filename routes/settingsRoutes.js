const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  getSchoolSettings,
  updateSchoolSettings,
  exportData,
  resetData
} = require("../controllers/settingsController");

router.get("/school", protect, getSchoolSettings);
router.put("/school", protect, updateSchoolSettings);
router.get("/export", protect, exportData);
router.post("/reset", protect, resetData);

module.exports = router;
