const SchoolSetting = require("../models/SchoolSetting");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

const getSchoolSettings = async (req, res) => {
  try {
    let settings = await SchoolSetting.findOne();
    if (!settings) {
      settings = await SchoolSetting.create({});
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSchoolSettings = async (req, res) => {
  try {
    let settings = await SchoolSetting.findOne();
    if (!settings) {
      settings = new SchoolSetting();
    }
    const fields = ["schoolName", "address", "phone", "email", "dateFormat", "academicYear"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) settings[f] = req.body[f];
    });
    await settings.save();
    res.status(200).json({ success: true, message: "School settings updated", data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportData = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const students = await Student.find();
    const attendance = await Attendance.find();
    const settings = await SchoolSetting.findOne();
    res.status(200).json({
      success: true,
      data: { users, students, attendance, settings, exportedAt: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetData = async (req, res) => {
  try {
    await Student.deleteMany({});
    await Attendance.deleteMany({});
    await SchoolSetting.deleteMany({});
    await SchoolSetting.create({});
    res.status(200).json({ success: true, message: "All data reset to defaults" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSchoolSettings,
  updateSchoolSettings,
  exportData,
  resetData
};
