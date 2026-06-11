const Student =
require("../models/Student");

const Attendance =
require("../models/Attendance");

const dashboardStats =
async (req, res) => {

  try {

    const totalStudents =
      await Student.countDocuments();

    const present =
      await Attendance.countDocuments({
        status: "Present",
      });

    const absent =
      await Attendance.countDocuments({
        status: "Absent",
      });

    const late =
      await Attendance.countDocuments({
        status: "Late",
      });

    const permission =
      await Attendance.countDocuments({
        status:
          "On Permission",
      });

    res.status(200).json({
      totalStudents,
      present,
      absent,
      late,
      permission,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

module.exports = {
  dashboardStats,
};