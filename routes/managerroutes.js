const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Manager = require("../models/manager");
const Role = require("../models/role")
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkpermission");

// Create Admin
router.post("/create", authMiddleware, checkPermission("managers","create"), async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body; // <-- receive roleId

    if (!roleId) {
      return res.status(400).json({ message: "Role is required" });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const manager = await Manager.create({
      name,
      email,
      password: hashedPassword,
      role: role._id // <-- assign role
    });

    res.status(201).json(manager);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// Get All Admins
router.get("/", authMiddleware, checkPermission("managers","view"), async (req, res) => {
  try {
    const managers = await Manager.find().select("-password");
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Admin
router.put("/:id", authMiddleware, checkPermission("managers","edit"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedManager = await Manager.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    res.json(updatedManager);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete Admin
router.delete("/:id", authMiddleware, checkPermission("managers","delete"), async (req, res) => {
  try {
    const deletedManager = await Manager.findByIdAndDelete(req.params.id);
    if (!deletedManager) return res.status(404).json({ message: "Manager not found" });
    res.json({ message: "Manager deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;