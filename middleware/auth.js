const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Manager = require("../models/manager");
const Customer = require("../models/customer");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const models = [Admin, Manager, Customer];
    let user = null;

    for (let Model of models) {
      user = await Model.findById(decoded._id).populate("role"); // make sure JWT has _id
      if (user) break;
    }

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};