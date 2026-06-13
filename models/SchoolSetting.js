const mongoose = require("mongoose");

const schoolSettingSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: "Springfield Elementary School"
    },
    address: {
      type: String,
      default: "100 Education Lane, Springfield"
    },
    phone: {
      type: String,
      default: "+1-555-0000"
    },
    email: {
      type: String,
      default: "admin@springfield.edu"
    },
    dateFormat: {
      type: String,
      default: "YYYY-MM-DD"
    },
    academicYear: {
      type: String,
      default: "2025-2026"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SchoolSetting", schoolSettingSchema);
