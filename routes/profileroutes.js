const express = require("express");
const router = express.Router();
const Admin = require("../models/admin");
const Manager = require("../models/manager");
const Customer = require("../models/customer");
const Product = require("../models/product");
const Blog = require("../models/blog");
const authMiddleware = require("../middleware/auth"); // your JWT middleware
const upload = require("../config/multer")
// Helper to get model based on role
const getModelByRole = (role) => {
  switch(role) {
    case "Admin":
    case "Super Admin":
      return Admin;
    case "Manager":
      return Manager;
    case "Customer":
      return Customer;
    default:
      return null;
  }
};

// GET profile

router.get("/", authMiddleware, async (req, res) => {
  try {
    const rolename =
      typeof req.user.role === "string" ? req.user.role : req.user.role?.name || "N/A";

    const Model = getModelByRole(rolename);
    let user;

    if (Model) {
      user = await Model.findById(req.user._id).populate("role", "name");
    }

    // If Model not found (Google login without role), fallback to JWT
res.json({
  name: user?.name || req.user.name || "No Name",
  email: user?.email || req.user.email || "No Email",
profileImage: user?.profileImage || req.user.profileImage || "",
coverImage: user?.coverImage || req.user.coverImage || "",
  role: rolename,
});
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ PUT profile (update)
router.put(
  "/profile",
  authMiddleware,
  upload("profiles").fields([
    { name: "profileImage", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const role = typeof req.user.role === "string" ? req.user.role : req.user.role?.name;
      const Model = getModelByRole(role);
      if (!Model) return res.status(400).json({ error: "Invalid role" });

      const user = await Model.findById(req.user._id);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { name, email, password } = req.body;

      user.name = name || user.name;
      user.email = email || user.email;

      if (req.files?.profileImage) {
        user.profileImage = req.files.profileImage[0].filename;
      }
      if (req.files?.coverImage) {
        user.coverImage = req.files.coverImage[0].filename;
      }

      if (password) {
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      await user.save();
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

router.get("/profile-stats", authMiddleware, async (req, res) => {
  try {
    const products = await Product.countDocuments();
    const blogs = await Blog.countDocuments();
    const customers = await Customer.countDocuments();

    res.json({
      products,
      blogs,
      customers,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;