const express = require("express");
const router = express.Router();
const partnerAuth = require("../middleware/partnerAuthMiddleware");
const { getStudentsByClass } = require("../controllers/studentController");
const Student = require("../models/Student");

router.get("/students/class/:className", partnerAuth, getStudentsByClass);

router.get("/students/:studentId", partnerAuth, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId })
      .select("studentId firstName lastName gender className status");
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;