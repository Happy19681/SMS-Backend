const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createAttendance, bulkAttendance, getAttendance, getAttendanceById, updateAttendance, deleteAttendance, dailyReport, studentReport, classReport } = require("../controllers/attendanceController");

router.post("/bulk", protect, bulkAttendance);
router.post("/", protect, createAttendance);
router.get("/", protect, getAttendance);
router.get("/report/daily", protect, dailyReport);
router.get("/report/student/:studentId", protect, studentReport);
router.get("/report/class/:className", protect, classReport);
router.get("/:id", protect, getAttendanceById);
router.put("/:id", protect, updateAttendance);
router.delete("/:id", protect, deleteAttendance);

module.exports = router;