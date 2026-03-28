const express = require("express");
const router = express.Router();
const Role = require("../models/role");

// Create Role
router.post("/create", async (req, res) => {
  try {
    const role = await Role.create(req.body);
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Roles
router.get("/", async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Update Role
router.put("/:id", async (req, res) => {
  try {
    const { name, permissions } = req.body;

    const updatedRole = await Role.findByIdAndUpdate(
      req.params.id,
      {
        name,
        permissions,
      },
      {
        new: true,        // ✅ return updated document
        runValidators: true, // ✅ apply schema validation
      }
    );

    if (!updatedRole) {
      return res.status(404).json({ message: "Role not found" });
    }

    res.json(updatedRole);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;