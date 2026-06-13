const Student = require("../models/Student");
const Attendance = require("../models/Attendance");

const dashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: "Active" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const present = await Attendance.countDocuments({
      status: "Present",
      date: { $gte: today, $lt: tomorrow }
    });

    const absent = await Attendance.countDocuments({
      status: "Absent",
      date: { $gte: today, $lt: tomorrow }
    });

    const late = await Attendance.countDocuments({
      status: "Late",
      date: { $gte: today, $lt: tomorrow }
    });

    const permission = await Attendance.countDocuments({
      status: "On Permission",
      date: { $gte: today, $lt: tomorrow }
    });

    const totalToday = present + absent + late + permission;

    res.status(200).json({
      totalStudents,
      activeStudents,
      totalToday,
      present,
      absent,
      late,
      permission,
      date: today.toISOString().split("T")[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { dashboardStats };
