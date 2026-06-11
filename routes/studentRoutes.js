const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createStudent, getStudents, getStudentsByClass, getStudentById, updateStudent, deleteStudent } = require("../controllers/studentController");

router.post("/", protect, createStudent);
router.get("/", protect, getStudents);
router.get("/class/:className", protect, getStudentsByClass);
router.get("/:id", protect, getStudentById);
router.put("/:id", protect, updateStudent);
router.delete("/:id", protect, deleteStudent);

module.exports = router;