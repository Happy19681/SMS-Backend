const Student = require("../models/Student");

const toFrontend = (doc) => ({
  id: doc._id,
  studentId: doc.studentId,
  name: `${doc.firstName} ${doc.lastName}`,
  firstName: doc.firstName,
  lastName: doc.lastName,
  gender: doc.gender,
  dob: doc.dateOfBirth ? doc.dateOfBirth.toISOString().split("T")[0] : "",
  dateOfBirth: doc.dateOfBirth,
  class: doc.className,
  className: doc.className,
  parentPhone: doc.parentPhone,
  address: doc.address,
  status: doc.status,
  registrationDate: doc.createdAt
    ? new Date(doc.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "",
});

const fromFrontend = (body) => {
  const parts = (body.name || "").split(" ");
  return {
    studentId:
      body.studentId ||
      `STU-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    firstName: parts.slice(0, -1).join(" ") || parts[0] || "",
    lastName: parts.slice(-1)[0] || "",
    gender: body.gender,
    dateOfBirth: body.dob || body.dateOfBirth,
    className: body.class || body.className,
    parentPhone: body.parentPhone,
    address: body.address,
    status: body.status || "Active",
  };
};

const createStudent = async (req, res) => {
  try {
    const data = fromFrontend(req.body);
    const student = await Student.create(data);
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: toFrontend(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json({
      success: true,
      count: students.length,
      data: students.map(toFrontend),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentsByClass = async (req, res) => {
  try {
    const { className } = req.params;
    const students = await Student.find({ className, status: "Active" });
    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No active students found in class ${className}`,
      });
    }
    res.status(200).json({
      success: true,
      className,
      count: students.length,
      data: students.map(toFrontend),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: toFrontend(student) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const updateData = fromFrontend(req.body);
    if (req.body.name === undefined) {
      delete updateData.firstName;
      delete updateData.lastName;
      Object.assign(updateData, req.body);
    }
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true }
    );
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: toFrontend(student),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    await student.deleteOne();
    res
      .status(200)
      .json({ success: true, message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentsByClass,
  getStudentById,
  updateStudent,
  deleteStudent,
};
