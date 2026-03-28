const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Role = require("../models/role")
const authMiddleware = require("../middleware/auth");
const checkPermission = require("../middleware/checkpermission");
const {encrypt} = require("../utils/encrypt")
// Create Admin
router.post("/create", authMiddleware, checkPermission("admins","create"), async (req, res) => {
  try {
    const { name, email, password, roleId } = req.body;
const role = await Role.findById(roleId);
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role._id
    });
 const encryptedData = encrypt(JSON.stringify(admin));
    res.status(201).json({ data: encryptedData });
    res.status(201).json(admin);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});;

// Get All Admins
router.get("/", authMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Admin
router.put("/:id", authMiddleware, checkPermission("admins","edit"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, { name, email }, { new: true });
    res.json(updatedAdmin);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// Delete Admin
router.delete("/:id", authMiddleware, checkPermission("admins","delete"), async (req, res) => {
  try {
    const deletedAdmin = await Admin.findByIdAndDelete(req.params.id);
    if (!deletedAdmin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;