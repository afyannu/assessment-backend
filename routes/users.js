const express = require("express");
const router = express.Router();

const Admin = require("../models/admin");
const Manager = require("../models/manager");
const Customer = require("../models/customer");
const auth = require("../middleware/auth")

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// File upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/profiles";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  },
});
const upload = multer({ storage });

router.get("/all", auth, async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").populate("role");
    const managers = await Manager.find().select("-password").populate("role");
    const customers = await Customer.find().select("-password").populate("role");

    const allUsers = [
  ...admins.map(u => ({ ...u.toObject(), roleType: "admin" })),
  ...managers.map(u => ({ ...u.toObject(), roleType: "manager" })),
  ...customers.map(u => ({ ...u.toObject(), roleType: "customer" })),
];
    

    res.json({ data: allUsers }); // no encrypt for now
  } catch (error) {
    console.error("Fetch Users Route Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// GET /api/users/profile - get current logged-in user
router.get("/profile", auth, async (req, res) => {
  try {
    const { role, userId } = req.user;
    let user;

    if (role === "admin") user = await Admin.findById(userId).select("-password").populate("role");
    else if (role === "manager") user = await Manager.findById(userId).select("-password").populate("role");
    else if (role === "customer") user = await Customer.findById(userId).select("-password").populate("role");

    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("FULL RESPONSE:", res.data);
    res.json(user);
  } catch (err) {
    console.error("Profile Route Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/users/profile - update current user's profile
router.put("/profile", auth, upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]), async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { name, email, password } = req.body;
    let user;

    if (role === "admin") user = await Admin.findById(userId);
    else if (role === "manager") user = await Manager.findById(userId);
    else if (role === "customer") user = await Customer.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // make sure your model hashes password in pre-save

    if (req.files.profileImage) user.profileImage = req.files.profileImage[0].filename;
    if (req.files.coverImage) user.coverImage = req.files.coverImage[0].filename;

    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    let user = await Admin.findById(id);
    if (user) await user.remove();
    else {
      user = await Manager.findById(id);
      if (user) await user.remove();
      else {
        user = await Customer.findById(id);
        if (user) await user.remove();
        else return res.status(404).json({ message: "User not found" });
      }
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;