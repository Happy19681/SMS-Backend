const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const { checkPermission } = require("../services/permissionService");

/*
=====================================
CREATE ATTENDANCE (WITH PERMISSION LOGIC)
=====================================
*/

const createAttendance = async (req, res) => {
  try {
    const { student, status } = req.body;

    const studentExists = await Student.findById(student);

    if (!studentExists) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    let finalStatus = status;

    /*
    =====================================
    AUTO PERMISSION CHECK
    =====================================
    */
    if (status === "Absent") {
      const permission = await checkPermission(
        studentExists.studentId // MUST MATCH partner entity_id
      );

      if (permission.success && permission.hasPermission) {
        finalStatus = "On Permission";
      }
    }

    const attendance = await Attendance.create({
      student,
      status: finalStatus,
      markedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
BULK ATTENDANCE (UPDATED)
=====================================
*/

const bulkAttendance = async (req, res) => {
  try {
    const attendanceData = req.body;

    if (!Array.isArray(attendanceData)) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array",
      });
    }

    const records = [];

    for (const item of attendanceData) {
      const student = await Student.findById(item.student);

      if (!student) continue;

      let finalStatus = item.status;

      if (item.status === "Absent") {
        const permission = await checkPermission(
          student.studentId
        );

        if (permission.success && permission.hasPermission) {
          finalStatus = "On Permission";
        }
      }

      const attendance = await Attendance.create({
        student: item.student,
        status: finalStatus,
        markedBy: req.user.id,
      });

      records.push(attendance);
    }

    res.status(201).json({
      success: true,
      message: "Bulk attendance recorded successfully",
      total: records.length,
      data: records,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET ALL ATTENDANCE
=====================================
*/

const getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("student", "studentId firstName lastName className")
      .populate("markedBy", "username")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
GET BY ID
=====================================
*/

const getAttendanceById = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate("student")
      .populate("markedBy", "username");

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
UPDATE
=====================================
*/

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
DELETE
=====================================
*/

const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    await attendance.deleteOne();

    res.status(200).json({
      success: true,
      message: "Attendance deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=====================================
REPORTS
=====================================
*/

const dailyReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow },
    }).populate("student", "studentId firstName lastName className");

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const studentReport = async (req, res) => {
  try {
    const attendance = await Attendance.find({
      student: req.params.studentId,
    }).populate("student");

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const classReport = async (req, res) => {
  try {
    const students = await Student.find({
      className: req.params.className,
    });

    const ids = students.map((s) => s._id);

    const attendance = await Attendance.find({
      student: { $in: ids },
    }).populate("student");

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAttendance,
  bulkAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  dailyReport,
  studentReport,
  classReport,
};