const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const { checkPermission } = require("../services/permissionService");

const toFrontend = (doc) => {
  const s = doc.student || {};
  return {
    id: s._id || doc._id,
    student: s._id,
    studentId: s.studentId,
    name: s.firstName ? `${s.firstName} ${s.lastName}` : "",
    firstName: s.firstName,
    lastName: s.lastName,
    gender: s.gender,
    class: s.className,
    className: s.className,
    date: doc.date,
    status: doc.status,
    attendanceStatus: doc.status,
    markedBy: doc.markedBy,
    markedByName: doc.markedBy?.username || "",
    createdAt: doc.createdAt,
  };
};

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

    if (status === "Absent") {
      const permission = await checkPermission(studentExists.studentId);
      if (permission.success && permission.hasPermission) {
        finalStatus = "On Permission";
      }
    }

    const attendance = await Attendance.create({
      student,
      status: finalStatus,
      markedBy: req.user.id,
    });

    const populated = await Attendance.findById(attendance._id)
      .populate("student", "studentId firstName lastName gender className")
      .populate("markedBy", "username");

    res.status(201).json({
      success: true,
      message: "Attendance recorded successfully",
      data: toFrontend(populated),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkAttendance = async (req, res) => {
  try {
    const records = Array.isArray(req.body)
      ? req.body
      : req.body.records || [];

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be an array or have a records array",
      });
    }

    const results = [];

    for (const item of records) {
      const studentId = item.student || item.studentId;
      const student = studentId
        ? await Student.findById(studentId)
        : null;

      if (!student) continue;

      let finalStatus = item.status || item.attendanceStatus || "Absent";

      if (finalStatus === "Absent") {
        const permission = await checkPermission(student.studentId);
        if (permission.success && permission.hasPermission) {
          finalStatus = "On Permission";
        }
      }

      const attendance = await Attendance.create({
        student: student._id,
        status: finalStatus,
        markedBy: req.user.id,
      });

      results.push(attendance);
    }

    const populated = await Attendance.find({
      _id: { $in: results.map((r) => r._id) },
    })
      .populate("student", "studentId firstName lastName gender className")
      .populate("markedBy", "username");

    res.status(201).json({
      success: true,
      message: "Bulk attendance recorded successfully",
      total: populated.length,
      data: populated.map(toFrontend),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAttendance = async (req, res) => {
  try {
    const filter = {};
    let classStudents = [];

    if (req.query.class || req.query.className) {
      const className = req.query.class || req.query.className;
      classStudents = await Student.find({ className });
      const ids = classStudents.map((s) => s._id);
      filter.student = { $in: ids };
    }

    if (req.query.date) {
      const dateStart = new Date(req.query.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      filter.date = { $gte: dateStart, $lt: dateEnd };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("student", "studentId firstName lastName gender className")
      .populate("markedBy", "username")
      .sort({ createdAt: -1 });

    if (classStudents.length > 0) {
      const attendanceMap = {};
      attendanceRecords.forEach((rec) => {
        const sId = rec.student?._id?.toString();
        if (sId) attendanceMap[sId] = rec;
      });

      const merged = classStudents.map((student) => {
        const existing = attendanceMap[student._id.toString()];
        if (existing) return toFrontend(existing);
        return {
          id: student._id,
          student: student._id,
          studentId: student.studentId,
          name: `${student.firstName} ${student.lastName}`,
          firstName: student.firstName,
          lastName: student.lastName,
          gender: student.gender,
          class: student.className,
          className: student.className,
          date: req.query.date
            ? new Date(req.query.date).toISOString().split("T")[0]
            : null,
          status: null,
          attendanceStatus: null,
          markedBy: null,
          markedByName: "",
          createdAt: null,
        };
      });

      return res.status(200).json({
        success: true,
        count: merged.length,
        data: merged,
      });
    }

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords.map(toFrontend),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      data: toFrontend(attendance),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance not found",
      });
    }

    const populated = await Attendance.findById(attendance._id)
      .populate("student", "studentId firstName lastName gender className")
      .populate("markedBy", "username");

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: toFrontend(populated),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

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
      data: attendance.map(toFrontend),
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
      data: attendance.map(toFrontend),
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
      data: attendance.map(toFrontend),
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
