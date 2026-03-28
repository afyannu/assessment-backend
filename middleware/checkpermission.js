// middleware/checkpermission.js
const Admin = require("../models/admin");
const Manager = require("../models/manager");

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Determine role name safely (handles object or string)
      const roleName = typeof req.user.role === "string"
        ? req.user.role
        : req.user.role?.name;

      // SUPER ADMIN bypass
      if (roleName?.toLowerCase() === "super admin") {
        return next();
      }

      // Fetch user from Admin or Manager collection
      let user = await Admin.findById(req.user.id).populate("role");
      if (!user) {
        user = await Manager.findById(req.user.id).populate("role");
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      if (!user.role) {
        return res.status(403).json({ message: "Role not assigned" });
      }

      const permissions = user.role.permissions || {};

      // Check permission for this module and action
      if (permissions[module]?.[action] === true) {
        return next();
      }

      return res.status(403).json({ message: "Permission denied" });

    } catch (error) {
      console.error("Permission Middleware Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkPermission;