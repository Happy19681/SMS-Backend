const partnerAuth = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.PARTNER_API_KEY) {
    return res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing API key" });
  }
  next();
};
module.exports = partnerAuth;