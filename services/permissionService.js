const axios = require("axios");

/*
========================================
CHECK STUDENT PERMISSION (REAL VERSION)
USING PARTNER MYSQL BACKEND API
========================================
*/

const checkPermission = async (entityId) => {
  try {
    // CALL PARTNER API
    const response = await axios.get(
      `${process.env.PERMISSION_API_URL}/entity/${entityId}`
    );

    const permission = response.data;

    /*
    ===============================
    BUSINESS LOGIC RULE
    ===============================
    */

    if (!permission || !permission.id) {
      return {
        success: false,
        hasPermission: false,
      };
    }

    const now = new Date();
    const expectedReturn = new Date(permission.expected_return);

    const isValidStatus =
      permission.status === "Approved" ||
      permission.status === "Active";

    const isNotExpired = expectedReturn >= now;

    const hasPermission = isValidStatus && isNotExpired;

    return {
      success: true,
      hasPermission,
      reason: permission.reason,
      destination: permission.destination,
      status: permission.status,
      expectedReturn: permission.expected_return,
    };
  } catch (error) {
    console.log("Permission API error:", error.message);

    return {
      success: false,
      hasPermission: false,
    };
  }
};

module.exports = {
  checkPermission,
};